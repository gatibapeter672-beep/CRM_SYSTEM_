# models/tag.py

from extensions import db
from sqlalchemy_serializer import SerializerMixin


class Tag(db.Model, SerializerMixin):
    __tablename__ = "tags"

    id = db.Column(db.Integer, primary_key=True)

    tag_name = db.Column(
        db.String(100),
        unique=True,
        nullable=False
    )

    resource_tags = db.relationship(
        "ResourceTag",
        back_populates="tag",
        cascade="all, delete-orphan"
    )

    serialize_rules = (
    '-resource_tags.tag',
    )

    def __repr__(self):
        return f"<Tag tag_name={self.tag_name} >"
