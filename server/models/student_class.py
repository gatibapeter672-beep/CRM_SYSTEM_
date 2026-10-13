# server/models/student_class.py

from extensions import db
from sqlalchemy_serializer import SerializerMixin



class StudentClass(db.Model, SerializerMixin):
    __tablename__ = "student_classes"

    id = db.Column(db.Integer, primary_key=True)

    student_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id'),
        nullable=False
    )

    class_id = db.Column(
        db.Integer,
        db.ForeignKey('classes.id'),
        nullable=False
    )

    # relationships
    student = db.relationship(
        "User",
        back_populates="student_classes"
    )

    school_class = db.relationship(
        "SchoolClass",
        back_populates="student_classes"
    )

    __table_args__ = (
        db.UniqueConstraint('student_id', 'class_id', name='uq_student_class'),
    )

    serialize_rules = (
        '-student.student_classes',
        '-school_class.student_classes',
    )