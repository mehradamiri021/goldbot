#!/usr/bin/env python3
"""
GoldBot v2.1 - Fixed Rate Limiting Package Creator
August 18, 2025

Creates final deployment package with:
- Fixed API rate limiting issues
- Startup-only data updates 
- Scheduled price announcements (11:11, 14:14, 17:17)
- Live MT5 data always available
- No continuous monitoring (preventing API abuse)
"""

import os
import shutil
import tarfile
from datetime import datetime

def create_final_package():
    """Create final GoldBot v2.1 package"""
    
    print("🚀 Creating GoldBot v2.1 - API Rate Limiting Fixed Package...")
    
    # Package info
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    package_name = f"goldbot_v2.1_RATE_LIMITING_FIXED_{timestamp}.tar.gz"
    
    # Files to include
    files_to_include = [
        # Core files
        'main.py',
        'app.py', 
        'models.py',
        'routes.py',
        'routes_admin.py',
        
        # Services
        'services/',
        
        # Templates and static
        'templates/',
        'static/',
        
        # Configuration
        'pyproject.toml',
        'uv.lock',
        '.env.example',
        '.replit',
        
        # Documentation
        'replit.md',
        'README.md',
        'INSTALLATION_INSTRUCTIONS.md',
        'QUICK_SETUP.md',
        'MT5_INTEGRATION_GUIDE.md',
        'DEPLOYMENT_GUIDE.md',
        
        # Scripts
        'start_server.sh',
        'install_requirements.txt',
        'one_click_install.sh',
        'quick_install.sh',
        
        # Data directories
        'data/',
        'metatrader/',
        'config/',
        'utils/',
        'scripts/',
        'instance/',
    ]
    
    # Create package
    print(f"📦 Creating package: {package_name}")
    
    with tarfile.open(package_name, 'w:gz') as tar:
        for item in files_to_include:
            if os.path.exists(item):
                tar.add(item, arcname=item)
                print(f"✅ Added: {item}")
            else:
                print(f"⚠️  Skipped (not found): {item}")
    
    # Get file size
    size_mb = os.path.getsize(package_name) / (1024 * 1024)
    
    print(f"""
🎉 Package Created Successfully!

📦 Package: {package_name}
📏 Size: {size_mb:.2f} MB
📅 Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

🔧 Key Fixes in v2.1:
✅ Fixed API rate limiting issues (429 errors)
✅ Removed continuous monitoring 
✅ Startup-only data updates
✅ Scheduled price announcements (3x daily)
✅ Live MT5 data maintained
✅ Web console error-free operation

🚀 Deployment Instructions:
1. Extract: tar -xzf {package_name}
2. Install: ./one_click_install.sh
3. Configure: Edit .env with your API keys
4. Start: ./start_server.sh

📊 System Features:
• MT5 Signal Detection (Primary)
• Smart Money Concepts Analysis  
• Daily AI Reports (09:09, 15:15)
• Price Updates (11:11, 14:14, 17:17)
• Admin Panel Management
• PostgreSQL Integration
• Zero-config deployment

🔗 Repository: Ready for production deployment
""")

if __name__ == "__main__":
    create_final_package()