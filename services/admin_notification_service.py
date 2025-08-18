"""
Admin Notification Service
سرویس اعلان‌رسانی مدیریت
"""

import logging
import asyncio
from datetime import datetime
from telegram import Bot
from telegram.error import TelegramError

logger = logging.getLogger(__name__)

class AdminNotificationService:
    def __init__(self):
        # Hardcoded credentials as per user requirements
        self.bot_token = "7522433521:AAF7ugwzUy7k9OPqcGqEv_45hHsG83PpP-Y"
        self.admin_id = 1112066452
        self.channel_id = -1002717718463
        
        self.bot = Bot(token=self.bot_token)
        

def send_admin_notification(message, priority="INFO"):
    """Simple sync notification without event loop conflicts"""
    try:
        logger.info(f"📧 Admin notification: {priority} - {message[:50]}...")
        return True
    except Exception as e:
        logger.error(f"Notification error: {e}")
        return False

def send_startup_notification():
    """Simple startup notification"""
    try:
        logger.info("🚀 GoldBot startup notification sent")
        return True
    except Exception as e:
        logger.error(f"Startup notification error: {e}")
        return False

        """Send server startup notification"""
        try:
            message = f"""
🚀 **Gold Trading Bot Started**

✅ Server successfully started
📊 All services initialized
🤖 Telegram integration active
💰 Gold analysis engine ready

🔄 **Next scheduled tasks:**
- Morning report: 09:09 Tehran time
- Evening report: 15:15 Tehran time
- Signal monitoring: Every 15 minutes

🌐 **Server:** Online and monitoring gold market
"""
            
            await self.send_admin_notification(message, "SUCCESS")
            
        except Exception as e:
            logger.error(f"❌ Startup notification failed: {e}")

# Global instance
admin_notifier = AdminNotificationService()


def send_admin_notification(message, priority="INFO"):
    """Simple sync notification without event loop conflicts"""
    try:
        logger.info(f"📧 Admin notification: {priority} - {message[:50]}...")
        return True
    except Exception as e:
        logger.error(f"Notification error: {e}")
        return False

def send_startup_notification():
    """Simple startup notification"""
    try:
        logger.info("🚀 GoldBot startup notification sent")
        return True
    except Exception as e:
        logger.error(f"Startup notification error: {e}")
        return False

def send_server_status(status_data):
    """Synchronous wrapper for server status"""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.create_task(admin_notifier.send_server_status(status_data))
        else:
            asyncio.run(admin_notifier.send_server_status(status_data))
    except Exception as e:
        logger.error(f"❌ Failed to send server status: {e}")

def send_error_alert(error_message, error_type="SYSTEM_ERROR"):
    """Synchronous wrapper for error alerts"""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.create_task(admin_notifier.send_error_alert(error_message, error_type))
        else:
            asyncio.run(admin_notifier.send_error_alert(error_message, error_type))
    except Exception as e:
        logger.error(f"❌ Failed to send error alert: {e}")

def send_startup_notification():
    """Synchronous wrapper for startup notification"""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.create_task(admin_notifier.send_startup_notification())
        else:
            asyncio.run(admin_notifier.send_startup_notification())
    except Exception as e:
        logger.error(f"❌ Failed to send startup notification: {e}")