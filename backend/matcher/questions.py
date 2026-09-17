"""Static quiz question set for the Program Matcher.

Each option carries a list of "tags" that the matching engine (see engine.py)
scores against each Career's `skills` JSONB list. Keeping this as plain data
(rather than DB-backed) keeps the quiz trivial to version and edit.
"""

QUESTIONS = [
    {
        "id": "interests_1",
        "category": "interests",
        "question": "Which of these activities sounds most appealing to you?",
        "options": [
            {"value": "build_things", "label": "Building or fixing things", "tags": ["engineering", "hands-on", "problem-solving"]},
            {"value": "analyze_data", "label": "Analyzing data and finding patterns", "tags": ["analytical", "data", "research"]},
            {"value": "help_people", "label": "Helping people solve problems", "tags": ["communication", "empathy", "service"]},
            {"value": "create_designs", "label": "Creating visual designs or art", "tags": ["creativity", "design", "visual"]},
        ],
    },
    {
        "id": "interests_2",
        "category": "interests",
        "question": "Which subject did you enjoy most in school?",
        "options": [
            {"value": "math_science", "label": "Math or science", "tags": ["analytical", "technical", "research"]},
            {"value": "arts_humanities", "label": "Arts or humanities", "tags": ["creativity", "communication", "design"]},
            {"value": "business_econ", "label": "Business or economics", "tags": ["business", "leadership", "analytical"]},
            {"value": "social_studies", "label": "Social studies", "tags": ["service", "communication", "empathy"]},
        ],
    },
    {
        "id": "interests_3",
        "category": "interests",
        "question": "What kind of environment excites you most?",
        "options": [
            {"value": "outdoors_fieldwork", "label": "Outdoors or hands-on fieldwork", "tags": ["hands-on", "physical", "engineering"]},
            {"value": "office_tech", "label": "An office working with technology", "tags": ["technical", "analytical", "focus"]},
            {"value": "creative_studio", "label": "A creative studio", "tags": ["creativity", "design", "innovation"]},
            {"value": "healthcare_setting", "label": "A healthcare or community setting", "tags": ["service", "empathy", "communication"]},
        ],
    },
    {
        "id": "strengths_1",
        "category": "strengths",
        "question": "What's your strongest skill?",
        "options": [
            {"value": "problem_solving", "label": "Problem solving", "tags": ["analytical", "problem-solving", "technical"]},
            {"value": "communication", "label": "Communication", "tags": ["communication", "leadership", "empathy"]},
            {"value": "creativity", "label": "Creativity", "tags": ["creativity", "design", "innovation"]},
            {"value": "organization", "label": "Organization", "tags": ["organization", "detail-oriented", "project-management"]},
        ],
    },
    {
        "id": "strengths_2",
        "category": "strengths",
        "question": "How do you prefer to work through a challenge?",
        "options": [
            {"value": "logical_steps", "label": "Break it down into logical steps", "tags": ["analytical", "technical", "problem-solving"]},
            {"value": "brainstorm_ideas", "label": "Brainstorm creative ideas", "tags": ["creativity", "innovation", "design"]},
            {"value": "team_discussion", "label": "Talk it through with a team", "tags": ["communication", "teamwork", "collaboration"]},
            {"value": "hands_on_testing", "label": "Test things hands-on until it works", "tags": ["hands-on", "experimentation", "engineering"]},
        ],
    },
    {
        "id": "work_style_1",
        "category": "work_style",
        "question": "Do you prefer working alone or with others?",
        "options": [
            {"value": "independently", "label": "Independently", "tags": ["independence", "focus"]},
            {"value": "small_team", "label": "In a small team", "tags": ["teamwork", "collaboration"]},
            {"value": "large_group", "label": "In a large group", "tags": ["leadership", "communication"]},
            {"value": "mix_both", "label": "A mix of both", "tags": ["adaptability", "teamwork"]},
        ],
    },
    {
        "id": "work_style_2",
        "category": "work_style",
        "question": "How structured do you like your work day to be?",
        "options": [
            {"value": "highly_structured", "label": "Highly structured with clear routines", "tags": ["organization", "detail-oriented"]},
            {"value": "flexible_schedule", "label": "Flexible, I set my own schedule", "tags": ["independence", "adaptability"]},
            {"value": "project_based", "label": "Organized around projects", "tags": ["project-management", "initiative"]},
            {"value": "fast_paced_variety", "label": "Fast-paced with lots of variety", "tags": ["adaptability", "multitasking"]},
        ],
    },
    {
        "id": "work_style_3",
        "category": "work_style",
        "question": "What role do you naturally take in group projects?",
        "options": [
            {"value": "leader", "label": "The leader", "tags": ["leadership", "communication"]},
            {"value": "researcher", "label": "The researcher", "tags": ["research", "analytical"]},
            {"value": "creative_contributor", "label": "The creative contributor", "tags": ["creativity", "innovation"]},
            {"value": "support_organizer", "label": "The organizer keeping things on track", "tags": ["organization", "teamwork"]},
        ],
    },
    {
        "id": "goals_1",
        "category": "goals",
        "question": "What matters most to you in a future career?",
        "options": [
            {"value": "high_earning_potential", "label": "High earning potential", "tags": ["business", "leadership"]},
            {"value": "making_a_difference", "label": "Making a difference in people's lives", "tags": ["service", "empathy"]},
            {"value": "creative_expression", "label": "Room for creative expression", "tags": ["creativity", "design"]},
            {"value": "stability_growth", "label": "Stability and steady growth", "tags": ["organization", "analytical"]},
        ],
    },
    {
        "id": "goals_2",
        "category": "goals",
        "question": "Where do you see yourself long term?",
        "options": [
            {"value": "industry_expert", "label": "A recognized expert in a technical field", "tags": ["technical", "research"]},
            {"value": "team_leader", "label": "Leading a team or organization", "tags": ["leadership", "communication"]},
            {"value": "entrepreneur", "label": "Running my own business", "tags": ["business", "innovation"]},
            {"value": "helping_community", "label": "Working directly with my community", "tags": ["service", "empathy"]},
        ],
    },
]
