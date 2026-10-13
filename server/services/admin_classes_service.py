from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from extensions import db
from models.class_model import SchoolClass
from models.subject import Subject
from models.user import User
from models.class_subject import ClassSubject
from models.teacher_class import TeacherClass
from models.student_class import StudentClass
import logging

logger = logging.getLogger(__name__)


def get_all_classes_deck():
    """Fetches all classes with pre-joined relations for the Class Deck."""
    try:
        classes = db.session.scalars(
            select(SchoolClass).order_by(SchoolClass.class_name.asc())
        ).all()
        return classes, 200
    except SQLAlchemyError as e:
        logger.error(f"Error fetching class deck details: {str(e)}")
        return {"error": "Failed to compile system class deck records."}, 500


def create_new_class(data: dict):
    """Initializes a new class container."""
    try:
        class_name = data.get("class_name").strip()
        existing = db.session.scalar(
            select(SchoolClass).where(SchoolClass.class_name == class_name)
        )
        if existing:
            return {"error": f"A class named '{class_name}' already exists."}, 400

        new_class = SchoolClass(
            class_name=class_name,
            description=data.get("description", "").strip() if data.get("description") else None
        )
        db.session.add(new_class)
        db.session.commit()
        return new_class, 201

    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Error creating class: {str(e)}")
        return {"error": "Database error while initializing class."}, 500


# --- BINDING & UNBINDING OPERATIONS ---

def bind_subject_to_class(class_id: int, subject_id: int):
    try:
        # Check if bridge exists
        existing = db.session.scalar(
            select(ClassSubject)
            .where(ClassSubject.class_id == class_id)
            .where(ClassSubject.subject_id == subject_id)
        )
        if existing:
            return {"error": "Subject is already bound to this class."}, 400

        bridge = ClassSubject(class_id=class_id, subject_id=subject_id)
        db.session.add(bridge)
        db.session.commit()
        return {"message": "Subject successfully bound to class.", "id": bridge.id}, 201
    except IntegrityError:
        db.session.rollback()
        return {"error": "Invalid class_id or subject_id provided."}, 400
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Error binding subject: {str(e)}")
        return {"error": "Database error during subject binding."}, 500


def unbind_subject_from_class(bridge_id: int):
    try:
        bridge = db.session.get(ClassSubject, bridge_id)
        if not bridge:
            return {"error": "Subject association not found."}, 404

        db.session.delete(bridge)
        db.session.commit()
        return {"message": "Subject unlinked successfully."}, 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return {"error": "Failed to remove subject association."}, 500


def bind_teacher_to_class(class_id: int, teacher_id: int):
    try:
        # Check user role
        teacher = db.session.get(User, teacher_id)
        if not teacher or teacher.role.role_name != 'teacher':
            return {"error": "Target user is not a valid faculty member."}, 400

        existing = db.session.scalar(
            select(TeacherClass)
            .where(TeacherClass.class_id == class_id)
            .where(TeacherClass.teacher_id == teacher_id)
        )
        if existing:
            return {"error": "Teacher is already assigned to this class."}, 400

        bridge = TeacherClass(class_id=class_id, teacher_id=teacher_id)
        db.session.add(bridge)
        db.session.commit()
        return {"message": "Teacher assigned successfully.", "id": bridge.id}, 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return {"error": "Database error assigning teacher."}, 500


def unbind_teacher_from_class(bridge_id: int):
    try:
        bridge = db.session.get(TeacherClass, bridge_id)
        if not bridge:
            return {"error": "Teacher mapping record not found."}, 404

        db.session.delete(bridge)
        db.session.commit()
        return {"message": "Teacher unassigned successfully."}, 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return {"error": "Failed to unassign teacher."}, 500


def bind_student_to_class(class_id: int, student_id: int):
    try:
        student = db.session.get(User, student_id)
        if not student or student.role.role_name != 'student':
            return {"error": "Target user is not a valid student."}, 400

        existing = db.session.scalar(
            select(StudentClass)
            .where(StudentClass.class_id == class_id)
            .where(StudentClass.student_id == student_id)
        )
        if existing:
            return {"error": "Student is already enrolled in this class."}, 400

        bridge = StudentClass(class_id=class_id, student_id=student_id)
        db.session.add(bridge)
        db.session.commit()
        return {"message": "Student enrolled successfully.", "id": bridge.id}, 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return {"error": "Database error enrolling student."}, 500


def unbind_student_from_class(bridge_id: int):
    try:
        bridge = db.session.get(StudentClass, bridge_id)
        if not bridge:
            return {"error": "Student enrollment record not found."}, 404

        db.session.delete(bridge)
        db.session.commit()
        return {"message": "Student unenrolled successfully."}, 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return {"error": "Failed to unenroll student."}, 500

def get_global_pools():
    """Retrieves list of all subjects, teachers, and students for dropdown selection."""
    try:
        subjects = db.session.scalars(
            select(Subject).order_by(Subject.subject_name.asc())
        ).all()

        teachers = db.session.scalars(
            select(User)
            .where(User.role.has(role_name="teacher"))   # ✅ FIX
            .order_by(User.first_name.asc())
        ).all()

        students = db.session.scalars(
            select(User)
            .where(User.role.has(role_name="student"))   # ✅ FIX
            .order_by(User.first_name.asc())
        ).all()

        return {
            "subjects": subjects,
            "teachers": teachers,
            "students": students
        }, 200

    except SQLAlchemyError as e:
        logger.error(f"Error fetching global selection pools: {str(e)}")
        return {"error": "Failed to fetch selection options."}, 500


# def get_global_pools():
#     """Retrieves list of all subjects, teachers, and students for dropdown selection."""
#     try:
#         subjects = db.session.scalars(select(Subject).order_by(Subject.subject_name.asc())).all()
#         teachers = db.session.scalars(select(User).where(User.role == 'teacher').order_by(User.first_name.asc())).all()
#         students = db.session.scalars(select(User).where(User.role == 'student').order_by(User.first_name.asc())).all()

#         return {
#             "subjects": subjects,
#             "teachers": teachers,
#             "students": students
#         }, 200
#     except SQLAlchemyError as e:
#         logger.error(f"Error fetching global selection pools: {str(e)}")
#         return {"error": "Failed to fetch selection options."}, 500