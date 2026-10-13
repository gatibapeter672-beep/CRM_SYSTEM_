# server/routes/adm_dashboard_routes.py
from flask_restful import Resource
from flask import make_response, request
from app import api
from services.decorators import role_required
from services.adm_dashboard_service import (
    get_top_trending_materials_service,
    get_curriculum_gaps_service,
    get_security_audit_service,
    get_dashboard_overview_service,
    get_tag_cloud_service,
    dashboard_search_service
)

class DashboardOverview(Resource):
    @role_required('admin')
    def get(self):
        return get_dashboard_overview_service()

class AnalyticsTrending(Resource):
    # @role_required('admin')
    def get(self):
        return get_top_trending_materials_service()

class CurriculumGaps(Resource):
    @role_required('admin')
    def get(self):
        return get_curriculum_gaps_service()

class TagCloud(Resource):
    @role_required('admin')
    def get(self):
        return get_tag_cloud_service()



class SecurityAudits(Resource):
    @role_required('admin')
    def get(self):
        return get_security_audit_service()
class DashboardSearch(Resource):
    @role_required('admin')
    def get(self):
        query = request.args.get('q', '').strip()
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 5))
        return dashboard_search_service(query, page, per_page)

# Clean Route Registrations for the Frontend Dashboard Streams
api.add_resource(DashboardSearch, '/dashboard/search', endpoint='dashboard_search')
api.add_resource(AnalyticsTrending, '/dashboard/analytics/trending', endpoint='dashboard_trending')
api.add_resource(CurriculumGaps, '/dashboard/curriculum/gaps', endpoint='dashboard_gaps')
api.add_resource(SecurityAudits, '/dashboard/security/audits', endpoint='dashboard_audits')

api.add_resource(TagCloud, '/dashboard/tags/cloud', endpoint='dashboard_tags')
api.add_resource(DashboardOverview, '/dashboard/overview', endpoint='dashboard_overview')