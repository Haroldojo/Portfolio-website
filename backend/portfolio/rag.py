"""
RAG (Retrieval-Augmented Generation) Service for Portfolio AI Search.
Uses LangChain + ChatGroq to answer visitor questions based on portfolio data.
"""
import logging
from decouple import config
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

logger = logging.getLogger(__name__)


def _get_portfolio_context():
    """
    Fetches all portfolio data from the database and constructs
    a rich text context document for the LLM.
    """
    # Import models here to avoid circular imports
    from .models import Profile, Skill, Experience, Education, Project, Technology

    sections = []

    # --- Profile ---
    profile = Profile.objects.first()
    if profile:
        sections.append(f"""## ABOUT ME
Name: {profile.name}
Title: {profile.title}
Bio: {profile.bio}
Email: {profile.email}
Location: {profile.location}
Years of Experience: {profile.years_experience}
GitHub: {profile.github_url or 'N/A'}
LinkedIn: {profile.linkedin_url or 'N/A'}
Portfolio: {profile.portfolio_url or 'N/A'}""")

    # --- Skills ---
    skills = Skill.objects.all()
    if skills.exists():
        skill_lines = [f"- {s.name} ({s.category}) — proficiency: {s.proficiency}%" for s in skills]
        sections.append("## SKILLS\n" + "\n".join(skill_lines))

    # --- Experience ---
    experiences = Experience.objects.all()
    if experiences.exists():
        exp_lines = []
        for exp in experiences:
            period = f"{exp.start_date.strftime('%b %Y')} - {'Present' if exp.is_current else exp.end_date.strftime('%b %Y') if exp.end_date else 'N/A'}"
            achievements = ""
            if exp.achievements:
                achievements = "\n    Achievements: " + "; ".join(exp.achievements)
            exp_lines.append(
                f"- {exp.role} at {exp.company} ({period})\n    {exp.description}{achievements}"
            )
        sections.append("## WORK EXPERIENCE\n" + "\n".join(exp_lines))

    # --- Education ---
    education = Education.objects.all()
    if education.exists():
        edu_lines = [
            f"- {edu.degree} at {edu.institution} ({edu.start_year}–{edu.end_year})"
            + (f"\n    {edu.description}" if edu.description else "")
            for edu in education
        ]
        sections.append("## EDUCATION\n" + "\n".join(edu_lines))

    # --- Projects ---
    projects = Project.objects.prefetch_related('technologies').all()
    if projects.exists():
        proj_lines = []
        for proj in projects:
            techs = ", ".join(t.name for t in proj.technologies.all())
            proj_lines.append(
                f"- {proj.title} [{proj.get_category_display()}]\n"
                f"    Description: {proj.description}\n"
                f"    Technologies: {techs}\n"
                f"    Live URL: {proj.project_url or 'N/A'}\n"
                f"    GitHub: {proj.github_url or 'N/A'}"
            )
        sections.append("## PROJECTS\n" + "\n".join(proj_lines))

    # --- Technologies ---
    technologies = Technology.objects.all()
    if technologies.exists():
        tech_lines = [f"- {t.name} ({t.get_category_display()})" for t in technologies]
        sections.append("## ALL TECHNOLOGIES & TOOLS\n" + "\n".join(tech_lines))

    return "\n\n".join(sections)


def ask_portfolio(question: str) -> dict:
    """
    Uses LangChain + ChatGroq to answer a user question
    based on the portfolio's database content.
    Returns a dict with 'answer' and 'success' keys.
    """
    groq_api_key = config('GROQ_API_KEY', default='')

    if not groq_api_key or groq_api_key == 'your-groq-api-key-here':
        return {
            'answer': 'AI search is not configured yet. The site owner needs to add their Groq API key.',
            'success': False,
        }

    try:
        # Retrieve context based on the RAG_BACKEND setting
        from django.conf import settings as django_settings
        rag_backend = getattr(django_settings, 'RAG_BACKEND', 'database')

        if rag_backend == 'pinecone':
            # --- Pinecone vector DB mode ---
            try:
                from .rag_pinecone import retrieve_chunks
                chunks = retrieve_chunks(question, top_k=5)
                if chunks:
                    context = "\n\n---\n\n".join(chunks)
                else:
                    # Pinecone returned nothing, fall back to DB
                    context = _get_portfolio_context()
            except Exception:
                # Pinecone errored, fall back to DB
                context = _get_portfolio_context()
        else:
            # --- Database mode (default) ---
            context = _get_portfolio_context()

        if not context.strip():
            return {
                'answer': 'No portfolio data found. Please add your information through the admin panel.',
                'success': False,
            }

        # Set up the LLM
        llm = ChatGroq(
            api_key=groq_api_key,
            model_name="llama-3.3-70b-versatile",
            temperature=0.1,
            max_tokens=1024,
        )

        # Build the prompt — extremely strict grounding
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a factual AI assistant embedded on a personal portfolio website.
You answer questions about the portfolio owner STRICTLY and ONLY using the PORTFOLIO CONTEXT provided below.

ABSOLUTE RULES — YOU MUST FOLLOW EVERY SINGLE ONE:
1. ONLY use facts explicitly stated in the PORTFOLIO CONTEXT below. Do NOT add, infer, assume, or hallucinate ANY information.
2. If the user asks about something NOT present in the context, respond EXACTLY: "I don't have that information available on this portfolio. You can reach out directly via the Contact page for more details!"
3. Do NOT use any outside knowledge, general knowledge, or training data. Pretend you know NOTHING except what is in the context.
4. Never guess dates, numbers, names, technologies, or details that are not explicitly written in the context.
5. If the user asks a question unrelated to the portfolio (e.g., weather, news, coding help, general knowledge), respond: "I can only help with questions about this portfolio. Feel free to ask about projects, skills, experience, or how to get in touch!"
6. Be concise and friendly. Use markdown formatting (bold, bullet points) for readability.
7. When mentioning projects, skills, or experience, use the exact names and details from the context.
8. Keep answers short and relevant — 2-4 sentences for simple questions, bullet lists for listing items.

--- PORTFOLIO CONTEXT (this is your ONLY source of truth) ---
{context}
--- END CONTEXT ---"""),
            ("human", "{question}"),
        ])

        # Build the chain
        chain = prompt | llm | StrOutputParser()

        # Run
        answer = chain.invoke({
            "context": context,
            "question": question,
        })

        return {
            'answer': answer,
            'success': True,
        }

    except Exception as e:
        logger.error(f"RAG AI Search error: {e}")
        return {
            'answer': f'Sorry, I encountered an error processing your question. Please try again later.',
            'success': False,
        }
