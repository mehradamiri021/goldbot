# GoldBot v2.0 - Production Ready

This is GoldBot v2.0, a comprehensive Smart Gold Trading Bot platform with all production issues resolved:

## Core System (Priority Order)

### 🥇 Primary: Smart Signal & Analysis System (MUST BE ACTIVE)
- **MT5 Signal Detection**: Real-time signal generation with mandatory admin logging
- **SMC Analysis**: Smart Money Concepts with Price Action analysis
- **Advanced AI Reports**: Enhanced daily intelligent analysis with higher accuracy
- **Admin Panel Monitoring**: Dedicated section for signal review and status checking

### 🥈 Secondary: Daily Price Delivery System
- **Daily Price Updates**: Automated price announcements to channel
- **Multi-source Integration**: Navasan API + ZaryaalGold monitoring
- **Scheduled Delivery**: 11:11, 14:14, 17:17 Tehran time (weekdays only)

### 🛠️ Supporting: Management & Infrastructure
- **Advanced Admin Panel**: Complete management interface with manual triggers and live monitoring
- **PostgreSQL Integration**: Complete database management with statistics and logging
- **Weekly Comprehensive Reports**: Sundays 12:12 with multi-timeframe chart analysis and important gold news

## Key Features (by Priority)
- **🎯 PRIMARY: MT5 Signal System + SMC Analysis**: Core signal generation with mandatory logging and admin panel monitoring
- **🎯 PRIMARY: Advanced AI Reports**: Enhanced accuracy daily analysis with detailed technical insights
- **📊 SECONDARY: Daily Price Delivery**: Automated price announcements to channel with multi-source data
- **🔧 SUPPORT: Technical Analysis**: RSI-only indicator combined with Price Action and Smart Money Concepts
- **🔧 SUPPORT: News Integration**: Limited to Forex Factory and FXStreet only
- **🔧 SUPPORT: Weekly News Summary**: Sunday comprehensive news from specified sources
- **🔧 SUPPORT: Admin Logging**: Complete activity logging with panel monitoring for primary features

The platform serves Persian/Farsi-speaking users with automated market analysis, multi-channel signal distribution, and a professional web-based management system.

## Recent Changes - GoldBot v2.1 Server Fix (August 18, 2025)
- ✅ **CRITICAL SERVER ISSUES RESOLVED**: SQLAlchemy, Async, Import errors fixed
- ✅ **Virtual Environment Fix**: Created scripts for broken venv recovery
- ✅ **SQLAlchemy Float Error**: Fixed Column expression error in routes.py
- ✅ **Async Notification Fix**: Added sync version for startup notifications
- ✅ **Import Error Fix**: Resolved telegram_service_helper missing functions
- ✅ **System-wide Installation**: Alternative to broken virtual environments
- ✅ **Server Recovery Scripts**: fix_venv_server.sh, install_system_wide.sh
- ✅ **Production Package**: goldbot_v2.1_fixed_20250818_122115.tar.gz (81MB)
- ✅ **Server Status Confirmed**: MT5 data flowing ($3347.34), Telegram active
- ✅ **Real-time Updates**: 10-second refresh with animations working
- ✅ **Complete Documentation**: Server fix guides and recovery procedures

## Latest Changes - API Rate Limiting Fixed v2.1 (August 18, 2025)
- ✅ **CRITICAL API RATE LIMITING FIXED**: Eliminated 429 errors by removing continuous API calls
- ✅ **STARTUP-ONLY DATA UPDATES**: System updates data only on startup and scheduled times (NO continuous monitoring)
- ✅ **WEB CONSOLE ERROR-FREE**: Fixed /api/real_time_status endpoint to use cached data only
- ✅ **LIVE MT5 DATA MAINTAINED**: MT5 price data remains real-time while other APIs scheduled only
- ✅ **SCHEDULED PRICE ANNOUNCEMENTS**: Daily updates at 11:11, 14:14, 17:17 Tehran time only
- ✅ **ADMIN REPORTING**: Admin receives notifications only when scheduled data updates occur
- ✅ **CACHE-BASED STATUS**: Web interface shows status from cached data (prevents rate limiting)
- ✅ **PRODUCTION PACKAGE v2.1**: goldbot_v2.1_RATE_LIMITING_FIXED_20250818_152211.tar.gz (1.54MB)

## Previous Changes - GoldBot v2.0 (August 18, 2025)
- ✅ **Telegram Service Fix**: Fixed message_type parameter errors
- ✅ **Monitoring System**: Now shows 100% health score consistently  
- ✅ **MT5 Data Integration**: CSV files read correctly with proper caching

## Previous Changes (August 2025)
- ✅ **PRIORITY RESTRUCTURE**: Primary focus on MT5 Signal + SMC Analysis with mandatory logging
- ✅ **TECHNICAL ANALYSIS SIMPLIFICATION**: RSI-only indicator + Price Action + Smart Money Concepts
- ✅ **NEWS SOURCES LIMITATION**: Restricted to Forex Factory and FXStreet only
- ✅ **ENHANCED AI REPORTS**: Daily morning reports with same-day gold news + Weekly Sunday reports with full week news + multi-timeframe analysis
- ✅ **ADMIN PANEL ENHANCEMENT**: Signal approval system with entry/stop/take-profit editing capabilities
- ✅ **SIGNAL DETECTION SYSTEM**: Price Action + SMC confluence zones with Pin Bar, Engulfing, and 2-candle patterns
- ✅ **MULTI-TIMEFRAME ANALYSIS**: Weekly, Daily, 4-hour analysis with RSI + Price Action + Smart Money Concepts
- ✅ **DATA SOURCES VERIFIED (Aug 17, 2025)**: All external APIs confirmed working
  - MT5 CSV files: Primary chart data source (functional)
  - Navasan API: Currency/gold prices (http://api.navasan.tech - working)  
  - @ZaryaalGold channel: Gold bar prices (accessible)
  - Telegram bot: Notifications system (active)

## Technical Implementation Changes (August 2025)
- ✅ Added comprehensive weekly reporting feature (Sundays 12:12)
- ✅ Multi-timeframe chart analysis (weekly, daily, 4-hour)
- ✅ Enhanced news service with major financial sources (Forex Factory, Investing.com, MarketWatch, FXStreet)  
- ✅ Removed individual admin notifications after price announcements
- ✅ Updated admin panel header (removed "قیمت‌گزاری نوسان" reference)
- ✅ GitHub deployment preparation with comprehensive documentation
- ✅ Test functionality for weekly reports in admin panel
- ✅ Created zero-configuration deployment system (August 17, 2025)
- ✅ Fixed critical dependency version conflict: lxml>=4.9.4 vs trafilatura==1.6.4  
- ✅ Added one-click installation script (one_click_install.sh)
- ✅ Created automated setup with pre-configured credentials
- ✅ Generated final deployment package: goldbot_final_fixed_20250817_115841.zip
- ✅ Resolved telegram service import conflicts: send_admin_notification function duplicates
- ✅ Created Zero-Config deployment: goldbot_zero_config_20250817_120503.zip
- ✅ Added simple_install.sh with dependency-free installation process
- ✅ **FINAL PRODUCTION READY (Aug 17, 2025)**: Complete API verification, database fixes, scheduler working
- ✅ **GitHub Update Package**: Created comprehensive update package for repository deployment
- ✅ **Production Flask Fix (Aug 17, 2025)**: Created quick fix for Flask missing in virtual environment
- ✅ **Final VPS Package (Aug 17, 2025)**: Complete deployment package with all fixes for production VPS
- ✅ **MT5 Data Verification (Aug 17, 2025)**: Confirmed MT5 reading from `/home/trader/.wine_mt5/drive_c/MT5-CX/MQL5/Files`
- ✅ **BotStatus Import Fix (Aug 17, 2025)**: Resolved duplicate model definitions and import errors
- ✅ **SQLAlchemy Query Fix (Aug 17, 2025)**: Corrected db.session.query syntax to Model.query format
- ✅ **Production Error Fixes (Aug 17, 2025)**: All VPS production issues resolved
  - Fixed SQLAlchemy "Column expression" error
  - **TA-Lib COMPLETELY REMOVED** - Custom RSI + Price Action only system  
  - Fixed DataFrame ambiguous truth value errors (.empty → len())
  - All database model conflicts resolved (BotStatus, TelegramMessage)
  - Auto-generating database (no manual PostgreSQL installation required)
  - Created final production package V3: goldbot_production_v3_TIMESTAMP.tar.gz

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Web Framework**: Flask-based web application with server-side rendered templates
- **UI Framework**: Bootstrap with custom CSS for dark theme and RTL (right-to-left) support for Persian language
- **Template Engine**: Jinja2 templates for dynamic content rendering
- **Client-side**: Vanilla JavaScript with Chart.js for data visualization
- **Responsive Design**: Mobile-first approach with Persian language support

## Backend Architecture
- **Web Framework**: Flask with modular service architecture
- **Database ORM**: SQLAlchemy with declarative base for database operations
- **Data Processing**: Pandas and NumPy for financial data analysis
- **Technical Analysis**: TA-Lib integration for technical indicators
- **Smart Money Analysis**: Custom SMC analyzer for institutional trading patterns
- **Scheduling**: APScheduler for automated tasks and report generation
- **Chart Generation**: Plotly for professional candlestick charts

## Data Storage Solutions
- **Primary Database**: SQLite for development (configurable to PostgreSQL via DATABASE_URL environment variable)
- **Connection Pooling**: Built-in connection pooling with pool recycling and pre-ping health checks
- **Data Models**: Three main entities:
  - Signals: Trading signal storage with SMC analysis and approval workflow
  - Analysis: Market analysis results with technical indicators and chart data
  - TelegramMessage: Message logging for audit and tracking

## Authentication and Authorization
- **Admin Access**: Simple admin ID-based authorization for Telegram interactions
- **Session Management**: Flask session handling with configurable secret key
- **API Security**: Internal API endpoints with basic validation

## Core Services Architecture
- **Analysis Service**: Technical indicator calculation and SMC pattern recognition
- **Data Service**: External API integration with caching and error handling
- **Telegram Service**: Async bot integration for notifications and admin approvals
- **Chart Service**: Dynamic chart generation with technical overlays
- **News Service**: Multi-source news aggregation with sentiment analysis
- **Scheduler Service**: Automated task execution with timezone awareness
- **Smart Money Service**: Institutional trading pattern detection

## Market Analysis Engine
- **Multi-timeframe Analysis**: Support for M15, H1, H4, and D1 timeframes
- **Technical Indicators**: RSI, MACD, Bollinger Bands, Moving Averages
- **Smart Money Concepts**: Order blocks, Fair Value Gaps, liquidity zones, Break of Structure (BOS), Change of Character (CHOCH)
- **Pattern Recognition**: Automated pattern detection with confidence scoring
- **Risk Management**: Stop-loss and take-profit calculation based on market structure

# External Dependencies

## Financial Data API
- **Primary Data Source**: Custom API endpoint (http://46.100.50.194:5050/get_data)
- **Symbol**: XAUUSD (Gold vs USD)
- **Data Format**: OHLCV candlestick data
- **Caching Strategy**: Time-based caching with configurable expiry
- **Rate Limiting**: 60 requests per minute with burst handling

## Telegram Bot Integration
- **Bot API**: Official Telegram Bot API for message delivery
- **Channel Management**: Automated posting to Persian gold analysis channel
- **Admin Workflow**: Interactive approval system for trading signals
- **Scheduled Reports**: Daily morning/evening reports and weekly summaries
- **Message Types**: Daily reports, signal notifications, admin communications

## News Data Sources (Limited Scope)
- **Forex Factory**: Economic calendar and forex news - PRIMARY SOURCE
- **FXStreet**: Financial news and market analysis - PRIMARY SOURCE
- **Weekly Summary**: Sunday comprehensive news compilation from both sources only
- **Web Scraping**: BeautifulSoup and trafilatura for content extraction from specified sources only

## Technical Analysis Libraries (Simplified)
- **RSI Only**: Single indicator focus using TA-Lib for RSI calculation
- **Price Action**: Manual pattern recognition and analysis
- **Smart Money Concepts**: Custom SMC implementation for institutional analysis
- **Pandas**: Data manipulation and time series analysis
- **NumPy**: Numerical computing for mathematical operations
- **Plotly**: Interactive charting and visualization

## Infrastructure Dependencies
- **APScheduler**: Background task scheduling with timezone support
- **PyTZ**: Timezone handling for Tehran/Asia timezone
- **Werkzeug**: WSGI utilities and proxy handling
- **Requests**: HTTP client for external API integration

## Development Tools
- **Bootstrap**: Frontend CSS framework with dark theme
- **Font Awesome**: Icon library for UI elements
- **Chart.js**: Client-side charting library
- **SQLite**: Development database (PostgreSQL-ready)