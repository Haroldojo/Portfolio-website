"""
Pinecone-backed retrieval for Portfolio RAG.
Lazy-loaded so Django doesn't crash at startup if Pinecone is not installed.
"""
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

# ── Lazy singletons ─────────────────────────────────────────────
_pc = None
_index = None
_embedder = None


def _get_pinecone_client():
    """Return (or create) the Pinecone client."""
    global _pc
    if _pc is None:
        from pinecone import Pinecone
        api_key = getattr(settings, "PINECONE_API_KEY", None)
        if not api_key:
            raise RuntimeError("PINECONE_API_KEY is not set in Django settings.")
        _pc = Pinecone(api_key=api_key.strip())
    return _pc


def _get_index():
    """Return (or create) the Pinecone Index handle."""
    global _index
    if _index is None:
        pc = _get_pinecone_client()
        index_name = getattr(settings, "PINECONE_INDEX_NAME", "portfolio-index")
        _index = pc.Index(index_name)
    return _index


def _get_embedder():
    """Return (or create) the SentenceTransformer model."""
    global _embedder
    if _embedder is None:
        from sentence_transformers import SentenceTransformer
        _embedder = SentenceTransformer("all-MiniLM-L6-v2")
    return _embedder


# ── Public API ──────────────────────────────────────────────────
def retrieve_chunks(question: str, top_k: int = 5) -> list[str]:
    """
    Embed the user question, query Pinecone, and return matching text chunks.
    Returns an empty list on any failure so the caller can fall back gracefully.
    """
    try:
        embedder = _get_embedder()
        index = _get_index()

        q_vec = embedder.encode(question).tolist()
        res = index.query(
            vector=q_vec,
            top_k=top_k,
            include_metadata=True,
        )

        chunks = []
        for match in res.get("matches", []):
            # Pinecone v3+ returns objects with attribute access;
            # older versions / raw dicts use dict access. Handle both.
            if isinstance(match, dict):
                meta = match.get("metadata", {})
            else:
                meta = getattr(match, "metadata", {})

            if isinstance(meta, dict):
                text = meta.get("text", "")
            else:
                text = getattr(meta, "text", "")

            if text:
                chunks.append(text)
        return chunks

    except Exception as e:
        logger.warning("Pinecone retrieval failed: %s", e)
        return []
