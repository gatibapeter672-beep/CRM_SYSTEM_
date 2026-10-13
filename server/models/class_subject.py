# models/class_subject.py

from extensions import db
from sqlalchemy_serializer import SerializerMixin


class ClassSubject(db.Model, SerializerMixin):
    __tablename__ = "class_subjects"
    __table_args__ = (
        db.UniqueConstraint(
            'class_id',
            'subject_id',
            name='uq_class_subject'
        ),
    )

    id = db.Column(db.Integer, primary_key=True)

    class_id = db.Column(
        db.Integer,
        db.ForeignKey('classes.id'),
        nullable=False
    )

    subject_id = db.Column(
        db.Integer,
        db.ForeignKey('subjects.id'),
        nullable=False
    )

    school_class = db.relationship(
        "SchoolClass",
        back_populates="class_subjects"
    )


    subject = db.relationship(
        "Subject",
        back_populates="class_subjects"
    )

    serialize_rules = (
    '-school_class.class_subjects',
    '-subject.class_subjects'
    )

    
    def __repr__(self):
        return f"<ClassSubject class_id={self.class_id} subject_id={self.subject_id}>"