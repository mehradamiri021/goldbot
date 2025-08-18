"""
تنظیمات پیش‌فرض برای ربات طلا
Default configurations for easy deployment
"""

import os

# تنظیمات پیش‌فرض که در صورت عدم وجود در environment استفاده می‌شوند
DEFAULT_CONFIG = {
    # Database
    'DATABASE_URL': 'sqlite:///goldbot.db',  # SQLite as fallback
    'PGHOST': 'localhost',
    'PGPORT': '5432',
    'PGDATABASE': 'goldbot',
    'PGUSER': 'goldbot',
    'PGPASSWORD': '',
    
    # Telegram
    'TELEGRAM_BOT_TOKEN': '',
    'TELEGRAM_CHANNEL_ID': '',
    'TELEGRAM_ADMIN_ID': '',
    
    # API Keys
    'NAVASAN_API_KEY': 'freeL3ceMoBm2EaeVeuvHJvuGKTJcNcg',  # Free API key
    
    # Server Settings
    'FLASK_SECRET_KEY': 'goldbot-secret-key-change-in-production',
    'SERVER_PORT': '5000',
    'FLASK_ENV': 'production',
    'TZ': 'Asia/Tehran',
    
    # Optional Features
    'ENABLE_TELEGRAM': 'true',
    'ENABLE_PRICE_ALERTS': 'true',
    'ENABLE_SIGNALS': 'true',
    'ENABLE_ADMIN_PANEL': 'true'
}

def load_config():
    """بارگذاری تنظیمات با fallback به مقادیر پیش‌فرض"""
    config = {}
    
    for key, default_value in DEFAULT_CONFIG.items():
        config[key] = os.environ.get(key, default_value)
    
    return config

def ensure_required_env_vars():
    """اطمینان از وجود متغیرهای ضروری"""
    required_vars = ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHANNEL_ID', 'TELEGRAM_ADMIN_ID']
    missing_vars = []
    
    for var in required_vars:
        if not os.environ.get(var):
            missing_vars.append(var)
    
    if missing_vars:
        print("⚠️ متغیرهای محیطی زیر تعریف نشده‌اند:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\n🔧 برای تنظیم:")
        print("   1. فایل .env ایجاد کنید")
        print("   2. یا متغیرهای محیطی را export کنید")
        print("   3. یا از auto_setup.py استفاده کنید")
        return False
    
    return True

def setup_environment():
    """تنظیم متغیرهای محیطی با مقادیر پیش‌فرض"""
    config = load_config()
    
    for key, value in config.items():
        if not os.environ.get(key):
            os.environ[key] = value

if __name__ == "__main__":
    print("🔧 تنظیمات پیش‌فرض ربات طلا")
    print("=" * 40)
    
    config = load_config()
    for key, value in config.items():
        masked_value = value if 'PASSWORD' not in key and 'TOKEN' not in key else '*' * len(value)
        print(f"{key}: {masked_value}")
    
    print("\n✅ تنظیمات بارگذاری شد")