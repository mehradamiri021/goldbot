#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gold Trading Bot - Windows Compatible Main Entry Point
نقطه ورود اصلی ربات طلا - سازگار با ویندوز
"""

import os
import sys
import logging
from pathlib import Path

# Add current directory to Python path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

# Set environment variables for Windows
os.environ.setdefault("FLASK_APP", "main.py")
os.environ.setdefault("FLASK_ENV", "production")

try:
    # Import Flask app
    from app import app, db, logger
    
    # Import scheduler after app is created  
    with app.app_context():
        try:
            # Initialize database
            db.create_all()
            logger.info("Database initialized")
            
            # Import and start scheduler
            from services.scheduler_service import init_scheduler
            init_scheduler()
            logger.info("Scheduler initialized")
            
        except Exception as e:
            logger.error(f"Initialization error: {e}")
    
    if __name__ == "__main__":
        # Get configuration
        host = os.environ.get("HOST", "0.0.0.0")
        port = int(os.environ.get("PORT", 5000))
        debug = os.environ.get("DEBUG", "True").lower() == "true"
        
        print("="*60)
        print("🥇 Gold Trading Bot - Windows Server")
        print("🥇 ربات تحلیل طلا - ویندوز سرور")
        print("="*60)
        print(f"🌐 آدرس محلی / Local: http://localhost:{port}")
        print(f"🌍 آدرس شبکه / Network: http://{host}:{port}")
        print(f"🔗 آدرس خارجی / External: http://YOUR_SERVER_IP:{port}")
        print("="*60)
        print("📱 صفحات در دسترس / Available Pages:")
        print("   • داشبورد / Dashboard: /dashboard")
        print("   • نمودارها / Charts: /charts")
        print("   • سیگنال‌ها / Signals: /signals")
        print("   • تنظیمات / Settings: /settings")
        print("="*60)
        print("🛑 برای توقف Ctrl+C فشار دهید / Press Ctrl+C to stop")
        print("="*60)
        
        try:
            # Start Flask development server
            app.run(
                host=host,
                port=port,
                debug=debug,
                threaded=True,
                use_reloader=False  # Disable reloader to prevent circular import issues
            )
        except KeyboardInterrupt:
            print("\n🛑 سرور متوقف شد / Server stopped")
        except Exception as e:
            print(f"❌ خطا در راه‌اندازی سرور: {e}")
            print(f"❌ Server startup error: {e}")
            sys.exit(1)

except ImportError as e:
    print(f"❌ خطای Import: {e}")
    print("❌ Import Error:", str(e))
    print("\n💡 راه‌حل‌های پیشنهادی:")
    print("💡 Suggested solutions:")
    print("1. python install_windows.py")
    print("2. start_windows_server.bat")
    print("3. Check virtual environment activation")
    sys.exit(1)
except Exception as e:
    print(f"❌ خطای عمومی: {e}")
    print(f"❌ General error:", str(e))
    sys.exit(1)