import os
import logging
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from werkzeug.middleware.proxy_fix import ProxyFix

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

# Create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "fallback_secret_key_for_development")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# Configure the database - Pre-configured for immediate use
# پیکربندی پایگاه داده - از پیش تنظیم شده برای استفاده فوری
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///gold_bot.db")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}

# Pre-configure environment variables if not set
# تنظیم متغیرهای محیط در صورت عدم وجود
if not os.environ.get("TELEGRAM_BOT_TOKEN"):
    os.environ["TELEGRAM_BOT_TOKEN"] = "7522433521:AAF7ugwzUy7k9OPqcGqEv_45hHsG83PpP-Y"
if not os.environ.get("TELEGRAM_CHANNEL_ID"):
    os.environ["TELEGRAM_CHANNEL_ID"] = "-1002717718463"
if not os.environ.get("TELEGRAM_ADMIN_ID"):
    os.environ["TELEGRAM_ADMIN_ID"] = "1112066452"

# Initialize the app with the extension
db.init_app(app)

with app.app_context():
    # Import models first to ensure tables are created
    import models
    db.create_all()
    
    # Import routes after models are set up
    from routes import *
    
    # Initialize scheduler last
    from services.scheduler_service import init_scheduler
    init_scheduler()
    logger.info("Gold Trading Bot initialized successfully")
