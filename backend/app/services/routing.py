from typing import Dict
from app.schemas import DepartmentRouting

DEPARTMENT_MAP: Dict[str, Dict[str, str]] = {
    "billing_issue": {
        "department": "Billing Support",
        "description": "Specialized team handling payment failures, duplicate charges, invoice inquiries, subscription renewals, and refunds.",
        "color": "amber",
        "badge_bg": "rgba(245, 158, 11, 0.12)",
        "badge_text": "#B45309",
    },
    "account_problem": {
        "department": "Account Support",
        "description": "Security and credentials team handling login failures, password resets, 2FA/MFA recovery, and account access permissions.",
        "color": "purple",
        "badge_bg": "rgba(139, 92, 246, 0.12)",
        "badge_text": "#6D28D9",
    },
    "bug": {
        "department": "Technical Support",
        "description": "Engineering support team investigating application crashes, reproducible glitches, UI rendering issues, and service downtime.",
        "color": "rose",
        "badge_bg": "rgba(244, 63, 94, 0.12)",
        "badge_text": "#BE123C",
    },
    "feature_request": {
        "department": "Product Team",
        "description": "Product management team evaluating workflow enhancements, new capability ideas, UX suggestions, and roadmap requests.",
        "color": "emerald",
        "badge_bg": "rgba(16, 185, 129, 0.12)",
        "badge_text": "#047857",
    },
    "general_inquiry": {
        "department": "Customer Support",
        "description": "Frontline customer operations team answering product questions, onboarding guidance, documentation lookups, and general inquiries.",
        "color": "sky",
        "badge_bg": "rgba(14, 165, 233, 0.12)",
        "badge_text": "#0369A1",
    },
}

DEFAULT_ROUTING = {
    "department": "Customer Support",
    "description": "General triage team reviewing incoming customer inquiries.",
    "color": "zinc",
    "badge_bg": "rgba(113, 113, 122, 0.12)",
    "badge_text": "#3F3F46",
}


def get_routing_for_category(category: str) -> DepartmentRouting:
    info = DEPARTMENT_MAP.get(category, DEFAULT_ROUTING)
    return DepartmentRouting(
        department=info["department"],
        description=info["description"],
        color=info["color"],
        badge_bg=info["badge_bg"],
        badge_text=info["badge_text"],
    )
