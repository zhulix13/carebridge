# Multilingual Hospital Appointment Booking System

Final-year project scaffold for a multilingual hospital appointment system with automatic language detection for English, Yoruba, Hausa, and Igbo.

## Structure

- `backend/` - FastAPI application, database models, auth, appointment APIs, and language detection endpoint.
- `frontend/` - React + Vite application with i18next language switching.
- `ml/` - scikit-learn training pipeline, corpus template, and model artifacts.
- `PROJECT_ASSESSMENT.md` - assessment of the implementation canvas against the proposal deck.

This is a monorepo: the frontend and backend live beside each other during development, but they are treated as separate deployable applications. The backend owns Python dependencies and API deployment. The frontend owns React/Vite dependencies and static frontend deployment.

## Quick Start

Backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
python -m app.seed
uvicorn app.main:app --reload
```

Seeded development accounts use password `Password123!`:

- `admin@carebridgehealth.com`
- `patient@carebridgehealth.com`
- `amina.bello@carebridgehealth.com`
- `chinedu.okafor@carebridgehealth.com`
- `tola.adeyemi@carebridgehealth.com`
- `fatima.musa@carebridgehealth.com`

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Train the language model after replacing the sample corpus with real data:

```bash
cd ml
python train.py
```
