from django.db import models
from django.utils.text import slugify


class Profile(models.Model):
    """Personal profile information"""
    name = models.CharField(max_length=200)
    title = models.CharField(max_length=200)
    bio = models.TextField()
    email = models.EmailField()
    location = models.CharField(max_length=200)
    profile_image = models.ImageField(upload_to='profile/', blank=True, null=True)
    resume_pdf = models.FileField(upload_to='resume/', blank=True, null=True)
    github_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    dribbble_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)
    years_experience = models.IntegerField(default=0)
    
    class Meta:
        verbose_name = 'Profile'
        verbose_name_plural = 'Profile'
    
    def __str__(self):
        return self.name


class Skill(models.Model):
    """Skills with proficiency levels"""
    CATEGORY_CHOICES = [
        ('technical', 'Technical'),
        ('design', 'Design'),
        ('other', 'Other'),
    ]
    
    name = models.CharField(max_length=100)
    proficiency = models.IntegerField(default=0, help_text='Proficiency level 0-100')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='technical')
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.proficiency}%)"


class Experience(models.Model):
    """Work experience timeline"""
    role = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    is_current = models.BooleanField(default=False)
    description = models.TextField()
    achievements = models.JSONField(default=list, blank=True, help_text='List of achievements')
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-start_date', 'order']
    
    def __str__(self):
        return f"{self.role} at {self.company}"
    
    @property
    def duration(self):
        """Calculate duration of employment"""
        if self.is_current:
            return f"{self.start_date.year} - Present"
        elif self.end_date:
            return f"{self.start_date.year} - {self.end_date.year}"
        return str(self.start_date.year)


class Education(models.Model):
    """Educational background"""
    degree = models.CharField(max_length=200)
    institution = models.CharField(max_length=200)
    start_year = models.IntegerField()
    end_year = models.IntegerField()
    description = models.TextField(blank=True)
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-end_year', 'order']
        verbose_name_plural = 'Education'
    
    def __str__(self):
        return f"{self.degree} - {self.institution}"


class Technology(models.Model):
    """Technology/tool tags"""
    CATEGORY_CHOICES = [
        ('frontend', 'Frontend'),
        ('backend', 'Backend'),
        ('design', 'Design'),
        ('other', 'Other'),
    ]
    
    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    
    class Meta:
        verbose_name_plural = 'Technologies'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Project(models.Model):
    """Portfolio projects"""
    CATEGORY_CHOICES = [
        ('web_app', 'Web App'),
        ('ecommerce', 'E-commerce'),
        ('ui_ux', 'UI/UX Design'),
        ('open_source', 'Open Source'),
    ]
    
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    description = models.TextField()
    thumbnail = models.ImageField(upload_to='projects/', blank=True, null=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    technologies = models.ManyToManyField(Technology, related_name='projects')
    project_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    is_featured = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', '-created_at']
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.title


class Stat(models.Model):
    """Homepage statistics"""
    label = models.CharField(max_length=100, help_text='e.g., Projects, Clients, Coffee Cups')
    value = models.CharField(max_length=50, help_text='e.g., 40+, 2.4k')
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.value} {self.label}"


class ContactMessage(models.Model):
    """Contact form submissions"""
    PROJECT_TYPE_CHOICES = [
        ('web_development', 'Web Development'),
        ('ui_ux_design', 'UI/UX Design'),
        ('branding', 'Branding'),
        ('consultation', 'Consultation'),
    ]
    
    name = models.CharField(max_length=200)
    email = models.EmailField()
    project_type = models.CharField(max_length=20, choices=PROJECT_TYPE_CHOICES)
    message = models.TextField()
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-submitted_at']
    
    def __str__(self):
        return f"Message from {self.name} - {self.submitted_at.strftime('%Y-%m-%d')}"
