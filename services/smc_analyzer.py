"""
Smart Money Concepts (SMC) Analysis for Gold Trading
تحلیل مفاهیم پول هوشمند برای معامله طلا

Focus: Order Blocks, Fair Value Gaps, Liquidity Zones, BOS, CHOCH
تمرکز: بلوک های سفارش، شکاف ارزش منصفانه، مناطق نقدینگی، شکست ساختار، تغییر کاراکتر
"""

import pandas as pd
import numpy as np
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

class SmartMoneyAnalyzer:
    def __init__(self):
        self.min_order_block_size = 10  # حداقل اندازه بلوک سفارش (پیپ)
        self.fvg_min_size = 5  # حداقل اندازه FVG (پیپ)
        self.liquidity_threshold = 0.002  # آستانه نقدینگی (0.2%)
        self.bos_confirmation_candles = 3  # تعداد کندل تایید BOS
        
    def analyze_smc_structure(self, df: pd.DataFrame, timeframe: str = "H4") -> Dict:
        """تحلیل ساختار Smart Money Concepts"""
        try:
            if len(df) < 50:
                return {"error": "داده کافی برای تحلیل SMC وجود ندارد"}
            
            # کپی داده برای تحلیل
            analysis_df = df.copy()
            analysis_df.reset_index(drop=True, inplace=True)
            
            # شناسایی کامپوننت‌های SMC
            order_blocks = self._identify_order_blocks(analysis_df)
            fair_value_gaps = self._identify_fair_value_gaps(analysis_df)  
            liquidity_zones = self._identify_liquidity_zones(analysis_df)
            market_structure = self._analyze_market_structure(analysis_df)
            confluence_zones = self._find_confluence_zones(
                order_blocks, fair_value_gaps, liquidity_zones, analysis_df
            )
            
            # تحلیل جهت کلی بازار
            market_bias = self._determine_market_bias(analysis_df, market_structure)
            
            return {
                "timeframe": timeframe,
                "analysis_time": datetime.now(),
                "market_bias": market_bias,
                "market_structure": market_structure,
                "order_blocks": order_blocks,
                "fair_value_gaps": fair_value_gaps,
                "liquidity_zones": liquidity_zones,
                "confluence_zones": confluence_zones,
                "total_zones": len(order_blocks) + len(fair_value_gaps) + len(liquidity_zones),
                "high_probability_zones": len([z for z in confluence_zones if z['strength'] >= 0.7])
            }
            
        except Exception as e:
            logger.error(f"خطا در تحلیل SMC: {e}")
            return {"error": str(e)}
    
    def _identify_order_blocks(self, df: pd.DataFrame) -> List[Dict]:
        """شناسایی بلوک‌های سفارش (Order Blocks)"""
        order_blocks = []
        
        try:
            # تحلیل 30 کندل اخیر
            recent_df = df.tail(30).copy()
            
            for i in range(2, len(recent_df) - 1):
                current = recent_df.iloc[i]
                prev = recent_df.iloc[i-1]
                next_candle = recent_df.iloc[i+1]
                
                # Bullish Order Block
                # شرط: کندل صعودی قوی + برگشت از سطح پایین
                if (current['close'] > current['open'] and  # کندل سبز
                    (current['close'] - current['open']) / current['open'] >= 0.001 and  # حرکت قوی
                    next_candle['low'] > current['low']):  # پایین بعدی بالاتر
                    
                    order_blocks.append({
                        "type": "Bullish Order Block",
                        "direction": "Bullish",
                        "high": current['high'],
                        "low": current['low'],
                        "open": current['open'],
                        "close": current['close'],
                        "candle_index": i,
                        "strength": self._calculate_order_block_strength(current, prev, next_candle),
                        "description": f"بلوک سفارش صعودی در سطح {current['low']:.2f}",
                        "created_at": datetime.now()
                    })
                
                # Bearish Order Block  
                # شرط: کندل نزولی قوی + برگشت از سطح بالا
                elif (current['close'] < current['open'] and  # کندل قرمز
                      (current['open'] - current['close']) / current['open'] >= 0.001 and  # حرکت قوی  
                      next_candle['high'] < current['high']):  # بالای بعدی پایین‌تر
                    
                    order_blocks.append({
                        "type": "Bearish Order Block",
                        "direction": "Bearish", 
                        "high": current['high'],
                        "low": current['low'],
                        "open": current['open'],
                        "close": current['close'],
                        "candle_index": i,
                        "strength": self._calculate_order_block_strength(current, prev, next_candle),
                        "description": f"بلوک سفارش نزولی در سطح {current['high']:.2f}",
                        "created_at": datetime.now()
                    })
            
            # مرتب‌سازی بر اساس قدرت
            order_blocks.sort(key=lambda x: x['strength'], reverse=True)
            return order_blocks[:5]  # 5 بلوک قوی‌تر
            
        except Exception as e:
            logger.error(f"خطا در شناسایی Order Blocks: {e}")
            return []
    
    def _identify_fair_value_gaps(self, df: pd.DataFrame) -> List[Dict]:
        """شناسایی شکاف‌های ارزش منصفانه (Fair Value Gaps)"""
        fvgs = []
        
        try:
            # تحلیل 25 کندل اخیر  
            recent_df = df.tail(25).copy()
            
            for i in range(1, len(recent_df) - 1):
                candle1 = recent_df.iloc[i-1]  # کندل اول
                candle2 = recent_df.iloc[i]    # کندل میانی  
                candle3 = recent_df.iloc[i+1]  # کندل سوم
                
                # Bullish FVG
                # شرط: شکاف بین low کندل سوم و high کندل اول
                if candle3['low'] > candle1['high']:
                    gap_size = candle3['low'] - candle1['high']
                    gap_percentage = gap_size / candle2['close']
                    
                    if gap_percentage >= (self.fvg_min_size / 100000):  # حداقل 5 پیپ
                        fvgs.append({
                            "type": "Bullish FVG",
                            "direction": "Bullish",
                            "top": candle3['low'],
                            "bottom": candle1['high'],
                            "gap_size": gap_size,
                            "gap_percentage": gap_percentage * 100,
                            "candle_index": i,
                            "strength": min(0.9, 0.4 + gap_percentage * 100),
                            "description": f"شکاف صعودی {gap_size:.1f} پیپ",
                            "created_at": datetime.now()
                        })
                
                # Bearish FVG
                # شرط: شکاف بین high کندل سوم و low کندل اول
                elif candle3['high'] < candle1['low']:
                    gap_size = candle1['low'] - candle3['high'] 
                    gap_percentage = gap_size / candle2['close']
                    
                    if gap_percentage >= (self.fvg_min_size / 100000):  # حداقل 5 پیپ
                        fvgs.append({
                            "type": "Bearish FVG",
                            "direction": "Bearish",
                            "top": candle1['low'],
                            "bottom": candle3['high'],
                            "gap_size": gap_size,
                            "gap_percentage": gap_percentage * 100,
                            "candle_index": i,
                            "strength": min(0.9, 0.4 + gap_percentage * 100),
                            "description": f"شکاف نزولی {gap_size:.1f} پیپ",
                            "created_at": datetime.now()
                        })
            
            # مرتب‌سازی بر اساس اندازه شکاف
            fvgs.sort(key=lambda x: x['gap_size'], reverse=True)
            return fvgs[:3]  # 3 شکاف بزرگ‌تر
            
        except Exception as e:
            logger.error(f"خطا در شناسایی FVG: {e}")
            return []
    
    def _identify_liquidity_zones(self, df: pd.DataFrame) -> List[Dict]:
        """شناسایی مناطق نقدینگی"""
        liquidity_zones = []
        
        try:
            # تحلیل 40 کندل اخیر
            recent_df = df.tail(40).copy()
            
            # پیدا کردن قله‌ها و دره‌ها
            highs = []
            lows = []
            
            for i in range(2, len(recent_df) - 2):
                current = recent_df.iloc[i]
                
                # قله محلی (Local High)
                if (current['high'] > recent_df.iloc[i-1]['high'] and 
                    current['high'] > recent_df.iloc[i+1]['high'] and
                    current['high'] > recent_df.iloc[i-2]['high'] and
                    current['high'] > recent_df.iloc[i+2]['high']):
                    
                    highs.append({
                        "price": current['high'],
                        "index": i,
                        "volume_estimate": self._estimate_volume(current, recent_df[i-2:i+3])
                    })
                
                # دره محلی (Local Low)
                if (current['low'] < recent_df.iloc[i-1]['low'] and
                    current['low'] < recent_df.iloc[i+1]['low'] and  
                    current['low'] < recent_df.iloc[i-2]['low'] and
                    current['low'] < recent_df.iloc[i+2]['low']):
                    
                    lows.append({
                        "price": current['low'],
                        "index": i,
                        "volume_estimate": self._estimate_volume(current, recent_df[i-2:i+3])
                    })
            
            # تبدیل به مناطق نقدینگی
            for high in highs[-3:]:  # 3 قله اخیر
                liquidity_zones.append({
                    "type": "Sell Side Liquidity",
                    "direction": "Bearish",
                    "price": high['price'],
                    "zone_top": high['price'] * 1.0002,
                    "zone_bottom": high['price'] * 0.9998,
                    "strength": min(0.8, 0.4 + high['volume_estimate']),
                    "description": f"نقدینگی فروش در {high['price']:.2f}",
                    "created_at": datetime.now()
                })
            
            for low in lows[-3:]:  # 3 دره اخیر
                liquidity_zones.append({
                    "type": "Buy Side Liquidity", 
                    "direction": "Bullish",
                    "price": low['price'],
                    "zone_top": low['price'] * 1.0002,
                    "zone_bottom": low['price'] * 0.9998,
                    "strength": min(0.8, 0.4 + low['volume_estimate']),
                    "description": f"نقدینگی خرید در {low['price']:.2f}",
                    "created_at": datetime.now()
                })
            
            return liquidity_zones
            
        except Exception as e:
            logger.error(f"خطا در شناسایی Liquidity Zones: {e}")
            return []
    
    def _analyze_market_structure(self, df: pd.DataFrame) -> Dict:
        """تحلیل ساختار بازار (BOS/CHOCH)"""
        try:
            recent_df = df.tail(20).copy()
            
            # پیدا کردن Higher Highs/Lower Lows
            structure_points = []
            for i in range(2, len(recent_df)):
                current = recent_df.iloc[i]
                prev = recent_df.iloc[i-1]
                
                if current['high'] > prev['high']:
                    structure_points.append({
                        "type": "Higher High",
                        "price": current['high'], 
                        "index": i
                    })
                elif current['low'] < prev['low']:
                    structure_points.append({
                        "type": "Lower Low",
                        "price": current['low'],
                        "index": i  
                    })
            
            # تشخیص BOS/CHOCH
            bos_signals = []
            choch_signals = []
            
            if len(structure_points) >= 2:
                last_structure = structure_points[-1]
                prev_structure = structure_points[-2]
                
                # Break of Structure
                if (last_structure['type'] == "Higher High" and 
                    prev_structure['type'] == "Lower Low"):
                    bos_signals.append({
                        "type": "Bullish BOS",
                        "description": "شکست ساختار صعودی",
                        "confidence": 0.7
                    })
                elif (last_structure['type'] == "Lower Low" and 
                      prev_structure['type'] == "Higher High"):
                    bos_signals.append({
                        "type": "Bearish BOS", 
                        "description": "شکست ساختار نزولی",
                        "confidence": 0.7
                    })
            
            return {
                "structure_points": structure_points[-5:],  # 5 نقطه اخیر
                "bos_signals": bos_signals,
                "choch_signals": choch_signals,
                "current_trend": self._determine_current_trend(structure_points)
            }
            
        except Exception as e:
            logger.error(f"خطا در تحلیل ساختار بازار: {e}")
            return {}
    
    def _find_confluence_zones(self, order_blocks: List, fvgs: List, 
                              liquidity_zones: List, df: pd.DataFrame) -> List[Dict]:
        """پیدا کردن مناطق همپوشانی (Confluence Zones)"""
        confluence_zones = []
        
        try:
            current_price = df.iloc[-1]['close']
            
            # همپوشانی Order Block + FVG
            for ob in order_blocks:
                for fvg in fvgs:
                    if self._zones_overlap(ob, fvg):
                        confluence_zones.append({
                            "type": "Order Block + FVG",
                            "components": [ob['type'], fvg['type']],
                            "direction": self._get_confluence_direction(ob, fvg),
                            "strength": (ob['strength'] + fvg['strength']) / 2,
                            "price_range": self._get_overlap_range(ob, fvg),
                            "distance_from_price": abs(current_price - self._get_zone_midpoint(ob)),
                            "description": f"همپوشانی {ob['type']} و {fvg['type']}",
                            "created_at": datetime.now()
                        })
            
            # همپوشانی Order Block + Liquidity
            for ob in order_blocks:
                for lz in liquidity_zones:
                    if self._zones_overlap(ob, lz):
                        confluence_zones.append({
                            "type": "Order Block + Liquidity",
                            "components": [ob['type'], lz['type']],
                            "direction": self._get_confluence_direction(ob, lz),
                            "strength": (ob['strength'] + lz['strength']) / 2,
                            "price_range": self._get_overlap_range(ob, lz),
                            "distance_from_price": abs(current_price - self._get_zone_midpoint(ob)),
                            "description": f"همپوشانی {ob['type']} و {lz['type']}",
                            "created_at": datetime.now()
                        })
            
            # مرتب‌سازی بر اساس قدرت و نزدیکی به قیمت
            confluence_zones.sort(key=lambda x: (x['strength'], -x['distance_from_price']), reverse=True)
            return confluence_zones[:3]  # 3 ناحیه قوی‌تر
            
        except Exception as e:
            logger.error(f"خطا در پیدا کردن Confluence Zones: {e}")
            return []
    
    def _calculate_order_block_strength(self, current: pd.Series, prev: pd.Series, next_c: pd.Series) -> float:
        """محاسبه قدرت Order Block"""
        try:
            # اندازه بدنه کندل
            body_size = abs(current['close'] - current['open']) / current['open']
            
            # حجم نسبی (تخمینی)
            volume_factor = (current['high'] - current['low']) / prev['close']
            
            # واکنش کندل بعدی
            reaction_factor = 0.5
            if next_c['direction'] != current['direction']:  # تغییر جهت
                reaction_factor = 0.8
            
            strength = min(0.9, (body_size * 100) + (volume_factor * 50) + reaction_factor)
            return max(0.3, strength)
            
        except:
            return 0.5
    
    def _estimate_volume(self, candle: pd.Series, context_df: pd.DataFrame) -> float:
        """تخمین حجم بر اساس اندازه کندل"""
        try:
            candle_range = candle['high'] - candle['low']
            avg_range = context_df['high'].subtract(context_df['low']).mean()
            
            if avg_range > 0:
                return min(0.4, candle_range / avg_range - 1)
            return 0.2
        except:
            return 0.2
    
    def _zones_overlap(self, zone1: Dict, zone2: Dict) -> bool:
        """بررسی همپوشانی دو ناحیه"""
        try:
            z1_top = zone1.get('high', zone1.get('top', zone1.get('zone_top', 0)))
            z1_bottom = zone1.get('low', zone1.get('bottom', zone1.get('zone_bottom', 0)))
            z2_top = zone2.get('high', zone2.get('top', zone2.get('zone_top', 0)))
            z2_bottom = zone2.get('low', zone2.get('bottom', zone2.get('zone_bottom', 0)))
            
            return not (z1_top < z2_bottom or z2_top < z1_bottom)
        except:
            return False
    
    def _get_confluence_direction(self, zone1: Dict, zone2: Dict) -> str:
        """تشخیص جهت همپوشانی"""
        dir1 = zone1.get('direction', 'Neutral')
        dir2 = zone2.get('direction', 'Neutral')
        
        if dir1 == dir2:
            return dir1
        return 'Mixed'
    
    def _get_overlap_range(self, zone1: Dict, zone2: Dict) -> Dict:
        """محاسبه محدوده همپوشانی"""
        try:
            z1_top = zone1.get('high', zone1.get('top', zone1.get('zone_top', 0)))
            z1_bottom = zone1.get('low', zone1.get('bottom', zone1.get('zone_bottom', 0)))
            z2_top = zone2.get('high', zone2.get('top', zone2.get('zone_top', 0)))
            z2_bottom = zone2.get('low', zone2.get('bottom', zone2.get('zone_bottom', 0)))
            
            overlap_top = min(z1_top, z2_top)
            overlap_bottom = max(z1_bottom, z2_bottom)
            
            return {
                "top": overlap_top,
                "bottom": overlap_bottom,
                "size": overlap_top - overlap_bottom
            }
        except:
            return {"top": 0, "bottom": 0, "size": 0}
    
    def _get_zone_midpoint(self, zone: Dict) -> float:
        """محاسبه نقطه میانی ناحیه"""
        try:
            top = zone.get('high', zone.get('top', zone.get('zone_top', 0)))
            bottom = zone.get('low', zone.get('bottom', zone.get('zone_bottom', 0)))
            return (top + bottom) / 2
        except:
            return 0
    
    def _determine_current_trend(self, structure_points: List) -> str:
        """تشخیص روند فعلی"""
        if not structure_points:
            return "Sideways"
        
        recent_points = structure_points[-3:] if len(structure_points) >= 3 else structure_points
        
        bullish_count = len([p for p in recent_points if "Higher" in p['type']])
        bearish_count = len([p for p in recent_points if "Lower" in p['type']])
        
        if bullish_count > bearish_count:
            return "Bullish"
        elif bearish_count > bullish_count:
            return "Bearish"
        return "Sideways"
    
    def _determine_market_bias(self, df: pd.DataFrame, structure: Dict) -> Dict:
        """تشخیص تعصب کلی بازار"""
        try:
            current_price = df.iloc[-1]['close']
            sma_20 = df['close'].rolling(20).mean().iloc[-1]
            sma_50 = df['close'].rolling(50).mean().iloc[-1] if len(df) >= 50 else current_price
            
            trend = structure.get('current_trend', 'Sideways')
            
            # تشخیص تعصب بر اساس قیمت و میانگین‌ها
            if current_price > sma_20 > sma_50 and trend == "Bullish":
                bias = "Strong Bullish"
                confidence = 0.8
            elif current_price > sma_20 and trend == "Bullish":
                bias = "Bullish"
                confidence = 0.6  
            elif current_price < sma_20 < sma_50 and trend == "Bearish":
                bias = "Strong Bearish"
                confidence = 0.8
            elif current_price < sma_20 and trend == "Bearish":
                bias = "Bearish"
                confidence = 0.6
            else:
                bias = "Neutral"
                confidence = 0.4
            
            return {
                "bias": bias,
                "confidence": confidence,
                "current_price": current_price,
                "sma_20": sma_20,
                "sma_50": sma_50,
                "description": f"تعصب بازار: {bias} با اطمینان {confidence:.1%}"
            }
            
        except Exception as e:
            logger.error(f"خطا در تشخیص Market Bias: {e}")
            return {"bias": "Unknown", "confidence": 0.0}
    
    def get_smc_summary(self, analysis_result: Dict) -> str:
        """خلاصه تحلیل SMC"""
        
        if analysis_result.get('error'):
            return f"❌ خطای تحلیل SMC: {analysis_result['error']}"
        
        market_bias = analysis_result.get('market_bias', {})
        confluence_zones = analysis_result.get('confluence_zones', [])
        
        summary = f"🧠 **تحلیل Smart Money Concepts**\n\n"
        
        # تعصب بازار
        bias = market_bias.get('bias', 'Unknown')
        confidence = market_bias.get('confidence', 0) * 100
        summary += f"📈 **تعصب بازار:** {bias} ({confidence:.0f}%)\n"
        
        # آمار کلی  
        summary += f"📊 **آمار SMC:**\n"
        summary += f"• Order Blocks: {len(analysis_result.get('order_blocks', []))}\n"
        summary += f"• Fair Value Gaps: {len(analysis_result.get('fair_value_gaps', []))}\n"
        summary += f"• Liquidity Zones: {len(analysis_result.get('liquidity_zones', []))}\n"
        summary += f"• مناطق همپوشانی: {len(confluence_zones)}\n\n"
        
        # مناطق مهم همپوشانی
        if confluence_zones:
            summary += f"🎯 **مناطق کلیدی:**\n"
            for i, zone in enumerate(confluence_zones[:2], 1):
                summary += f"{i}. {zone['type']} - {zone['direction']} "
                summary += f"(قدرت: {zone['strength']:.1%})\n"
        
        return summary