# Project Plan Assessment

## Score: 84/100

The implementation canvas is strong enough to proceed. It matches the proposal's actual scope: a hospital appointment system with patient/admin workflows, automatic language identification, dynamic localization, and model evaluation using accuracy, precision, recall, F1-score, response time, and resource usage.

## What Is Strong

- The technology stack is appropriate for a final-year project: React + Vite, FastAPI, SQLAlchemy, SQLite/PostgreSQL, scikit-learn, and i18next are coherent and lightweight.
- The ML choice is sensible. Character n-gram TF-IDF with a linear classifier is a good fit for short-text language identification and avoids unnecessary transformer complexity.
- The plan correctly treats the ML layer as detection only, not translation or medical interpretation. That keeps the research claim focused and achievable.
- The proposal and canvas agree on the core research contribution: integrating language identification into a real multilingual healthcare booking workflow.
- The plan includes the right evaluation dimensions: per-language precision, recall, F1-score, confusion matrix, response time, and basic computational efficiency.

## Concerns And Corrections

- The canvas overstates "production-grade" a little. For a dissertation MVP, we should frame this as a working research prototype with production-conscious architecture.
- SQLite UUID defaults like `gen_random_uuid()` are PostgreSQL-specific. In the implementation, UUIDs should be generated in Python so SQLite and PostgreSQL both work.
- The preprocessing regex in the canvas is too brittle and appears encoding-damaged in places. A safer approach is Unicode normalization plus character n-grams, with minimal destructive cleaning.
- The corpus plan depends on external datasets that may change names, configs, or availability. We need a local fallback CSV and a clear `data_sources.md` trail for reproducibility.
- The UI auto-switching should not be too aggressive. Users may type names, emails, drug names, or mixed-language text. The frontend should debounce detection and only switch when confidence is acceptable.
- LinearSVC does not expose calibrated probabilities by default. If we want confidence-based switching, we should use `CalibratedClassifierCV`, `LogisticRegression`, or expose a decision-margin heuristic.
- The proposal mentions manual language selection. The canvas includes it conceptually, but the implementation should make manual override a visible feature.
- The database layer should include doctors, appointments, users, and logs/audit-friendly timestamps. Security and privacy are important because the deck cites healthcare privacy concerns.

## Verdict

Go ahead. The plan earns a good pass mark because it is feasible, academically defensible, and aligned with the proposal. The build should start with a clean research-prototype architecture, then tighten the ML evaluation and UI switching behavior as data becomes available.
