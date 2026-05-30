import re
import unicodedata
from pathlib import Path

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.svm import LinearSVC


ROOT = Path(__file__).resolve().parent
CORPUS_PATH = ROOT / "corpus.csv"
MODEL_PATH = ROOT / "language_model.pkl"
REPORT_PATH = ROOT / "classification_report.txt"
STRICT_REPORT_PATH = ROOT / "strict_healthcare_holdout_report.txt"


def preprocess(text: str) -> str:
    # Normalize text so equivalent Unicode characters are treated consistently.
    # This keeps useful Yoruba/Igbo diacritics while removing punctuation noise.
    text = unicodedata.normalize("NFC", str(text).lower())
    text = re.sub(r"[^\w\s]", " ", text, flags=re.UNICODE)
    return re.sub(r"\s+", " ", text).strip()


def main() -> None:
    # Load the final balanced corpus produced by build_corpus.py/build_corpus.js.
    df = pd.read_csv(CORPUS_PATH)

    # Fail early if any target language is missing from the dataset.
    expected = {"english", "yoruba", "hausa", "igbo"}
    missing = expected - set(df["language"].unique())
    if missing:
        raise ValueError(f"Corpus is missing labels: {', '.join(sorted(missing))}")

    # Remove exact duplicates and create the cleaned text column used for training.
    df = df.drop_duplicates(subset=["text", "language"])
    df["text_clean"] = df["text"].map(preprocess)
    df = df[df["text_clean"].str.len() >= 3]

    # Every language must have enough examples for a meaningful train/test split.
    min_class_size = df["language"].value_counts().min()
    if min_class_size < 2:
        raise ValueError("Each language needs at least two examples before training.")

    # Stratification keeps English, Yoruba, Hausa, and Igbo balanced in both splits.
    stratify = df["language"] if min_class_size >= 2 else None
    test_size = 0.25 if len(df) >= 16 else 0.34
    x_train, x_test, y_train, y_test = train_test_split(
        df["text_clean"],
        df["language"],
        test_size=test_size,
        random_state=42,
        stratify=stratify,
    )

    pipeline = make_pipeline()

    # Train the vectorizer and classifier together.
    # After this, pipeline.predict(["some text"]) can detect a language directly.
    pipeline.fit(x_train, y_train)
    predictions = pipeline.predict(x_test)

    # The random split report is useful, but can be optimistic because similar
    # source data may appear in both train and test sets.
    labels = ["english", "yoruba", "hausa", "igbo"]
    report = classification_report(y_test, predictions, labels=labels, zero_division=0, digits=4)
    matrix = confusion_matrix(y_test, predictions, labels=labels)

    REPORT_PATH.write_text(
        "Classification report\n"
        "=====================\n\n"
        f"{report}\n\nConfusion matrix labels: {labels}\n{matrix}\n",
        encoding="utf-8",
    )

    # Save the trained model for FastAPI to load later.
    joblib.dump(pipeline, MODEL_PATH)

    # Run a stricter check: train without manual healthcare rows, then test on
    # those healthcare rows. This better reflects the app's real input style.
    strict_report = run_manual_healthcare_holdout(df, labels)
    print(report)
    print("\n--- Strict healthcare holdout ---")
    print(strict_report)
    print(f"Saved model to {MODEL_PATH}")
    print(f"Saved report to {REPORT_PATH}")
    print(f"Saved strict report to {STRICT_REPORT_PATH}")


def make_pipeline() -> Pipeline:
    # Character n-grams are strong for language identification because they learn
    # spelling fragments, accents, and short patterns instead of full vocabulary.
    return Pipeline(
        [
            (
                "tfidf",
                TfidfVectorizer(
                    analyzer="char_wb",
                    ngram_range=(2, 4),
                    max_features=50000,
                    sublinear_tf=True,
                ),
            ),
            ("clf", LinearSVC(C=1.0, max_iter=3000, random_state=42)),
        ]
    )


def run_manual_healthcare_holdout(df: pd.DataFrame, labels: list[str]) -> str:
    # Manual healthcare examples are the closest match to what users will type
    # into the hospital appointment app, so we test them as a separate holdout.
    manual_mask = df["source"].eq("manual_healthcare_google_translate")
    train_df = df[~manual_mask]
    test_df = df[manual_mask]

    if train_df.empty or test_df.empty:
        return "Strict healthcare holdout skipped because train or test data is empty."

    # Train only on external datasets, then test on healthcare-domain examples.
    strict_pipeline = make_pipeline()
    strict_pipeline.fit(train_df["text_clean"], train_df["language"])
    predictions = strict_pipeline.predict(test_df["text_clean"])

    report = classification_report(
        test_df["language"],
        predictions,
        labels=labels,
        zero_division=0,
        digits=4,
    )
    matrix = confusion_matrix(test_df["language"], predictions, labels=labels)
    output = (
        "Strict healthcare holdout report\n"
        "================================\n\n"
        "Training data: all non-manual external corpus rows\n"
        "Test data: all manually translated healthcare rows only\n\n"
        f"{report}\n\nConfusion matrix labels: {labels}\n{matrix}\n"
    )
    STRICT_REPORT_PATH.write_text(output, encoding="utf-8")
    return output


if __name__ == "__main__":
    main()
