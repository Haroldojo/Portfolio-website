import os
import django
import sys
from datetime import date

# Set up Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from portfolio.models import (
    Profile, Skill, Experience, Education, 
    Technology, Project, Stat
)

def seed_data():
    print("Seeding database with Parul Verma's data...")
    
    # 1. Profile
    Profile.objects.all().delete()
    profile = Profile.objects.create(
        name="Parul Verma",
        title="PYTHON DEVELOPER & AI ENGINEER",
        bio="Python developer with experience across Django web development, frontend internships, and hands-on RAG pipeline development using Ollama and local LLMs. Built a content-based movie recommendation system using Scikit-learn and real-world data preprocessing. Currently upskilling in n8n AI workflow automation and prompt engineering. Available immediately and looking to grow in an AI-focused engineering team.",
        email="parulvermaece@gmail.com",
        location="Mohali, Chandigarh",
        github_url="https://github.com",
        linkedin_url="https://linkedin.com/in/parul-verma-7562b1373",
        dribbble_url="",
        portfolio_url="",
        years_experience=1
    )
    print("Profile created.")

    # 2. Stats
    Stat.objects.all().delete()
    stats_data = [
        {"label": "PROJECTS", "value": "5+", "order": 1},
        {"label": "TECHNOLOGIES", "value": "15+", "order": 2},
        {"label": "EXPERIENCE", "value": "1+ YR", "order": 3},
        {"label": "JEE PERCENTILE", "value": "79th", "order": 4},
    ]
    for s in stats_data:
        Stat.objects.create(**s)
    print("Stats created.")

    # 3. Technologies
    Technology.objects.all().delete()
    techs = [
        ("Python", "backend"),
        ("Django", "backend"),
        ("Django REST Framework", "backend"),
        ("JavaScript", "frontend"),
        ("HTML", "frontend"),
        ("CSS", "frontend"),
        ("Scikit-learn", "other"),
        ("Pandas", "other"),
        ("NumPy", "other"),
        ("Streamlit", "frontend"),
        ("PostgreSQL", "backend"),
        ("Git", "other"),
        ("Postman", "other"),
        ("VS Code", "other"),
        ("Ollama", "other"),
        ("n8n", "other"),
        ("SQL", "backend"),
        ("REST APIs", "backend"),
    ]
    tech_objects = {}
    for name, cat in techs:
        tech_objects[name] = Technology.objects.create(name=name, category=cat)
    print("Technologies created.")

    # 4. Skills
    Skill.objects.all().delete()
    skills_data = [
        {"name": "Python", "proficiency": 90, "category": "technical", "order": 1},
        {"name": "Django / DRF", "proficiency": 80, "category": "technical", "order": 2},
        {"name": "AI / ML (RAG, Scikit-learn)", "proficiency": 75, "category": "technical", "order": 3},
        {"name": "JavaScript / HTML / CSS", "proficiency": 70, "category": "technical", "order": 4},
        {"name": "SQL / PostgreSQL", "proficiency": 70, "category": "technical", "order": 5},
        {"name": "Data Analysis", "proficiency": 75, "category": "technical", "order": 6},
        {"name": "Git / DevTools", "proficiency": 80, "category": "other", "order": 7},
    ]
    for sk in skills_data:
        Skill.objects.create(**sk)
    print("Skills created.")

    # 5. Experience
    Experience.objects.all().delete()
    exp_data = [
        {
            "role": "Software Engineer",
            "company": "Tunica Tech",
            "start_date": date(2024, 12, 1),
            "end_date": date(2025, 6, 30),
            "is_current": False,
            "description": "Paid internship focused on building AI-powered solutions using local LLMs and RAG architecture.",
            "achievements": [
                "Built a RAG pipeline POC using Ollama for local LLM inference",
                "Trained and tested a local language model, evaluating output quality",
                "Managed the pipeline from document ingestion to generated response"
            ],
            "order": 1
        },
        {
            "role": "Frontend Intern",
            "company": "Excellence Technology",
            "start_date": date(2024, 7, 1),
            "end_date": date(2024, 12, 31),
            "is_current": False,
            "description": "Built frontend pages for client projects using modern web technologies.",
            "achievements": [
                "Built frontend pages using HTML, CSS, and JavaScript",
                "Ensured cross-browser compatibility across delivered pages",
                "Implemented basic responsive layouts for client projects"
            ],
            "order": 2
        },
        {
            "role": "Trainee",
            "company": "CS Soft Solutions (India) Pvt. Ltd.",
            "start_date": date(2024, 1, 1),
            "end_date": date(2024, 6, 30),
            "is_current": False,
            "description": "Formal training in Django web development and Python data analysis fundamentals.",
            "achievements": [
                "Learned Django fundamentals: models, views, URLs, and API structure",
                "Studied basics of data analysis using Python",
                "Covered data reading, cleaning, and simple data exploration"
            ],
            "order": 3
        },
    ]
    for exp in exp_data:
        Experience.objects.create(**exp)
    print("Experience created.")

    # 6. Education
    Education.objects.all().delete()
    edu_data = [
        {
            "degree": "B.Tech in Electronics & Communication Engineering",
            "institution": "Jawaharlal Nehru Govt. Engineering College",
            "start_year": 2020,
            "end_year": 2024,
            "description": "CGPA: 7.69/10"
        },
    ]
    for edu in edu_data:
        Education.objects.create(**edu)
    print("Education created.")

    # 7. Projects
    Project.objects.all().delete()
    projects_data = [
        {
            "title": "Movie Recommendation System",
            "description": "A content-based recommendation engine built on 1,000+ titles using the TMDB 5000 dataset. Performed data preprocessing and feature engineering — extracted and merged genres, keywords, cast, and crew into unified text tags. Applied CountVectorizer and cosine similarity to rank and return relevant movie recommendations. Deployed on Streamlit Cloud for live access.",
            "category": "web_app",
            "tech": ["Python", "Scikit-learn", "Pandas", "NumPy", "Streamlit"],
            "is_featured": True,
            "project_url": "",
            "github_url": "",
        },
        {
            "title": "RAG Pipeline POC",
            "description": "A Retrieval-Augmented Generation pipeline proof-of-concept built during internship at Tunica Tech. Used Ollama for local LLM inference, managing the full pipeline from document ingestion to intelligent response generation. Trained and tested a local language model, evaluating output quality and response relevance.",
            "category": "web_app",
            "tech": ["Python", "Ollama"],
            "is_featured": True,
            "project_url": "",
            "github_url": "",
        },
        {
            "title": "Portfolio Website",
            "description": "A full-stack portfolio website built with React, Tailwind CSS, and Django REST Framework. Features dynamic content management, project showcases, resume display, and a contact form — all powered by a Django backend with API endpoints.",
            "category": "web_app",
            "tech": ["Python", "Django", "Django REST Framework", "JavaScript", "CSS"],
            "is_featured": True,
            "project_url": "",
            "github_url": "",
        },
    ]
    for p_data in projects_data:
        tech_names = p_data.pop('tech')
        project_url = p_data.pop('project_url', '')
        github_url = p_data.pop('github_url', '')
        project = Project.objects.create(
            project_url=project_url,
            github_url=github_url,
            **p_data
        )
        for t_name in tech_names:
            if t_name in tech_objects:
                project.technologies.add(tech_objects[t_name])
            else:
                new_tech = Technology.objects.get_or_create(name=t_name)[0]
                project.technologies.add(new_tech)
    print("Projects created.")

    print("\n✅ Success: Database seeded with Parul Verma's data!")

if __name__ == "__main__":
    seed_data()
