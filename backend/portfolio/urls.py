from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProfileViewSet, SkillViewSet, ExperienceViewSet, 
    EducationViewSet, TechnologyViewSet, ProjectViewSet,
    StatViewSet, ContactMessageCreateView, download_resume,
    ai_search
)

router = DefaultRouter()
router.register(r'profile', ProfileViewSet, basename='profile')
router.register(r'skills', SkillViewSet, basename='skills')
router.register(r'experience', ExperienceViewSet, basename='experience')
router.register(r'education', EducationViewSet, basename='education')
router.register(r'technologies', TechnologyViewSet, basename='technologies')
router.register(r'projects', ProjectViewSet, basename='projects')
router.register(r'stats', StatViewSet, basename='stats')

urlpatterns = [
    path('', include(router.urls)),
    path('contact/', ContactMessageCreateView.as_view(), name='contact'),
    path('resume/download/', download_resume, name='resume-download'),
    path('ai-search/', ai_search, name='ai-search'),
]

