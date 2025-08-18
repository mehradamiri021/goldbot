"""
Enhanced News Service - خدمات خبری پیشرفته
فقط از Forex Factory و FXStreet استفاده می‌کند
گزارش هفتگی یکشنبه‌ها و اخبار روزانه طلا

Only uses Forex Factory and FXStreet
Weekly Sunday reports and daily gold news
"""

import requests
import logging
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
import trafilatura
from typing import Dict, List, Optional
import pytz

logger = logging.getLogger(__name__)

class EnhancedNewsService:
    def __init__(self):
        self.sources = {
            'forex_factory': {
                'name': 'Forex Factory',
                'base_url': 'https://www.forexfactory.com',
                'calendar_url': 'https://www.forexfactory.com/calendar',
                'news_url': 'https://www.forexfactory.com/news'
            },
            'fxstreet': {
                'name': 'FXStreet',
                'base_url': 'https://www.fxstreet.com',
                'gold_news_url': 'https://www.fxstreet.com/news/gold',
                'calendar_url': 'https://www.fxstreet.com/economic-calendar'
            }
        }
        
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        self.tehran_tz = pytz.timezone('Asia/Tehran')
        self.gold_keywords = [
            'gold', 'xauusd', 'precious metal', 'bullion', 'طلا',
            'federal reserve', 'inflation', 'dollar', 'dxy',
            'interest rate', 'monetary policy', 'central bank'
        ]
    
    def get_daily_gold_news(self, date: datetime = None) -> Dict:
        """دریافت اخبار روزانه طلا"""
        if date is None:
            date = datetime.now(self.tehran_tz)
        
        logger.info(f"📰 دریافت اخبار طلای {date.strftime('%Y-%m-%d')}")
        
        try:
            # دریافت اخبار از هر دو منبع
            forex_factory_news = self._get_forex_factory_daily_news(date)
            fxstreet_news = self._get_fxstreet_daily_news(date)
            
            # ترکیب و فیلتر اخبار
            all_news = []
            all_news.extend(forex_factory_news)
            all_news.extend(fxstreet_news)
            
            # فیلتر اخبار مرتبط با طلا
            gold_news = self._filter_gold_related_news(all_news)
            
            # مرتب‌سازی بر اساس اهمیت
            sorted_news = sorted(gold_news, key=lambda x: x.get('importance_score', 0), reverse=True)
            
            return {
                'date': date.strftime('%Y-%m-%d'),
                'total_news': len(all_news),
                'gold_related_news': len(gold_news),
                'news_items': sorted_news[:5],  # 5 خبر مهم
                'sources_used': ['Forex Factory', 'FXStreet'],
                'last_updated': datetime.now(self.tehran_tz)
            }
            
        except Exception as e:
            logger.error(f"خطا در دریافت اخبار روزانه: {e}")
            return {'error': str(e), 'news_items': []}
    
    def get_weekly_news_summary(self, week_start_date: datetime = None) -> Dict:
        """گزارش خبری هفتگی (یکشنبه‌ها)"""
        if week_start_date is None:
            # یکشنبه این هفته
            today = datetime.now(self.tehran_tz)
            days_since_sunday = today.weekday() + 1 if today.weekday() != 6 else 0
            week_start_date = today - timedelta(days=days_since_sunday)
        
        logger.info(f"📊 ایجاد گزارش هفتگی از {week_start_date.strftime('%Y-%m-%d')}")
        
        try:
            week_end_date = week_start_date + timedelta(days=6)
            
            # جمع‌آوری اخبار هفته
            weekly_news = []
            economic_events = []
            
            for day_offset in range(7):
                current_date = week_start_date + timedelta(days=day_offset)
                
                # اخبار روزانه
                daily_news = self.get_daily_gold_news(current_date)
                if daily_news.get('news_items'):
                    weekly_news.extend(daily_news['news_items'])
                
                # رویدادهای اقتصادی
                daily_events = self._get_economic_events(current_date)
                economic_events.extend(daily_events)
            
            # تحلیل و خلاصه‌سازی
            news_summary = self._create_weekly_summary(weekly_news, economic_events, week_start_date, week_end_date)
            
            return news_summary
            
        except Exception as e:
            logger.error(f"خطا در ایجاد گزارش هفتگی: {e}")
            return {'error': str(e)}
    
    def _get_forex_factory_daily_news(self, date: datetime) -> List[Dict]:
        """دریافت اخبار روزانه از Forex Factory"""
        news_items = []
        
        try:
            # دریافت صفحه اخبار
            response = requests.get(self.sources['forex_factory']['news_url'], 
                                  headers=self.headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # پیدا کردن اخبار
            news_elements = soup.find_all('div', class_='news-item') or soup.find_all('tr', class_='calendar_row')
            
            for element in news_elements[:10]:  # 10 خبر اول
                try:
                    title_elem = element.find('a') or element.find('span', class_='calendar_title')
                    if title_elem:
                        title = title_elem.get_text(strip=True)
                        link = title_elem.get('href', '') if title_elem.name == 'a' else ''
                        
                        # اگر لینک نسبی است، کامل کن
                        if link and not link.startswith('http'):
                            link = self.sources['forex_factory']['base_url'] + link
                        
                        # تشخیص اهمیت
                        impact_elem = element.find('span', class_='impact') or element.find('td', class_='calendar_impact')
                        impact = 'Medium'
                        if impact_elem:
                            impact_text = impact_elem.get_text(strip=True).lower()
                            if 'high' in impact_text or 'red' in impact_elem.get('class', []):
                                impact = 'High'
                            elif 'low' in impact_text or 'yellow' in impact_elem.get('class', []):
                                impact = 'Low'
                        
                        # تشخیص زمان
                        time_elem = element.find('time') or element.find('td', class_='calendar_time')
                        event_time = date.strftime('%H:%M') if time_elem else '00:00'
                        
                        news_items.append({
                            'title': title,
                            'source': 'Forex Factory',
                            'link': link,
                            'impact': impact,
                            'time': event_time,
                            'date': date.strftime('%Y-%m-%d'),
                            'importance_score': self._calculate_importance_score(title, impact)
                        })
                        
                except Exception as e:
                    logger.debug(f"خطا در پردازش خبر Forex Factory: {e}")
                    continue
            
            return news_items
            
        except Exception as e:
            logger.error(f"خطا در دریافت اخبار Forex Factory: {e}")
            return []
    
    def _get_fxstreet_daily_news(self, date: datetime) -> List[Dict]:
        """دریافت اخبار روزانه از FXStreet"""
        news_items = []
        
        try:
            # دریافت اخبار طلا از FXStreet
            response = requests.get(self.sources['fxstreet']['gold_news_url'],
                                  headers=self.headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # پیدا کردن اخبار
            news_elements = soup.find_all('article', class_='fs-article-item') or soup.find_all('div', class_='news-item')
            
            for element in news_elements[:10]:  # 10 خبر اول
                try:
                    title_elem = element.find('h3') or element.find('h2') or element.find('a')
                    if title_elem:
                        title = title_elem.get_text(strip=True)
                        
                        # پیدا کردن لینک
                        link_elem = title_elem.find('a') if title_elem.name != 'a' else title_elem
                        link = ''
                        if link_elem:
                            link = link_elem.get('href', '')
                            if link and not link.startswith('http'):
                                link = self.sources['fxstreet']['base_url'] + link
                        
                        # تشخیص زمان انتشار
                        time_elem = element.find('time') or element.find('span', class_='time')
                        published_time = '00:00'
                        if time_elem:
                            time_text = time_elem.get_text(strip=True)
                            # پردازش زمان - فرمت‌های مختلف
                            if ':' in time_text:
                                published_time = time_text[:5]  # فقط ساعت:دقیقه
                        
                        # محاسبه اهمیت بر اساس محتوا
                        impact = 'Medium'
                        title_lower = title.lower()
                        if any(keyword in title_lower for keyword in ['breaking', 'alert', 'urgent', 'fed', 'fomc']):
                            impact = 'High'
                        elif any(keyword in title_lower for keyword in ['outlook', 'preview', 'technical']):
                            impact = 'Low'
                        
                        news_items.append({
                            'title': title,
                            'source': 'FXStreet',
                            'link': link,
                            'impact': impact,
                            'time': published_time,
                            'date': date.strftime('%Y-%m-%d'),
                            'importance_score': self._calculate_importance_score(title, impact)
                        })
                        
                except Exception as e:
                    logger.debug(f"خطا در پردازش خبر FXStreet: {e}")
                    continue
            
            return news_items
            
        except Exception as e:
            logger.error(f"خطا در دریافت اخبار FXStreet: {e}")
            return []
    
    def _get_economic_events(self, date: datetime) -> List[Dict]:
        """دریافت رویدادهای اقتصادی مهم"""
        events = []
        
        try:
            # دریافت تقویم اقتصادی Forex Factory
            calendar_url = f"{self.sources['forex_factory']['calendar_url']}?day={date.strftime('%b%d.%Y')}"
            response = requests.get(calendar_url, headers=self.headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # پیدا کردن رویدادها
            event_rows = soup.find_all('tr', class_='calendar_row')
            
            for row in event_rows[:15]:  # 15 رویداد اول
                try:
                    # نام رویداد
                    title_elem = row.find('td', class_='calendar_title') or row.find('span', class_='calendar_title')
                    if not title_elem:
                        continue
                    
                    title = title_elem.get_text(strip=True)
                    
                    # ارز
                    currency_elem = row.find('td', class_='calendar_currency')
                    currency = currency_elem.get_text(strip=True) if currency_elem else 'USD'
                    
                    # تأثیر
                    impact_elem = row.find('td', class_='calendar_impact')
                    impact = 'Medium'
                    if impact_elem:
                        impact_classes = impact_elem.get('class', [])
                        if 'high' in impact_classes or 'red' in ' '.join(impact_classes):
                            impact = 'High'
                        elif 'low' in impact_classes or 'yellow' in ' '.join(impact_classes):
                            impact = 'Low'
                    
                    # زمان
                    time_elem = row.find('td', class_='calendar_time')
                    event_time = time_elem.get_text(strip=True) if time_elem else '00:00'
                    
                    # فقط رویدادهای مهم مرتبط با طلا
                    if (impact == 'High' or 
                        any(keyword in title.lower() for keyword in ['inflation', 'fed', 'interest', 'gdp', 'employment'])):
                        
                        events.append({
                            'title': title,
                            'currency': currency,
                            'impact': impact,
                            'time': event_time,
                            'date': date.strftime('%Y-%m-%d'),
                            'source': 'Forex Factory Calendar'
                        })
                        
                except Exception as e:
                    logger.debug(f"خطا در پردازش رویداد: {e}")
                    continue
            
            return events
            
        except Exception as e:
            logger.error(f"خطا در دریافت رویدادهای اقتصادی: {e}")
            return []
    
    def _filter_gold_related_news(self, news_list: List[Dict]) -> List[Dict]:
        """فیلتر اخبار مرتبط با طلا"""
        gold_related = []
        
        for news_item in news_list:
            title = news_item.get('title', '').lower()
            
            # بررسی کلیدواژه‌های طلا
            is_gold_related = any(keyword in title for keyword in self.gold_keywords)
            
            if is_gold_related:
                # افزایش امتیاز اهمیت برای اخبار مستقیماً مرتبط با طلا
                if 'gold' in title or 'xauusd' in title:
                    news_item['importance_score'] += 2
                
                gold_related.append(news_item)
        
        return gold_related
    
    def _calculate_importance_score(self, title: str, impact: str) -> float:
        """محاسبه امتیاز اهمیت خبر"""
        score = 0.0
        
        # امتیاز بر اساس تأثیر
        impact_scores = {'High': 3.0, 'Medium': 2.0, 'Low': 1.0}
        score += impact_scores.get(impact, 2.0)
        
        title_lower = title.lower()
        
        # امتیاز بر اساس کلیدواژه‌ها
        if 'gold' in title_lower or 'xauusd' in title_lower:
            score += 3.0
        elif any(keyword in title_lower for keyword in ['fed', 'federal reserve', 'fomc']):
            score += 2.5
        elif any(keyword in title_lower for keyword in ['inflation', 'cpi', 'ppi']):
            score += 2.0
        elif any(keyword in title_lower for keyword in ['dollar', 'dxy', 'usd']):
            score += 1.5
        elif any(keyword in title_lower for keyword in ['interest rate', 'monetary policy']):
            score += 1.5
        
        # امتیاز بر اساس کلمات کلیدی
        if any(keyword in title_lower for keyword in ['breaking', 'alert', 'urgent']):
            score += 1.0
        
        return score
    
    def _create_weekly_summary(self, news_items: List[Dict], economic_events: List[Dict],
                              week_start: datetime, week_end: datetime) -> Dict:
        """ایجاد خلاصه هفتگی"""
        
        # گروه‌بندی اخبار بر اساس روز
        daily_news = {}
        for news in news_items:
            date = news.get('date', '')
            if date not in daily_news:
                daily_news[date] = []
            daily_news[date].append(news)
        
        # گروه‌بندی رویدادها بر اساس روز  
        daily_events = {}
        for event in economic_events:
            date = event.get('date', '')
            if date not in daily_events:
                daily_events[date] = []
            daily_events[date].append(event)
        
        # اخبار مهم هفته
        important_news = [n for n in news_items if n.get('importance_score', 0) >= 4.0][:10]
        
        # رویدادهای مهم هفته
        important_events = [e for e in economic_events if e.get('impact') == 'High'][:10]
        
        return {
            'period': {
                'start_date': week_start.strftime('%Y-%m-%d'),
                'end_date': week_end.strftime('%Y-%m-%d'),
                'persian_date_range': f"{week_start.strftime('%Y/%m/%d')} تا {week_end.strftime('%Y/%m/%d')}"
            },
            'summary_stats': {
                'total_news': len(news_items),
                'total_events': len(economic_events),
                'daily_breakdown': {date: len(items) for date, items in daily_news.items()},
                'important_news_count': len(important_news),
                'important_events_count': len(important_events)
            },
            'important_news': important_news,
            'important_events': important_events,
            'daily_highlights': self._create_daily_highlights(daily_news, daily_events),
            'market_themes': self._extract_market_themes(news_items + economic_events),
            'sources_used': ['Forex Factory', 'FXStreet'],
            'generated_at': datetime.now(self.tehran_tz)
        }
    
    def _create_daily_highlights(self, daily_news: Dict, daily_events: Dict) -> Dict:
        """ایجاد نکات برجسته روزانه"""
        highlights = {}
        
        all_dates = set(list(daily_news.keys()) + list(daily_events.keys()))
        
        for date in sorted(all_dates):
            day_news = daily_news.get(date, [])
            day_events = daily_events.get(date, [])
            
            # مهم‌ترین خبر روز
            top_news = max(day_news, key=lambda x: x.get('importance_score', 0)) if day_news else None
            
            # مهم‌ترین رویداد روز
            top_event = next((e for e in day_events if e.get('impact') == 'High'), 
                           day_events[0] if day_events else None)
            
            highlights[date] = {
                'date': date,
                'top_news': top_news,
                'top_event': top_event,
                'news_count': len(day_news),
                'events_count': len(day_events)
            }
        
        return highlights
    
    def _extract_market_themes(self, all_items: List[Dict]) -> List[Dict]:
        """استخراج موضوعات اصلی بازار"""
        themes = {}
        
        # موضوعات کلیدی
        theme_keywords = {
            'Federal Reserve': ['fed', 'federal reserve', 'fomc', 'jerome powell'],
            'Inflation': ['inflation', 'cpi', 'ppi', 'core inflation'],
            'Interest Rates': ['interest rate', 'rate hike', 'rate cut', 'monetary policy'],
            'US Dollar': ['dollar', 'dxy', 'usd index', 'greenback'],
            'Gold Markets': ['gold', 'xauusd', 'precious metal', 'bullion'],
            'Economic Data': ['gdp', 'employment', 'unemployment', 'jobs', 'payroll'],
            'Geopolitics': ['geopolitical', 'trade war', 'sanctions', 'tension']
        }
        
        # شمارش موضوعات
        for item in all_items:
            title = item.get('title', '').lower()
            
            for theme, keywords in theme_keywords.items():
                if any(keyword in title for keyword in keywords):
                    if theme not in themes:
                        themes[theme] = {'count': 0, 'examples': []}
                    
                    themes[theme]['count'] += 1
                    if len(themes[theme]['examples']) < 3:
                        themes[theme]['examples'].append(item.get('title', ''))
        
        # مرتب‌سازی بر اساس تعداد
        sorted_themes = sorted(themes.items(), key=lambda x: x[1]['count'], reverse=True)
        
        return [{'theme': theme, 'count': data['count'], 'examples': data['examples']} 
                for theme, data in sorted_themes[:5]]  # 5 موضوع برتر
    
    def format_daily_news_for_report(self, news_data: Dict) -> str:
        """فرمت اخبار روزانه برای گزارش"""
        if news_data.get('error') or not news_data.get('news_items'):
            return "❌ اخبار مهم طلا برای امروز یافت نشد"
        
        news_items = news_data['news_items']
        
        formatted_news = "📰 **اخبار مهم طلا امروز:**\n\n"
        
        for i, news in enumerate(news_items[:3], 1):  # 3 خبر مهم
            formatted_news += f"{i}. **{news.get('title', 'بدون عنوان')}**\n"
            formatted_news += f"   📍 منبع: {news.get('source', 'نامشخص')}\n"
            formatted_news += f"   ⏰ زمان: {news.get('time', '00:00')}\n"
            formatted_news += f"   🔥 اهمیت: {news.get('impact', 'متوسط')}\n\n"
        
        return formatted_news
    
    def format_weekly_summary_for_report(self, summary_data: Dict) -> str:
        """فرمت گزارش هفتگی"""
        if summary_data.get('error'):
            return f"❌ خطا در ایجاد گزارش هفتگی: {summary_data['error']}"
        
        period = summary_data.get('period', {})
        stats = summary_data.get('summary_stats', {})
        important_news = summary_data.get('important_news', [])
        important_events = summary_data.get('important_events', [])
        themes = summary_data.get('market_themes', [])
        
        formatted_report = "📊 **گزارش خبری هفتگی طلا**\n\n"
        formatted_report += f"📅 **بازه زمانی:** {period.get('persian_date_range', 'نامشخص')}\n\n"
        
        # آمار کلی
        formatted_report += f"📈 **آمار هفته:**\n"
        formatted_report += f"• کل اخبار: {stats.get('total_news', 0)}\n"
        formatted_report += f"• رویدادهای اقتصادی: {stats.get('total_events', 0)}\n"
        formatted_report += f"• اخبار مهم: {stats.get('important_news_count', 0)}\n\n"
        
        # اخبار مهم
        if important_news:
            formatted_report += f"🔥 **مهم‌ترین اخبار هفته:**\n\n"
            for i, news in enumerate(important_news[:5], 1):
                formatted_report += f"{i}. {news.get('title', 'بدون عنوان')}\n"
                formatted_report += f"   📍 {news.get('source', 'نامشخص')} | "
                formatted_report += f"⚡ {news.get('impact', 'متوسط')}\n\n"
        
        # رویدادهای مهم
        if important_events:
            formatted_report += f"📅 **رویدادهای مهم اقتصادی:**\n\n"
            for i, event in enumerate(important_events[:5], 1):
                formatted_report += f"{i}. {event.get('title', 'بدون عنوان')}\n"
                formatted_report += f"   💱 {event.get('currency', 'USD')} | "
                formatted_report += f"⚡ {event.get('impact', 'متوسط')}\n\n"
        
        # موضوعات اصلی
        if themes:
            formatted_report += f"🎯 **موضوعات کلیدی هفته:**\n\n"
            for i, theme in enumerate(themes[:3], 1):
                formatted_report += f"{i}. **{theme.get('theme', '')}** ({theme.get('count', 0)} مورد)\n"
        
        return formatted_report