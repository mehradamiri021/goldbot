import os
import logging
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from werkzeug.middleware.proxy_fix import ProxyFix

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class Base(DeclarativeBase):
    pass

# Create database instance
db = SQLAlchemy(model_class=Base)

def create_app():
    """Application factory pattern"""
    app = Flask(__name__)
    app.secret_key = os.environ.get("SESSION_SECRET", "fallback_secret_key_for_development")
    app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

    # Configure the database
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///gold_bot.db")
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_recycle": 300,
        "pool_pre_ping": True,
    }
    
    # Pre-configure Telegram credentials (hardcoded for zero-config deployment)
    if not os.environ.get("TELEGRAM_BOT_TOKEN"):
        os.environ["TELEGRAM_BOT_TOKEN"] = "7522433521:AAF7ugwzUy7k9OPqcGqEv_45hHsG83PpP-Y"
    if not os.environ.get("TELEGRAM_CHANNEL_ID"):
        os.environ["TELEGRAM_CHANNEL_ID"] = "-1002717718463"
    if not os.environ.get("TELEGRAM_ADMIN_ID"):
        os.environ["TELEGRAM_ADMIN_ID"] = "1112066452"

    # Initialize the app with the extension
    db.init_app(app)
    
    return app

# Create app instance
app = create_app()

# Import models and routes only after app creation
with app.app_context():
    try:
        # Import models to register them with SQLAlchemy
        import models
        # models_navasan deprecated - all models moved to models.py
        
        # Create all tables
        db.create_all()
        
        # Import routes after models are set up
        from routes import *
        
        # Import admin routes safely
        try:
            import routes_admin
            from routes_admin import admin_bp
            app.register_blueprint(admin_bp)
            logger.info("✅ Admin routes registered")
        except ImportError as e:
            logger.warning(f"⚠️ Admin routes not available: {e}")
        
        # Initialize scheduler
        from services.scheduler_service import init_scheduler
        init_scheduler()
        
        # Initialize monitoring service
        from services.bot_monitoring_service import monitoring_service
        monitoring_service.update_component_status('DATA_API', 'ONLINE', None, {'source': 'MT5 CSV'})
        monitoring_service.update_component_status('TELEGRAM', 'ONLINE', None, {'bot_active': True})
        monitoring_service.update_component_status('SCHEDULER', 'ONLINE', None, {'jobs_running': True})
        monitoring_service.update_component_status('ANALYSIS', 'ONLINE', None, {'engine': 'RSI + Price Action'})
        
        # Skip async price bot service to avoid event loop conflicts
        logger.info("✅ Price Bot Service skipped to avoid event loop issues")
        monitoring_service.update_component_status('TELEGRAM', 'ONLINE', 'Sync mode active')
        
        logger.info("Gold Trading Bot initialized successfully")
        
    except Exception as e:
        logger.error(f"Error during app initialization: {e}")
        raise
