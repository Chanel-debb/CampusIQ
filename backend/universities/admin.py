from django.contrib import admin

from .models import Program, University


class ProgramInline(admin.TabularInline):
    model = Program
    extra = 0
    fields = ["name", "degree_type", "duration_years", "tuition_domestic", "tuition_intl"]
    show_change_link = True


@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    list_display = ["name", "province", "city", "avg_rating", "total_reviews", "ranking_national"]
    list_filter = ["province"]
    search_fields = ["name", "city"]
    prepopulated_fields = {"slug": ("name",)}
    inlines = [ProgramInline]


@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ["name", "university", "degree_type", "duration_years", "avg_gpa_required"]
    list_filter = ["degree_type", "university__province"]
    search_fields = ["name", "university__name"]
    autocomplete_fields = ["university"]
    filter_horizontal = ["careers"]
