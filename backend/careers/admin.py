from django.contrib import admin

from .models import Career, CareerCategory


@admin.register(CareerCategory)
class CareerCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug"]
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ["name"]


@admin.register(Career)
class CareerAdmin(admin.ModelAdmin):
    list_display = ["title", "category", "job_outlook", "salary_min", "salary_max"]
    list_filter = ["job_outlook", "category"]
    search_fields = ["title", "description"]
    prepopulated_fields = {"slug": ("title",)}
    exclude = ["embedding"]
