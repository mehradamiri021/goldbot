"""
تنظیمات وب سرویس برای دسترسی از IP خارجی
Web service configuration for external IP access
"""

import os

class WebConfig:
    """تنظیمات وب سرویس"""
    
    # Network settings
    HOST = os.getenv('HOST', '0.0.0.0')  # Accept connections from any IP
    PORT = int(os.getenv('PORT', 5000))
    DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'
    
    # Security settings
    SECRET_KEY = os.getenv('SESSION_SECRET', 'default-secret-key-change-in-production')
    
    # External access configuration
    EXTERNAL_ACCESS = True
    THREADED = True  # Allow multiple simultaneous connections
    
    # CORS settings for external access
    CORS_ORIGINS = ["*"]  # Allow all origins in development
    
    # Application settings
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    
    @staticmethod
    def get_external_url(server_ip: str = None) -> str:
        """Get external URL for the service"""
        if server_ip:
            return f"http://{server_ip}:{WebConfig.PORT}"
        return f"http://YOUR_SERVER_IP:{WebConfig.PORT}"
    
    @staticmethod
    def print_startup_info(server_ip: str = None):
        """Print startup information"""
        print("=" * 50)
        print("🚀 Gold Trading Bot - وب سرویس راه‌اندازی شد")
        print("=" * 50)
        print(f"🌐 Local access:    http://localhost:{WebConfig.PORT}")
        print(f"🌐 Network access:  http://0.0.0.0:{WebConfig.PORT}")
        
        if server_ip:
            print(f"🌐 External access: http://{server_ip}:{WebConfig.PORT}")
        else:
            print(f"🌐 External access: http://YOUR_SERVER_IP:{WebConfig.PORT}")
        
        print(f"📊 Dashboard:       /dashboard")
        print(f"📈 Charts:          /charts")
        print(f"⚙️  Settings:       /settings")
        print(f"🔧 Debug mode:      {'ON' if WebConfig.DEBUG else 'OFF'}")
        print("=" * 50)
        print("💡 برای دسترسی از خارج، IP سرور خود را جایگزین YOUR_SERVER_IP کنید")
        print("=" * 50)

# Static configuration
WEB_CONFIG = WebConfig()