import re
import unicodedata
from pathlib import Path

import joblib

from .config import get_settings


LANG_MAP = {
    "english": "en",
    "yoruba": "yo",
    "hausa": "ha",
    "igbo": "ig",
}


def normalize_text(text: str) -> str:
    text = unicodedata.normalize("NFC", str(text).lower())
    text = re.sub(r"[^\w\s]", " ", text, flags=re.UNICODE)
    return re.sub(r"\s+", " ", text).strip()


class LanguageDetector:
    def __init__(self) -> None:
        self.pipeline = None
        self.model_path = Path(get_settings().language_model_path)

    def load(self) -> None:
        if self.model_path.exists():
            self.pipeline = joblib.load(self.model_path)

    def predict(self, text: str) -> dict[str, str | float | bool | None]:
        cleaned = normalize_text(text)
        if self.pipeline is None:
            language = self._fallback_detect(cleaned)
            return {
                "detected_language": language,
                "i18n_code": LANG_MAP[language],
                "confidence": None,
                "switched": True,
            }

        language = self.pipeline.predict([cleaned])[0]
        return {
            "detected_language": language,
            "i18n_code": LANG_MAP.get(language, "en"),
            "confidence": None,
            "switched": True,
        }
    
    def _fallback_detect(self, text: str) -> str:
        hausa_markers = {"ina", "likita", "asibiti", "rashin", "lafiya", "zan", "bukata"}
        yoruba_markers = {"mo", "dokita", "ile", "iwosan", "fe", "aisan", "pade"}
        igbo_markers = {"achoro", "dọkịta", "ulo", "ogwu", "ahu", "oria", "biko"}
        tokens = set(text.split())
        scores = {
            "hausa": len(tokens & hausa_markers),
            "yoruba": len(tokens & yoruba_markers),
            "igbo": len(tokens & igbo_markers),
        }
        best = max(scores, key=lambda language: scores[language])
        return best if scores[best] > 0 else "english"


detector = LanguageDetector()
