# models/class_model.py

from extensions import db
from sqlalchemy_serializer import SerializerMixin


class SchoolClass(db.Model, SerializerMixin):
    __tablename__ = "classes"

    id = db.Column(db.Integer, primary_key=True)
    

    class_name = db.Column(
        db.String(100),
        nullable=False,
        unique=True
    )

    description = db.Column(db.Text)

    resources = db.relationship(
        "Resource",
        back_populates="school_class",
        cascade="all, delete-orphan"

    )

    class_subjects = db.relationship(
        "ClassSubject",
        back_populates="school_class",
        cascade="all, delete-orphan"
    )
    student_classes = db.relationship(
    "StudentClass",
    back_populates="school_class",
    cascade="all, delete-orphan"
    )

    # Add the teacher_classes relationship here
    teacher_classes = db.relationship(
        "TeacherClass",
        back_populates="school_class",
        cascade="all, delete-orphan"
    )


    serialize_rules = (
    '-teacher_classes.school_class',
    '-resources.school_class',
    '-class_subjects.school_class',
    '-student_classes.school_class'
    )

    def __repr__(self):
        return f"<SchoolClass {self.class_name}>"