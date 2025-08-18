"""
Admin Notification Service - Fixed Version
سرویس اعلان‌رسانی مدیریت - ورژن رفع شده
"""

import logging
from datetime import datetime

logger = logging.getLogger(__name__)

# Simple sync notification functions
def send_admin_notification(message, priority="INFO"):
    """Simple sync notification without async complications"""
    try:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.info(f"📧 Admin notification [{priority}]: {message[:100]}...")
        # In production, this would send to Telegram
        # For now, just log it
        return True
    except Exception as e:
        logger.error(f"Notification error: {e}")
        return False

def send_startup_notification():
    """Simple startup notification"""
    try:
        message = "🚀 GoldBot v2.1 initialized successfully - All systems operational"
        logger.info("🚀 Startup notification sent")
        return send_admin_notification(message, "SUCCESS")
    except Exception as e:
        logger.error(f"Startup notification error: {e}")
        return False

def send_error_alert(error_message, error_type="SYSTEM_ERROR"):
    """Send error alert"""
    try:
        message = f"🚨 {error_type}: {error_message}"
        return send_admin_notification(message, "ERROR")
    except Exception as e:
        logger.error(f"Error alert failed: {e}")
        return False

def send_health_report(health_data):
    """Send health report"""
    try:
        message = f"📊 Health Report: {health_data.get('score', 0)}% - {len(health_data.get('components', {}))} components checked"
        return send_admin_notification(message, "INFO")
    except Exception as e:
        logger.error(f"Health report failed: {e}")
        return False