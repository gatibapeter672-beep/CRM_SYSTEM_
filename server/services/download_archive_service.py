from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from extensions import db
from models.download import Download
import logging

logger = logging.getLogger(__name__)

def get_student_download_history(student_user_id: int):
    """
    Fetches historical audit logs matching the target student user account.
    Uses modern explicit SQLAlchemy 2.0 select executions.
    """
    try:
        # Pull records ordered sequentially with newest downloads tracking first
        stmt = (
            select(Download)
            .where(Download.user_id == student_user_id)
            .order_by(Download.downloaded_at.desc())
        )
        
        logs = db.session.scalars(stmt).all()
        return logs, 200

    except SQLAlchemyError as e:
        logger.error(f"Failed compiling download logs database array context: {str(e)}")
        return {"error": "Internal server database error parsing archive index logs."}, 500