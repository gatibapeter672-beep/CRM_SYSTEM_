# models/resource.py

from extensions import db
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime, timezone


class Resource(db.Model, SerializerMixin):
    __tablename__ = "resources"

    id = db.Column(db.Integer, primary_key=True)

    title = db.Column(
        db.String(255),
        nullable=False
    )

    description = db.Column(db.Text)

    file_name = db.Column(
        db.String(255),
        nullable=False
    )

    file_path = db.Column(
        db.Text,
        nullable=False
    )

    file_size = db.Column(db.BigInteger)

    file_type = db.Column(
        db.String(50)
    )

    resource_type = db.Column(
        db.Enum(
            'NOTE',
            'REVISION_QUESTION',
            'PAST_PAPER',
            'ASSIGNMENT',
            name='resource_types'
        )
    )

    status = db.Column(
        db.Enum(
            'ACTIVE',
            'ARCHIVED',
            'DELETED',
            name='resource_status'
        ),
        default='ACTIVE'
    )

    subject_id = db.Column(
        db.Integer,
        db.ForeignKey('subjects.id'),
        nullable=False
    )

    class_id = db.Column(
        db.Integer,
        db.ForeignKey('classes.id'),
        nullable=False
    )

    uploaded_by = db.Column(
        db.Integer,
        db.ForeignKey('users.id'),
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    subject = db.relationship(
        "Subject",
        back_populates="resources"
    )

    school_class = db.relationship(
        "SchoolClass",
        back_populates="resources"
    )
    

    uploader = db.relationship(
        "User",
        back_populates="uploaded_resources"
    )
    

    downloads = db.relationship(
        "Download",
        back_populates="resource",
        cascade="all, delete-orphan"
    )
    

    resource_tags = db.relationship(
        "ResourceTag",
        back_populates="resource",
        cascade="all, delete-orphan"
    )

    resource_views = db.relationship(
    "ResourceView",
    back_populates="resource",
    cascade="all, delete-orphan"
)
    

    serialize_rules = (
    '-subject.resources',
    '-school_class.resources',
    '-uploader.uploaded_resources',
    '-downloads.resource',
    '-resource_tags.resource',
    '-resource_views.resource'
    )

    def __repr__(self):
        return f"<Resource {self.title}>"