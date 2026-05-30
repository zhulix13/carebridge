import uuid
from datetime import datetime, time

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, Time, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def uuid_str() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    full_name: Mapped[str] = mapped_column(String(160))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    preferred_language: Mapped[str] = mapped_column(String(8), default="en")
    role: Mapped[str] = mapped_column(String(20), default="patient")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    appointments: Mapped[list["Appointment"]] = relationship(back_populates="patient")
    doctor_profile: Mapped["DoctorProfile | None"] = relationship(back_populates="user")
    language_detection_logs: Mapped[list["LanguageDetectionLog"]] = relationship(back_populates="user")


class Department(Base):
    __tablename__ = "departments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    name: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    doctor_profiles: Mapped[list["DoctorProfile"]] = relationship(back_populates="department")
    appointments: Mapped[list["Appointment"]] = relationship(back_populates="department")


class DoctorProfile(Base):
    __tablename__ = "doctor_profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), unique=True)
    department_id: Mapped[str] = mapped_column(ForeignKey("departments.id"))
    specialization: Mapped[str | None] = mapped_column(String(160), nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    consultation_fee: Mapped[float | None] = mapped_column(Float, nullable=True)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    user: Mapped[User] = relationship(back_populates="doctor_profile")
    department: Mapped[Department] = relationship(back_populates="doctor_profiles")
    schedules: Mapped[list["DoctorSchedule"]] = relationship(back_populates="doctor")
    appointments: Mapped[list["Appointment"]] = relationship(back_populates="doctor")


class DoctorSchedule(Base):
    __tablename__ = "doctor_schedules"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    doctor_id: Mapped[str] = mapped_column(ForeignKey("doctor_profiles.id"))
    day_of_week: Mapped[int] = mapped_column(Integer)
    start_time: Mapped[time] = mapped_column(Time)
    end_time: Mapped[time] = mapped_column(Time)
    slot_minutes: Mapped[int] = mapped_column(Integer, default=30)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    doctor: Mapped[DoctorProfile] = relationship(back_populates="schedules")


class Appointment(Base):
    __tablename__ = "appointments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    patient_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    doctor_id: Mapped[str] = mapped_column(ForeignKey("doctor_profiles.id"))
    department_id: Mapped[str] = mapped_column(ForeignKey("departments.id"))
    appointment_date: Mapped[datetime] = mapped_column(DateTime)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    reason: Mapped[str | None] = mapped_column(String(255), nullable=True)
    symptoms: Mapped[str | None] = mapped_column(Text, nullable=True)
    detected_language: Mapped[str | None] = mapped_column(String(20), nullable=True)
    language_source: Mapped[str] = mapped_column(String(20), default="auto")
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    patient: Mapped[User] = relationship(back_populates="appointments")
    doctor: Mapped[DoctorProfile] = relationship(back_populates="appointments")
    department: Mapped[Department] = relationship(back_populates="appointments")


class LanguageDetectionLog(Base):
    __tablename__ = "language_detection_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    input_text: Mapped[str] = mapped_column(Text)
    detected_language: Mapped[str] = mapped_column(String(20))
    i18n_code: Mapped[str] = mapped_column(String(8))
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    source_page: Mapped[str | None] = mapped_column(String(120), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    user: Mapped[User | None] = relationship(back_populates="language_detection_logs")
