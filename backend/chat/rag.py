"""Basic keyword-based retrieval for chat context.

No pgvector yet — that's Phase 5. For now we pull a handful of plausibly
relevant Career/University rows via simple icontains matching on keywords
extracted from the user's message, and format them into a context block
for the Claude system prompt.
"""

import operator
import re
from functools import reduce

from django.db.models import Q

from careers.models import Career
from universities.models import University

_STOPWORDS = {
    "the", "and", "for", "are", "but", "not", "you", "your", "what", "which",
    "how", "can", "could", "should", "would", "about", "with", "that", "this",
    "have", "has", "want", "like", "tell", "know", "get", "job", "work",
    # Domain-generic filler: near-universal in this app's queries, and since most
    # University names literally contain "university"/"college", leaving these in
    # would make icontains matching return arbitrary rows instead of relevant ones.
    "career", "careers", "university", "universities", "college", "colleges",
    "school", "schools", "program", "programs", "degree", "degrees", "study", "studies",
}


def _extract_keywords(text, limit=6):
    words = re.findall(r"[a-zA-Z]{3,}", text.lower())
    keywords = []
    seen = set()
    for word in words:
        if word in _STOPWORDS or word in seen:
            continue
        seen.add(word)
        keywords.append(word)
        if len(keywords) >= limit:
            break
    return keywords


def build_context(message, max_careers=3, max_universities=3):
    keywords = _extract_keywords(message)
    if not keywords:
        return ""

    career_filter = reduce(
        operator.or_,
        (Q(title__icontains=kw) | Q(description__icontains=kw) for kw in keywords),
    )
    careers = list(Career.objects.filter(career_filter)[:max_careers])

    university_filter = reduce(
        operator.or_,
        (Q(name__icontains=kw) | Q(city__icontains=kw) for kw in keywords),
    )
    universities = list(University.objects.filter(university_filter)[:max_universities])

    if not careers and not universities:
        return ""

    lines = []
    if careers:
        lines.append("Relevant careers:")
        for career in careers:
            lines.append(f"- {career.title}: {career.description[:200]}")
    if universities:
        if lines:
            lines.append("")
        lines.append("Relevant universities:")
        for university in universities:
            lines.append(
                f"- {university.name} ({university.city}, {university.get_province_display()})"
            )

    return "\n".join(lines)
