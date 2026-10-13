from app import ma
from models import SchoolClass, Student, TeacherClass

from datetime import datetime, timezone

class StudentEngagementSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Student

    id = ma.auto_field(dump_only=True)
    name = ma.Method("get_student_name")
    documents_read = ma.Method("get_documents_read")
    last_active = ma.Method("get_last_active")

    def get_student_name(self, obj):
        # Combines first and last name from user model
        if hasattr(obj, 'user') and obj.user:
            return f"{obj.user.first_name} {obj.user.last_name}".strip()
        return f"Student #{obj.id}"

    def get_documents_read(self, obj):
        # Unique resources viewed by this student
        return len(obj.resource_views) if hasattr(obj, 'resource_views') else 0

    def get_last_active(self, obj):
        # Formats the most recent resource_view timestamp into human readable relative time
        if not hasattr(obj, 'resource_views') or not obj.resource_views:
            return "Never"
        
        latest_view = max((rv.viewed_at for rv in obj.resource_views if rv.viewed_at), default=None)
        if not latest_view:
            return "Never"

        now = datetime.now(timezone.utc)
        if latest_view.tzinfo is None:
            latest_view = latest_view.replace(tzinfo=timezone.utc)
            
        diff = now - latest_view
        
        seconds = diff.total_seconds()
        if seconds < 60:
            return "Just now"
        elif seconds < 3600:
            mins = int(seconds // 60)
            return f"{mins} min{'s' if mins > 1 else ''} ago"
        elif seconds < 86400:
            hours = int(seconds // 3600)
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        else:
            days = int(seconds // 86400)
            if days == 1:
                return "Yesterday"
            return f"{days} days ago"


class CohortClassSchema(ma.SQLAlchemySchema):
    class Meta:
        model = SchoolClass
        load_instance = True

    id = ma.auto_field(dump_only=True)
    class_name = ma.auto_field()
    subject_name = ma.Method("get_subject_name")
    course_code = ma.Method("get_course_code")
    total_uploads = ma.Method("get_total_uploads")
    library_health = ma.Method("get_library_health")
    students = ma.Method("get_students_roster")

    def get_subject_name(self, obj):
        # Grabs primary subject name or defaults
        if hasattr(obj, 'class_subjects') and obj.class_subjects:
            first_subject = obj.class_subjects[0].subject
            if first_subject:
                return first_subject.subject_name
        return "General Studies"

    def get_course_code(self, obj):
        # Formats course code from class name or subject code
        formatted_name = obj.class_name.upper().replace(" ", "-")
        return formatted_name

    def get_total_uploads(self, obj):
        return len(obj.resources) if hasattr(obj, 'resources') and obj.resources else 0

    def get_library_health(self, obj):
        # Health percentage score based on active vs total resources
        if not hasattr(obj, 'resources') or not obj.resources:
            return "100%"
        total = len(obj.resources)
        active = sum(1 for r in obj.resources if getattr(r, 'status', 'ACTIVE') == 'ACTIVE')
        health_pct = int((active / total) * 100) if total > 0 else 100
        return f"{health_pct}%"

    def get_students_roster(self, obj):
        # Extracts student list through StudentClass pivot relationship
        students = []
        if hasattr(obj, 'student_classes') and obj.student_classes:
            students = [sc.student for sc in obj.student_classes if sc.student]
        return StudentEngagementSchema(many=True).dump(students)


cohort_class_schema = CohortClassSchema()
cohort_classes_schema = CohortClassSchema(many=True)