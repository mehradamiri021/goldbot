import logging
import socket
import json
from datetime import datetime
from typing import Dict, List, Optional
import time
import threading
from services.bot_monitoring_service import monitoring_service
from utils.helpers import get_tehran_time

logger = logging.getLogger(__name__)

class MetaTraderService:
    """Service for connecting to MetaTrader via socket communication"""
    
    def __init__(self):
        self.socket_host = "127.0.0.1"
        self.socket_port = 9090
        self.connection = None
        self.is_connected = False
        self.data_buffer = []
        self.last_price = None
        self.connection_thread = None
        self.running = False
        
    def start_connection(self):
        """Start MetaTrader connection in background thread"""
        try:
            if not self.running:
                self.running = True
                self.connection_thread = threading.Thread(target=self._connection_loop, daemon=True)
                self.connection_thread.start()
                logger.info("MetaTrader connection service started")
                monitoring_service.update_component_status('METATRADER', 'ONLINE')
        except Exception as e:
            logger.error(f"Error starting MetaTrader connection: {e}")
            monitoring_service.update_component_status('METATRADER', 'ERROR', str(e))
    
    def stop_connection(self):
        """Stop MetaTrader connection"""
        try:
            self.running = False
            if self.connection:
                self.connection.close()
            self.is_connected = False
            logger.info("MetaTrader connection stopped")
            monitoring_service.update_component_status('METATRADER', 'OFFLINE')
        except Exception as e:
            logger.error(f"Error stopping MetaTrader connection: {e}")
    
    def _connection_loop(self):
        """Main connection loop running in background"""
        while self.running:
            try:
                if not self.is_connected:
                    self._attempt_connection()
                
                if self.is_connected:
                    self._receive_data()
                
                time.sleep(1)  # Prevent high CPU usage
                
            except Exception as e:
                logger.error(f"Error in MetaTrader connection loop: {e}")
                self.is_connected = False
                monitoring_service.update_component_status('METATRADER', 'ERROR', str(e))
                time.sleep(5)  # Wait before retry
    
    def _attempt_connection(self):
        """Attempt to connect to MetaTrader"""
        try:
            self.connection = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.connection.settimeout(10)
            self.connection.connect((self.socket_host, self.socket_port))
            self.is_connected = True
            logger.info(f"Connected to MetaTrader at {self.socket_host}:{self.socket_port}")
            monitoring_service.update_component_status('METATRADER', 'ONLINE')
            
            # Send initial handshake
            self._send_command('HANDSHAKE', {'version': '1.0', 'client': 'GoldBot'})
            
        except Exception as e:
            logger.warning(f"Failed to connect to MetaTrader: {e}")
            self.is_connected = False
            monitoring_service.update_component_status('METATRADER', 'ERROR', str(e))
            if self.connection:
                self.connection.close()
    
    def _receive_data(self):
        """Receive data from MetaTrader"""
        try:
            if self.connection:
                self.connection.settimeout(1)
                data = self.connection.recv(1024)
                
                if data:
                    message = data.decode('utf-8').strip()
                    if message:
                        self._process_message(message)
                else:
                    # Connection lost
                    self.is_connected = False
                    self.connection.close()
                    
        except socket.timeout:
            # Normal timeout, continue loop
            pass
        except Exception as e:
            logger.error(f"Error receiving data from MetaTrader: {e}")
            self.is_connected = False
            if self.connection:
                self.connection.close()
    
    def _process_message(self, message: str):
        """Process incoming message from MetaTrader"""
        try:
            data = json.loads(message)
            msg_type = data.get('type', '')
            
            if msg_type == 'TICK':
                self._handle_tick_data(data.get('data', {}))
            elif msg_type == 'CANDLE':
                self._handle_candle_data(data.get('data', {}))
            elif msg_type == 'ACCOUNT':
                self._handle_account_data(data.get('data', {}))
            elif msg_type == 'ERROR':
                logger.error(f"MetaTrader error: {data.get('message', 'Unknown error')}")
                
        except json.JSONDecodeError:
            logger.warning(f"Invalid JSON received from MetaTrader: {message}")
        except Exception as e:
            logger.error(f"Error processing MetaTrader message: {e}")
    
    def _handle_tick_data(self, tick_data: Dict):
        """Handle real-time tick data from MetaTrader"""
        try:
            symbol = tick_data.get('symbol', 'XAUUSD')
            bid = tick_data.get('bid', 0)
            ask = tick_data.get('ask', 0)
            time_str = tick_data.get('time', '')
            
            if symbol == 'XAUUSD' and bid > 0:
                current_price = (bid + ask) / 2
                
                # Log price change if we have previous price
                if self.last_price:
                    monitoring_service.log_price_change(
                        symbol=symbol,
                        timeframe='TICK',
                        previous_price=self.last_price,
                        current_price=current_price
                    )
                
                self.last_price = current_price
                logger.debug(f"XAUUSD tick: {current_price}")
                
        except Exception as e:
            logger.error(f"Error handling tick data: {e}")
    
    def _handle_candle_data(self, candle_data: Dict):
        """Handle candle data from MetaTrader"""
        try:
            symbol = candle_data.get('symbol', 'XAUUSD')
            timeframe = candle_data.get('timeframe', 'M15')
            open_price = candle_data.get('open', 0)
            high_price = candle_data.get('high', 0)
            low_price = candle_data.get('low', 0)
            close_price = candle_data.get('close', 0)
            time_str = candle_data.get('time', '')
            
            if symbol == 'XAUUSD' and close_price > 0:
                # Store candle data for analysis
                candle_info = {
                    'symbol': symbol,
                    'timeframe': timeframe,
                    'open': open_price,
                    'high': high_price,
                    'low': low_price,
                    'close': close_price,
                    'timestamp': time_str
                }
                
                self.data_buffer.append(candle_info)
                
                # Keep only recent data
                if len(self.data_buffer) > 200:
                    self.data_buffer = self.data_buffer[-200:]
                
                logger.debug(f"XAUUSD candle {timeframe}: OHLC({open_price}, {high_price}, {low_price}, {close_price})")
                
        except Exception as e:
            logger.error(f"Error handling candle data: {e}")
    
    def _handle_account_data(self, account_data: Dict):
        """Handle account information from MetaTrader"""
        try:
            balance = account_data.get('balance', 0)
            equity = account_data.get('equity', 0)
            margin = account_data.get('margin', 0)
            free_margin = account_data.get('free_margin', 0)
            
            logger.info(f"MT5 Account - Balance: {balance}, Equity: {equity}")
            
            # Update monitoring service with account info
            monitoring_service.update_component_status(
                'METATRADER', 
                'ONLINE',
                additional_info={
                    'balance': balance,
                    'equity': equity,
                    'margin': margin,
                    'free_margin': free_margin,
                    'last_update': get_tehran_time().isoformat()
                }
            )
            
        except Exception as e:
            logger.error(f"Error handling account data: {e}")
    
    def _send_command(self, command: str, data: Dict = None):
        """Send command to MetaTrader"""
        try:
            if self.is_connected and self.connection:
                message = {
                    'command': command,
                    'timestamp': get_tehran_time().isoformat(),
                    'data': data or {}
                }
                
                json_message = json.dumps(message) + '\n'
                self.connection.send(json_message.encode('utf-8'))
                logger.debug(f"Sent command to MT5: {command}")
                
        except Exception as e:
            logger.error(f"Error sending command to MetaTrader: {e}")
            self.is_connected = False
    
    def get_current_data(self, symbol: str = 'XAUUSD', timeframe: str = 'M15', limit: int = 100) -> List[Dict]:
        """Get current market data from buffer"""
        try:
            if not self.data_buffer:
                return []
            
            # Filter by symbol and timeframe
            filtered_data = [
                candle for candle in self.data_buffer
                if candle.get('symbol') == symbol and candle.get('timeframe') == timeframe
            ]
            
            # Return latest data
            return filtered_data[-limit:] if filtered_data else []
            
        except Exception as e:
            logger.error(f"Error getting current data: {e}")
            return []
    
    def place_order(self, symbol: str, order_type: str, volume: float, price: float, sl: float = 0, tp: float = 0, comment: str = "GoldBot"):
        """Place order in MetaTrader"""
        try:
            order_data = {
                'symbol': symbol,
                'type': order_type,  # BUY, SELL
                'volume': volume,
                'price': price,
                'sl': sl,
                'tp': tp,
                'comment': comment
            }
            
            self._send_command('PLACE_ORDER', order_data)
            logger.info(f"Order placement requested: {order_type} {volume} {symbol} @ {price}")
            
        except Exception as e:
            logger.error(f"Error placing order: {e}")
    
    def get_connection_status(self) -> Dict:
        """Get current connection status"""
        return {
            'connected': self.is_connected,
            'host': self.socket_host,
            'port': self.socket_port,
            'last_price': self.last_price,
            'buffer_size': len(self.data_buffer),
            'running': self.running
        }

# Global MetaTrader service instance
mt_service = MetaTraderService()

def get_mt_service():
    """Get MetaTrader service instance"""
    return mt_service