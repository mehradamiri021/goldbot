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

# بارگذاری فایل .env اگر موجود باشد
def load_env_file():
    """بارگذاری فایل .env اگر موجود باشد"""
    if os.path.exists('.env'):
        with open('.env', 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key] = value

# بارگذاری متغیرهای محیطی
load_env_file()

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
        
        # Send startup notification (sync version)
        try:
            from services.telegram_service_helper import send_admin_notification_sync
            send_admin_notification_sync("🚀 سیستم GoldBot v2.1 آماده کار است!")
            logger.info("🚀 Startup notification sent to admin")
        except Exception as e:
            logger.warning(f"⚠️ Could not send startup notification: {e}")
            
        # Check startup data once
        try:
            from services.real_time_monitor import real_time_monitor
            real_time_monitor.start_monitoring()  # Only startup check, no continuous monitoring
            logger.info("📊 Startup data check completed")
        except Exception as e:
            logger.warning(f"⚠️ Could not check startup data: {e}")
            
        # Skip async price bot initialization to avoid event loop issues
        logger.info("✅ Price Bot Service skipped (avoiding async issues)")
        logger.info("✅ Core trading bot systems ready")
        
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
