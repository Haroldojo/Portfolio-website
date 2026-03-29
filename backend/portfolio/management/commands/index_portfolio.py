"""
Management command to index all portfolio data into Pinecone.
Usage:  python manage.py index_portfolio
        python manage.py index_portfolio --clear   (delete all vectors first)
"""
import logging
from django.core.management.base import BaseCommand
from django.conf import settings

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Indexes Portfolio data (Profile, Skills, Experience, Education, Projects) into Pinecone"

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete ALL vectors from the index before upserting.",
        )

    # ── helpers ──────────────────────────────────────────────────
    def _ensure_index(self, pc, index_name, env):
        """Create the index if it doesn't exist yet."""
        from pinecone import ServerlessSpec

        existing = [idx.name for idx in pc.list_indexes()]
        if index_name in existing:
            self.stdout.write(f"Index '{index_name}' already exists.")
            return

        self.stdout.write(f"Creating index '{index_name}' in region '{env}'...")
        try:
            pc.create_index(
                name=index_name,
                dimension=384,          # all-MiniLM-L6-v2 → 384-d
                metric="cosine",
                spec=ServerlessSpec(cloud="aws", region=env),
            )
            self.stdout.write(self.style.SUCCESS(f"Index '{index_name}' created."))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Failed to create index: {e}"))
            raise

    @staticmethod
    def _batch_upsert(index, vectors, batch_size=100):
        """Upsert vectors in batches."""
        for i in range(0, len(vectors), batch_size):
            index.upsert(vectors=vectors[i : i + batch_size])

    # ── main ────────────────────────────────────────────────────
    def handle(self, *args, **options):
        from pinecone import Pinecone
        from sentence_transformers import SentenceTransformer
        from portfolio.models import Profile, Skill, Experience, Education, Project

        # ── Validate config ──────────────────────────────────────
        api_key = getattr(settings, "PINECONE_API_KEY", None)
        if not api_key:
            self.stderr.write(self.style.ERROR(
                "PINECONE_API_KEY is not set. Add it to your .env / settings."
            ))
            return

        index_name = getattr(settings, "PINECONE_INDEX_NAME", "portfolio-index")
        env = getattr(settings, "PINECONE_ENV", "us-east-1")

        # ── Pinecone client ──────────────────────────────────────
        self.stdout.write("Connecting to Pinecone...")
        pc = Pinecone(api_key=api_key.strip())
        self._ensure_index(pc, index_name, env)
        index = pc.Index(index_name)

        # ── Optionally clear existing vectors ────────────────────
        if options["clear"]:
            self.stdout.write(self.style.WARNING("Clearing ALL vectors from index..."))
            try:
                index.delete(delete_all=True)
                self.stdout.write("Cleared.")
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Clear failed: {e}"))

        # ── Load embedding model ─────────────────────────────────
        self.stdout.write("Loading embedding model 'all-MiniLM-L6-v2'...")
        model = SentenceTransformer("all-MiniLM-L6-v2")

        vectors = []

        # 1 ─── Profile ──────────────────────────────────────────
        self.stdout.write("Processing Profile...")
        profile = Profile.objects.first()
        if profile:
            text = (
                f"Type: profile\n"
                f"Name: {profile.name}\n"
                f"Title: {profile.title}\n"
                f"Bio: {profile.bio}\n"
                f"Email: {profile.email}\n"
                f"Location: {profile.location}\n"
                f"Years of Experience: {profile.years_experience}\n"
                f"GitHub: {profile.github_url or 'N/A'}\n"
                f"LinkedIn: {profile.linkedin_url or 'N/A'}\n"
                f"Portfolio: {profile.portfolio_url or 'N/A'}\n"
            )
            vectors.append({
                "id": f"profile-{profile.id}",
                "values": model.encode(text).tolist(),
                "metadata": {"type": "profile", "title": profile.name, "text": text},
            })

        # 2 ─── Skills ───────────────────────────────────────────
        self.stdout.write("Processing Skills...")
        for skill in Skill.objects.all():
            text = (
                f"Type: skill\n"
                f"Name: {skill.name}\n"
                f"Category: {skill.get_category_display()}\n"
                f"Proficiency: {skill.proficiency}%\n"
            )
            vectors.append({
                "id": f"skill-{skill.id}",
                "values": model.encode(text).tolist(),
                "metadata": {"type": "skill", "title": skill.name, "text": text},
            })

        # 3 ─── Experience ───────────────────────────────────────
        self.stdout.write("Processing Experience...")
        for exp in Experience.objects.all():
            if exp.is_current:
                period = f"{exp.start_date.strftime('%b %Y')} - Present"
            elif exp.end_date:
                period = f"{exp.start_date.strftime('%b %Y')} - {exp.end_date.strftime('%b %Y')}"
            else:
                period = exp.start_date.strftime("%b %Y")

            achievements_str = "; ".join(exp.achievements) if exp.achievements else "None"
            text = (
                f"Type: experience\n"
                f"Role: {exp.role}\n"
                f"Company: {exp.company}\n"
                f"Period: {period}\n"
                f"Description: {exp.description}\n"
                f"Achievements: {achievements_str}\n"
            )
            vectors.append({
                "id": f"experience-{exp.id}",
                "values": model.encode(text).tolist(),
                "metadata": {
                    "type": "experience",
                    "title": f"{exp.role} at {exp.company}",
                    "text": text,
                },
            })

        # 4 ─── Education ────────────────────────────────────────
        self.stdout.write("Processing Education...")
        for edu in Education.objects.all():
            text = (
                f"Type: education\n"
                f"Degree: {edu.degree}\n"
                f"Institution: {edu.institution}\n"
                f"Period: {edu.start_year} - {edu.end_year}\n"
                f"Description: {edu.description or 'N/A'}\n"
            )
            vectors.append({
                "id": f"education-{edu.id}",
                "values": model.encode(text).tolist(),
                "metadata": {
                    "type": "education",
                    "title": f"{edu.degree} at {edu.institution}",
                    "text": text,
                },
            })

        # 5 ─── Projects ─────────────────────────────────────────
        self.stdout.write("Processing Projects...")
        for proj in Project.objects.prefetch_related("technologies").all():
            techs = ", ".join(t.name for t in proj.technologies.all())
            text = (
                f"Type: project\n"
                f"Title: {proj.title}\n"
                f"Category: {proj.get_category_display()}\n"
                f"Technologies: {techs}\n"
                f"Description: {proj.description}\n"
                f"Live URL: {proj.project_url or 'N/A'}\n"
                f"GitHub: {proj.github_url or 'N/A'}\n"
            )
            vectors.append({
                "id": f"project-{proj.id}",
                "values": model.encode(text).tolist(),
                "metadata": {"type": "project", "title": proj.title, "text": text},
            })

        # ── Upsert ───────────────────────────────────────────────
        if not vectors:
            self.stdout.write(self.style.WARNING(
                "No records found in the database. Add data via admin first."
            ))
            return

        self.stdout.write(f"Upserting {len(vectors)} vectors to Pinecone...")
        self._batch_upsert(index, vectors)
        self.stdout.write(self.style.SUCCESS(
            f"✅ Successfully indexed {len(vectors)} items into '{index_name}'!"
        ))
