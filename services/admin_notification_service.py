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
        
    async def send_admin_notification(self, message, priority="INFO"):
        """Send notification to admin"""
        try:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            # Add priority emoji
            priority_emojis = {
                "ERROR": "🚨",
                "WARNING": "⚠️",
                "INFO": "ℹ️",
                "SUCCESS": "✅"
            }
            
            emoji = priority_emojis.get(priority, "📝")
            
            formatted_message = f"""
{emoji} **Server Notification**

🕐 **Time:** {timestamp}
🔍 **Priority:** {priority}
💬 **Message:**
{message}

📊 **Server:** Gold Trading Bot
🖥️ **Status:** Running
"""
            
            await self.bot.send_message(
                chat_id=self.admin_id,
                text=formatted_message,
                parse_mode='Markdown'
            )
            
            logger.info(f"✅ Admin notification sent: {priority}")
            return True
            
        except TelegramError as e:
            logger.error(f"❌ Failed to send admin notification: {e}")
            return False
        except Exception as e:
            logger.error(f"❌ Admin notification error: {e}")
            return False
    
    async def send_server_status(self, status_data):
        """Send server status update to admin"""
        try:
            message = f"""
🖥️ **Server Status Update**

📊 **System Status:** {status_data.get('status', 'Unknown')}
💰 **Current Gold Price:** ${status_data.get('current_price', 'N/A')}
📈 **MT5 Connection:** {'✅ Connected' if status_data.get('mt5_connected') else '❌ Disconnected'}
🤖 **Telegram Bot:** {'✅ Active' if status_data.get('telegram_active') else '❌ Inactive'}

🔄 **Data Sources:**
- MT5 CSV Files: {'✅' if status_data.get('csv_available') else '❌'}
- Last Update: {status_data.get('last_update', 'Unknown')}

⚡ **Performance:**
- Memory Usage: {status_data.get('memory_usage', 'N/A')}%
- CPU Usage: {status_data.get('cpu_usage', 'N/A')}%
- Uptime: {status_data.get('uptime', 'N/A')}
"""
            
            await self.send_admin_notification(message, "INFO")
            
        except Exception as e:
            logger.error(f"❌ Server status notification error: {e}")
    
    async def send_error_alert(self, error_message, error_type="SYSTEM_ERROR"):
        """Send critical error alert to admin"""
        try:
            message = f"""
🚨 **CRITICAL ERROR ALERT**

⚠️ **Error Type:** {error_type}
🔍 **Details:** {error_message}

🛠️ **Required Actions:**
1. Check server logs immediately
2. Verify MT5 connection
3. Restart services if needed

📞 **Contact:** Technical support may be required
"""
            
            await self.send_admin_notification(message, "ERROR")
            
        except Exception as e:
            logger.error(f"❌ Error alert notification failed: {e}")
    
    async def send_startup_notification(self):
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
    """Synchronous wrapper for admin notifications"""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # Create new task if loop is already running
            asyncio.create_task(admin_notifier.send_admin_notification(message, priority))
        else:
            # Run in new event loop
            asyncio.run(admin_notifier.send_admin_notification(message, priority))
    except Exception as e:
        logger.error(f"❌ Failed to send admin notification: {e}")

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