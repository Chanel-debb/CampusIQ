import django_filters

from .models import University


class UniversityFilter(django_filters.FilterSet):
    province = django_filters.ChoiceFilter(choices=University.Province.choices)
    program = django_filters.CharFilter(field_name="programs__slug", lookup_expr="iexact")
    min_rating = django_filters.NumberFilter(field_name="avg_rating", lookup_expr="gte")

    class Meta:
        model = University
        fields = ["province", "program", "min_rating"]
