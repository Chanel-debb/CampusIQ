from django.db.models import Avg, Count
from django.db.models.signals import post_delete, post_save, pre_save
from django.dispatch import receiver

from .models import Review


@receiver(pre_save, sender=Review)
def stash_previous_status(sender, instance, **kwargs):
    """Record the pre-save status so post_save can detect a transition into/out of approved."""
    instance._previous_status = None
    if instance.pk:
        instance._previous_status = (
            Review.objects.filter(pk=instance.pk).values_list("status", flat=True).first()
        )


@receiver(post_save, sender=Review)
def recalculate_on_status_change(sender, instance, **kwargs):
    previous_status = getattr(instance, "_previous_status", None)
    is_approved = Review.Status.APPROVED
    entered_approved = instance.status == is_approved and previous_status != is_approved
    left_approved = previous_status == is_approved and instance.status != is_approved
    if entered_approved or left_approved:
        recalculate_university_rating(instance.university_id)


@receiver(post_delete, sender=Review)
def recalculate_on_delete(sender, instance, **kwargs):
    if instance.status == Review.Status.APPROVED:
        recalculate_university_rating(instance.university_id)


def recalculate_university_rating(university_id):
    from universities.models import University

    aggregate = Review.objects.filter(
        university_id=university_id, status=Review.Status.APPROVED
    ).aggregate(avg=Avg("overall_rating"), count=Count("id"))

    University.objects.filter(pk=university_id).update(
        avg_rating=round(aggregate["avg"], 2) if aggregate["avg"] is not None else 0,
        total_reviews=aggregate["count"] or 0,
    )
