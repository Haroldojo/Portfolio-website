"""
Service layer for resume import — syncs parsed resume data into the database.
Deletes all existing records and replaces them with the imported data.
"""
import logging
from datetime import date, datetime
from django.utils.text import slugify
from .models import Profile, Education, Experience, Project, Skill, Technology
from .resume_parsing import extract_resume_data_from_pdf

logger = logging.getLogger(__name__)


def _parse_date(value):
    """
    Robustly parse a date string into a Python date object.
    Handles: YYYY-MM-DD, YYYY-MM, YYYY, "Jan 2020", "January 2020", etc.
    Returns None if parsing fails or value is None/empty.
    """
    if not value:
        return None

    if isinstance(value, date):
        return value

    value = str(value).strip()

    # Try ISO format first: YYYY-MM-DD
    for fmt in ("%Y-%m-%d", "%Y-%m", "%Y"):
        try:
            return datetime.strptime(value, fmt).date()
        except ValueError:
            continue

    # Try month-name formats: "Jan 2020", "January 2020"
    for fmt in ("%b %Y", "%B %Y"):
        try:
            return datetime.strptime(value, fmt).date()
        except ValueError:
            continue

    # Last resort: try to extract a 4-digit year
    import re
    year_match = re.search(r'\b(19|20)\d{2}\b', value)
    if year_match:
        return date(int(year_match.group()), 1, 1)

    logger.warning(f"Could not parse date: '{value}'")
    return None


def _safe_int(value, default=0):
    """Safely convert a value to int."""
    if value is None:
        return default
    try:
        return int(value)
    except (ValueError, TypeError):
        return default


def process_resume_file(file_obj):
    """
    Main entry point: reads PDF file, parses it via Groq, then syncs to DB.
    Deletes ALL existing resume-related data and replaces it.
    """
    logger.info(f"Starting resume import for file: {getattr(file_obj, 'name', 'unknown')}")
    binary = file_obj.read()
    if not binary:
        raise ValueError("The uploaded file is empty.")

    data = extract_resume_data_from_pdf(binary)

    _sync_profile(data.get("profile") or {})
    _sync_education(data.get("education") or [])
    _sync_experience(data.get("experience") or [])
    _sync_projects(data.get("projects") or [])
    _sync_skills(data.get("skills") or [])

    logger.info("Resume import completed successfully.")


def _sync_profile(profile_data):
    """Update or create the single Profile record (id=1)."""
    if not profile_data:
        return

    Profile.objects.update_or_create(
        id=1,
        defaults={
            "name": (profile_data.get("name") or "")[:200],
            "title": (profile_data.get("title") or profile_data.get("headline") or "")[:200],
            "bio": profile_data.get("bio") or profile_data.get("summary") or "",
            "email": (profile_data.get("email") or "")[:254],
            "location": (profile_data.get("location") or "")[:200],
            "years_experience": _safe_int(profile_data.get("years_experience"), 0),
            # Social links — include if provided by the LLM
            "github_url": (profile_data.get("github_url") or "")[:200],
            "linkedin_url": (profile_data.get("linkedin_url") or "")[:200],
            "dribbble_url": (profile_data.get("dribbble_url") or "")[:200],
            "portfolio_url": (profile_data.get("portfolio_url") or "")[:200],
        },
    )
    logger.info(f"Profile synced: {profile_data.get('name')}")


def _sync_education(edu_list):
    """Delete all Education records and recreate from parsed data."""
    Education.objects.all().delete()

    for edu in edu_list:
        Education.objects.create(
            degree=(edu.get("degree") or "")[:200],
            institution=(edu.get("institution") or "")[:200],
            start_year=_safe_int(edu.get("start_year"), 2020),
            end_year=_safe_int(edu.get("end_year"), 2024),
            description=edu.get("description") or "",
        )

    logger.info(f"Synced {len(edu_list)} education records.")


def _sync_experience(exp_list):
    """Delete all Experience records and recreate from parsed data."""
    Experience.objects.all().delete()

    for exp in exp_list:
        start = _parse_date(exp.get("start_date"))
        end = _parse_date(exp.get("end_date"))
        is_current = bool(exp.get("is_current", False))

        # If start_date is None, use a fallback
        if not start:
            start = date(2020, 1, 1)

        # If is_current, clear end_date
        if is_current:
            end = None

        achievements = exp.get("achievements") or []
        if isinstance(achievements, str):
            achievements = [achievements]

        Experience.objects.create(
            role=(exp.get("role") or "")[:200],
            company=(exp.get("company") or "")[:200],
            start_date=start,
            end_date=end,
            is_current=is_current,
            description=exp.get("description") or "",
            achievements=achievements,
        )

    logger.info(f"Synced {len(exp_list)} experience records.")


def _sync_projects(proj_list):
    """Delete all Project records and recreate from parsed data."""
    Project.objects.all().delete()

    VALID_CATEGORIES = {"web_app", "ecommerce", "ui_ux", "open_source"}

    for proj in proj_list:
        title = (proj.get("title") or "Untitled")[:200]
        slug = slugify(title)

        # Ensure unique slug
        base_slug = slug
        counter = 1
        while Project.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        category = proj.get("category") or "web_app"
        if category not in VALID_CATEGORIES:
            category = "web_app"

        project = Project.objects.create(
            title=title,
            slug=slug[:200],
            description=proj.get("description") or "",
            category=category,
            project_url=proj.get("project_url") or proj.get("link") or "",
            github_url=proj.get("github_url") or "",
        )

        # Handle technologies as M2M
        tech_names = proj.get("technologies") or []
        for tech_name in tech_names:
            if tech_name and isinstance(tech_name, str):
                tech_obj, _ = Technology.objects.get_or_create(
                    name=tech_name.strip()[:100],
                    defaults={"category": "other"},
                )
                project.technologies.add(tech_obj)

    logger.info(f"Synced {len(proj_list)} project records.")


def _sync_skills(skill_list):
    """Delete all Skill records and recreate from parsed data."""
    Skill.objects.all().delete()

    VALID_CATEGORIES = {"technical", "design", "other"}

    for idx, sk in enumerate(skill_list):
        category = sk.get("category") or "technical"
        if category not in VALID_CATEGORIES:
            category = "technical"

        proficiency = _safe_int(sk.get("proficiency") or sk.get("level"), 80)
        proficiency = max(0, min(100, proficiency))  # Clamp 0-100

        Skill.objects.create(
            name=(sk.get("name") or "Unknown")[:100],
            proficiency=proficiency,
            category=category,
            order=idx,
        )

    logger.info(f"Synced {len(skill_list)} skill records.")
