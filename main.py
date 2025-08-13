#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Main entry point for Gold Trading Bot
نقطه ورودی اصلی برای ربات تحلیل طلا
"""

import os
import sys
import logging
from datetime import datetime

# Set logging level
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def initialize_app():
    """Initialize Flask app with proper import order"""
    try:
        # Clear any existing SQLAlchemy mappers
        try:
            from sqlalchemy.orm import clear_mappers
            clear_mappers()
        except ImportError:
            pass
            
        # Import app and database
        from app import app, db
        
        # Ensure all tables are created in app context
        with app.app_context():
            db.create_all()
            logger.info("Database tables initialized successfully")
            
        return app
        
    except Exception as e:
        logger.error(f"❌ خطای راه‌اندازی: {e}")
        logger.error(f"❌ Initialization error: {e}")
        raise

def main():
    """Main entry point"""
    try:
        logger.info("🚀 راه‌اندازی ربات تحلیل طلا...")
        logger.info("🚀 Starting Gold Trading Bot...")
        
        app = initialize_app()
        
        # Run the application
        port = int(os.environ.get('PORT', 5000))
        host = '0.0.0.0'
        
        logger.info(f"✅ ربات آماده اجرا در http://{host}:{port}")
        logger.info(f"✅ Bot ready at http://{host}:{port}")
        
        # Send startup notification to admin
        try:
            from services.admin_notification_service import send_startup_notification
            send_startup_notification()
            logger.info("🚀 Startup notification sent to admin")
        except Exception as e:
            logger.error(f"❌ Failed to send startup notification: {e}")
        
        app.run(host=host, port=port, debug=False)
        
    except Exception as e:
        logger.error(f"❌ خطای عمومی: {e}")
        logger.error(f"❌ General error: {e}")
        sys.exit(1)

# Make app available for Gunicorn
try:
    app = initialize_app()
except Exception as e:
    logger.error(f"Failed to initialize app for Gunicorn: {e}")
    # Create minimal app for import
    from app import app

if __name__ == "__main__":
    main()
