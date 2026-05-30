from pathlib import Path

import joblib
import pandas as pd

from train import preprocess


ROOT = Path(__file__).resolve().parent
MODEL_PATH = ROOT / "language_model.pkl"
STRESS_TEST_PATH = ROOT / "stress_test_samples.csv"
OUTPUT_PATH = ROOT / "stress_test_results.csv"
SUMMARY_PATH = ROOT / "stress_test_summary.txt"


def main() -> None:
    if not MODEL_PATH.exists():
        raise FileNotFoundError("Train the model first so ml/language_model.pkl exists.")

    model = joblib.load(MODEL_PATH)
    df = pd.read_csv(STRESS_TEST_PATH)
    df["text_clean"] = df["text"].map(preprocess)
    df["predicted_language"] = model.predict(df["text_clean"])
    df["is_correct"] = df["predicted_language"].eq(df["expected_language"])

    accuracy = df["is_correct"].mean()
    by_case_type = df.groupby("case_type")["is_correct"].agg(["count", "sum", "mean"])
    mistakes = df[~df["is_correct"]][
        ["sample_id", "text", "expected_language", "predicted_language", "case_type", "notes"]
    ]

    df.to_csv(OUTPUT_PATH, index=False)
    SUMMARY_PATH.write_text(
        "Stress test summary\n"
        "===================\n\n"
        f"Total samples: {len(df)}\n"
        f"Correct: {int(df['is_correct'].sum())}\n"
        f"Accuracy: {accuracy:.4f}\n\n"
        "Accuracy by case type:\n"
        f"{by_case_type}\n\n"
        "Mistakes:\n"
        f"{mistakes.to_string(index=False) if not mistakes.empty else 'None'}\n",
        encoding="utf-8",
    )

    print(SUMMARY_PATH.read_text(encoding="utf-8"))
    print(f"Saved detailed results to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
