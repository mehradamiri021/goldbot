"""
OANDA API Setup and Configuration
راه‌اندازی و پیکربندی OANDA API

Easy 3-Step Setup:
1. Get OANDA API key from: https://oanda.com
2. Set the API key using setup_oanda_api() function
3. Enjoy real-time gold data!
"""

import os
import logging
from services.oanda_data_service import initialize_oanda_service

logger = logging.getLogger(__name__)

def setup_oanda_api(api_key, account_type='practice'):
    """
    Setup OANDA API for real-time gold data
    
    Args:
        api_key (str): Your OANDA API key
        account_type (str): 'practice' or 'live'
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Initialize OANDA service
        oanda_service = initialize_oanda_service(api_key, account_type)
        
        # Test connection
        if oanda_service.test_connection():
            logger.info("✅ OANDA API configured successfully!")
            
            # Test data fetch
            test_data = oanda_service.get_gold_data('H1', 10)
            if test_data is not None and len(test_data) > 0:
                logger.info(f"✅ Successfully fetched {len(test_data)} candles")
                logger.info(f"📊 Latest gold price: ${test_data.iloc[-1]['close']:.2f}")
                return True
            else:
                logger.error("❌ No data received from OANDA")
                return False
        else:
            logger.error("❌ OANDA API connection failed")
            return False
            
    except Exception as e:
        logger.error(f"❌ Error setting up OANDA API: {e}")
        return False

def get_oanda_setup_instructions():
    """Get step-by-step setup instructions"""
    return """
🏦 OANDA API Setup Instructions:

Step 1: Create Account
• Go to: https://oanda.com
• Click "Create Account"
• Choose "Demo Account" (free)
• Complete registration

Step 2: Get API Key
• Login to your OANDA account
• Go to "API Access" or "Manage API Access"
• Click "Generate Personal Access Token"
• Copy your API key (looks like: a1b2c3d4e5f6...)

Step 3: Configure in Bot
• Use the setup_oanda_api() function
• Or set OANDA_API_KEY environment variable

Example API Key Format:
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0

Benefits:
✅ Real-time XAUUSD data
✅ High-quality historical data  
✅ Professional trading data
✅ Reliable and fast
✅ FREE demo account

Ready to get live gold data!
"""

# Environment variable setup
def setup_from_environment():
    """Setup OANDA from environment variables"""
    api_key = os.getenv('OANDA_API_KEY')
    account_type = os.getenv('OANDA_ACCOUNT_TYPE', 'practice')
    
    if api_key:
        return setup_oanda_api(api_key, account_type)
    else:
        logger.info("⚠️ OANDA_API_KEY not found in environment")
        return False

# Auto-setup on import (if env vars are available)
if __name__ != "__main__":
    setup_from_environment()