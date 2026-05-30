from datetime import time

from sqlalchemy import select   
from sqlalchemy.orm import Session

from .auth import hash_password
from .database import SessionLocal
from .models import Department, DoctorProfile, DoctorSchedule, User


DEFAULT_PASSWORD = "Password123!"

DEPARTMENTS = [
    ("General Medicine", "General outpatient consultation and first-line care."),
    ("Pediatrics", "Child health, immunization, and pediatric consultation."),
    ("Antenatal Care", "Pregnancy care and maternal health appointments."),
    ("Gynecology", "Women's reproductive health services."),
    ("Eye Clinic", "Eye checks, vision complaints, and ophthalmology referrals."),
    ("Dental Care", "Dental consultation, tooth pain, and oral health services."),
    ("Cardiology", "Heart and blood pressure-related consultation."),
    ("Dermatology", "Skin, rash, wound, and allergy-related consultation."),
    ("Orthopedics", "Bone, joint, back, and injury-related consultation."),
    ("Mental Health", "Mental health support and counseling appointments."),
]

DOCTORS = [
    {
        "full_name": "Dr. Amina Bello",
        "email": "amina.bello@carebridgehealth.com",
        "phone": "08010000001",
        "department": "General Medicine",
        "specialization": "Family Medicine",
        "bio": "General outpatient physician for routine and urgent consultations.",
        "consultation_fee": 5000.0,
        "schedule": [(0, "09:00", "14:00"), (2, "09:00", "14:00"), (4, "09:00", "13:00")],
    },
    {
        "full_name": "Dr. Chinedu Okafor",
        "email": "chinedu.okafor@carebridgehealth.com",
        "phone": "08010000002",
        "department": "Pediatrics",
        "specialization": "Pediatrics",
        "bio": "Pediatric doctor for child health and immunization appointments.",
        "consultation_fee": 4500.0,
        "schedule": [(1, "10:00", "15:00"), (3, "10:00", "15:00")],
    },
    {
        "full_name": "Dr. Tola Adeyemi",
        "email": "tola.adeyemi@carebridgehealth.com",
        "phone": "08010000003",
        "department": "Eye Clinic",
        "specialization": "Ophthalmology",
        "bio": "Eye clinic doctor for vision changes, eye pain, and eye checks.",
        "consultation_fee": 6000.0,
        "schedule": [(0, "08:30", "12:30"), (3, "08:30", "12:30")],
    },
    {
        "full_name": "Dr. Fatima Musa",
        "email": "fatima.musa@carebridgehealth.com",
        "phone": "08010000004",
        "department": "Antenatal Care",
        "specialization": "Maternal Health",
        "bio": "Maternal health doctor for antenatal and pregnancy-related appointments.",
        "consultation_fee": 5500.0,
        "schedule": [(1, "09:00", "13:00"), (4, "09:00", "13:00")],
    },
]


def parse_time(value: str) -> time:
    hour, minute = value.split(":")
    return time(hour=int(hour), minute=int(minute))


def get_or_create_user(
    db: Session,
    *,
    full_name: str,
    email: str,
    role: str,
    phone: str | None = None,
    preferred_language: str = "en",
) -> User:
    user = db.scalar(select(User).where(User.email == email))
    if user:
        return user

    user = db.scalar(select(User).where(User.full_name == full_name, User.role == role))
    if user:
        user.email = email
        user.phone = phone
        user.preferred_language = preferred_language
        return user

    user = User(
        full_name=full_name,
        email=email,
        password_hash=hash_password(DEFAULT_PASSWORD),
        phone=phone,
        preferred_language=preferred_language,
        role=role,
    )
    db.add(user)
    db.flush()
    return user


def get_or_create_department(db: Session, name: str, description: str) -> Department:
    department = db.scalar(select(Department).where(Department.name == name))
    if department:
        return department

    department = Department(name=name, description=description)
    db.add(department)
    db.flush()
    return department


def get_or_create_doctor_profile(db: Session, doctor_data: dict[str, object], department: Department) -> DoctorProfile:
    user = get_or_create_user(
        db,
        full_name=str(doctor_data["full_name"]),
        email=str(doctor_data["email"]),
        phone=str(doctor_data["phone"]),
        role="doctor",
    )

    profile = db.scalar(select(DoctorProfile).where(DoctorProfile.user_id == user.id))
    if profile:
        return profile

    profile = DoctorProfile(
        user_id=user.id,
        department_id=department.id,
        specialization=str(doctor_data["specialization"]),
        bio=str(doctor_data["bio"]),
        consultation_fee=float(doctor_data["consultation_fee"]),
        is_available=True,
    )
    db.add(profile)
    db.flush()
    return profile


def schedule_exists(db: Session, doctor_id: str, day_of_week: int, start: time, end: time) -> bool:
    existing = db.scalar(
        select(DoctorSchedule).where(
            DoctorSchedule.doctor_id == doctor_id,
            DoctorSchedule.day_of_week == day_of_week,
            DoctorSchedule.start_time == start,
            DoctorSchedule.end_time == end,
        )
    )
    return existing is not None


def seed() -> None:
    db = SessionLocal()
    try:
        departments = {
            name: get_or_create_department(db, name, description)
            for name, description in DEPARTMENTS
        }

        get_or_create_user(
            db,
            full_name="System Administrator",
            email="admin@carebridgehealth.com",
            role="admin",
            phone="08000000000",
        )
        get_or_create_user(
            db,
            full_name="Test Patient",
            email="patient@carebridgehealth.com",
            role="patient",
            phone="08000000010",
            preferred_language="en",
        )

        for doctor_data in DOCTORS:
            department = departments[str(doctor_data["department"])]
            profile = get_or_create_doctor_profile(db, doctor_data, department)
            for day_of_week, start_value, end_value in doctor_data["schedule"]:
                start = parse_time(start_value)
                end = parse_time(end_value)
                if schedule_exists(db, profile.id, day_of_week, start, end):
                    continue
                db.add(
                    DoctorSchedule(
                        doctor_id=profile.id,
                        day_of_week=day_of_week,
                        start_time=start,
                        end_time=end,
                        slot_minutes=30,
                        is_active=True,
                    )
                )

        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed()
    print("Seed data created successfully.")
    print(f"Default password for seeded accounts: {DEFAULT_PASSWORD}")
