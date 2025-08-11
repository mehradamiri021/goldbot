from app import db
from datetime import datetime
import json


class Signal(db.Model):
    __tablename__ = 'signals'
    
    id = db.Column(db.Integer, primary_key=True)
    signal_id = db.Column(db.String(50), unique=True, nullable=False)
    symbol = db.Column(db.String(10), default='XAUUSD', nullable=False)
    signal_type = db.Column(db.String(10), nullable=False)  # BUY/SELL
    entry_price = db.Column(db.Float, nullable=False)
    stop_loss = db.Column(db.Float, nullable=False)
    take_profit = db.Column(db.Float, nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    pattern = db.Column(db.String(50))
    timeframe = db.Column(db.String(10), nullable=False)
    status = db.Column(db.String(20), default='PENDING')  # PENDING/APPROVED/REJECTED/EXECUTED
    admin_approved = db.Column(db.Boolean, default=False)
    sent_to_channel = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    approved_at = db.Column(db.DateTime)
    
    def to_dict(self):
        return {
            'signal_id': self.signal_id,
            'symbol': self.symbol,
            'signal_type': self.signal_type,
            'entry_price': self.entry_price,
            'stop_loss': self.stop_loss,
            'take_profit': self.take_profit,
            'confidence': self.confidence,
            'pattern': self.pattern,
            'timeframe': self.timeframe,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Analysis(db.Model):
    __tablename__ = 'analysis'
    
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    timeframe = db.Column(db.String(10), nullable=False)
    price = db.Column(db.Float, nullable=False)
    rsi = db.Column(db.Float)
    ma_20 = db.Column(db.Float)
    ma_50 = db.Column(db.Float)
    support_level = db.Column(db.Float)
    resistance_level = db.Column(db.Float)
    trend = db.Column(db.String(20))
    smc_analysis = db.Column(db.Text)  # JSON string
    news_sentiment = db.Column(db.String(20))
    chart_image = db.Column(db.Text)  # Base64 encoded chart
    sent_to_telegram = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def get_smc_data(self):
        if self.smc_analysis:
            try:
                return json.loads(self.smc_analysis)
            except:
                return {}
        return {}
    
    def set_smc_data(self, data):
        self.smc_analysis = json.dumps(data, ensure_ascii=False)


class TelegramMessage(db.Model):
    __tablename__ = 'telegram_messages'
    
    id = db.Column(db.Integer, primary_key=True)
    message_type = db.Column(db.String(30), nullable=False)  # SIGNAL/REPORT/ADMIN/STATUS
    recipient_type = db.Column(db.String(20), nullable=False)  # CHANNEL/ADMIN
    recipient_id = db.Column(db.String(50), nullable=False)
    message_text = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='PENDING')  # PENDING/SENT/FAILED
    telegram_message_id = db.Column(db.String(50))
    error_message = db.Column(db.Text)
    sent_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'message_type': self.message_type,
            'recipient_type': self.recipient_type,
            'status': self.status,
            'sent_at': self.sent_at.isoformat() if self.sent_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class BotStatus(db.Model):
    __tablename__ = 'bot_status'
    
    id = db.Column(db.Integer, primary_key=True)
    component = db.Column(db.String(50), nullable=False)  # DATA_API/TELEGRAM/SCHEDULER/ANALYSIS
    status = db.Column(db.String(20), nullable=False)  # ONLINE/OFFLINE/ERROR
    last_update = db.Column(db.DateTime, default=datetime.utcnow)
    error_message = db.Column(db.Text)
    additional_info = db.Column(db.Text)  # JSON string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_info(self, info_dict):
        self.additional_info = json.dumps(info_dict, ensure_ascii=False)
    
    def get_info(self):
        if self.additional_info:
            try:
                return json.loads(self.additional_info)
            except:
                return {}
        return {}


class PriceAlert(db.Model):
    __tablename__ = 'price_alerts'
    
    id = db.Column(db.Integer, primary_key=True)
    symbol = db.Column(db.String(10), default='XAUUSD', nullable=False)
    previous_price = db.Column(db.Float)
    current_price = db.Column(db.Float, nullable=False)
    price_change = db.Column(db.Float)
    change_percentage = db.Column(db.Float)
    alert_type = db.Column(db.String(20))  # MAJOR_MOVE/RESISTANCE_BREAK/SUPPORT_BREAK
    timeframe = db.Column(db.String(10), nullable=False)
    logged_at = db.Column(db.DateTime, default=datetime.utcnow)
    admin_notified = db.Column(db.Boolean, default=False)