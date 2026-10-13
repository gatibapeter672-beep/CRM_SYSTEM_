# models/resource_view.py

from extensions import db
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime, timezone


class ResourceView(db.Model, SerializerMixin):
    __tablename__ = "resource_views"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id'),
        nullable=False
    )

    resource_id = db.Column(
        db.Integer,
        db.ForeignKey('resources.id'),
        nullable=False
    )

    viewed_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    user = db.relationship(
        "User",
        back_populates="resource_views"
    )

    resource = db.relationship(
        "Resource",
        back_populates="resource_views"
    )

    serialize_rules = (
        '-user.resource_views',
        '-resource.resource_views'
    )
    

    def __repr__(self):
        return (
            f"<ResourceView "
            f"user_id={self.user_id} "
            f"resource_id={self.resource_id}>"
        )