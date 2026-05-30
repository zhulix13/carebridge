from datetime import datetime, time

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=160)
    email: EmailStr
    password: str = Field(min_length=6)
    phone: str | None = None
    preferred_language: str = "en"


class UserRead(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    phone: str | None
    preferred_language: str
    role: str
    is_active: bool

    model_config = {"from_attributes": True}


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


class DepartmentCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    description: str | None = None


class DepartmentRead(DepartmentCreate):
    id: str

    model_config = {"from_attributes": True}


class DoctorProfileCreate(BaseModel):
    user_id: str
    department_id: str
    specialization: str | None = None
    bio: str | None = None
    consultation_fee: float | None = None
    is_available: bool = True


class DoctorOnboard(BaseModel):
    full_name: str = Field(min_length=2, max_length=160)
    email: EmailStr
    password: str = Field(min_length=6)
    phone: str | None = None
    preferred_language: str = "en"
    department_id: str
    specialization: str | None = None
    bio: str | None = None
    consultation_fee: float | None = None



class DoctorProfileRead(BaseModel):
    id: str
    user_id: str
    department_id: str
    specialization: str | None
    bio: str | None
    consultation_fee: float | None
    is_available: bool

    model_config = {"from_attributes": True}


class DoctorCardRead(BaseModel):
    id: str
    user_id: str
    full_name: str
    email: EmailStr
    phone: str | None
    department_id: str
    department_name: str
    specialization: str | None
    bio: str | None
    consultation_fee: float | None
    is_available: bool


class DoctorScheduleCreate(BaseModel):
    doctor_id: str
    day_of_week: int = Field(ge=0, le=6)
    start_time: time
    end_time: time
    slot_minutes: int = Field(default=30, ge=5, le=240)
    is_active: bool = True


class DoctorScheduleRead(DoctorScheduleCreate):
    id: str

    model_config = {"from_attributes": True}


class AvailableSlotRead(BaseModel):
    appointment_date: datetime
    time: str
    label: str


class AppointmentCreate(BaseModel):
    doctor_id: str
    department_id: str
    appointment_date: datetime
    reason: str | None = Field(default=None, max_length=255)
    symptoms: str | None = None
    detected_language: str | None = None
    language_source: str = "auto"
    notes: str | None = None


class AppointmentRead(BaseModel):
    id: str
    patient_id: str
    doctor_id: str
    department_id: str
    appointment_date: datetime
    status: str
    reason: str | None
    symptoms: str | None
    detected_language: str | None
    language_source: str
    notes: str | None
    doctor_name: str | None = None
    doctor_specialization: str | None = None
    department_name: str | None = None
    consultation_fee: float | None = None

    model_config = {"from_attributes": True}


class AppointmentRescheduleRequest(BaseModel):
    appointment_date: datetime


class AppointmentStatusUpdate(BaseModel):
    status: str = Field(pattern="^(pending|confirmed|cancelled|completed)$")


class LanguageDetectionRequest(BaseModel):
    text: str = Field(min_length=3)
    should_log: bool = True
    source_page: str = "api"


class LanguageDetectionResponse(BaseModel):
    detected_language: str
    i18n_code: str
    confidence: float | None = None
    switched: bool = True


class LanguageDetectionLogRead(BaseModel):
    id: str
    user_id: str | None
    input_text: str
    detected_language: str
    i18n_code: str
    confidence: float | None
    source_page: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
