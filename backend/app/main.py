from datetime import date, datetime, time, timedelta

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .auth import create_access_token, get_current_user, hash_password, require_admin, require_patient, verify_password
from .config import get_settings
from .database import get_db
from .language import detector
from .models import Appointment, Department, DoctorProfile, DoctorSchedule, LanguageDetectionLog, Notification, User
from .schemas import (
    AvailableSlotRead,
    AppointmentCreate,
    AppointmentRead,
    AppointmentRescheduleRequest,
    AppointmentStatusUpdate,
    DepartmentCreate,
    DepartmentRead,
    DoctorCardRead,
    DoctorProfileCreate,
    DoctorOnboard,
    DoctorProfileRead,
    DoctorScheduleCreate,
    DoctorScheduleRead,
    LanguageDetectionRequest,
    LanguageDetectionResponse,
    LanguageDetectionLogRead,
    LoginRequest,
    NotificationRead,
    NotificationSummary,
    TokenResponse,
    UserCreate,
    UserRead,
)


settings = get_settings()
app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    detector.load()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/auth/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)) -> TokenResponse:
    existing = db.scalar(select(User).where(User.email == payload.email.lower()))
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    user = User(
        full_name=payload.full_name,
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
        phone=payload.phone,
        preferred_language=payload.preferred_language,
        role="patient",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return TokenResponse(access_token=create_access_token(user.id), user=UserRead.model_validate(user))


@app.post("/auth/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return TokenResponse(access_token=create_access_token(user.id), user=UserRead.model_validate(user))


@app.get("/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@app.post("/departments", response_model=DepartmentRead, status_code=status.HTTP_201_CREATED)
def create_department(
    payload: DepartmentCreate,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> Department:
    existing = db.scalar(select(Department).where(Department.name == payload.name))
    if existing:
        raise HTTPException(status_code=409, detail="Department already exists")
    department = Department(**payload.model_dump())
    db.add(department)
    db.commit()
    db.refresh(department)
    return department


@app.get("/departments", response_model=list[DepartmentRead])
def list_departments(db: Session = Depends(get_db)) -> list[Department]:
    return list(db.scalars(select(Department).order_by(Department.name)))


@app.post("/doctors", response_model=DoctorProfileRead, status_code=status.HTTP_201_CREATED)
def onboard_doctor(
    payload: DoctorOnboard,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> DoctorProfile:
    # Check if department exists
    if not db.get(Department, payload.department_id):
        raise HTTPException(status_code=404, detail="Department not found")

    # Check if user email is registered
    existing_user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if existing_user:
        raise HTTPException(status_code=409, detail="Email already registered")

    # Create user account for doctor
    user = User(
        full_name=payload.full_name,
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
        phone=payload.phone,
        preferred_language=payload.preferred_language,
        role="doctor",
    )
    db.add(user)
    db.flush()  # get the newly generated UUID

    # Create doctor profile
    doctor = DoctorProfile(
        user_id=user.id,
        department_id=payload.department_id,
        specialization=payload.specialization,
        bio=payload.bio,
        consultation_fee=payload.consultation_fee,
        is_available=True,
    )
    db.add(doctor)
    db.commit()
    db.refresh(doctor)
    return doctor



@app.get("/doctors", response_model=list[DoctorCardRead])
def list_doctors(db: Session = Depends(get_db)) -> list[DoctorCardRead]:
    rows = db.execute(
        select(DoctorProfile, User, Department)
        .join(User, DoctorProfile.user_id == User.id)
        .join(Department, DoctorProfile.department_id == Department.id)
        .order_by(User.full_name)
    ).all()
    return [
        DoctorCardRead(
            id=profile.id,
            user_id=user.id,
            full_name=user.full_name,
            email=user.email,
            phone=user.phone,
            department_id=department.id,
            department_name=department.name,
            specialization=profile.specialization,
            bio=profile.bio,
            consultation_fee=profile.consultation_fee,
            is_available=profile.is_available,
        )
        for profile, user, department in rows
    ]


@app.post("/doctor-schedules", response_model=DoctorScheduleRead, status_code=status.HTTP_201_CREATED)
def create_doctor_schedule(
    payload: DoctorScheduleCreate,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> DoctorSchedule:
    if not db.get(DoctorProfile, payload.doctor_id):
        raise HTTPException(status_code=404, detail="Doctor not found")
    if payload.end_time <= payload.start_time:
        raise HTTPException(status_code=400, detail="End time must be after start time")

    schedule = DoctorSchedule(**payload.model_dump())
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    return schedule


@app.get("/doctor-schedules", response_model=list[DoctorScheduleRead])
def list_doctor_schedules(
    doctor_id: str | None = None,
    db: Session = Depends(get_db),
) -> list[DoctorSchedule]:
    query = select(DoctorSchedule).order_by(DoctorSchedule.day_of_week, DoctorSchedule.start_time)
    if doctor_id:
        query = query.where(DoctorSchedule.doctor_id == doctor_id)
    return list(db.scalars(query))


@app.get("/doctors/{doctor_id}/available-slots", response_model=list[AvailableSlotRead])
def list_doctor_available_slots(
    doctor_id: str,
    slot_date: date,
    db: Session = Depends(get_db),
) -> list[AvailableSlotRead]:
    doctor = db.get(DoctorProfile, doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    if not doctor.is_available:
        return []

    schedules = list(db.scalars(
        select(DoctorSchedule).where(
            DoctorSchedule.doctor_id == doctor_id,
            DoctorSchedule.day_of_week == slot_date.weekday(),
            DoctorSchedule.is_active.is_(True),
        )
    ))
    if not schedules:
        return []

    day_start = datetime.combine(slot_date, time.min)
    day_end = datetime.combine(slot_date, time.max)
    booked_dates = set(db.scalars(
        select(Appointment.appointment_date).where(
            Appointment.doctor_id == doctor_id,
            Appointment.appointment_date >= day_start,
            Appointment.appointment_date <= day_end,
            Appointment.status != "cancelled",
        )
    ))

    now = datetime.now()
    slots: list[AvailableSlotRead] = []
    for schedule in schedules:
        step = timedelta(minutes=schedule.slot_minutes)
        current = datetime.combine(slot_date, schedule.start_time)
        schedule_end = datetime.combine(slot_date, schedule.end_time)
        while current + step <= schedule_end:
            normalized = current.replace(second=0, microsecond=0)
            if normalized >= now and normalized not in booked_dates:
                slots.append(
                    AvailableSlotRead(
                        appointment_date=normalized,
                        time=normalized.strftime("%H:%M"),
                        label=normalized.strftime("%I:%M %p").lstrip("0"),
                    )
                )
            current += step

    return slots


@app.post("/appointments", response_model=AppointmentRead, status_code=status.HTTP_201_CREATED)
def book_appointment(
    payload: AppointmentCreate,
    current_user: User = Depends(require_patient),
    db: Session = Depends(get_db),
) -> AppointmentRead:
    doctor = db.get(DoctorProfile, payload.doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    if not db.get(Department, payload.department_id):
        raise HTTPException(status_code=404, detail="Department not found")
    if doctor.department_id != payload.department_id:
        raise HTTPException(status_code=400, detail="Doctor does not belong to selected department")
    if not doctor.is_available:
        raise HTTPException(status_code=400, detail="Doctor is not currently available for bookings")

    appointment_date = payload.appointment_date.replace(second=0, microsecond=0)
    appointment_time = appointment_date.time()
    validate_doctor_schedule(db, doctor.id, appointment_date.weekday(), appointment_time)
    ensure_slot_not_booked(db, doctor.id, appointment_date)

    appointment_data = payload.model_dump()
    appointment_data["appointment_date"] = appointment_date
    appointment = Appointment(patient_id=current_user.id, **appointment_data)
    db.add(appointment)
    db.flush()
    create_appointment_notification(db, appointment, "booked")
    db.commit()
    db.refresh(appointment)
    return get_appointment_read(db, appointment.id)


def validate_doctor_schedule(db: Session, doctor_id: str, day_of_week: int, appointment_time: time) -> None:
    schedules = db.scalars(
        select(DoctorSchedule).where(
            DoctorSchedule.doctor_id == doctor_id,
            DoctorSchedule.day_of_week == day_of_week,
            DoctorSchedule.is_active.is_(True),
        )
    )
    for schedule in schedules:
        if schedule.start_time <= appointment_time < schedule.end_time:
            return
    raise HTTPException(status_code=400, detail="Selected time is outside the doctor's active schedule")


def ensure_slot_not_booked(
    db: Session,
    doctor_id: str,
    appointment_date: datetime,
    exclude_appointment_id: str | None = None,
) -> None:
    query = select(Appointment).where(
        Appointment.doctor_id == doctor_id,
        Appointment.appointment_date == appointment_date,
        Appointment.status != "cancelled",
    )
    if exclude_appointment_id:
        query = query.where(Appointment.id != exclude_appointment_id)

    existing = db.scalar(query)
    if existing:
        raise HTTPException(status_code=409, detail="This doctor already has an appointment at that time")


@app.get("/appointments", response_model=list[AppointmentRead])
def list_appointments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[AppointmentRead]:
    query = (
        select(Appointment, DoctorProfile, User, Department)
        .join(DoctorProfile, Appointment.doctor_id == DoctorProfile.id)
        .join(User, DoctorProfile.user_id == User.id)
        .join(Department, Appointment.department_id == Department.id)
        .order_by(Appointment.appointment_date.desc())
    )
    if current_user.role != "admin":
        query = query.where(Appointment.patient_id == current_user.id)
    return [
        build_appointment_read(appointment, doctor, doctor_user, department)
        for appointment, doctor, doctor_user, department in db.execute(query).all()
    ]


@app.patch("/appointments/{appointment_id}/cancel", response_model=AppointmentRead)
def cancel_appointment(
    appointment_id: str,
    current_user: User = Depends(require_patient),
    db: Session = Depends(get_db),
) -> AppointmentRead:
    appointment = get_patient_appointment(db, appointment_id, current_user.id)
    if appointment.status in {"cancelled", "completed"}:
        raise HTTPException(status_code=400, detail=f"Cannot cancel a {appointment.status} appointment")

    appointment.status = "cancelled"
    create_appointment_notification(db, appointment, "cancelled")
    db.commit()
    db.refresh(appointment)
    return get_appointment_read(db, appointment.id)


@app.patch("/appointments/{appointment_id}/reschedule", response_model=AppointmentRead)
def reschedule_appointment(
    appointment_id: str,
    payload: AppointmentRescheduleRequest,
    current_user: User = Depends(require_patient),
    db: Session = Depends(get_db),
) -> AppointmentRead:
    appointment = get_patient_appointment(db, appointment_id, current_user.id)
    if appointment.status in {"cancelled", "completed"}:
        raise HTTPException(status_code=400, detail=f"Cannot reschedule a {appointment.status} appointment")

    appointment_date = payload.appointment_date.replace(second=0, microsecond=0)
    validate_doctor_schedule(db, appointment.doctor_id, appointment_date.weekday(), appointment_date.time())
    ensure_slot_not_booked(db, appointment.doctor_id, appointment_date, exclude_appointment_id=appointment.id)

    appointment.appointment_date = appointment_date
    appointment.status = "pending"
    create_appointment_notification(db, appointment, "rescheduled")
    db.commit()
    db.refresh(appointment)
    return get_appointment_read(db, appointment.id)


@app.patch("/appointments/{appointment_id}/status", response_model=AppointmentRead)
def update_appointment_status(
    appointment_id: str,
    payload: AppointmentStatusUpdate,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> AppointmentRead:
    appointment = db.get(Appointment, appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    appointment.status = payload.status
    create_appointment_notification(db, appointment, payload.status)
    db.commit()
    db.refresh(appointment)
    return get_appointment_read(db, appointment.id)


@app.get("/notifications", response_model=list[NotificationRead])
def list_notifications(
    current_user: User = Depends(require_patient),
    db: Session = Depends(get_db),
) -> list[Notification]:
    return list(db.scalars(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
    ))


@app.get("/notifications/summary", response_model=NotificationSummary)
def notification_summary(
    current_user: User = Depends(require_patient),
    db: Session = Depends(get_db),
) -> NotificationSummary:
    unread_count = db.scalar(
        select(func.count(Notification.id)).where(
            Notification.user_id == current_user.id,
            Notification.is_read.is_(False),
        )
    ) or 0
    return NotificationSummary(unread_count=unread_count)


@app.patch("/notifications/read", response_model=NotificationSummary)
def mark_notifications_read(
    current_user: User = Depends(require_patient),
    db: Session = Depends(get_db),
) -> NotificationSummary:
    notifications = list(db.scalars(
        select(Notification).where(
            Notification.user_id == current_user.id,
            Notification.is_read.is_(False),
        )
    ))
    for notification in notifications:
        notification.is_read = True
    db.commit()
    return NotificationSummary(unread_count=0)


def create_appointment_notification(db: Session, appointment: Appointment, event_type: str) -> None:
    title_map = {
        "booked": "Appointment booked",
        "pending": "Appointment pending",
        "confirmed": "Appointment confirmed",
        "completed": "Appointment completed",
        "cancelled": "Appointment cancelled",
        "rescheduled": "Appointment rescheduled",
    }
    message_map = {
        "booked": "Your appointment was booked and is waiting for confirmation.",
        "pending": "Your appointment is pending confirmation.",
        "confirmed": "Your appointment has been confirmed.",
        "completed": "Your appointment has been marked as completed.",
        "cancelled": "Your appointment has been cancelled.",
        "rescheduled": "Your appointment was rescheduled and is waiting for confirmation.",
    }
    db.add(Notification(
        user_id=appointment.patient_id,
        appointment_id=appointment.id,
        type=f"appointment_{event_type}",
        title=title_map.get(event_type, "Appointment updated"),
        message=message_map.get(event_type, "Your appointment was updated."),
    ))


def get_patient_appointment(db: Session, appointment_id: str, patient_id: str) -> Appointment:
    appointment = db.get(Appointment, appointment_id)
    if not appointment or appointment.patient_id != patient_id:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment


def get_appointment_read(db: Session, appointment_id: str) -> AppointmentRead:
    row = db.execute(
        select(Appointment, DoctorProfile, User, Department)
        .join(DoctorProfile, Appointment.doctor_id == DoctorProfile.id)
        .join(User, DoctorProfile.user_id == User.id)
        .join(Department, Appointment.department_id == Department.id)
        .where(Appointment.id == appointment_id)
    ).one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Appointment not found")
    appointment, doctor, doctor_user, department = row
    return build_appointment_read(appointment, doctor, doctor_user, department)


def build_appointment_read(
    appointment: Appointment,
    doctor: DoctorProfile,
    doctor_user: User,
    department: Department,
) -> AppointmentRead:
    return AppointmentRead.model_validate(appointment).model_copy(update={
        "doctor_name": doctor_user.full_name,
        "doctor_specialization": doctor.specialization,
        "department_name": department.name,
        "consultation_fee": doctor.consultation_fee,
    })


@app.post("/detect-language", response_model=LanguageDetectionResponse)
def detect_language(
    payload: LanguageDetectionRequest,
    db: Session = Depends(get_db),
) -> dict[str, str | float | bool | None]:
    result = detector.predict(payload.text)
    if payload.should_log:
        log = LanguageDetectionLog(
            input_text=payload.text,
            detected_language=str(result["detected_language"]),
            i18n_code=str(result["i18n_code"]),
            confidence=result["confidence"] if isinstance(result["confidence"], float) else None,
            source_page=payload.source_page,
        )
        db.add(log)
        db.commit()
    return result


@app.get("/language-detection-logs", response_model=list[LanguageDetectionLogRead])
def list_language_detection_logs(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> list[LanguageDetectionLog]:
    return list(db.scalars(select(LanguageDetectionLog).order_by(LanguageDetectionLog.created_at.desc())))


# ── New Admin Endpoints ──────────────────────────────────────────────────────

@app.get("/users", response_model=list[UserRead])
def list_users(
    role: str | None = None,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> list[User]:
    """List all registered users. Optionally filter by role (patient, doctor, admin)."""
    query = select(User).order_by(User.created_at.desc())
    if role:
        query = query.where(User.role == role)
    return list(db.scalars(query))


@app.get("/admin/stats")
def admin_stats(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> dict:
    """Aggregated hospital metrics computed at the database level."""
    total_patients = db.scalar(select(func.count(User.id)).where(User.role == "patient")) or 0
    total_doctors = db.scalar(select(func.count(User.id)).where(User.role == "doctor")) or 0
    total_departments = db.scalar(select(func.count(Department.id))) or 0
    total_appointments = db.scalar(select(func.count(Appointment.id))) or 0

    pending_count = db.scalar(
        select(func.count(Appointment.id)).where(Appointment.status == "pending")
    ) or 0
    confirmed_count = db.scalar(
        select(func.count(Appointment.id)).where(Appointment.status == "confirmed")
    ) or 0
    completed_count = db.scalar(
        select(func.count(Appointment.id)).where(Appointment.status == "completed")
    ) or 0
    cancelled_count = db.scalar(
        select(func.count(Appointment.id)).where(Appointment.status == "cancelled")
    ) or 0

    total_lang_logs = db.scalar(select(func.count(LanguageDetectionLog.id))) or 0

    # Per-language log breakdown
    lang_breakdown_rows = db.execute(
        select(LanguageDetectionLog.i18n_code, func.count(LanguageDetectionLog.id))
        .group_by(LanguageDetectionLog.i18n_code)
    ).all()
    lang_breakdown = {code: count for code, count in lang_breakdown_rows}

    return {
        "total_patients": total_patients,
        "total_doctors": total_doctors,
        "total_departments": total_departments,
        "total_appointments": total_appointments,
        "appointments_by_status": {
            "pending": pending_count,
            "confirmed": confirmed_count,
            "completed": completed_count,
            "cancelled": cancelled_count,
        },
        "total_language_logs": total_lang_logs,
        "language_breakdown": lang_breakdown,
    }


@app.delete("/doctors/{doctor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_doctor_profile(
    doctor_id: str,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> None:
    """Offboard a physician by removing their doctor profile.
    Pending or confirmed appointments are automatically cancelled before deletion.
    """
    doctor = db.get(DoctorProfile, doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    # Safely cancel all non-terminal appointments before removing the profile
    active_appointments = list(db.scalars(
        select(Appointment).where(
            Appointment.doctor_id == doctor_id,
            Appointment.status.in_(["pending", "confirmed"]),
        )
    ))
    for appt in active_appointments:
        appt.status = "cancelled"
        create_appointment_notification(db, appt, "cancelled")

    db.delete(doctor)
    db.commit()
