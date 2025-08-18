import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class SmartMoneyAnalyzer:
    """Smart Money Concepts (SMC) Analysis for Gold Trading"""
    
    def __init__(self):
        self.swing_length = 15  # Length for swing high/low detection
        self.ob_length = 5      # Order block length
    
    def analyze(self, df):
        """Comprehensive SMC analysis"""
        try:
            if len(df) < 50:
                return {}
            
            analysis = {
                'market_structure': self.analyze_market_structure(df),
                'order_blocks': self.find_order_blocks(df),
                'fair_value_gaps': self.find_fair_value_gaps(df),
                'liquidity_zones': self.find_liquidity_zones(df),
                'bos_signal': self.detect_break_of_structure(df),
                'choch_signal': self.detect_change_of_character(df)
            }
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error in SMC analysis: {e}")
            return {}
    
    def analyze_market_structure(self, df):
        """Analyze market structure - Higher Highs, Lower Lows, etc."""
        try:
            swing_highs = self.find_swing_highs(df)
            swing_lows = self.find_swing_lows(df)
            
            if len(swing_highs) < 2 or len(swing_lows) < 2:
                return {'structure': 'UNDEFINED', 'last_high': None, 'last_low': None}
            
            # Get last few swing points
            recent_highs = swing_highs[-3:] if len(swing_highs) >= 3 else swing_highs
            recent_lows = swing_lows[-3:] if len(swing_lows) >= 3 else swing_lows
            
            # Determine structure
            structure = 'UNDEFINED'
            
            if len(recent_highs) >= 2:
                if recent_highs[-1]['price'] > recent_highs[-2]['price']:
                    if len(recent_lows) >= 2 and recent_lows[-1]['price'] > recent_lows[-2]['price']:
                        structure = 'BULLISH'  # Higher Highs, Higher Lows
                elif recent_highs[-1]['price'] < recent_highs[-2]['price']:
                    if len(recent_lows) >= 2 and recent_lows[-1]['price'] < recent_lows[-2]['price']:
                        structure = 'BEARISH'  # Lower Highs, Lower Lows
            
            return {
                'structure': structure,
                'last_high': swing_highs[-1] if swing_highs else None,
                'last_low': swing_lows[-1] if swing_lows else None,
                'swing_highs': recent_highs,
                'swing_lows': recent_lows
            }
            
        except Exception as e:
            logger.error(f"Error analyzing market structure: {e}")
            return {'structure': 'ERROR'}
    
    def find_swing_highs(self, df):
        """Find swing high points"""
        try:
            swing_highs = []
            highs = df['high'].values
            
            for i in range(self.swing_length, len(highs) - self.swing_length):
                if highs[i] == max(highs[i-self.swing_length:i+self.swing_length+1]):
                    swing_highs.append({
                        'index': i,
                        'price': highs[i],
                        'timestamp': df.iloc[i]['timestamp']
                    })
            
            return swing_highs
            
        except Exception as e:
            logger.error(f"Error finding swing highs: {e}")
            return []
    
    def find_swing_lows(self, df):
        """Find swing low points"""
        try:
            swing_lows = []
            lows = df['low'].values
            
            for i in range(self.swing_length, len(lows) - self.swing_length):
                if lows[i] == min(lows[i-self.swing_length:i+self.swing_length+1]):
                    swing_lows.append({
                        'index': i,
                        'price': lows[i],
                        'timestamp': df.iloc[i]['timestamp']
                    })
            
            return swing_lows
            
        except Exception as e:
            logger.error(f"Error finding swing lows: {e}")
            return []
    
    def find_order_blocks(self, df):
        """Find order blocks - strong support/resistance areas"""
        try:
            order_blocks = []
            
            # Find strong bullish candles followed by pullback
            for i in range(10, len(df) - 5):
                candle = df.iloc[i]
                
                # Bullish order block conditions
                if (candle['close'] > candle['open'] and  # Bullish candle
                    (candle['close'] - candle['open']) > (candle['high'] - candle['low']) * 0.6):  # Strong body
                    
                    # Check if price comes back to this level
                    future_lows = df.iloc[i+1:i+20]['low'].min() if i+20 < len(df) else df.iloc[i+1:]['low'].min()
                    
                    if future_lows <= candle['high'] and future_lows >= candle['low']:
                        order_blocks.append({
                            'type': 'bullish',
                            'high': candle['high'],
                            'low': candle['low'],
                            'open': candle['open'],
                            'close': candle['close'],
                            'timestamp': candle['timestamp'],
                            'index': i,
                            'tested': True
                        })
                
                # Bearish order block conditions
                elif (candle['close'] < candle['open'] and  # Bearish candle
                      (candle['open'] - candle['close']) > (candle['high'] - candle['low']) * 0.6):  # Strong body
                    
                    # Check if price comes back to this level
                    future_highs = df.iloc[i+1:i+20]['high'].max() if i+20 < len(df) else df.iloc[i+1:]['high'].max()
                    
                    if future_highs >= candle['low'] and future_highs <= candle['high']:
                        order_blocks.append({
                            'type': 'bearish',
                            'high': candle['high'],
                            'low': candle['low'],
                            'open': candle['open'],
                            'close': candle['close'],
                            'timestamp': candle['timestamp'],
                            'index': i,
                            'tested': True
                        })
            
            # Sort by timestamp and return recent ones
            order_blocks = sorted(order_blocks, key=lambda x: x['index'])[-10:]
            
            return order_blocks
            
        except Exception as e:
            logger.error(f"Error finding order blocks: {e}")
            return []
    
    def find_fair_value_gaps(self, df):
        """Find Fair Value Gaps (FVG) - imbalances in price"""
        try:
            fvgs = []
            
            for i in range(2, len(df)):
                candle1 = df.iloc[i-2]  # Two candles ago
                candle2 = df.iloc[i-1]  # Previous candle
                candle3 = df.iloc[i]    # Current candle
                
                # Bullish FVG: Gap between candle1 high and candle3 low
                if (candle1['high'] < candle3['low'] and
                    candle2['close'] > candle2['open']):  # Middle candle is bullish
                    
                    fvgs.append({
                        'type': 'bullish',
                        'top': candle3['low'],
                        'bottom': candle1['high'],
                        'timestamp': candle3['timestamp'],
                        'index': i,
                        'filled': False
                    })
                
                # Bearish FVG: Gap between candle1 low and candle3 high
                elif (candle1['low'] > candle3['high'] and
                      candle2['close'] < candle2['open']):  # Middle candle is bearish
                    
                    fvgs.append({
                        'type': 'bearish',
                        'top': candle1['low'],
                        'bottom': candle3['high'],
                        'timestamp': candle3['timestamp'],
                        'index': i,
                        'filled': False
                    })
            
            # Check if FVGs have been filled
            current_price = df.iloc[-1]['close']
            for fvg in fvgs:
                if fvg['bottom'] <= current_price <= fvg['top']:
                    fvg['filled'] = True
            
            # Return recent unfilled FVGs
            unfilled_fvgs = [fvg for fvg in fvgs if not fvg['filled']][-5:]
            
            return unfilled_fvgs
            
        except Exception as e:
            logger.error(f"Error finding FVGs: {e}")
            return []
    
    def find_liquidity_zones(self, df):
        """Find liquidity zones - areas where stop losses likely cluster"""
        try:
            liquidity_zones = []
            
            swing_highs = self.find_swing_highs(df)
            swing_lows = self.find_swing_lows(df)
            
            # Recent swing highs (potential sell-side liquidity)
            for high in swing_highs[-5:]:
                liquidity_zones.append({
                    'type': 'sell_side',
                    'price': high['price'],
                    'timestamp': high['timestamp'],
                    'strength': self.calculate_liquidity_strength(df, high['price'], 'high')
                })
            
            # Recent swing lows (potential buy-side liquidity)
            for low in swing_lows[-5:]:
                liquidity_zones.append({
                    'type': 'buy_side',
                    'price': low['price'],
                    'timestamp': low['timestamp'],
                    'strength': self.calculate_liquidity_strength(df, low['price'], 'low')
                })
            
            return liquidity_zones
            
        except Exception as e:
            logger.error(f"Error finding liquidity zones: {e}")
            return []
    
    def calculate_liquidity_strength(self, df, price, level_type):
        """Calculate the strength of a liquidity level"""
        try:
            touches = 0
            tolerance = price * 0.001  # 0.1% tolerance
            
            if level_type == 'high':
                for _, candle in df.iterrows():
                    if abs(candle['high'] - price) <= tolerance:
                        touches += 1
            else:
                for _, candle in df.iterrows():
                    if abs(candle['low'] - price) <= tolerance:
                        touches += 1
            
            return min(touches, 10)  # Cap at 10
            
        except Exception as e:
            logger.error(f"Error calculating liquidity strength: {e}")
            return 1
    
    def detect_break_of_structure(self, df):
        """Detect Break of Structure (BOS)"""
        try:
            structure = self.analyze_market_structure(df)
            current_price = df.iloc[-1]['close']
            
            if structure['structure'] == 'ERROR' or not structure['last_high'] or not structure['last_low']:
                return None
            
            last_high = structure['last_high']['price']
            last_low = structure['last_low']['price']
            
            # Bullish BOS - price breaks above previous high
            if current_price > last_high * 1.001:  # 0.1% buffer
                return {
                    'direction': 'BUY',
                    'type': 'Bullish BOS',
                    'broken_level': last_high,
                    'current_price': current_price,
                    'stop_loss': last_low * 0.999,
                    'take_profit': current_price + (current_price - last_low) * 1.5
                }
            
            # Bearish BOS - price breaks below previous low
            elif current_price < last_low * 0.999:  # 0.1% buffer
                return {
                    'direction': 'SELL',
                    'type': 'Bearish BOS',
                    'broken_level': last_low,
                    'current_price': current_price,
                    'stop_loss': last_high * 1.001,
                    'take_profit': current_price - (last_high - current_price) * 1.5
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Error detecting BOS: {e}")
            return None
    
    def detect_change_of_character(self, df):
        """Detect Change of Character (CHoCH)"""
        try:
            structure = self.analyze_market_structure(df)
            
            if len(structure.get('swing_highs', [])) < 2 or len(structure.get('swing_lows', [])) < 2:
                return None
            
            current_price = df.iloc[-1]['close']
            
            # Look for internal structure breaks
            recent_highs = structure['swing_highs'][-2:]
            recent_lows = structure['swing_lows'][-2:]
            
            # CHoCH from bearish to bullish
            if (len(recent_lows) >= 2 and recent_lows[-1]['price'] > recent_lows[-2]['price'] and
                current_price > recent_highs[-1]['price']):
                
                return {
                    'type': 'Bearish to Bullish CHoCH',
                    'direction': 'BUY',
                    'confirmation_level': recent_highs[-1]['price']
                }
            
            # CHoCH from bullish to bearish
            elif (len(recent_highs) >= 2 and recent_highs[-1]['price'] < recent_highs[-2]['price'] and
                  current_price < recent_lows[-1]['price']):
                
                return {
                    'type': 'Bullish to Bearish CHoCH',
                    'direction': 'SELL',
                    'confirmation_level': recent_lows[-1]['price']
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Error detecting CHoCH: {e}")
            return None
