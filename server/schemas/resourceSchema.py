from app import ma
from models import Resource

class ResourceSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Resource
        load_instance = True

    id = ma.auto_field(dump_only=True)
    title = ma.auto_field()
    description = ma.auto_field()
    file_name = ma.auto_field()
    file_path = ma.auto_field()
    file_size = ma.Method("get_formatted_file_size")
    file_type = ma.auto_field()
    resource_type = ma.auto_field()
    status = ma.auto_field()
    subject_id = ma.auto_field()
    class_id = ma.auto_field()
    uploaded_by = ma.auto_field(dump_only=True)
    created_at = ma.auto_field(dump_only=True)
    updated_at = ma.auto_field(dump_only=True)

    # Nested & Flat fields to match UI
    class_name = ma.Method("get_class_name")
    subject_name = ma.Method("get_subject_name")
    views_count = ma.Method("get_views_count")
    downloads_count = ma.Method("get_downloads_count")

    def get_class_name(self, obj):
        return obj.school_class.class_name if obj.school_class else ""

    def get_subject_name(self, obj):
        return obj.subject.subject_name if obj.subject else ""

    def get_views_count(self, obj):
        return len(obj.resource_views) if obj.resource_views else 0

    def get_downloads_count(self, obj):
        return len(obj.downloads) if obj.downloads else 0

    def get_formatted_file_size(self, obj):
        if not obj.file_size:
            return "0 KB"
        # Convert bytes to human-readable string
        size_in_bytes = obj.file_size
        if size_in_bytes < 1024 * 1024:
            return f"{round(size_in_bytes / 1024, 1)} KB"
        return f"{round(size_in_bytes / (1024 * 1024), 1)} MB"

resource_schema = ResourceSchema()
resources_schema = ResourceSchema(many=True)