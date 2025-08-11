# Overview

This is a Smart Gold Trading Bot application that provides comprehensive analysis and signal generation for gold (XAUUSD) trading using artificial intelligence and Smart Money Concepts (SMC). The bot is designed specifically for Persian/Farsi-speaking users, featuring automated market analysis, signal generation with admin approval workflow, scheduled reporting via Telegram, and a web-based dashboard for monitoring and management.

The application combines technical analysis with Smart Money Concepts to identify high-probability trading opportunities in the gold market, delivering insights through both a web interface and automated Telegram notifications.

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

## News Data Sources
- **Forex Factory**: Economic calendar and forex news
- **FXStreet**: Financial news and market analysis
- **Investing.com**: Commodities news and market updates
- **MarketWatch**: Gold futures and market sentiment
- **Web Scraping**: BeautifulSoup and trafilatura for content extraction

## Technical Analysis Libraries
- **TA-Lib**: Comprehensive technical analysis indicators library
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