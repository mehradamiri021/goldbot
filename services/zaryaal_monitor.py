"""
ZaryaalGold Channel Monitor
مانیتور کانال ZaryaalGold برای دریافت قیمت شمش طلا
"""

import logging
import re
from datetime import datetime
from typing import Optional, Dict, List
import asyncio
from telegram import Bot
from telegram.error import TelegramError

logger = logging.getLogger(__name__)

class ZaryaalMonitor:
    """مانیتور کانال ZaryaalGold"""
    
    def __init__(self, bot_token: str):
        self.bot = Bot(token=bot_token)
        self.channel_username = "@ZaryaalGold"
        self.channel_id = None  # Will be resolved from username
        
        # Price extraction patterns
        self.price_patterns = {
            'gold_bar': [
                r'شمش.*?(\d{1,3}(?:,\d{3})*)',
                r'طلا.*?شمش.*?(\d{1,3}(?:,\d{3})*)',
                r'(\d{1,3}(?:,\d{3})*)\s*تومان.*?شمش',
            ],
            'gold_18k': [
                r'18\s*عیار.*?(\d{1,3}(?:,\d{3})*)',
                r'طلای.*?18.*?(\d{1,3}(?:,\d{3})*)',
            ],
            'coin': [
                r'سکه.*?(\d{1,3}(?:,\d{3})*)',
                r'امامی.*?(\d{1,3}(?:,\d{3})*)',
            ]
        }
        
        logger.info(f"🔍 ZaryaalGold monitor initialized for channel: {self.channel_username}")
    
    async def get_channel_info(self) -> Optional[Dict]:
        """دریافت اطلاعات کانال"""
        try:
            chat = await self.bot.get_chat(self.channel_username)
            self.channel_id = chat.id
            
            return {
                'id': chat.id,
                'title': chat.title,
                'username': chat.username,
                'description': chat.description,
                'member_count': getattr(chat, 'member_count', None)
            }
            
        except TelegramError as e:
            logger.error(f"❌ Error getting channel info: {e}")
            return None
    
    async def get_latest_messages(self, limit: int = 10) -> List[Dict]:
        """دریافت آخرین پیام‌ها از کانال"""
        try:
            if not self.channel_id:
                await self.get_channel_info()
            
            if not self.channel_id:
                logger.error("❌ Cannot resolve channel ID")
                return []
            
            # Note: This requires bot to be admin of the channel or channel to be public
            # For private channels, we need different approach
            
            messages = []
            # Telegram Bot API doesn't directly support getting channel messages
            # We need to use update mechanism or channel admin privileges
            
            logger.warning("⚠️ Direct message fetching requires special permissions")
            return messages
            
        except TelegramError as e:
            logger.error(f"❌ Error fetching messages: {e}")
            return []
    
    def extract_prices_from_text(self, text: str) -> Dict[str, Optional[float]]:
        """استخراج قیمت‌ها از متن پیام"""
        prices = {
            'gold_bar': None,
            'gold_18k': None,
            'coin': None,
            'timestamp': datetime.now()
        }
        
        if not text:
            return prices
        
        # Clean text
        text = text.replace(',', '').replace('٬', '').replace('،', '')
        
        for price_type, patterns in self.price_patterns.items():
            for pattern in patterns:
                match = re.search(pattern, text, re.IGNORECASE | re.UNICODE)
                if match:
                    try:
                        price_str = match.group(1).replace(',', '')
                        price = float(price_str)
                        prices[price_type] = price
                        logger.debug(f"💰 Extracted {price_type}: {price:,}")
                        break
                    except (ValueError, IndexError):
                        continue
        
        return prices
    
    def format_extracted_prices(self, prices: Dict) -> str:
        """فرمت کردن قیمت‌های استخراج شده"""
        if not any(prices[key] for key in ['gold_bar', 'gold_18k', 'coin']):
            return "❌ هیچ قیمتی استخراج نشد"
        
        message_parts = []
        message_parts.append("🥇 **قیمت‌های کانال ZaryaalGold**")
        message_parts.append(f"🕐 تاریخ: {prices['timestamp'].strftime('%Y-%m-%d %H:%M:%S')}")
        message_parts.append("")
        
        if prices['gold_bar']:
            message_parts.append(f"📦 شمش طلا: {prices['gold_bar']:,} تومان")
        
        if prices['gold_18k']:
            message_parts.append(f"✨ طلای 18 عیار: {prices['gold_18k']:,} تومان")
        
        if prices['coin']:
            message_parts.append(f"🪙 سکه طلا: {prices['coin']:,} تومان")
        
        message_parts.append("")
        message_parts.append("📊 منبع: کانال @ZaryaalGold")
        
        return "\n".join(message_parts)
    
    async def monitor_channel_updates(self, callback=None):
        """مانیتور به‌روزرسانی‌های کانال (نیاز به webhook)"""
        logger.info(f"🔍 Starting channel monitor for {self.channel_username}")
        
        # This would require webhook setup or long polling
        # For now, we'll implement a placeholder
        
        while True:
            try:
                # In a real implementation, this would listen for updates
                await asyncio.sleep(60)  # Check every minute
                
                # Placeholder for actual monitoring logic
                logger.debug("📡 Monitoring channel for updates...")
                
            except Exception as e:
                logger.error(f"❌ Error in channel monitoring: {e}")
                await asyncio.sleep(300)  # Wait 5 minutes on error
    
    def validate_price_data(self, prices: Dict) -> bool:
        """اعتبارسنجی داده‌های قیمت"""
        if not prices:
            return False
        
        # Check if at least one price is available
        if not any(prices.get(key) for key in ['gold_bar', 'gold_18k', 'coin']):
            return False
        
        # Validate price ranges (rough estimates)
        validations = {
            'gold_bar': (1000000, 50000000),  # 1M to 50M Toman
            'gold_18k': (100000, 10000000),   # 100K to 10M Toman  
            'coin': (5000000, 100000000)      # 5M to 100M Toman
        }
        
        for price_type, price in prices.items():
            if price and price_type in validations:
                min_price, max_price = validations[price_type]
                if not (min_price <= price <= max_price):
                    logger.warning(f"⚠️ Suspicious price for {price_type}: {price:,}")
                    return False
        
        return True
    
    async def test_connection(self) -> bool:
        """تست اتصال به کانال"""
        try:
            info = await self.get_channel_info()
            if info:
                logger.info(f"✅ Successfully connected to {info['title']}")
                return True
            else:
                logger.error("❌ Failed to connect to channel")
                return False
                
        except Exception as e:
            logger.error(f"❌ Connection test failed: {e}")
            return False

# Factory function
def create_zaryaal_monitor(bot_token: str) -> ZaryaalMonitor:
    """ایجاد نمونه مانیتور ZaryaalGold"""
    return ZaryaalMonitor(bot_token)