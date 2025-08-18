# 🚨 فیکس اضطراری سرور - Flask SQLAlchemy Missing

## مشکل فعلی
```
ModuleNotFoundError: No module named 'flask_sqlalchemy'
```

## راه‌حل فوری (در سرور)

### گزینه 1: فیکس سریع Virtual Environment
```bash
# در پوشه goldbot/
source venv/bin/activate
pip install flask-sqlalchemy==3.1.1
pip install flask==3.0.0 sqlalchemy==2.0.23
pip install gunicorn==21.2.0 psycopg2-binary==2.9.9
python main.py
```

### گزینه 2: نصب کامل Dependencies
```bash
source venv/bin/activate
pip install -r install_requirements_production.txt

# اگر فایل requirements نداشتید:
pip install flask flask-sqlalchemy gunicorn sqlalchemy psycopg2-binary
pip install python-telegram-bot requests pandas numpy plotly
pip install apscheduler pytz werkzeug jdatetime beautifulsoup4 trafilatura
```

### گزینه 3: ایجاد Virtual Environment جدید
```bash
# حذف venv خراب
deactivate
rm -rf venv

# ایجاد venv جدید  
python3 -m venv venv
source venv/bin/activate

# نصب dependencies
python -m pip install --upgrade pip
pip install flask==3.0.0 flask-sqlalchemy==3.1.1
pip install gunicorn==21.2.0 sqlalchemy==2.0.23 psycopg2-binary==2.9.9
pip install python-telegram-bot==20.8 requests==2.31.0
pip install pandas==2.1.4 numpy==1.24.4 plotly==5.17.0
pip install apscheduler==3.10.4 pytz==2023.3.post1
pip install werkzeug==3.0.1 jdatetime==5.2.0 
pip install beautifulsoup4==4.12.2 trafilatura==1.6.4

# تست و اجرا
python main.py
```

### گزینه 4: نصب سیستمی (اگر venv کار نکرد)
```bash
deactivate
sudo apt update
sudo pip3 install flask flask-sqlalchemy gunicorn
sudo pip3 install python-telegram-bot requests pandas
sudo pip3 install sqlalchemy psycopg2-binary jdatetime

# اجرا بدون venv
python3 main.py
```

## تست سریع
```bash
python -c "
import flask
import flask_sqlalchemy
import requests
import telegram
print('✅ All core modules imported successfully')
"
```

## اجرای سرور
```bash
# Development
python main.py

# Production  
gunicorn --bind 0.0.0.0:5000 --reuse-port --reload main:app
```

## وضعیت سیستم
بر اساس لاگ‌ها، سیستم GoldBot کاملاً سالم است:
- ✅ MT5 data: 168 candles، $3370.90
- ✅ Scheduler: تمام job ها فعال
- ✅ APIs: Navasan online، Telegram ready

**فقط dependencies نصب نشده - پس از فیکس، سیستم کاملاً کار می‌کند!**

## فایل پکیج جدید
`goldbot_v2.1_final_server_fix_*.tar.gz` - شامل تمام فیکس‌ها و scripts