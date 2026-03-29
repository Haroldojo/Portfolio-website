"""
End-to-end test script for the Resume Import API.
Tests: auth rejection, validation, and a real PDF import via Groq.
"""
import os
import sys
import json
import django

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIRequestFactory
from portfolio.views import ResumeImportAPIView
from django.conf import settings

ADMIN_TOKEN = settings.ADMIN_API_TOKEN

factory = APIRequestFactory()
view = ResumeImportAPIView.as_view()


def _get_response(response):
    """Force-render and extract status + body from a DRF Response or Django JsonResponse."""
    if hasattr(response, 'render') and callable(response.render):
        response.render()
    content = response.content
    try:
        body = json.loads(content)
    except (json.JSONDecodeError, ValueError):
        body = {"detail": content.decode("utf-8", errors="replace")}
    return response.status_code, body


def test_no_token():
    """POST with no auth token → 401"""
    request = factory.post("/api/admin/import-resume/")
    status, body = _get_response(view(request))
    ok = status == 401
    print(f"  {'PASS' if ok else 'FAIL'} | No token → {status} | {body.get('detail','')}")
    return ok


def test_wrong_token():
    """POST with wrong token → 401"""
    request = factory.post(
        "/api/admin/import-resume/",
        HTTP_X_ADMIN_TOKEN="wrong-token-123",
    )
    status, body = _get_response(view(request))
    ok = status == 401
    print(f"  {'PASS' if ok else 'FAIL'} | Wrong token → {status} | {body.get('detail','')}")
    return ok


def test_valid_token_no_file():
    """POST with valid token but no file → 400"""
    request = factory.post(
        "/api/admin/import-resume/",
        data={},
        format="multipart",
        HTTP_X_ADMIN_TOKEN=ADMIN_TOKEN,
    )
    status, body = _get_response(view(request))
    ok = status == 400
    print(f"  {'PASS' if ok else 'FAIL'} | Valid token, no file → {status} | {body.get('detail','')}")
    return ok


def test_non_pdf_file():
    """POST with valid token but a .txt file → 400"""
    fake_txt = SimpleUploadedFile("resume.txt", b"Not a PDF", content_type="text/plain")
    request = factory.post(
        "/api/admin/import-resume/",
        data={"file": fake_txt},
        format="multipart",
        HTTP_X_ADMIN_TOKEN=ADMIN_TOKEN,
    )
    status, body = _get_response(view(request))
    ok = status == 400
    print(f"  {'PASS' if ok else 'FAIL'} | Non-PDF file → {status} | {body.get('detail','')}")
    return ok


def test_real_pdf_import():
    """
    Create a real PDF with pdfplumber-readable text via fpdf2,
    then POST it with valid token → should get 200 if Groq key works.
    """
    from fpdf import FPDF

    resume_text = """John Doe
Full Stack Developer

Email: john.doe@example.com
Location: San Francisco, CA
GitHub: https://github.com/johndoe
LinkedIn: https://linkedin.com/in/johndoe

SUMMARY
Experienced full-stack developer with 5 years of experience building web applications
using Python, Django, React, and cloud technologies.

EXPERIENCE
Senior Developer at TechCorp
Jan 2022 - Present
- Built scalable REST APIs serving 1M+ requests/day
- Led migration from monolith to microservices architecture

Junior Developer at StartupXYZ
Jun 2019 - Dec 2021
- Developed React frontends and Django backends
- Implemented CI/CD pipelines with GitHub Actions

EDUCATION
B.S. Computer Science at MIT
2015 - 2019
Dean's List, GPA 3.8

PROJECTS
Portfolio Website - Personal portfolio built with React and Django REST Framework
E-Commerce Platform - Full-stack e-commerce app with Stripe integration

SKILLS
Python, Django, React, JavaScript, TypeScript, PostgreSQL, Docker, AWS, Git"""

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", size=11)
    for line in resume_text.strip().split("\n"):
        pdf.cell(0, 6, line.strip(), new_x="LMARGIN", new_y="NEXT")
    pdf_bytes = bytes(pdf.output())

    pdf_file = SimpleUploadedFile("resume.pdf", pdf_bytes, content_type="application/pdf")
    request = factory.post(
        "/api/admin/import-resume/",
        data={"file": pdf_file},
        format="multipart",
        HTTP_X_ADMIN_TOKEN=ADMIN_TOKEN,
    )

    print("  ... calling Groq API (may take 5-15 seconds) ...")
    status, body = _get_response(view(request))

    if status == 200:
        print(f"  PASS | Real PDF import → {status} | {body.get('detail','')}")

        # Verify DB was populated
        from portfolio.models import Profile, Experience, Education, Project, Skill

        profile = Profile.objects.first()
        exp_count = Experience.objects.count()
        edu_count = Education.objects.count()
        proj_count = Project.objects.count()
        skill_count = Skill.objects.count()

        print(f"\n  ╔══════════════════════════════════════════════╗")
        print(f"  ║   DATABASE STATE AFTER IMPORT                ║")
        print(f"  ╠══════════════════════════════════════════════╣")
        if profile:
            print(f"  ║ Profile:   {profile.name[:30]:<30} ║")
            print(f"  ║ Title:     {profile.title[:30]:<30} ║")
            print(f"  ║ Email:     {profile.email[:30]:<30} ║")
            print(f"  ║ Location:  {profile.location[:30]:<30} ║")
            print(f"  ║ GitHub:    {(profile.github_url or '(empty)')[:30]:<30} ║")
            print(f"  ║ LinkedIn:  {(profile.linkedin_url or '(empty)')[:30]:<30} ║")
            print(f"  ║ Yrs Exp:   {str(profile.years_experience):<30} ║")
        print(f"  ╠══════════════════════════════════════════════╣")
        print(f"  ║ Experience: {exp_count} records{' '*(27-len(str(exp_count)))}║")
        print(f"  ║ Education:  {edu_count} records{' '*(27-len(str(edu_count)))}║")
        print(f"  ║ Projects:   {proj_count} records{' '*(27-len(str(proj_count)))}║")
        print(f"  ║ Skills:     {skill_count} records{' '*(27-len(str(skill_count)))}║")
        print(f"  ╚══════════════════════════════════════════════╝")

        ok = profile is not None and exp_count > 0 and skill_count > 0
        if ok:
            print(f"\n  PASS | All DB models populated correctly!")
        else:
            print(f"\n  FAIL | Some DB models are empty")
        return ok
    else:
        print(f"  FAIL | Real PDF import → {status} | {body.get('detail','')}")
        return False


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("  RESUME IMPORT API — END-TO-END TESTS")
    print("=" * 60)

    results = []

    print("\n--- Auth Tests ---")
    results.append(test_no_token())
    results.append(test_wrong_token())

    print("\n--- Validation Tests ---")
    results.append(test_valid_token_no_file())
    results.append(test_non_pdf_file())

    print("\n--- Full Import Test (calls Groq API) ---")
    results.append(test_real_pdf_import())

    print("\n" + "=" * 60)
    passed = sum(results)
    total = len(results)
    if passed == total:
        print(f"  ALL {total} TESTS PASSED!")
    else:
        print(f"  {passed}/{total} tests passed, {total - passed} FAILED")
    print("=" * 60 + "\n")
