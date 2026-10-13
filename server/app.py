from flask import Flask, make_response, send_from_directory,jsonify,request, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api, Resource
from flask_migrate import Migrate
from flask_socketio import SocketIO
import os
from flask import Flask





from config import Config
from marshmallow import ValidationError
from datetime import timedelta
from flask_jwt_extended import jwt_required
from extensions import db, ma, jwt, bcrypt, cors
import models 
from tasks import prune_expired_tokens
from flask_apscheduler import APScheduler



app = Flask(__name__,
    static_url_path='',
    static_folder='../client/dist',
    template_folder='../client/dist'
            )
app.config.from_object(Config)
socketio = SocketIO(app, cors_allowed_origins="*")



db.init_app(app)
ma.init_app(app)
jwt.init_app(app)
bcrypt.init_app(app)
cors.init_app(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)
api = Api(app)
migrate = Migrate(app, db)


scheduler = APScheduler()

# Optional configurations
app.config['SCHEDULER_API_ENABLED'] = False

scheduler.init_app(app)
scheduler.start()

# Schedule the task to run automatically every 24 hours
@scheduler.task('interval', id='prune_tokens_job', hours=24)
def scheduled_prune():
    # APScheduler runs tasks outside the request context, 
    # so we wrap it in an app context to let SQLAlchemy talk to the DB safely.
    with app.app_context():
        prune_expired_tokens()





# so the api.add_resource() lines actually execute!
import routes.auth_routes
import routes.logout_refr_routes
import routes.roles_routes
import routes.adm_dashboard_routes
import routes.student_dashboard_routes
import routes.admin_classes_routes
import routes.teacher_dashboard_routes
import routes.student_curriculum_routes
import routes.teacher_class_routes
import routes.download_archive_routes
import routes.resource_routes




from flask import send_from_directory, request

# Place this route in app.py after creating your Flask app instance
@app.route('/uploads/resources/<path:filename>')
def serve_uploads(filename):
    # Resolves to: /your/project/path/server/uploads/resources
    uploads_dir = os.path.join(app.root_path, 'uploads', 'resources')
    should_download = request.args.get('download', 'false').lower() == 'true'
    return send_from_directory(uploads_dir, filename, as_attachment=should_download)

