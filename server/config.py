import os
from dotenv import load_dotenv
from datetime import timedelta
load_dotenv()

class Config:
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URI')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'super-secret')

    # 🚀 PRODUCTION SECURITY COOKIE MATRIX
    JWT_TOKEN_LOCATION = ['cookies']
    JWT_ACCESS_COOKIE_PATH = '/'      # Only send access tokens to API paths
    JWT_REFRESH_COOKIE_PATH = '/' # Only send refresh tokens to refresh endpoint
    JWT_COOKIE_CSRF_PROTECT = False       # Set to True later when adding CSRF tokens
    JWT_COOKIE_HTTPONLY = True            # 🔒 Prevents JavaScript from reading the tokens
    JWT_COOKIE_SECURE = False             # 💻 Set to True in actual live production HTTPS environments
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15) # Short-lived access
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=7)    # Long-lived renewal