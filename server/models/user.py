# models/user.py

from extensions import db, bcrypt
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.hybrid import hybrid_property
from datetime import datetime, timezone
from sqlalchemy.orm import validates
import re


class User(db.Model, SerializerMixin):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    first_name = db.Column(
        db.String(100),
        nullable=False
    )

    last_name = db.Column(
        db.String(100),
        nullable=False
    )

    email = db.Column(
        db.String(255),
        unique=True,
        nullable=False
    )

    _password_hash = db.Column(
        db.String(255),
        nullable=False
    )

    role_id = db.Column(
        db.Integer,
        db.ForeignKey('roles.id'),
        nullable=False
    )

    is_active = db.Column(
        db.Boolean,
        default=True
    )

    last_login = db.Column(db.DateTime)

    created_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    role = db.relationship(
        "Role",
        back_populates="users"
    )

    uploaded_resources = db.relationship(
        "Resource",
        back_populates="uploader"
    )
    student_classes = db.relationship(
    "StudentClass",
    back_populates="student",
    cascade="all, delete-orphan"
    )

    downloads = db.relationship(
        "Download",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    resource_views = db.relationship(
    "ResourceView",
    back_populates="user",
    cascade="all, delete-orphan"
)
    # Add the teacher_classes relationship here
    teacher_classes = db.relationship(
        "TeacherClass",
        back_populates="teacher",
        cascade="all, delete-orphan"
    )



    serialize_rules = (
    '-teacher_classes.teacher',
    '-_password_hash',
    '-role.users',
    '-student_classes.student',
    '-downloads.user',
    '-resource_views.user',
    '-uploaded_resources.uploader'
    )

    #password handling property

    @hybrid_property
    def password(self):
        raise AttributeError("Password is not readable")
    


    @password.setter
    def password(self, plain_password):
        self._password_hash =bcrypt.generate_password_hash(plain_password).decode('utf-8')


    def check_password(self, plain_password):
        return bcrypt.check_password_hash(self._password_hash, plain_password)

    @validates('email')
    def validate_email(self,key,email):
        email = email.lower()
        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            raise ValueError('invalid email format')
        return email
    

    

    def __repr__(self):
        return f"<User {self.email}>"