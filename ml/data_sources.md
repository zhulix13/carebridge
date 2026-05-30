# Data Sources Log

This file records every dataset used to train and evaluate the language identification model.

The goal is reproducibility: another person should be able to read this file and understand where the training text came from, why it was included, and whether it is suitable for dissertation use.

## Source Categories

### 1. External General-Language Corpora

These provide broad examples of English, Yoruba, Hausa, and Igbo.

| Source | Languages | Planned Use | Status | Date Accessed | Notes |
| --- | --- | --- | --- | --- | --- |
| FLORES-200 | English, Yoruba, Hausa, Igbo | Balanced general-language examples | Downloaded | 2026-05-08 | Local archive: `ml/raw/flores/flores200_dataset.tar.gz`. Extracted files include `eng_Latn`, `yor_Latn`, `hau_Latn`, and `ibo_Latn` for `dev` and `devtest`. |
| MasakhaNEWS | English, Yoruba, Hausa, Igbo | African-language news/domain examples | Downloaded | 2026-05-08 | Local files: `ml/raw/masakhanews/{eng,yor,hau,ibo}/{train,dev,test}.tsv`. Confirmed all four target languages. |
| Hausa VOA Topics | Hausa | Extra Hausa-only examples | Downloaded | 2026-05-08 | Local files: `ml/raw/hausa_voa/{train,validation,test}.parquet`. Use carefully so Hausa does not dominate the corpus. |

### 2. Manual Healthcare Sentences

These are appointment and symptom-related samples created specifically for this project.

| File | Languages | Planned Use | Status | Verification |
| --- | --- | --- | --- | --- |
| `manual_healthcare_samples.csv` | English, Yoruba, Hausa, Igbo | Domain-specific healthcare language examples | Started | Mark every row as verified or unverified. |
| `manual_stress_training_samples.csv` | English, Yoruba, Hausa, Igbo | Robustness examples for no-diacritic text, code-switching, short phrases, ambiguous words, and casual health requests | Added | Hand-authored training supplement; not native-speaker verified. |

## Local Inventory Snapshot

Current confirmed local data:

| Dataset | Language | Local Count / File Status |
| --- | --- | --- |
| FLORES-200 dev | English, Yoruba, Hausa, Igbo | 997 lines per language |
| FLORES-200 devtest | English, Yoruba, Hausa, Igbo | 1,012 lines per language |
| MasakhaNEWS train | English | 69,251 lines |
| MasakhaNEWS train | Yoruba | 1,435 lines |
| MasakhaNEWS train | Hausa | 2,220 lines |
| MasakhaNEWS train | Igbo | 1,357 lines |
| Hausa VOA Topics | Hausa | Train, validation, and test parquet files downloaded |
| Manual healthcare samples | English source sentences | 100 aligned rows ready for translation |
| Manual stress-training samples | English, Yoruba, Hausa, Igbo | 200 health-related rows added for robustness training |

## Manual Stress-Training Supplement

The file `manual_stress_training_samples.csv` was added after the first stress test showed weaker performance on short, ambiguous, no-diacritic, and code-switched healthcare inputs.

These examples are not a replacement for external datasets. They are a targeted robustness supplement for likely user input patterns in a Nigerian hospital appointment app, such as:

- Yoruba, Hausa, and Igbo typed without diacritics.
- Code-switching with English medical words such as `doctor`, `appointment`, `blood test`, `scan`, and `prescription`.
- Very short health phrases such as `ciwon ido`, `dokita appointment`, and `achoro doctor now`.
- Casual Nigerian English and pidgin-like health requests.

The examples are included in `corpus.csv` with source label `manual_stress_training` so their effect can be tracked separately.

## Data Quality Rules

- Keep the final training corpus balanced across the four languages.
- Preserve diacritics because Yoruba and Igbo diacritics can help language detection.
- Do not mix translated text into the corpus without marking its source.
- Keep raw source data separate from the final combined `corpus.csv`.
- Do not report only accuracy. Always report precision, recall, and F1-score per language.
- If a sentence is machine-translated, keep `verified_by_native_speaker` as `false` until reviewed.

## Dataset Build Flow

1. Collect external corpus samples.
2. Fill and review `manual_healthcare_samples.csv`.
3. Convert aligned manual samples into model rows: `text,language,source,intent`.
4. Combine external and manual rows into `corpus.csv`.
5. Train and evaluate the model.
6. Save the final report and confusion matrix for the dissertation.
