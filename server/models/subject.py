# models/subject.py

from extensions import db
from sqlalchemy_serializer import SerializerMixin


class Subject(db.Model, SerializerMixin):
    __tablename__ = "subjects"

    id = db.Column(db.Integer, primary_key=True)

    subject_name = db.Column(
        db.String(100),
        unique=True,
        nullable=False
    )

    subject_code = db.Column(
        db.String(20),
        unique=True
    )

    description = db.Column(db.Text)

    resources = db.relationship(
        "Resource",
        back_populates="subject",
        cascade="all, delete-orphan"
    )

    class_subjects = db.relationship(
        "ClassSubject",
        back_populates="subject",
        cascade="all, delete-orphan"
    )

    serialize_rules = (
    '-resources.subject',
    '-class_subjects.subject'
    )

    def __repr__(self):
        return f"<Subject {self.subject_name}>"