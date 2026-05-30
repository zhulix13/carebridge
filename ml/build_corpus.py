import csv
import random
from pathlib import Path


ROOT = Path(__file__).resolve().parent
RAW = ROOT / "raw"
OUTPUT = ROOT / "corpus.csv"

RANDOM_SEED = 42

LANGUAGES = {
    "english": {
        "manual_column": "english",
        "flores_code": "eng_Latn",
        "masakhanews_code": "eng",
    },
    "yoruba": {
        "manual_column": "yoruba",
        "flores_code": "yor_Latn",
        "masakhanews_code": "yor",
    },
    "hausa": {
        "manual_column": "hausa",
        "flores_code": "hau_Latn",
        "masakhanews_code": "hau",
    },
    "igbo": {
        "manual_column": "igbo",
        "flores_code": "ibo_Latn",
        "masakhanews_code": "ibo",
    },
}


def clean_text(text: str) -> str:
    return " ".join(str(text).replace("\ufeff", "").split())


def add_row(rows: list[dict[str, str]], text: str, language: str, source: str, domain: str = "", intent: str = "") -> None:
    cleaned = clean_text(text)
    if len(cleaned) < 3:
        return
    rows.append(
        {
            "text": cleaned,
            "language": language,
            "source": source,
            "domain": domain,
            "intent": intent,
        }
    )


def load_manual_healthcare() -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    path = ROOT / "manual_healthcare_samples.csv"

    with path.open("r", encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file)
        for item in reader:
            for language, config in LANGUAGES.items():
                add_row(
                    rows,
                    item[config["manual_column"]],
                    language,
                    "manual_healthcare_google_translate",
                    item["domain"],
                    item["intent"],
                )

    return rows


def load_manual_stress_training() -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    path = ROOT / "manual_stress_training_samples.csv"

    with path.open("r", encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file)
        for item in reader:
            add_row(
                rows,
                item["text"],
                item["language"],
                "manual_stress_training",
                item["domain"],
                item["case_type"],
            )

    return rows


def load_flores() -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    base = RAW / "flores" / "flores200_dataset"

    for language, config in LANGUAGES.items():
        for split in ("dev", "devtest"):
            path = base / split / f"{config['flores_code']}.{split}"
            with path.open("r", encoding="utf-8") as file:
                for line in file:
                    add_row(rows, line, language, f"flores200_{split}", "general", "")

    return rows


def load_masakhanews(max_per_language: int = 1000) -> list[dict[str, str]]:
    rng = random.Random(RANDOM_SEED)
    rows: list[dict[str, str]] = []

    for language, config in LANGUAGES.items():
        language_rows: list[dict[str, str]] = []
        folder = RAW / "masakhanews" / config["masakhanews_code"]

        for split in ("train", "dev", "test"):
            path = folder / f"{split}.tsv"
            with path.open("r", encoding="utf-8-sig", newline="") as file:
                reader = csv.DictReader(file, delimiter="\t")
                for item in reader:
                    text = f"{item.get('headline', '')} {item.get('text', '')}"
                    add_row(language_rows, text, language, f"masakhanews_{split}", item.get("category", ""), "")

        rng.shuffle(language_rows)
        rows.extend(language_rows[:max_per_language])

    return rows


def deduplicate(rows: list[dict[str, str]]) -> list[dict[str, str]]:
    seen: set[tuple[str, str]] = set()
    unique_rows: list[dict[str, str]] = []

    for row in rows:
        key = (row["language"], row["text"].casefold())
        if key in seen:
            continue
        seen.add(key)
        unique_rows.append(row)

    return unique_rows


def balance_rows(rows: list[dict[str, str]]) -> list[dict[str, str]]:
    rng = random.Random(RANDOM_SEED)
    grouped: dict[str, list[dict[str, str]]] = {language: [] for language in LANGUAGES}

    for row in rows:
        grouped[row["language"]].append(row)

    target = min(len(items) for items in grouped.values())
    balanced: list[dict[str, str]] = []

    for language, items in grouped.items():
        rng.shuffle(items)
        balanced.extend(items[:target])

    rng.shuffle(balanced)
    return balanced


def write_corpus(rows: list[dict[str, str]]) -> None:
    fieldnames = ["text", "language", "source", "domain", "intent"]
    with OUTPUT.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def print_summary(rows: list[dict[str, str]]) -> None:
    print(f"Saved: {OUTPUT}")
    print(f"Total rows: {len(rows)}")
    for language in LANGUAGES:
        count = sum(1 for row in rows if row["language"] == language)
        print(f"{language}: {count}")


def main() -> None:
    rows: list[dict[str, str]] = []
    rows.extend(load_manual_healthcare())
    rows.extend(load_manual_stress_training())
    rows.extend(load_flores())
    rows.extend(load_masakhanews(max_per_language=1000))

    rows = deduplicate(rows)
    rows = balance_rows(rows)
    write_corpus(rows)
    print_summary(rows)


if __name__ == "__main__":
    main()
