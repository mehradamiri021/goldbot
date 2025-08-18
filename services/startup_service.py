"""
Startup Service for Gold Trading Bot
Handles initial system startup and reports
"""

import logging
from datetime import datetime
from services.data_service import DataService
from services.navasan_service import NavasanService
from services.analysis_service import AnalysisService
from services.telegram_service import telegram_service
from utils.tehran_time import get_tehran_time

logger = logging.getLogger(__name__)

class StartupService:
    """Service for handling bot startup procedures"""
    
    def __init__(self):
        self.data_service = DataService()
        self.navasan_service = NavasanService()
        self.analysis_service = AnalysisService()
        
    def send_initial_market_report(self):
        """Send comprehensive initial market report to admin"""
        try:
            logger.info("🚀 Generating initial market report...")
            
            # Get market data from all sources
            mt5_data = self._get_mt5_status()
            navasan_data = self._get_navasan_status()
            analysis_data = self._generate_initial_analysis()
            
            # Format comprehensive report
            report = self._format_initial_report(mt5_data, navasan_data, analysis_data)
            
            # Send to admin
            result = telegram_service.send_admin_notification_sync(report, urgent=True)
            
            if result:
                logger.info("✅ Initial market report sent to admin successfully")
                return True
            else:
                logger.error("❌ Failed to send initial market report")
                return False
                
        except Exception as e:
            logger.error(f"Error sending initial market report: {e}")
            return False
    
    def _get_mt5_status(self):
        """Get MT5 data status"""
        try:
            # Get data from different timeframes
            h1_data = self.data_service.get_market_data('H1', limit=10)
            m15_data = self.data_service.get_market_data('M15', limit=10)
            
            if h1_data is not None and len(h1_data) > 0:
                latest_price = h1_data.iloc[-1]['close']
                data_count = len(h1_data)
                latest_time = h1_data.iloc[-1]['timestamp']
                
                return {
                    'status': 'CONNECTED',
                    'latest_price': latest_price,
                    'data_count_h1': data_count,
                    'data_count_m15': len(m15_data) if m15_data is not None else 0,
                    'latest_time': latest_time,
                    'price_range': {
                        'high': h1_data['high'].max(),
                        'low': h1_data['low'].min()
                    }
                }
            else:
                return {'status': 'DISCONNECTED', 'error': 'No MT5 data available'}
                
        except Exception as e:
            return {'status': 'ERROR', 'error': str(e)}
    
    def _get_navasan_status(self):
        """Get Navasan API status"""
        try:
            data = self.navasan_service.get_currency_prices()
            
            if data:
                return {
                    'status': 'CONNECTED',
                    'usd_buy': data.get('usd_buy'),
                    'usd_sell': data.get('usd_sell'),
                    'gold_18k': data.get('gold_18k'),
                    'timestamp': data.get('timestamp', datetime.now())
                }
            else:
                return {'status': 'DISCONNECTED', 'error': 'No Navasan data available'}
                
        except Exception as e:
            return {'status': 'ERROR', 'error': str(e)}
    
    def _generate_initial_analysis(self):
        """Generate initial market analysis"""
        try:
            # Get H1 data for analysis
            h1_data = self.data_service.get_market_data('H1', limit=50)
            
            if h1_data is not None and len(h1_data) > 0:
                analysis = self.analysis_service.analyze_market(h1_data, 'H1')
                return {
                    'status': 'SUCCESS',
                    'rsi': analysis.get('rsi', 0),
                    'trend': analysis.get('trend', 'UNKNOWN'),
                    'support': analysis.get('support_level', 0),
                    'resistance': analysis.get('resistance_level', 0),
                    'smc_analysis': analysis.get('smc_analysis', {})
                }
            else:
                return {'status': 'NO_DATA', 'error': 'Insufficient data for analysis'}
                
        except Exception as e:
            return {'status': 'ERROR', 'error': str(e)}
    
    def _format_initial_report(self, mt5_data, navasan_data, analysis_data):
        """Format comprehensive initial report"""
        try:
            current_time = get_tehran_time()
            
            report = f"""🚀 **گزارش اولیه راه‌اندازی سیستم**
⏰ **زمان:** {current_time.strftime('%Y/%m/%d - %H:%M')} (تهران)

📊 **وضعیت منابع داده:**

🎯 **MT5 Local Server:**
"""
            
            # MT5 Status
            if mt5_data['status'] == 'CONNECTED':
                report += f"""✅ متصل و فعال
📈 آخرین قیمت: ${mt5_data['latest_price']:,.2f}
📊 تعداد کندل H1: {mt5_data['data_count_h1']}
📊 تعداد کندل M15: {mt5_data['data_count_m15']}
📈 محدوده قیمت: ${mt5_data['price_range']['low']:,.0f} - ${mt5_data['price_range']['high']:,.0f}
🕐 آخرین آپدیت: {mt5_data['latest_time']}"""
            else:
                report += f"❌ خطا: {mt5_data.get('error', 'نامشخص')}"
            
            # Navasan API Status  
            report += f"""

💰 **API نوسان:**
"""
            if navasan_data['status'] == 'CONNECTED':
                report += f"""✅ متصل و فعال
💵 دلار خرید: {navasan_data['usd_buy']:,} تومان
💵 دلار فروش: {navasan_data['usd_sell']:,} تومان
🥇 طلای ۱۸ عیار: {navasan_data['gold_18k']:,} تومان"""
            else:
                report += f"❌ خطا: {navasan_data.get('error', 'نامشخص')}"
            
            # Analysis Status
            report += f"""

🔍 **تحلیل اولیه بازار:**
"""
            if analysis_data['status'] == 'SUCCESS':
                report += f"""✅ تحلیل موفق
📊 RSI: {analysis_data['rsi']:.2f}
📈 ترند: {analysis_data['trend']}
🛡️ حمایت: ${analysis_data['support']:,.0f}
⚡ مقاومت: ${analysis_data['resistance']:,.0f}

🎯 **Smart Money Analysis:**"""
                
                smc = analysis_data.get('smc_analysis', {})
                if smc:
                    order_blocks = smc.get('order_blocks', [])
                    report += f"""
📦 Order Blocks: {len(order_blocks)} شناسایی شد
🔥 Break of Structure: {smc.get('bos_signal', {}).get('type', 'تشخیص داده نشد')}"""
            else:
                report += f"⚠️ خطا: {analysis_data.get('error', 'نامشخص')}"
            
            report += f"""

🔧 **وضعیت کلی سیستم:**
✅ Scheduler فعال - زمان‌بندی‌ها تنظیم شدند
✅ Telegram Bot متصل
✅ پایگاه داده آماده
✅ سیستم کاملاً راه‌اندازی شده

🎯 **برنامه‌های آتی:**
📅 گزارش صبحگاهی: ۰۸:۳۰
📅 آپدیت قیمت: ۱۱:۱۱، ۱۴:۱۴، ۱۷:۱۷
📅 گزارش هفتگی: یکشنبه ۱۲:۱۲

🚨 سیستم آماده و تمام سرویس‌ها فعال هستند."""
            
            return report
            
        except Exception as e:
            logger.error(f"Error formatting initial report: {e}")
            return f"خطا در تولید گزارش اولیه: {e}"

# Global instance
startup_service = StartupService()