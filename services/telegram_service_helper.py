"""
Telegram Service Helper
سرویس کمکی تلگرام برای ارسال پیام‌ها
"""

import asyncio
import logging
from datetime import datetime
import requests
from typing import Optional
import jdatetime

logger = logging.getLogger(__name__)

class TelegramHelper:
    """کلاس کمکی برای ارسال پیام‌های تلگرام"""
    
    def __init__(self, bot_token: str):
        self.bot_token = bot_token
        self.base_url = f"https://api.telegram.org/bot{bot_token}"
        
    async def send_message(self, chat_id: str, text: str, parse_mode: str = "Markdown") -> bool:
        """ارسال پیام به چت/کانال"""
        try:
            url = f"{self.base_url}/sendMessage"
            data = {
                'chat_id': chat_id,
                'text': text,
                'parse_mode': parse_mode,
                'disable_web_page_preview': True
            }
            
            response = requests.post(url, data=data, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            if result.get('ok'):
                logger.info(f"✅ Message sent successfully to {chat_id}")
                return True
            else:
                logger.error(f"❌ Telegram API error: {result.get('description')}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Failed to send message: {e}")
            return False

def format_navasan_message(prices_data: dict) -> str:
    """فرمت کردن پیام نوسان برای تلگرام"""
    
    # تاریخ و زمان شمسی
    now = datetime.now()
    persian_date = jdatetime.datetime.now().strftime('%Y/%m/%d')
    persian_time = now.strftime('%H:%M')
    
    message_parts = []
    
    # هدر پیام
    message_parts.append("🔔 گزارش لحظه‌ای قیمت‌ها")
    message_parts.append("")
    message_parts.append(f"📅 تاریخ: {persian_date} شمسی")
    message_parts.append(f"🕐 زمان: {persian_time} به وقت تهران")
    message_parts.append("")
    
    # نرخ ارزها
    if prices_data.get('currency'):
        currency = prices_data['currency']
        message_parts.append("💰 نرخ ارزها:")
        
        if 'usd' in currency:
            usd = currency['usd']
            if usd.get('sell'):
                message_parts.append(f" دلار آمریکا: {usd['sell']:,} تومان")
        
        if 'eur' in currency:
            eur = currency['eur']
            if eur.get('sell'):
                message_parts.append(f" یورو: {eur['sell']:,} تومان")
        
        # اضافه کردن ارزهای اضافی (اختیاری)
        if 'cad' in currency:
            cad = currency['cad']
            if cad.get('sell'):
                message_parts.append(f" دلار کانادا: {cad['sell']:,} تومان")
        
        if 'aed' in currency:
            aed = currency['aed']
            if aed.get('sell'):
                message_parts.append(f" درهم امارات: {aed['sell']:,} تومان")
        
        message_parts.append("")
    
    # رمزارزها
    if prices_data.get('crypto'):
        crypto = prices_data['crypto']
        message_parts.append("🪙 رمزارزها:")
        
        if 'bitcoin' in crypto:
            btc = crypto['bitcoin']
            if btc.get('price_usd'):
                # تبدیل قیمت دلار به تومان (تقریبی)
                usd_rate = 93400  # نرخ پیش‌فرض دلار
                if prices_data.get('currency', {}).get('usd', {}).get('sell'):
                    usd_rate = prices_data['currency']['usd']['sell']
                btc_toman = int(btc['price_usd'] * usd_rate)
                message_parts.append(f"₿ بیت‌کوین: {btc_toman:,} تومان")
        
        if 'ethereum' in crypto:
            eth = crypto['ethereum']
            if eth.get('price_usd'):
                usd_rate = 93400
                if prices_data.get('currency', {}).get('usd', {}).get('sell'):
                    usd_rate = prices_data['currency']['usd']['sell']
                eth_toman = int(eth['price_usd'] * usd_rate)
                message_parts.append(f"⧫ اتریوم: {eth_toman:,} تومان")
        
        # تتر (USDT) - معمولاً نزدیک نرخ دلار است
        if prices_data.get('currency', {}).get('usd', {}).get('sell'):
            usdt_rate = int(prices_data['currency']['usd']['sell'] * 0.985)  # کمی کمتر از دلار
            message_parts.append(f"💎 تتر (USDT): {usdt_rate:,} تومان")
        
        message_parts.append("")
    
    # طلا و سکه
    if prices_data.get('gold'):
        gold = prices_data['gold']
        message_parts.append("🥇 طلا و سکه:")
        
        if 'gold_18k' in gold and gold['gold_18k']:
            message_parts.append(f"🔶 طلای ۱۸ عیار: {gold['gold_18k']:,} تومان")
        
        if 'coins' in gold:
            coins = gold['coins']
            if coins.get('emami'):
                message_parts.append(f"🟡 سکه امامی: {coins['emami']:,} تومان")
        
        message_parts.append("")
    
    # بخش شمش طلا (اختیاری - داده‌های ثابت نمونه)
    message_parts.append("🏅 فروش شمش طلا ۹۹۵")
    message_parts.append("(تحویل فرودگاه امام خمینی (ره))")
    
    # محاسبه قیمت شمش بر اساس قیمت طلا
    if prices_data.get('gold', {}).get('gold_18k'):
        gold_price = prices_data['gold']['gold_18k']
        # تبدیل تقریبی به دلار
        usd_rate = 93400
        if prices_data.get('currency', {}).get('usd', {}).get('sell'):
            usd_rate = prices_data['currency']['usd']['sell']
        
        gold_usd = int(gold_price / usd_rate * 100)  # تقریبی
        message_parts.append(f"USD: {gold_usd}💵")
        
        # سایر ارزها (تقریبی)
        if prices_data.get('currency', {}).get('eur', {}).get('sell'):
            eur_rate = prices_data['currency']['eur']['sell']
            gold_eur = int(gold_price / eur_rate * 100)
            message_parts.append(f"EUR: {gold_eur}💶")
    
    message_parts.append("")
    
    # بخش خرید شمش
    message_parts.append("🏅 خرید شمش طلا ۹۹۵")
    
    if prices_data.get('gold', {}).get('gold_18k'):
        gold_price = prices_data['gold']['gold_18k']
        
        # محاسبه قیمت‌های مختلف شمش
        bar_free_market = int(gold_price * 1.32)  # ضریب تقریبی
        bar_exchange = int(gold_price * 1.325)
        
        message_parts.append(f"💰 {bar_free_market:,} تومان (بازار آزاد)")
        message_parts.append(f"💰 {bar_exchange:,} تومان (مرکز مبادله)")
        
        # قیمت دلاری
        usd_rate = 93400
        if prices_data.get('currency', {}).get('usd', {}).get('sell'):
            usd_rate = prices_data['currency']['usd']['sell']
        
        usd_free = int(bar_free_market / usd_rate)
        usd_gold = int(usd_free * 1.006)
        usd_commitment = int(usd_free * 0.975)
        
        message_parts.append(f"💵 {usd_free} دلار حواله بازار آزاد")
        message_parts.append(f"💵 {usd_gold} دلار طلا")
        message_parts.append(f"💵 {usd_commitment} دلار شمش رفع تعهدی")
    
    message_parts.append("")
    message_parts.append("⚠️ توجه: قیمت‌ها لحظه‌ای بوده و ممکن است تغییر کنند.")
    message_parts.append("")
    message_parts.append("📊 منبع: API نوسان")
    message_parts.append("🤖 ربات اعلام قیمت طلا و ارز")
    
    return "\n".join(message_parts)

def send_admin_notification_sync(message):
    """Send notification to admin (sync version for startup)"""
    try:
        import requests
        import os
        bot_token = os.getenv('TELEGRAM_BOT_TOKEN', '7503938398:AAFQGDmrAcYGVTF1_5lFJjJzePcRAkNsW38')
        admin_id = os.getenv('TELEGRAM_ADMIN_ID', '5137624945')
        
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        data = {
            'chat_id': admin_id,
            'text': message,
            'parse_mode': 'HTML'
        }
        
        response = requests.post(url, data=data, timeout=10)
        if response.status_code == 200:
            logger.info("✅ Admin notification sent successfully")
            return True
        else:
            logger.error(f"Telegram API error: {response.status_code}")
            return False
    except Exception as e:
        logger.error(f"❌ Failed to send admin notification sync: {e}")
        return False

# Global helper instance
telegram_helper = None

async def send_telegram_message(chat_id: str, message: str, bot_token: str = "7522433521:AAF7ugwzUy7k9OPqcGqEv_45hHsG83PpP-Y") -> bool:
    """ارسال پیام تلگرام"""
    global telegram_helper
    
    if not telegram_helper:
        telegram_helper = TelegramHelper(bot_token)
    
    return await telegram_helper.send_message(chat_id, message)

async def send_admin_notification(message: str, level: str = "INFO", 
                                bot_token: str = "7522433521:AAF7ugwzUy7k9OPqcGqEv_45hHsG83PpP-Y",
                                admin_id: str = "1112066452") -> bool:
    """ارسال اعلان به ادمین"""
    
    level_emojis = {
        "INFO": "ℹ️",
        "SUCCESS": "✅", 
        "WARNING": "⚠️",
        "ERROR": "❌",
        "DEBUG": "🔍"
    }
    
    emoji = level_emojis.get(level, "📢")
    formatted_message = f"{emoji} **{level}**\n\n{message}"
    
    return await send_telegram_message(admin_id, formatted_message, bot_token)

async def send_navasan_price_update(prices_data: dict, 
                                  channel_id: str = "-1002717718463",
                                  bot_token: str = "7522433521:AAF7ugwzUy7k9OPqcGqEv_45hHsG83PpP-Y") -> bool:
    """ارسال به‌روزرسانی قیمت نوسان به کانال"""
    
    try:
        # فرمت کردن پیام
        formatted_message = format_navasan_message(prices_data)
        
        # ارسال به کانال
        result = await send_telegram_message(channel_id, formatted_message, bot_token)
        
        if result:
            logger.info("✅ Navasan price update sent to channel successfully")
        else:
            logger.error("❌ Failed to send Navasan price update to channel")
        
        return result
        
    except Exception as e:
        logger.error(f"❌ Error in send_navasan_price_update: {e}")
        return False

async def send_signal_for_approval(signal_data: dict, 
                                 admin_id: str = "1112066452",
                                 bot_token: str = "7522433521:AAF7ugwzUy7k9OPqcGqEv_45hHsG83PpP-Y") -> bool:
    """ارسال سیگنال برای تایید ادمین"""
    
    try:
        # فرمت کردن پیام سیگنال
        message = f"""
🎯 **سیگنال جدید برای تایید**

📊 نماد: {signal_data.get('symbol', 'XAUUSD')}
📈 نوع: {signal_data.get('signal_type', 'BUY')}
💰 قیمت ورود: ${signal_data.get('entry_price', 'N/A')}
🛡️ Stop Loss: ${signal_data.get('stop_loss', 'N/A')}
🎯 Take Profit: ${signal_data.get('take_profit', 'N/A')}

🔍 تحلیل:
{signal_data.get('analysis', 'تحلیل در دسترس نیست')}

⏰ زمان: {signal_data.get('timestamp', datetime.now().strftime('%Y-%m-%d %H:%M:%S'))}

✅ برای تایید: /approve_{signal_data.get('id', 0)}
❌ برای رد: /reject_{signal_data.get('id', 0)}
        """
        
        return await send_telegram_message(admin_id, message, bot_token)
        
    except Exception as e:
        logger.error(f"❌ Error in send_signal_for_approval: {e}")
        return False