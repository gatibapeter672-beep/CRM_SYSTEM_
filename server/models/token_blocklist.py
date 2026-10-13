# models/token_blocklist.py
from extensions import db
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime, timezone

class TokenBlocklist(db.Model):
    __tablename__ = "token_blocklist"

    id = db.Column(db.Integer, primary_key=True)

    jti = db.Column(
        db.String(36),
        nullable=False,
        unique=True,
        index=True
    )

    created_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    expires_at = db.Column(
        db.DateTime,
        nullable=False
    )

    def __repr__(self):
        return f"<BlockedToken {self.jti}>"