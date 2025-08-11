import os
import json
import hashlib
import hmac
import time
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Union
from urllib.parse import urlparse, parse_qs
import pytz
import logging

logger = logging.getLogger(__name__)

def get_tehran_time():
    """Get current time in Tehran timezone"""
    try:
        tehran_tz = pytz.timezone('Asia/Tehran')
        return datetime.now(tehran_tz)
    except Exception as e:
        logger.error(f"Error getting Tehran time: {e}")
        return datetime.now()

def format_persian_datetime(dt: datetime, include_seconds: bool = False) -> str:
    """Format datetime for Persian display"""
    try:
        if not dt:
            return "--"
        
        # Convert to Tehran timezone if not already
        if dt.tzinfo is None:
            tehran_tz = pytz.timezone('Asia/Tehran')
            dt = tehran_tz.localize(dt)
        elif dt.tzinfo != pytz.timezone('Asia/Tehran'):
            tehran_tz = pytz.timezone('Asia/Tehran')
            dt = dt.astimezone(tehran_tz)
        
        date_format = "%Y/%m/%d %H:%M"
        if include_seconds:
            date_format += ":%S"
        
        return dt.strftime(date_format)
    except Exception as e:
        logger.error(f"Error formatting Persian datetime: {e}")
        return str(dt) if dt else "--"

def format_price(price: Union[float, int, str], decimals: int = 2, include_currency: bool = True) -> str:
    """Format price with proper currency symbol"""
    try:
        if price is None or price == "":
            return "--"
        
        price_float = float(price)
        formatted = f"{price_float:.{decimals}f}"
        
        if include_currency:
            return f"${formatted}"
        return formatted
    except (ValueError, TypeError) as e:
        logger.error(f"Error formatting price {price}: {e}")
        return "--"

def format_percentage(value: Union[float, int, str], decimals: int = 1) -> str:
    """Format percentage value"""
    try:
        if value is None or value == "":
            return "--"
        
        value_float = float(value)
        return f"{value_float:.{decimals}f}%"
    except (ValueError, TypeError) as e:
        logger.error(f"Error formatting percentage {value}: {e}")
        return "--"

def is_market_hours(dt: Optional[datetime] = None) -> bool:
    """Check if given datetime (or current) is within market hours"""
    try:
        if dt is None:
            dt = get_tehran_time()
        
        # Convert to Tehran timezone if not already
        if dt.tzinfo is None:
            tehran_tz = pytz.timezone('Asia/Tehran')
            dt = tehran_tz.localize(dt)
        elif dt.tzinfo != pytz.timezone('Asia/Tehran'):
            tehran_tz = pytz.timezone('Asia/Tehran')
            dt = dt.astimezone(tehran_tz)
        
        # Check if it's a working day (Monday to Friday)
        if dt.weekday() >= 5:  # Saturday = 5, Sunday = 6
            return False
        
        # Check if it's within market hours (07:30 to 22:00)
        market_start = dt.replace(hour=7, minute=30, second=0, microsecond=0)
        market_end = dt.replace(hour=22, minute=0, second=0, microsecond=0)
        
        return market_start <= dt <= market_end
    except Exception as e:
        logger.error(f"Error checking market hours: {e}")
        return False

def calculate_risk_reward_ratio(entry_price: float, stop_loss: float, take_profit: float, signal_type: str) -> float:
    """Calculate risk/reward ratio for a signal"""
    try:
        if signal_type.upper() == 'BUY':
            risk = entry_price - stop_loss
            reward = take_profit - entry_price
        else:  # SELL
            risk = stop_loss - entry_price
            reward = entry_price - take_profit
        
        if risk <= 0:
            return 0
        
        return reward / risk
    except Exception as e:
        logger.error(f"Error calculating R/R ratio: {e}")
        return 0

def calculate_position_size(account_balance: float, risk_percent: float, entry_price: float, stop_loss: float) -> float:
    """Calculate position size based on risk management"""
    try:
        risk_amount = account_balance * (risk_percent / 100)
        price_diff = abs(entry_price - stop_loss)
        
        if price_diff == 0:
            return 0
        
        position_size = risk_amount / price_diff
        return round(position_size, 2)
    except Exception as e:
        logger.error(f"Error calculating position size: {e}")
        return 0

def sanitize_filename(filename: str) -> str:
    """Sanitize filename for safe file operations"""
    try:
        # Remove or replace unsafe characters
        unsafe_chars = '<>:"/\\|?*'
        for char in unsafe_chars:
            filename = filename.replace(char, '_')
        
        # Remove leading/trailing spaces and dots
        filename = filename.strip(' .')
        
        # Ensure filename is not empty
        if not filename:
            filename = f"file_{int(time.time())}"
        
        return filename
    except Exception as e:
        logger.error(f"Error sanitizing filename: {e}")
        return f"file_{int(time.time())}"

def generate_signal_id(symbol: str, signal_type: str, entry_price: float, timestamp: datetime) -> str:
    """Generate unique signal ID"""
    try:
        # Create a unique string from signal parameters
        signal_string = f"{symbol}_{signal_type}_{entry_price}_{timestamp.isoformat()}"
        
        # Generate hash
        signal_hash = hashlib.md5(signal_string.encode()).hexdigest()[:8]
        
        return f"{symbol}_{signal_type}_{signal_hash}".upper()
    except Exception as e:
        logger.error(f"Error generating signal ID: {e}")
        return f"SIGNAL_{int(time.time())}"

def validate_price_data(price_data: Dict[str, Any]) -> bool:
    """Validate price data structure"""
    try:
        required_fields = ['open', 'high', 'low', 'close', 'timestamp']
        
        for field in required_fields:
            if field not in price_data:
                return False
            
            if field == 'timestamp':
                continue
            
            # Validate numeric fields
            try:
                float(price_data[field])
            except (ValueError, TypeError):
                return False
        
        # Validate OHLC logic
        open_price = float(price_data['open'])
        high_price = float(price_data['high'])
        low_price = float(price_data['low'])
        close_price = float(price_data['close'])
        
        # High should be highest, low should be lowest
        if high_price < max(open_price, close_price) or low_price > min(open_price, close_price):
            return False
        
        return True
    except Exception as e:
        logger.error(f"Error validating price data: {e}")
        return False

def safe_divide(numerator: Union[float, int], denominator: Union[float, int], default: float = 0) -> float:
    """Safely divide two numbers"""
    try:
        if denominator == 0:
            return default
        return numerator / denominator
    except (TypeError, ValueError) as e:
        logger.error(f"Error in safe divide: {e}")
        return default

def truncate_text(text: str, max_length: int = 100, suffix: str = "...") -> str:
    """Truncate text to specified length"""
    try:
        if not text or len(text) <= max_length:
            return text or ""
        
        return text[:max_length - len(suffix)] + suffix
    except Exception as e:
        logger.error(f"Error truncating text: {e}")
        return text or ""

def clean_json_string(json_str: str) -> str:
    """Clean and validate JSON string"""
    try:
        if not json_str:
            return "{}"
        
        # Try to parse and reformat
        parsed = json.loads(json_str)
        return json.dumps(parsed, ensure_ascii=False)
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON string: {e}")
        return "{}"
    except Exception as e:
        logger.error(f"Error cleaning JSON string: {e}")
        return json_str

def get_config_value(config_dict: Dict, key_path: str, default: Any = None) -> Any:
    """Get nested configuration value using dot notation"""
    try:
        keys = key_path.split('.')
        value = config_dict
        
        for key in keys:
            if isinstance(value, dict) and key in value:
                value = value[key]
            else:
                return default
        
        return value
    except Exception as e:
        logger.error(f"Error getting config value for {key_path}: {e}")
        return default

def create_telegram_keyboard(buttons: List[List[Dict[str, str]]]) -> Dict:
    """Create Telegram inline keyboard markup"""
    try:
        keyboard = {
            "inline_keyboard": []
        }
        
        for row in buttons:
            keyboard_row = []
            for button in row:
                if 'text' in button and 'callback_data' in button:
                    keyboard_row.append({
                        'text': button['text'],
                        'callback_data': button['callback_data']
                    })
            
            if keyboard_row:
                keyboard["inline_keyboard"].append(keyboard_row)
        
        return keyboard
    except Exception as e:
        logger.error(f"Error creating Telegram keyboard: {e}")
        return {"inline_keyboard": []}

def format_signal_message(signal_data: Dict[str, Any], for_admin: bool = False) -> str:
    """Format signal data into readable message"""
    try:
        signal_type = signal_data.get('signal_type', 'UNKNOWN')
        entry_price = signal_data.get('entry_price', 0)
        stop_loss = signal_data.get('stop_loss', 0)
        take_profit = signal_data.get('take_profit', 0)
        confidence = signal_data.get('confidence', 0)
        pattern = signal_data.get('pattern', 'Unknown')
        timeframe = signal_data.get('timeframe', 'H1')
        
        # Calculate R/R ratio
        rr_ratio = calculate_risk_reward_ratio(entry_price, stop_loss, take_profit, signal_type)
        
        # Signal emoji
        emoji = '🟢' if signal_type == 'BUY' else '🔴'
        
        if for_admin:
            message = f"""
{emoji} **سیگنال {signal_type} - {timeframe}**

💰 **قیمت ورود:** {format_price(entry_price)}
🛡️ **Stop Loss:** {format_price(stop_loss)}
🎯 **Take Profit:** {format_price(take_profit)}
📊 **نسبت R/R:** 1:{rr_ratio:.1f}
🔥 **اعتماد:** {format_percentage(confidence * 100)}
📈 **الگو:** {pattern}

⏰ **زمان:** {format_persian_datetime(datetime.now())}
            """.strip()
        else:
            message = f"""
{emoji} **سیگنال طلای جهانی**

💎 **XAUUSD** | {timeframe}
{emoji} **{signal_type}**
💰 ورود: {format_price(entry_price)}
🛡️ SL: {format_price(stop_loss)}
🎯 TP: {format_price(take_profit)}

⚠️ **تذکر:** همیشه مدیریت ریسک را رعایت کنید
            """.strip()
        
        return message
    except Exception as e:
        logger.error(f"Error formatting signal message: {e}")
        return "خطا در تولید پیام سیگنال"

def validate_telegram_config() -> bool:
    """Validate Telegram configuration"""
    try:
        bot_token = os.getenv('TELEGRAM_BOT_TOKEN', '7522433521:AAF7ugwzUy7k9OPqcGqEv_45hHsG83PpP-Y')
        channel_id = os.getenv('TELEGRAM_CHANNEL_ID', '-1002717718463')
        admin_id = os.getenv('TELEGRAM_ADMIN_ID', '1112066452')
        
        # Basic validation
        if not bot_token or len(bot_token.split(':')) != 2:
            logger.error("Invalid Telegram bot token")
            return False
        
        if not channel_id or not channel_id.startswith('-'):
            logger.error("Invalid Telegram channel ID")
            return False
        
        if not admin_id or not admin_id.isdigit():
            logger.error("Invalid Telegram admin ID")
            return False
        
        return True
    except Exception as e:
        logger.error(f"Error validating Telegram config: {e}")
        return False

def get_market_session(dt: Optional[datetime] = None) -> str:
    """Get current market session (Asian, European, American)"""
    try:
        if dt is None:
            dt = get_tehran_time()
        
        hour = dt.hour
        
        # Tehran time market sessions (approximate)
        if 2 <= hour < 10:
            return "Asian"
        elif 10 <= hour < 18:
            return "European"
        elif 18 <= hour < 2:
            return "American"
        else:
            return "Closed"
    except Exception as e:
        logger.error(f"Error getting market session: {e}")
        return "Unknown"

def calculate_pip_value(symbol: str, lot_size: float = 1.0) -> float:
    """Calculate pip value for given symbol and lot size"""
    try:
        # For XAUUSD, 1 pip = $0.10 per 1 lot
        if symbol.upper() == 'XAUUSD':
            return 0.10 * lot_size
        
        # Default pip value for major pairs
        return 10 * lot_size
    except Exception as e:
        logger.error(f"Error calculating pip value: {e}")
        return 0.10

def format_duration(seconds: int) -> str:
    """Format duration in seconds to human readable string"""
    try:
        if seconds < 60:
            return f"{seconds} ثانیه"
        elif seconds < 3600:
            minutes = seconds // 60
            return f"{minutes} دقیقه"
        elif seconds < 86400:
            hours = seconds // 3600
            minutes = (seconds % 3600) // 60
            if minutes > 0:
                return f"{hours} ساعت و {minutes} دقیقه"
            return f"{hours} ساعت"
        else:
            days = seconds // 86400
            hours = (seconds % 86400) // 3600
            if hours > 0:
                return f"{days} روز و {hours} ساعت"
            return f"{days} روز"
    except Exception as e:
        logger.error(f"Error formatting duration: {e}")
        return f"{seconds} ثانیه"

def validate_api_response(response_data: Dict, required_fields: List[str]) -> bool:
    """Validate API response has required fields"""
    try:
        if not isinstance(response_data, dict):
            return False
        
        for field in required_fields:
            if field not in response_data:
                logger.error(f"Missing required field in API response: {field}")
                return False
        
        return True
    except Exception as e:
        logger.error(f"Error validating API response: {e}")
        return False

def retry_on_failure(func, max_retries: int = 3, delay: float = 1.0, backoff_factor: float = 2.0):
    """Decorator for retrying functions on failure"""
    def decorator(*args, **kwargs):
        retries = 0
        current_delay = delay
        
        while retries < max_retries:
            try:
                return func(*args, **kwargs)
            except Exception as e:
                retries += 1
                if retries >= max_retries:
                    logger.error(f"Function {func.__name__} failed after {max_retries} retries: {e}")
                    raise e
                
                logger.warning(f"Function {func.__name__} failed (attempt {retries}/{max_retries}): {e}")
                time.sleep(current_delay)
                current_delay *= backoff_factor
        
        return None
    
    return decorator

def get_next_schedule_time(hour: int, minute: int, timezone_str: str = 'Asia/Tehran') -> datetime:
    """Get next occurrence of specific time"""
    try:
        tz = pytz.timezone(timezone_str)
        now = datetime.now(tz)
        
        # Create target time for today
        target_time = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
        
        # If target time has passed today, schedule for tomorrow
        if target_time <= now:
            target_time += timedelta(days=1)
        
        return target_time
    except Exception as e:
        logger.error(f"Error getting next schedule time: {e}")
        return datetime.now() + timedelta(hours=1)

def mask_sensitive_data(data: str, mask_char: str = '*', visible_chars: int = 4) -> str:
    """Mask sensitive data leaving only first and last few characters visible"""
    try:
        if not data or len(data) <= visible_chars * 2:
            return mask_char * len(data) if data else ""
        
        start = data[:visible_chars]
        end = data[-visible_chars:]
        middle = mask_char * (len(data) - visible_chars * 2)
        
        return f"{start}{middle}{end}"
    except Exception as e:
        logger.error(f"Error masking sensitive data: {e}")
        return mask_char * 8
