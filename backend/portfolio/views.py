from rest_framework import viewsets, generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import FileResponse, Http404
from django.shortcuts import get_object_or_404
from .models import Profile, Skill, Experience, Education, Technology, Project, Stat, ContactMessage
from .serializers import (
    ProfileSerializer, SkillSerializer, ExperienceSerializer, 
    EducationSerializer, TechnologySerializer, ProjectSerializer,
    ProjectListSerializer, StatSerializer, ContactMessageSerializer
)


class ProfileViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for profile information.
    Returns the first (and should be only) profile.
    """
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    
    def list(self, request):
        """Return single profile object instead of list"""
        profile = self.queryset.first()
        if profile:
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        return Response({})


class SkillViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for skills"""
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer


class ExperienceViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for work experience"""
    queryset = Experience.objects.all()
    serializer_class = ExperienceSerializer


class EducationViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for education"""
    queryset = Education.objects.all()
    serializer_class = EducationSerializer


class TechnologyViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for technologies"""
    queryset = Technology.objects.all()
    serializer_class = TechnologySerializer


class ProjectViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for projects with category filtering"""
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        """Use simplified serializer for list view"""
        if self.action == 'list':
            return ProjectListSerializer
        return ProjectSerializer
    
    def get_queryset(self):
        """Filter projects by category if provided"""
        queryset = Project.objects.all()
        category = self.request.query_params.get('category', None)
        
        if category and category != 'all':
            queryset = queryset.filter(category=category)
        
        return queryset


class StatViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for statistics"""
    queryset = Stat.objects.all()
    serializer_class = StatSerializer


class ContactMessageCreateView(generics.CreateAPIView):
    """API endpoint for contact form submission"""
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response(
            {
                'message': 'Thank you for your message! I will get back to you soon.',
                'data': serializer.data
            },
            status=status.HTTP_201_CREATED
        )


@api_view(['GET'])
def download_resume(request):
    """Download resume PDF"""
    profile = Profile.objects.first()
    
    if not profile or not profile.resume_pdf:
        raise Http404("Resume not found")
    
    try:
        return FileResponse(
            profile.resume_pdf.open('rb'),
            as_attachment=True,
            filename=f"{profile.name.replace(' ', '_')}_Resume.pdf"
        )
    except Exception as e:
        raise Http404("Resume file not found")


@api_view(['POST'])
def ai_search(request):
    """
    AI-powered portfolio search using LangChain + ChatGroq RAG.
    Accepts a JSON body with a 'query' field.
    """
    from .rag import ask_portfolio

    query = request.data.get('query', '').strip()

    if not query:
        return Response(
            {'error': 'Please provide a search query.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if len(query) > 500:
        return Response(
            {'error': 'Query is too long. Please keep it under 500 characters.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    result = ask_portfolio(query)

    return Response(result, status=status.HTTP_200_OK)
