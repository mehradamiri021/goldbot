import logging
from datetime import datetime
from app import db
from models import BotStatus, PriceAlert
from services.telegram_service import send_admin_notification
from utils.helpers import get_tehran_time, format_price, format_percentage
import json

logger = logging.getLogger(__name__)

class BotMonitoringService:
    """Service for monitoring bot status and price changes"""
    
    def __init__(self):
        self.price_history = {}
        self.component_statuses = {
            'DATA_API': 'OFFLINE',
            'TELEGRAM': 'OFFLINE', 
            'SCHEDULER': 'OFFLINE',
            'ANALYSIS': 'OFFLINE'
        }
    
    def update_component_status(self, component: str, status: str, error_message: str = None, additional_info: dict = None):
        """Update status of a bot component"""
        try:
            # Update in-memory status
            self.component_statuses[component] = status
            
            # Update database
            existing_status = BotStatus.query.filter_by(component=component).first()
            
            if existing_status:
                existing_status.status = status
                existing_status.last_update = datetime.utcnow()
                existing_status.error_message = error_message
                if additional_info:
                    existing_status.set_info(additional_info)
            else:
                new_status = BotStatus(
                    component=component,
                    status=status,
                    error_message=error_message,
                    last_update=datetime.utcnow()
                )
                if additional_info:
                    new_status.set_info(additional_info)
                db.session.add(new_status)
            
            db.session.commit()
            
            # Send admin notification for critical status changes
            if status == 'ERROR':
                self._send_status_alert(component, status, error_message)
                
            logger.info(f"Component {component} status updated to {status}")
            
        except Exception as e:
            logger.error(f"Error updating component status: {e}")
            db.session.rollback()
    
    def log_price_change(self, symbol: str, timeframe: str, previous_price: float, current_price: float):
        """Log significant price changes and alert admin"""
        try:
            if previous_price and current_price:
                price_change = current_price - previous_price
                change_percentage = (price_change / previous_price) * 100
                
                # Determine alert type based on change
                alert_type = None
                should_alert = False
                
                # Major price movement (>0.5% in 15min or >1% in 1H)
                if abs(change_percentage) > 0.5 and timeframe == 'M15':
                    alert_type = 'MAJOR_MOVE'
                    should_alert = True
                elif abs(change_percentage) > 1.0 and timeframe == 'H1':
                    alert_type = 'MAJOR_MOVE'
                    should_alert = True
                
                # Store price alert in database
                price_alert = PriceAlert(
                    symbol=symbol,
                    previous_price=previous_price,
                    current_price=current_price,
                    price_change=price_change,
                    change_percentage=change_percentage,
                    alert_type=alert_type,
                    timeframe=timeframe,
                    logged_at=datetime.utcnow(),
                    admin_notified=False
                )
                
                db.session.add(price_alert)
                db.session.commit()
                
                # Send admin notification for significant movements
                if should_alert:
                    self._send_price_alert(symbol, timeframe, current_price, price_change, change_percentage)
                    price_alert.admin_notified = True
                    db.session.commit()
                
                logger.info(f"Price change logged: {symbol} {timeframe} - {change_percentage:.2f}%")
                
            # Update price history
            key = f"{symbol}_{timeframe}"
            self.price_history[key] = current_price
            
        except Exception as e:
            logger.error(f"Error logging price change: {e}")
            db.session.rollback()
    
    def get_bot_health_report(self):
        """Generate comprehensive bot health report"""
        try:
            current_time = get_tehran_time()
            
            # Get component statuses
            statuses = BotStatus.query.all()
            status_dict = {}
            
            for status in statuses:
                status_dict[status.component] = {
                    'status': status.status,
                    'last_update': status.last_update,
                    'error_message': status.error_message,
                    'additional_info': status.get_info()
                }
            
            # Get recent price alerts
            recent_alerts = PriceAlert.query.filter(
                PriceAlert.logged_at >= datetime.utcnow().replace(hour=0, minute=0, second=0)
            ).order_by(PriceAlert.logged_at.desc()).limit(10).all()
            
            # Count pending signals
            pending_signals = db.session.query(db.func.count()).select_from(
                db.session.query('signals').filter_by(status='PENDING')
            ).scalar() or 0
            
            # Generate health score
            online_components = sum(1 for comp, status in self.component_statuses.items() if status == 'ONLINE')
            total_components = len(self.component_statuses)
            health_score = (online_components / total_components) * 100
            
            report = {
                'timestamp': current_time.isoformat(),
                'health_score': health_score,
                'component_statuses': status_dict,
                'recent_price_alerts': [
                    {
                        'symbol': alert.symbol,
                        'timeframe': alert.timeframe,
                        'current_price': alert.current_price,
                        'price_change': alert.price_change,
                        'change_percentage': alert.change_percentage,
                        'alert_type': alert.alert_type,
                        'logged_at': alert.logged_at.isoformat()
                    }
                    for alert in recent_alerts
                ],
                'pending_signals_count': pending_signals,
                'in_memory_statuses': self.component_statuses
            }
            
            return report
            
        except Exception as e:
            logger.error(f"Error generating health report: {e}")
            return {
                'timestamp': get_tehran_time().isoformat(),
                'health_score': 0,
                'error': str(e)
            }
    
    def _send_status_alert(self, component: str, status: str, error_message: str):
        """Send status alert to admin"""
        try:
            current_time = get_tehran_time()
            
            if status == 'ERROR':
                emoji = '🔴'
                status_text = 'خطا'
            elif status == 'OFFLINE':
                emoji = '🟡'
                status_text = 'آفلاین'
            else:
                emoji = '🟢'
                status_text = 'آنلاین'
            
            message = f"""
{emoji} **هشدار وضعیت سیستم**

🔧 **کامپوننت:** {component}
📊 **وضعیت:** {status_text}
⏰ **زمان:** {current_time.strftime('%Y/%m/%d %H:%M')}

"""
            
            if error_message:
                message += f"❌ **خطا:** {error_message}\n"
            
            message += "\n📋 جهت بررسی کامل وضعیت از دستور /status استفاده کنید"
            
            # Send to admin
            send_admin_notification(message, message_type='STATUS_ALERT')
            
        except Exception as e:
            logger.error(f"Error sending status alert: {e}")
    
    def _send_price_alert(self, symbol: str, timeframe: str, current_price: float, price_change: float, change_percentage: float):
        """Send price movement alert to admin"""
        try:
            current_time = get_tehran_time()
            
            if price_change > 0:
                emoji = '🟢'
                direction = 'صعود'
            else:
                emoji = '🔴'
                direction = 'نزول'
            
            message = f"""
{emoji} **هشدار حرکت قیمت**

💰 **نماد:** {symbol}
📊 **تایم‌فریم:** {timeframe}
💹 **قیمت فعلی:** {format_price(current_price)}
📈 **تغییر قیمت:** {format_price(abs(price_change))} ({direction})
📊 **درصد تغییر:** {format_percentage(abs(change_percentage))}
⏰ **زمان:** {current_time.strftime('%Y/%m/%d %H:%M')}

⚠️ حرکت قابل توجه در بازار طلا مشاهده شد
            """.strip()
            
            # Send to admin
            send_admin_notification(message, message_type='PRICE_ALERT')
            
        except Exception as e:
            logger.error(f"Error sending price alert: {e}")
    
    def cleanup_old_logs(self, days_to_keep: int = 7):
        """Clean up old price alerts and status logs"""
        try:
            cutoff_date = datetime.utcnow().replace(hour=0, minute=0, second=0)
            cutoff_date = cutoff_date.replace(day=cutoff_date.day - days_to_keep)
            
            # Delete old price alerts
            old_alerts = PriceAlert.query.filter(PriceAlert.logged_at < cutoff_date).all()
            for alert in old_alerts:
                db.session.delete(alert)
            
            # Keep only latest status for each component
            components = ['DATA_API', 'TELEGRAM', 'SCHEDULER', 'ANALYSIS']
            for component in components:
                old_statuses = BotStatus.query.filter(
                    BotStatus.component == component
                ).order_by(BotStatus.last_update.desc()).offset(5).all()
                
                for status in old_statuses:
                    db.session.delete(status)
            
            db.session.commit()
            logger.info(f"Cleaned up logs older than {days_to_keep} days")
            
        except Exception as e:
            logger.error(f"Error cleaning up old logs: {e}")
            db.session.rollback()

# Global monitoring service instance
monitoring_service = BotMonitoringService()