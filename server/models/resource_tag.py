# models/resource_tag.py

from extensions import db
from sqlalchemy_serializer import SerializerMixin


class ResourceTag(db.Model, SerializerMixin):
    __tablename__ = "resource_tags"
    __table_args__ = (
        db.UniqueConstraint(
            'resource_id',
            'tag_id',
            name='uq_resource_tag'
         ),
    )

    id = db.Column(db.Integer, primary_key=True)

    resource_id = db.Column(
        db.Integer,
        db.ForeignKey('resources.id'),
        nullable=False
    )

    tag_id = db.Column(
        db.Integer,
        db.ForeignKey('tags.id'),
        nullable=False
    )

    resource = db.relationship(
        "Resource",
        back_populates="resource_tags"
    )
    

    tag = db.relationship(
        "Tag",
        back_populates="resource_tags"
    )

    serialize_rules = (
    '-resource.resource_tags',
    '-tag.resource_tags'
    )


    def __repr__(self):
        return f"<ResourceTag resource_id={self.resource_id} tag_id={self.tag_id}>"
