from django.contrib import admin
from .models import (
    Profile, Skill, Experience, Education, 
    Technology, Project, Stat, ContactMessage
)

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('name', 'title', 'email', 'years_experience')

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'proficiency', 'category', 'order')
    list_filter = ('category',)
    list_editable = ('order',)

@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ('role', 'company', 'start_date', 'end_date', 'is_current')
    list_filter = ('is_current', 'company')
    search_fields = ('role', 'company', 'description')

@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = ('degree', 'institution', 'start_year', 'end_year')
    search_fields = ('degree', 'institution')

@admin.register(Technology)
class TechnologyAdmin(admin.ModelAdmin):
    list_display = ('name', 'category')
    list_filter = ('category',)
    search_fields = ('name',)

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'is_featured', 'order', 'created_at')
    list_filter = ('category', 'is_featured', 'technologies')
    search_fields = ('title', 'description')
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ('technologies',)

@admin.register(Stat)
class StatAdmin(admin.ModelAdmin):
    list_display = ('label', 'value', 'order')

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'project_type', 'submitted_at', 'is_read')
    list_filter = ('project_type', 'is_read', 'submitted_at')
    readonly_fields = ('name', 'email', 'project_type', 'message', 'submitted_at')
    search_fields = ('name', 'email', 'message')
