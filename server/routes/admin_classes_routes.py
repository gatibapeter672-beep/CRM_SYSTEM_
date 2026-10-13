from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required
from services.decorators import role_required
from schemas.admin_classes_schema import (
    class_deck_schema, 
    single_class_schema, 
    create_class_schema, 
    bind_entity_schema,
    global_pools_schema
)
from services.admin_classes_service import (
    get_all_classes_deck,
    create_new_class,
    bind_subject_to_class,
    unbind_subject_from_class,
    bind_teacher_to_class,
    unbind_teacher_from_class,
    bind_student_to_class,
    unbind_student_from_class,
    get_global_pools
)
from marshmallow import ValidationError
from app import api


class AdminClassDeckResource(Resource):
    @jwt_required()
    @role_required("admin")
    def get(self):
        """GET /api/admin/classes - Fetch full class deck matrix."""
        data, status_code = get_all_classes_deck()
        if status_code != 200:
            return data, status_code
        return class_deck_schema.dump(data), 200

    @jwt_required()
    @role_required("admin")
    def post(self):
        """POST /api/admin/classes - Initialize a new class container."""
        payload = request.get_json(silent=True)
        if not payload:
            return {"error": "Missing JSON request body."}, 400

        try:
            validated = create_class_schema.load(payload)
        except ValidationError as err:
            return {"error": err.messages}, 400

        result, status_code = create_new_class(validated)
        if status_code != 201:
            return result, status_code
            
        return single_class_schema.dump(result), 201


class AdminClassSubjectBinderResource(Resource):
    @jwt_required()
    @role_required("admin")
    def post(self, class_id: int):
        """POST /api/admin/classes/<class_id>/subjects - Bind subject to class."""
        payload = request.get_json(silent=True) or {}
        try:
            validated = bind_entity_schema.load(payload)
        except ValidationError as err:
            return {"error": err.messages}, 400

        return bind_subject_to_class(class_id, validated["entity_id"])


class AdminClassSubjectUnbinderResource(Resource):
    @jwt_required()
    @role_required("admin")
    def delete(self, bridge_id: int):
        """DELETE /api/admin/classes/subjects/<bridge_id> - Unbind subject from class."""
        return unbind_subject_from_class(bridge_id)


class AdminClassTeacherBinderResource(Resource):
    @jwt_required()
    @role_required("admin")
    def post(self, class_id: int):
        """POST /api/admin/classes/<class_id>/teachers - Assign teacher to class."""
        payload = request.get_json(silent=True) or {}
        try:
            validated = bind_entity_schema.load(payload)
        except ValidationError as err:
            return {"error": err.messages}, 400

        return bind_teacher_to_class(class_id, validated["entity_id"])


class AdminClassTeacherUnbinderResource(Resource):
    @jwt_required()
    @role_required("admin")
    def delete(self, bridge_id: int):
        """DELETE /api/admin/classes/teachers/<bridge_id> - Remove teacher assignment."""
        return unbind_teacher_from_class(bridge_id)


class AdminClassStudentBinderResource(Resource):
    @jwt_required()
    @role_required("admin")
    def post(self, class_id: int):
        """POST /api/admin/classes/<class_id>/students - Enroll student in class."""
        payload = request.get_json(silent=True) or {}
        try:
            validated = bind_entity_schema.load(payload)
        except ValidationError as err:
            return {"error": err.messages}, 400

        return bind_student_to_class(class_id, validated["entity_id"])


class AdminClassStudentUnbinderResource(Resource):
    @jwt_required()
    @role_required("admin")
    def delete(self, bridge_id: int):
        """DELETE /api/admin/classes/students/<bridge_id> - Unenroll student."""
        return unbind_student_from_class(bridge_id)


class AdminGlobalPoolsResource(Resource):
    @jwt_required()
    @role_required("admin")
    def get(self):
        """GET /api/admin/pools - Get options for subjects, teachers, and students."""
        data, status_code = get_global_pools()
        if status_code != 200:
            return data, status_code
        return global_pools_schema.dump(data), 200


# Endpoint Registration
api.add_resource(AdminClassDeckResource, "/api/admin/classes")
api.add_resource(AdminGlobalPoolsResource, "/api/admin/pools")

# Binder Routes
api.add_resource(AdminClassSubjectBinderResource, "/api/admin/classes/<int:class_id>/subjects")
api.add_resource(AdminClassSubjectUnbinderResource, "/api/admin/classes/subjects/<int:bridge_id>")

api.add_resource(AdminClassTeacherBinderResource, "/api/admin/classes/<int:class_id>/teachers")
api.add_resource(AdminClassTeacherUnbinderResource, "/api/admin/classes/teachers/<int:bridge_id>")

api.add_resource(AdminClassStudentBinderResource, "/api/admin/classes/<int:class_id>/students")
api.add_resource(AdminClassStudentUnbinderResource, "/api/admin/classes/students/<int:bridge_id>")
