"""Simple, deterministic quiz-to-career matching.

Scores each Career against the tags implied by the user's selected quiz
options, using a skills-JSONB overlap plus a small job_outlook bonus. No
embeddings/pgvector here yet — that arrives in Phase 5 with the AI chat.
"""

from collections import Counter

from careers.models import Career

from .questions import QUESTIONS

_QUESTIONS_BY_ID = {question["id"]: question for question in QUESTIONS}

_OUTLOOK_WEIGHTS = {
    Career.JobOutlook.BRIGHT: 3,
    Career.JobOutlook.GROWING: 2,
    Career.JobOutlook.STABLE: 1,
    Career.JobOutlook.DECLINING: 0,
}


def _collect_tag_counts(quiz_answers):
    tag_counts = Counter()
    for question_id, selected_value in quiz_answers.items():
        question = _QUESTIONS_BY_ID.get(question_id)
        if question is None:
            continue
        option = next(
            (opt for opt in question["options"] if opt["value"] == selected_value), None
        )
        if option is None:
            continue
        for tag in option.get("tags", []):
            tag_counts[tag.lower()] += 1
    return tag_counts


def _score_career(career, tag_counts):
    skills = {str(skill).lower() for skill in (career.skills or [])}
    skill_score = sum(count for tag, count in tag_counts.items() if tag in skills)
    outlook_bonus = _OUTLOOK_WEIGHTS.get(career.job_outlook, 0)
    return skill_score + outlook_bonus


def run_matcher(quiz_answers, top_n=5):
    """Score every Career against quiz_answers and return the top matches + linked programs."""
    tag_counts = _collect_tag_counts(quiz_answers)

    scored = [(career, _score_career(career, tag_counts)) for career in Career.objects.all()]
    scored.sort(key=lambda pair: (-pair[1], pair[0].title))
    top_careers = [career for career, _score in scored[:top_n]]

    programs = []
    seen_program_ids = set()
    for career in top_careers:
        for program in career.programs.select_related("university").all():
            if program.id not in seen_program_ids:
                seen_program_ids.add(program.id)
                programs.append(program)

    return {"careers": top_careers, "programs": programs}
