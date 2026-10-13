# services/student_dashboard_service.py

from datetime import datetime, timezone, timedelta
from sqlalchemy import select, func, desc
from sqlalchemy.exc import SQLAlchemyError
from extensions import db
from models.user import User
from models.class_model import SchoolClass
from models.subject import Subject
from models.class_subject import ClassSubject
from models.resource import Resource
from models.download import Download
from models.resource_view import ResourceView
from schemas.student_dashboard_schema import student_dashboard_schema
from models.student_class import StudentClass  # <-- Importing your new model!
import logging

logger = logging.getLogger(__name__)

def get_student_dashboard_data(student_user_id: int):
    try:
        # 1. Fetch Student Context
        student = db.session.get(User, student_user_id)
        if not student:
            return {"error": "Student record not found."}, 404
        
        # --- DYNAMIC CLASS RESOLUTION USING STUDENT_CLASS ---
        # Query the student's primary/first active class assignment
        student_class_record = db.session.scalar(
            select(StudentClass)
            .where(StudentClass.student_id == student_user_id)
            .limit(1)
        )
        
        if not student_class_record:
            print(student_class_record)
            return {
                "student_context": {
                    "className": None,
                    "totalCourses": 0,
                    "newFilesThisWeek": 0,
                    "completedReads": 0
                },
                "subject_binder": [],
                "fresh_drops": [],
                "user_activity_logs": []
            }, 200
            

        class_id = student_class_record.class_id
        school_class = student_class_record.school_class
        class_name = school_class.class_name if school_class else "Unknown Class"
        # ----------------------------------------------------

        # 2. Compute Metric Card Analytics (Filtered by dynamic class_id)
        total_courses_count = db.session.scalar(
            select(func.count(ClassSubject.id))
            .where(ClassSubject.class_id == class_id)
        ) or 0

        one_week_ago = datetime.now(timezone.utc) - timedelta(days=7)
        new_files_count = db.session.scalar(
            select(func.count(Resource.id))
            .where(Resource.class_id == class_id)
            .where(Resource.created_at >= one_week_ago)
            .where(Resource.status == 'ACTIVE')
        ) or 0

        # Completed reads = Combined distinct active views and downloads for this user
        completed_reads_count = db.session.scalar(
            select(func.count(ResourceView.id))
            .where(ResourceView.user_id == student_user_id)
        ) or 0

        # 3. Fetch Subjects Binder (Dynamic to resolved class_id)
        subjects_query = (
            db.session.execute(
                select(
                    Subject.id,
                    Subject.subject_name,
                    Subject.subject_code,
                    func.count(Resource.id).label("file_count")
                )
                .join(ClassSubject, ClassSubject.subject_id == Subject.id)
                .outerjoin(
                    Resource, 
                    (Resource.subject_id == Subject.id) & 
                    (Resource.class_id == class_id) & 
                    (Resource.status == 'ACTIVE')
                )
                .where(ClassSubject.class_id == class_id)
                .group_by(Subject.id)
            ).all()
        )

        subject_binder = []
        for row in subjects_query:
            subject_binder.append({
                "id": row.id,
                "subject_name": row.subject_name,
                "subject_code": row.subject_code or f"SUBJ-{row.id}",
                "file_count": row.file_count
            })

        # 4. Fetch Fresh Drops (Dynamic to resolved class_id)
        fresh_drops_query = db.session.scalars(
            select(Resource)
            .where(Resource.class_id == class_id)
            .where(Resource.status == 'ACTIVE')
            .order_by(desc(Resource.created_at))
            .limit(5)
        ).all()

        fresh_drops = []
        for res in fresh_drops_query:
            # Format time-ago string cleanly
            time_delta = datetime.now(timezone.utc) - res.created_at.replace(tzinfo=timezone.utc)
            if time_delta.days > 0:
                time_str = f"{time_delta.days} days ago" if time_delta.days > 1 else "Yesterday"
            else:
                hours = time_delta.seconds // 3600
                time_str = f"{hours} hours ago" if hours > 0 else "Just now"

            fresh_drops.append({
                "id": res.id,
                "title": res.title,  # Using the corrected 'title' field from your schema!
                "resource_type": res.resource_type,
                "author_name": f"Prof. {res.uploader.last_name}" if res.uploader else "System Vault",
                "time_ago": time_str
            })

        # 5. User Activity Logs
        recent_views = db.session.scalars(
            select(ResourceView)
            .where(ResourceView.user_id == student_user_id)
            .order_by(desc(ResourceView.viewed_at))
            .limit(5)
        ).all()

        recent_downloads = db.session.scalars(
            select(Download)
            .where(Download.user_id == student_user_id)
            .order_by(desc(Download.downloaded_at))
            .limit(5)
        ).all()

        activity_logs = []
        for r_view in recent_views:
            activity_logs.append({
                "id": f"view-{r_view.id}",
                "title": r_view.resource.title if r_view.resource else "Deleted Resource",
                "action": "Opened and read",
                "timestamp": r_view.viewed_at.strftime("%Y-%m-%d at %I:%M %p"),
                "activity_type": "VIEW"
            })

        for r_dl in recent_downloads:
            activity_logs.append({
                "id": f"dl-{r_dl.id}",
                "title": r_dl.resource.title if r_dl.resource else "Deleted Resource",
                "action": "Downloaded to device",
                "timestamp": r_dl.downloaded_at.strftime("%Y-%m-%d at %I:%M %p"),
                "activity_type": "DOWNLOAD"
            })

        # Sort combined activity lists by timestamp
        activity_logs = sorted(activity_logs, key=lambda x: x["timestamp"], reverse=True)[:5]

        # Construct unified API response payload
        payload = {
            "student_context": {
                "className": class_name,
                "totalCourses": total_courses_count,
                "newFilesThisWeek": new_files_count,
                "completedReads": completed_reads_count
            },
            "subject_binder": subject_binder,
            "fresh_drops": fresh_drops,
            "user_activity_logs": activity_logs
        }
                # 3. Serialize through Marshmallow validator prior to dispatching
        
        
        return student_dashboard_schema.dump(payload), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Error compiling student dashboard metrics: {str(e)}")
        return {"error": "An unexpected server error occurred during compilation."}, 500









# from datetime import datetime, timezone, timedelta
# from sqlalchemy import select, func, desc, or_
# from sqlalchemy.exc import SQLAlchemyError
# from extensions import db
# from models.user import User
# from models.class_model import SchoolClass
# from models.subject import Subject
# from models.class_subject import ClassSubject
# from models.resource import Resource
# from models.download import Download
# from models.resource_view import ResourceView
# import logging

# logger = logging.getLogger(__name__)

# def get_student_dashboard_data(student_user_id: int):
#     try:
#         # 1. Fetch Student & Class Context
#         student = db.session.get(User, student_user_id)
#         if not student:
#             return {"error": "Student record not found."}, 404
        
#         # Resolve class association (Assuming user belongs to a class or via custom mapping;
#         # if User does not have a direct class_id, we default or extract it. We assume dynamic match here):
#         # Let's dynamically find the class they are most associated with, or fall back safely.
#         # For production robustness, we inspect the resources uploaded/downloaded to grab their active class ID.
#         # Ideally, User model should have a class_id. If missing, we query the first class or assign a fallback.
#         # Let's assume a default/first class_id for simulation if not stored on the model.
#         # (We will use class_id = 1 as the default base for this showcase)
#         class_id = 1 
#         school_class = db.session.get(SchoolClass, class_id)
#         class_name = school_class.class_name if school_class else "Default Class 10A"

#         # 2. Compute Metric Card Analytics
#         total_courses_count = db.session.scalar(
#             select(func.count(ClassSubject.id)).where(ClassSubject.class_id == class_id)
#         ) or 0

#         one_week_ago = datetime.now(timezone.utc) - timedelta(days=7)
#         new_files_count = db.session.scalar(
#             select(func.count(Resource.id))
#             .where(Resource.class_id == class_id)
#             .where(Resource.created_at >= one_week_ago)
#             .where(Resource.status == 'ACTIVE')
#         ) or 0

#         # Completed reads = Combined distinct active views and downloads
#         completed_reads_count = db.session.scalar(
#             select(func.count(ResourceView.id))
#             .where(ResourceView.user_id == student_user_id)
#         ) or 0

#         # 3. Fetch Subjects Binder (Subjects assigned to this class + resource counts)
#         # Left Outer Join with Resource to gather counts for each ClassSubject link
#         subjects_query = (
#             db.session.execute(
#                 select(
#                     Subject.id,
#                     Subject.subject_name,
#                     Subject.subject_code,
#                     func.count(Resource.id).label("file_count")
#                 )
#                 .join(ClassSubject, ClassSubject.subject_id == Subject.id)
#                 .outerjoin(
#                     Resource, 
#                     (Resource.subject_id == Subject.id) & (Resource.class_id == class_id) & (Resource.status == 'ACTIVE')
#                 )
#                 .where(ClassSubject.class_id == class_id)
#                 .group_by(Subject.id)
#             ).all()
#         )

#         subject_binder = []
#         for row in subjects_query:
#             subject_binder.append({
#                 "id": row.id,
#                 "subject_name": row.subject_name,
#                 "subject_code": row.subject_code or f"SUBJ-{row.id}",
#                 "file_count": row.file_count
#             })

#         # 4. Fetch Fresh Drops (Latest active resources uploaded for this class)
#         fresh_drops_query = db.session.scalars(
#             select(Resource)
#             .where(Resource.class_id == class_id)
#             .where(Resource.status == 'ACTIVE')
#             .order_by(desc(Resource.created_at))
#             .limit(5)
#         ).all()

#         fresh_drops = []
#         for res in fresh_drops_query:
#             # Format time-ago string cleanly
#             time_delta = datetime.now(timezone.utc) - res.created_at.replace(tzinfo=timezone.utc)
#             if time_delta.days > 0:
#                 time_str = f"{time_delta.days} days ago" if time_delta.days > 1 else "Yesterday"
#             else:
#                 hours = time_delta.seconds // 3600
#                 time_str = f"{hours} hours ago" if hours > 0 else "Just now"

#             fresh_drops.append({
#                 "id": res.id,
#                 "title": res.file_name,
#                 "resource_type": res.resource_type,
#                 "author_name": f"Prof. {res.uploader.last_name}" if res.uploader else "System Vault",
#                 "time_ago": time_str
#             })

#         # 5. User Activity Logs (Merged history of views and downloads)
#         recent_views = db.session.scalars(
#             select(ResourceView)
#             .where(ResourceView.user_id == student_user_id)
#             .order_by(desc(ResourceView.viewed_at))
#             .limit(5)
#         ).all()

#         recent_downloads = db.session.scalars(
#             select(Download)
#             .where(Download.user_id == student_user_id)
#             .order_by(desc(Download.downloaded_at))
#             .limit(5)
#         ).all()

#         activity_logs = []
#         for r_view in recent_views:
#             activity_logs.append({
#                 "id": f"view-{r_view.id}",
#                 "title": r_view.resource.file_name if r_view.resource else "Deleted Resource",
#                 "action": "Opened and read",
#                 "timestamp": r_view.viewed_at.strftime("%Y-%m-%d at %I:%M %p"),
#                 "activity_type": "VIEW"
#             })

#         for r_dl in recent_downloads:
#             activity_logs.append({
#                 "id": f"dl-{r_dl.id}",
#                 "title": r_dl.resource.file_name if r_dl.resource else "Deleted Resource",
#                 "action": "Downloaded to device",
#                 "timestamp": r_dl.downloaded_at.strftime("%Y-%m-%d at %I:%M %p"),
#                 "activity_type": "DOWNLOAD"
#             })

#         # Sort combined list by timestamp
#         activity_logs = sorted(activity_logs, key=lambda x: x["timestamp"], reverse=True)[:5]

#         # Construct unified API response payload
#         payload = {
#             "student_context": {
#                 "className": class_name,
#                 "totalCourses": total_courses_count,
#                 "newFilesThisWeek": new_files_count,
#                 "completedReads": completed_reads_count
#             },
#             "subject_binder": subject_binder,
#             "fresh_drops": fresh_drops,
#             "user_activity_logs": activity_logs
#         }
        
#         return payload, 200

#     except SQLAlchemyError as e:
#         db.session.rollback()
#         logger.error(f"Error compiling student dashboard metrics: {str(e)}")
#         return {"error": "An unexpected server error occurred during compilation."}, 500