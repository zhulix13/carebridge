from pathlib import Path

import joblib

from train import preprocess


ROOT = Path(__file__).resolve().parent
MODEL_PATH = ROOT / "language_model.pkl"


def main() -> None:
    if not MODEL_PATH.exists():
        raise FileNotFoundError("Model not found. Run `python ml/train.py` first.")

    model = joblib.load(MODEL_PATH)

    print("Language detection CLI")
    print("======================")
    print("Type a sentence or word and press Enter.")
    print("Type `exit` or press Ctrl+C to quit.\n")

    while True:
        text = input("Text> ").strip()
        if text.lower() in {"exit", "quit", "q"}:
            print("Goodbye.")
            break
        if not text:
            print("Please type something.\n")
            continue

        cleaned = preprocess(text)
        prediction = model.predict([cleaned])[0]
        print(f"Detected language: {prediction}\n")


if __name__ == "__main__":
    main()
