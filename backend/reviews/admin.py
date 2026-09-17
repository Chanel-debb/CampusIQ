from django.contrib import admin

from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = [
        "user",
        "university",
        "program",
        "overall_rating",
        "status",
        "is_verified",
        "created_at",
    ]
    list_filter = ["status", "is_verified", "university"]
    search_fields = ["body", "user__email", "university__name"]
    autocomplete_fields = ["user", "university", "program"]
    actions = ["approve_reviews", "reject_reviews"]

    @admin.action(description="Approve selected reviews")
    def approve_reviews(self, request, queryset):
        # Looped + saved individually (not queryset.update()) so the post_save
        # signal fires per review and recalculates University.avg_rating/total_reviews.
        count = 0
        for review in queryset:
            review.status = Review.Status.APPROVED
            review.save()
            count += 1
        self.message_user(request, f"{count} review(s) approved.")

    @admin.action(description="Reject selected reviews")
    def reject_reviews(self, request, queryset):
        count = 0
        for review in queryset:
            review.status = Review.Status.REJECTED
            review.save()
            count += 1
        self.message_user(request, f"{count} review(s) rejected.")
