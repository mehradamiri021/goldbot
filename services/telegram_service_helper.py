"""
Helper functions for Telegram service to resolve import issues
"""

import asyncio
from services.telegram_service import TelegramService

# Global telegram service instance
telegram_service = TelegramService()

def send_admin_notification(message_text: str, message_type: str = 'NOTIFICATION'):
    """Sync wrapper for async admin notification"""
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(telegram_service.send_admin_notification(message_text, message_type))
        loop.close()
        return result
    except Exception as e:
        print(f"Error sending admin notification: {e}")
        return None

def send_signal_for_approval(signal_data):
    """Send signal for admin approval"""
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(telegram_service.send_signal_for_approval(signal_data))
        loop.close()
        return result
    except Exception as e:
        print(f"Error sending signal for approval: {e}")
        return None

def send_daily_report(analysis_data):
    """Send daily report to channel"""
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(telegram_service.send_daily_report(analysis_data))
        loop.close()
        return result
    except Exception as e:
        print(f"Error sending daily report: {e}")
        return None