# models/role.py

from extensions import db
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime, timezone


class Role(db.Model, SerializerMixin):
    __tablename__ = "roles"

    id = db.Column(db.Integer, primary_key=True)

    role_name = db.Column(db.String(50),unique=True,nullable=False)

    description = db.Column(db.Text)

    created_at = db.Column(db.DateTime,default=lambda: datetime.now(timezone.utc)    )

    users = db.relationship(
        "User",
        back_populates="role"
    )

    serialize_rules = (
        '-users.role',
    )

    

    def __repr__(self):
        return f"<Role {self.role_name}>"