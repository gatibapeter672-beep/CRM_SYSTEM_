# server/models/teacher_class.py
from extensions import db
from sqlalchemy_serializer import SerializerMixin

class TeacherClass(db.Model, SerializerMixin):
    __tablename__ = "teacher_classes"

    id = db.Column(db.Integer, primary_key=True)

    teacher_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id'),
        nullable=False
    )

    class_id = db.Column(
        db.Integer,
        db.ForeignKey('classes.id'),
        nullable=False
    )

    # Relationships
    teacher = db.relationship(
        "User", 
        back_populates="teacher_classes"
    )
    
    school_class = db.relationship(
        "SchoolClass", 
        back_populates="teacher_classes"
    )

    # Ensures a teacher can't be added to the exact same class twice
    __table_args__ = (
        db.UniqueConstraint('teacher_id', 'class_id', name='uq_teacher_class'),
    )

    serialize_rules = (
        '-teacher.teacher_classes',
        '-school_class.teacher_classes',
    )

    def __repr__(self):
        return f"<TeacherClass teacher_id={self.teacher_id} class_id={self.class_id}>"