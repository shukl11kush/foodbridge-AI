import json
import logging
import requests
from typing import List, Dict, Any, Optional
from app.config import settings

logger = logging.getLogger(__name__)

def generate_ai_matches(listing_info: Dict[str, Any], shelters_candidate: List[Dict[str, Any]]) -> Optional[List[Dict[str, Any]]]:
    """
    Calls Google Gemini REST API directly to rank candidate shelters for a food listing.
    Uses pure HTTP requests so no compiled C/Rust dependencies are required.
    """
    if not settings.GEMINI_API_KEY:
        logger.info("No GEMINI_API_KEY provided. Skipping AI call, will use rule-based fallback.")
        return None

    prompt = f"""
You are the AI Orchestration Engine for FoodBridge-AI.
A restaurant has listed surplus food:
- Category: {listing_info.get('category')}
- Description: {listing_info.get('description')}
- Servings: {listing_info.get('quantity_servings')}
- Perishability: {listing_info.get('perishability_level')}
- Ready By: {listing_info.get('ready_by')}
- Pickup Window End: {listing_info.get('pickup_window_end')}

Candidate Shelters:
{json.dumps(shelters_candidate, indent=2)}

Task:
Evaluate each shelter based on distance/location, capacity fit, storage suitability (e.g. high perishability requires refrigerated storage), and urgency.
Return a valid JSON array of top matches sorted from best fit to worst fit.
Format requirements:
[
  {{
    "shelter_id": 12,
    "score": 94,
    "rationale": "Located 1.5 km away, has refrigerated storage for high perishability items, and capacity for 100 servings."
  }}
]
Do NOT include any markdown code block ticks (```) or conversational intro/outro text. Return ONLY raw JSON array.
"""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ]
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        if response.status_code == 200:
            res_data = response.json()
            candidates = res_data.get("candidates", [])
            if candidates:
                text_content = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()
                if text_content.startswith("```"):
                    text_content = text_content.split("\n", 1)[-1].rsplit("```", 1)[0].strip()
                parsed = json.loads(text_content)
                if isinstance(parsed, list):
                    return parsed
        else:
            logger.warning(f"Gemini API returned status {response.status_code}: {response.text}")
    except Exception as e:
        logger.warning(f"Gemini REST API call failed: {e}")

    return None
