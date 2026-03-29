"""
Resume PDF parsing using pdfplumber + Groq LLM.
Extracts text from a PDF and uses an LLM to convert it into structured JSON.
"""
import io
import json
import logging
import re
import pdfplumber
from decouple import config
from groq import Groq

logger = logging.getLogger(__name__)


def extract_resume_data_from_pdf(binary: bytes) -> dict:
    """
    1. Extract raw text from PDF bytes using pdfplumber.
    2. Send text to Groq LLM to parse into structured JSON.
    3. Return the parsed dict.
    """
    # Read API key at call time (not at import time) so env is fully loaded
    groq_api_key = config("GROQ_API_KEY", default="")
    if not groq_api_key:
        raise ValueError("GROQ_API_KEY is not configured in the environment.")

    # --- Step 1: Extract text from PDF ---
    text = ""
    try:
        with pdfplumber.open(io.BytesIO(binary)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text() or ""
                text += page_text + "\n"
    except Exception as e:
        raise ValueError(f"Failed to read PDF file: {e}")

    text = text.strip()
    if not text:
        raise ValueError("Could not extract any text from the uploaded PDF. Ensure it is a text-based PDF, not a scanned image.")

    logger.info(f"Extracted {len(text)} characters from resume PDF.")

    # --- Step 2: LLM structured extraction ---
    client = Groq(api_key=groq_api_key)

    prompt = f"""You are a resume parser. Given the resume text below, extract structured JSON with this EXACT schema. Return ONLY valid JSON, no explanations or markdown fences.

{{
  "profile": {{
    "name": "Full name of the person",
    "title": "Their professional title/headline e.g. Full Stack Developer",
    "bio": "A 2-3 sentence professional summary",
    "email": "Their email address or empty string",
    "location": "Their city/country or empty string",
    "years_experience": 0,
    "github_url": "GitHub profile URL or empty string",
    "linkedin_url": "LinkedIn profile URL or empty string",
    "portfolio_url": "Personal website/portfolio URL or empty string",
    "dribbble_url": "Dribbble profile URL or empty string"
  }},
  "education": [
    {{
      "degree": "Degree name",
      "institution": "University/school name",
      "start_year": 2020,
      "end_year": 2024,
      "description": "Optional description"
    }}
  ],
  "experience": [
    {{
      "role": "Job title",
      "company": "Company name",
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD or null if current",
      "is_current": false,
      "description": "What they did in this role",
      "achievements": ["achievement 1", "achievement 2"]
    }}
  ],
  "projects": [
    {{
      "title": "Project name",
      "description": "What the project does",
      "category": "web_app",
      "project_url": "",
      "github_url": "",
      "technologies": ["React", "Django"]
    }}
  ],
  "skills": [
    {{
      "name": "Skill name",
      "proficiency": 80,
      "category": "technical"
    }}
  ]
}}

Rules:
- For dates, ALWAYS use YYYY-MM-DD format. If only a year is known, use YYYY-01-01. If month+year, use YYYY-MM-01.
- For end_date, use null if the person currently works there, and set is_current to true.
- For years_experience, calculate from the earliest work start date to today.
- For proficiency, estimate 0-100 based on how prominently the skill features.
- For category in skills, use one of: "technical", "design", "other".
- For category in projects, use one of: "web_app", "ecommerce", "ui_ux", "open_source".
- achievements should be a JSON array of strings.
- Return VALID JSON only, no extra text, no markdown code fences.

Resume text:
\"\"\"{text}\"\"\"
"""

    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
    )

    raw = completion.choices[0].message.content.strip()

    # Strip markdown code fences if the LLM included them despite instructions
    # e.g. ```json ... ``` or ``` ... ```
    fenced = re.match(r'^```(?:json)?(.*?)```\s*$', raw, re.DOTALL)
    if fenced:
        raw = fenced.group(1).strip()
    elif raw.startswith("```"):
        # Fallback: strip line by line
        lines = [line for line in raw.split("\n") if not line.strip().startswith("```")]
        raw = "\n".join(lines).strip()

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        logger.error(f"LLM returned invalid JSON. Raw response (first 800 chars): {raw[:800]}")
        raise ValueError(
            f"The AI returned malformed JSON and could not be parsed. "
            f"Please try uploading again. Detail: {e}"
        )

    return data
