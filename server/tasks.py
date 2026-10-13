# server/tasks.py
from datetime import datetime, timezone
from extensions import db
from models.token_blocklist import TokenBlocklist

def prune_expired_tokens():
    """Deletes tokens from the blocklist that have already naturally expired."""
    now = datetime.now(timezone.utc)
    
    # Perform the deletion query
    expired_tokens = TokenBlocklist.query.filter(TokenBlocklist.expires_at < now).delete()
    db.session.commit()
    
    print(f"Pruned {expired_tokens} expired tokens from the blocklist.")