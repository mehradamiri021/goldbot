# 🤖 Smart Gold Trading Bot with Navasan Integration

[![GitHub Stars](https://img.shields.io/github/stars/username/gold-trading-bot?style=social)](https://github.com/username/gold-trading-bot)
[![License](https://img.shields.io/github/license/username/gold-trading-bot)](LICENSE)
[![Python Version](https://img.shields.io/badge/python-3.11-blue.svg)](https://python.org)
[![PostgreSQL](https://img.shields.io/badge/database-PostgreSQL-blue.svg)](https://postgresql.org)

A comprehensive automated gold market analysis platform featuring Smart Money Concepts (SMC) analysis, real-time price monitoring via Navasan API, and advanced admin management systems.

## ✨ Core Features

### 🎯 Smart Gold Trading Bot
- **AI-Powered Analysis**: Advanced Smart Money Concepts implementation
- **Multi-Timeframe Support**: M15, H1, H4, D1 analysis
- **Technical Indicators**: RSI, MACD, Bollinger Bands, Moving Averages
- **Pattern Recognition**: Order blocks, FVG, liquidity zones, BOS, CHOCH

### 💰 Navasan Price Bot
- **Real-Time Pricing**: Currency, gold, and cryptocurrency rates
- **Scheduled Updates**: Automatic updates at 11:11, 14:14, 17:17 Tehran time
- **ZaryaalGold Monitor**: Channel integration for gold bar prices
- **Price Alerts**: Smart alerts for significant price changes (>5%)

### 🎛️ Advanced Admin Panel
- **Manual Triggers**: Instant price updates and system controls
- **Live Monitoring**: Real-time statistics and performance metrics
- **Log Management**: Comprehensive system logging and error tracking
- **Database Tools**: Export capabilities and cleanup utilities

## 🚀 Quick Installation

### Prerequisites
- Ubuntu 20.04+ or similar Linux distribution
- Python 3.11+
- PostgreSQL 14+
- Git

### One-Line Install
```bash
git clone https://github.com/username/gold-trading-bot.git && cd gold-trading-bot && chmod +x install_ubuntu.sh && ./install_ubuntu.sh
```

### Manual Installation
```bash
# Clone repository
git clone https://github.com/username/gold-trading-bot.git
cd gold-trading-bot

# Run installation script
chmod +x install_ubuntu.sh
./install_ubuntu.sh

# Configure environment
cp .env.example .env
nano .env  # Edit with your credentials

# Start the application
./start_server.sh
```

## 🔧 Configuration

### Environment Variables
```bash
# Core Settings
DATABASE_URL=postgresql://user:password@localhost:5432/goldbot
SESSION_SECRET=your-secure-secret-key
TZ=Asia/Tehran

# MT5 Integration
DATA_DIR=/path/to/mt5/csv/files
SYMBOL=XAUUSD
TIMEFRAMES=M1,M5,M15,H1,H4,D1,W1

# Telegram Bot
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHANNEL_ID=your-channel-id
ADMIN_ID=your-admin-id

# APIs
NAVASAN_API_KEY=freeL3ceMoBm2EaeVeuvHJvuGKTJcNcg
OANDA_API_KEY=your-oanda-key  # Optional
```

### Telegram Setup
1. Create a bot via [@BotFather](https://t.me/BotFather)
2. Get your bot token
3. Add bot to your channel as admin
4. Configure channel ID in environment

## 📊 Architecture Overview

### Backend Services
- **Flask Web Framework**: Server-side rendering with REST APIs
- **SQLAlchemy ORM**: Database management with PostgreSQL
- **APScheduler**: Task scheduling with timezone support
- **Telegram Bot API**: Automated notifications and interactions

### Data Sources
- **MT5 CSV Files**: Primary trading data source
- **Navasan API**: Real-time price feeds
- **ZaryaalGold Channel**: Gold bar price monitoring
- **Economic Calendar**: News and events integration

### Analysis Engine
- **Smart Money Concepts**: Institutional trading pattern detection
- **Technical Analysis**: 20+ indicators via TA-Lib/pandas-ta
- **Multi-Timeframe**: Comprehensive market structure analysis
- **Risk Management**: Automated stop-loss and take-profit calculation

## 🌐 Web Interface

### Main Dashboard
- Real-time market overview
- Active signals display
- Performance metrics
- Quick action buttons

### Admin Panel (`/admin/advanced`)
- Manual price updates
- System health monitoring
- Database management
- Log viewing and filtering

### Signal Management (`/signals`)
- Signal approval workflow
- Performance tracking
- Historical analysis
- Export capabilities

## 📱 Telegram Integration

### Automated Features
- **Morning Reports**: 08:00 Tehran time
- **Evening Summaries**: 20:00 Tehran time
- **Price Alerts**: Significant change notifications
- **Signal Notifications**: Real-time trading signals

### Commands
- `/price` - Current market prices
- `/stats` - Bot performance statistics
- `/help` - Command reference
- `/status` - System health check

## 🔄 Scheduled Operations

### Price Updates
```
11:11 AM - Morning price update
14:14 PM - Afternoon price update
17:17 PM - Evening price update
```

### Maintenance Tasks
```
Daily 00:00 - Statistics reset
Weekly Friday 02:00 - Database cleanup
Monthly 1st 03:00 - Full system maintenance
```

## 📈 Performance Monitoring

### Key Metrics
- API success rates
- Signal accuracy
- Response times
- Database performance
- User engagement

### Health Checks
- Service availability
- Database connectivity
- External API status
- Memory usage
- Disk space

## 🛠️ Development

### Local Development
```bash
# Setup development environment
python -m venv venv
source venv/bin/activate
pip install -r install_requirements_no_talib.txt
pip install pandas-ta

# Run development server
export FLASK_ENV=development
python main.py
```

### Testing
```bash
# Run tests
python -m pytest tests/ -v

# Code quality
python -m flake8 . --exclude=venv
python -m black . --exclude=venv
```

### Contributing
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 🐳 Docker Deployment

```dockerfile
# Dockerfile included for containerized deployment
docker build -t goldbot .
docker run -p 5000:5000 --env-file .env goldbot
```

## 📚 Documentation

- [Installation Guide](DEPLOYMENT_GUIDE.md)
- [API Documentation](API_ALTERNATIVES_GUIDE.md)
- [MT5 Integration](MT5_INTEGRATION_GUIDE.md)
- [GitHub Setup](GITHUB_SETUP.md)
- [Patch Notes](PATCH_NOTES.md)

## ⚠️ Important Notes

### Security
- Never commit `.env` files
- Use strong passwords and API keys
- Enable firewall on production servers
- Regular security updates

### Performance
- Monitor database size regularly
- Implement log rotation
- Use caching for frequently accessed data
- Optimize API call frequencies

## 🤝 Support

### Community
- [GitHub Issues](https://github.com/username/gold-trading-bot/issues)
- [Telegram Support Group](https://t.me/goldbot_support)
- [Documentation Wiki](https://github.com/username/gold-trading-bot/wiki)

### Professional Support
- Custom development services
- Deployment assistance
- Training and consultation
- Priority support packages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Navasan API](https://navasan.tech) for price data
- [ZaryaalGold](https://t.me/ZaryaalGold) for gold bar prices
- Smart Money Concepts community
- Open source contributors

## 📊 Statistics

![GitHub Stats](https://github-readme-stats.vercel.app/api?username=username&repo=gold-trading-bot&show_icons=true&theme=radical)

---

**Made with ❤️ for the Persian/Farsi trading community**

> This bot is designed specifically for Persian/Farsi speaking traders and includes RTL support, Persian date formatting, and culturally appropriate terminology.

## 🔗 Quick Links

- [Live Demo](https://goldbot.example.com)
- [API Documentation](https://docs.goldbot.example.com)
- [Support Telegram](https://t.me/goldbot_support)
- [GitHub Repository](https://github.com/username/gold-trading-bot)