# models/download.py

from extensions import db
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime, timezone


class Download(db.Model, SerializerMixin):
    __tablename__ = "downloads"

    id = db.Column(db.Integer, primary_key=True)

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

    downloaded_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    user = db.relationship(
        "User",
        back_populates="downloads"
    )

    resource = db.relationship(
        "Resource",
        back_populates="downloads"
    )

    serialize_rules = (
    '-user.downloads',
    '-resource.downloads'
    )

    def __repr__(self):
        return f"<Download user_id={self.user_id} resource_id={self.resource_id}>"
            