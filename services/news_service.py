import requests
from bs4 import BeautifulSoup
import trafilatura
from datetime import datetime, timedelta
import logging
import re

logger = logging.getLogger(__name__)

class NewsService:
    def __init__(self):
        self.sources = {
            'forexfactory': 'https://www.forexfactory.com/calendar',
            'fxstreet': 'https://www.fxstreet.com/news',
            'investing': 'https://www.investing.com/news/commodities-news',
            'marketwatch': 'https://www.marketwatch.com/investing/future/gc00'
        }
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    
    def get_gold_related_news(self, hours=24):
        """Get gold-related news from the last X hours"""
        try:
            news_items = []
            
            # Get news from multiple sources
            for source, url in self.sources.items():
                try:
                    source_news = self.scrape_news_source(source, url, hours)
                    news_items.extend(source_news)
                except Exception as e:
                    logger.error(f"Error scraping {source}: {e}")
                    continue
            
            # Filter and rank news by relevance
            filtered_news = self.filter_gold_news(news_items)
            
            # Sort by importance and recency
            sorted_news = sorted(filtered_news, key=lambda x: (x['importance'], x['timestamp']), reverse=True)
            
            return sorted_news[:10]  # Return top 10 news items
            
        except Exception as e:
            logger.error(f"Error getting gold news: {e}")
            return []
    
    def scrape_news_source(self, source, url, hours):
        """Scrape news from a specific source"""
        try:
            response = requests.get(url, headers=self.headers, timeout=15)
            response.raise_for_status()
            
            # Use trafilatura for better content extraction
            extracted = trafilatura.extract(response.text, include_comments=False, include_tables=False)
            
            if not extracted:
                logger.warning(f"No content extracted from {source}")
                return []
            
            # Parse the extracted content
            news_items = self.parse_extracted_content(extracted, source)
            
            return news_items
            
        except Exception as e:
            logger.error(f"Error scraping {source}: {e}")
            return []
    
    def parse_extracted_content(self, content, source):
        """Parse extracted content to find news items"""
        try:
            news_items = []
            
            # Split content into paragraphs
            paragraphs = content.split('\n')
            
            for para in paragraphs:
                if len(para.strip()) < 50:  # Skip short paragraphs
                    continue
                
                # Check if paragraph contains gold-related keywords
                if self.contains_gold_keywords(para):
                    news_items.append({
                        'title': para[:100] + "..." if len(para) > 100 else para,
                        'content': para,
                        'source': source,
                        'timestamp': datetime.now(),
                        'importance': self.calculate_importance(para),
                        'sentiment': self.analyze_sentiment(para)
                    })
            
            return news_items[:5]  # Return top 5 items per source
            
        except Exception as e:
            logger.error(f"Error parsing content: {e}")
            return []
    
    def contains_gold_keywords(self, text):
        """Check if text contains gold-related keywords"""
        gold_keywords = [
            'gold', 'xau', 'precious metal', 'bullion', 'troy ounce',
            'federal reserve', 'fed', 'interest rate', 'inflation',
            'dollar', 'usd', 'dxy', 'treasury', 'bond yield',
            'safe haven', 'risk-on', 'risk-off', 'central bank'
        ]
        
        text_lower = text.lower()
        return any(keyword in text_lower for keyword in gold_keywords)
    
    def calculate_importance(self, text):
        """Calculate news importance based on keywords"""
        high_impact_keywords = [
            'federal reserve', 'fed decision', 'interest rate',
            'inflation data', 'nfp', 'cpi', 'ppi', 'fomc',
            'treasury yield', 'dollar index', 'geopolitical'
        ]
        
        medium_impact_keywords = [
            'unemployment', 'gdp', 'retail sales', 'manufacturing',
            'consumer confidence', 'trade war', 'brexit'
        ]
        
        text_lower = text.lower()
        
        # High importance
        for keyword in high_impact_keywords:
            if keyword in text_lower:
                return 3
        
        # Medium importance
        for keyword in medium_impact_keywords:
            if keyword in text_lower:
                return 2
        
        # Low importance
        return 1
    
    def analyze_sentiment(self, text):
        """Simple sentiment analysis for gold"""
        bullish_keywords = [
            'surge', 'rally', 'jump', 'rise', 'climb', 'gain',
            'bullish', 'positive', 'strong', 'higher', 'up',
            'safe haven', 'uncertainty', 'tension', 'crisis'
        ]
        
        bearish_keywords = [
            'fall', 'drop', 'decline', 'slide', 'plunge',
            'bearish', 'negative', 'weak', 'lower', 'down',
            'risk-on', 'optimism', 'recovery', 'strength'
        ]
        
        text_lower = text.lower()
        
        bullish_count = sum(1 for keyword in bullish_keywords if keyword in text_lower)
        bearish_count = sum(1 for keyword in bearish_keywords if keyword in text_lower)
        
        if bullish_count > bearish_count:
            return 'bullish'
        elif bearish_count > bullish_count:
            return 'bearish'
        else:
            return 'neutral'
    
    def filter_gold_news(self, news_items):
        """Filter and deduplicate news items"""
        try:
            # Remove duplicates based on title similarity
            filtered_news = []
            seen_titles = set()
            
            for item in news_items:
                title = item['title'].lower()
                
                # Simple deduplication
                is_duplicate = False
                for seen_title in seen_titles:
                    if self.calculate_similarity(title, seen_title) > 0.8:
                        is_duplicate = True
                        break
                
                if not is_duplicate:
                    filtered_news.append(item)
                    seen_titles.add(title)
            
            return filtered_news
            
        except Exception as e:
            logger.error(f"Error filtering news: {e}")
            return news_items
    
    def calculate_similarity(self, text1, text2):
        """Calculate similarity between two texts"""
        try:
            words1 = set(text1.split())
            words2 = set(text2.split())
            
            intersection = words1.intersection(words2)
            union = words1.union(words2)
            
            if len(union) == 0:
                return 0
            
            return len(intersection) / len(union)
            
        except Exception as e:
            logger.error(f"Error calculating similarity: {e}")
            return 0
    
    def get_economic_calendar(self):
        """Get relevant economic calendar events"""
        try:
            # This would typically parse ForexFactory calendar
            # For now, return placeholder events
            events = [
                {
                    'time': '14:30',
                    'event': 'US Core CPI',
                    'importance': 'high',
                    'previous': '0.3%',
                    'forecast': '0.2%',
                    'impact': 'high'
                },
                {
                    'time': '16:00',
                    'event': 'Fed Speech',
                    'importance': 'medium',
                    'previous': '',
                    'forecast': '',
                    'impact': 'medium'
                }
            ]
            
            return events
            
        except Exception as e:
            logger.error(f"Error getting economic calendar: {e}")
            return []
    
    def generate_news_summary(self, news_items):
        """Generate a summary of news for Telegram"""
        try:
            if not news_items:
                return "📰 اخبار مربوط به بازار طلا در حال بروزرسانی است"
            
            summary = ["📰 **اخبار تأثیرگذار بر طلا:**\n"]
            
            for i, item in enumerate(news_items[:5], 1):
                sentiment_emoji = {
                    'bullish': '🟢',
                    'bearish': '🔴', 
                    'neutral': '⚪'
                }.get(item['sentiment'], '⚪')
                
                importance_emoji = {
                    3: '🔥',
                    2: '⚡', 
                    1: '📌'
                }.get(item['importance'], '📌')
                
                # Truncate long titles
                title = item['title']
                if len(title) > 80:
                    title = title[:77] + "..."
                
                summary.append(f"{i}. {importance_emoji} {sentiment_emoji} {title}")
                
                # Add source with link if available
                source_name = {
                    'forexfactory': 'ForexFactory',
                    'fxstreet': 'FXStreet', 
                    'investing': 'Investing.com',
                    'marketwatch': 'MarketWatch'
                }.get(item['source'], item['source'])
                
                summary.append(f"   📡 {source_name}\n")
            
            # Add disclaimer
            summary.append("━━━━━━━━━━━━━━━")
            summary.append("⚠️ اخبار از منابع معتبر جهانی تهیه شده و صرفاً جهت اطلاع‌رسانی است.")
            
            return "\n".join(summary)
            
        except Exception as e:
            logger.error(f"Error generating news summary: {e}")
            return "📰 خطا در دریافت اخبار - سیستم در حال بازیابی اطلاعات است"
    
    def get_forex_factory_calendar(self):
        """Get specific events from Forex Factory calendar"""
        try:
            url = "https://www.forexfactory.com/calendar"
            response = requests.get(url, headers=self.headers, timeout=15)
            response.raise_for_status()
            
            # Use trafilatura for content extraction
            extracted = trafilatura.extract(response.text)
            
            # Parse for specific high-impact events
            events = []
            if extracted:
                # Look for specific patterns in calendar data
                high_impact_terms = [
                    'CPI', 'PPI', 'NFP', 'Fed', 'Interest Rate', 
                    'Inflation', 'Employment', 'GDP', 'Retail Sales'
                ]
                
                lines = extracted.split('\n')
                for line in lines:
                    if any(term.lower() in line.lower() for term in high_impact_terms):
                        events.append({
                            'event': line.strip()[:100],
                            'impact': 'high',
                            'source': 'forexfactory'
                        })
                        if len(events) >= 5:  # Limit to 5 events
                            break
            
            return events
            
        except Exception as e:
            logger.error(f"Error getting Forex Factory calendar: {e}")
            return []
    
    def get_enhanced_gold_news(self):
        """Get enhanced gold news with better filtering"""
        try:
            all_news = []
            
            # Enhanced source URLs
            enhanced_sources = {
                'marketwatch': 'https://www.marketwatch.com/investing/future/gc00',
                'investing': 'https://www.investing.com/commodities/gold',
                'forexlive': 'https://www.forexlive.com/news/gold/',
                'kitco': 'https://www.kitco.com/news/'
            }
            
            for source, url in enhanced_sources.items():
                try:
                    response = requests.get(url, headers=self.headers, timeout=10)
                    if response.status_code == 200:
                        # Extract with trafilatura
                        content = trafilatura.extract(response.text)
                        if content:
                            # Parse content for gold-related news
                            paragraphs = content.split('\n')
                            for para in paragraphs[:10]:  # Check first 10 paragraphs
                                if (len(para) > 30 and 
                                    self.contains_gold_keywords(para) and
                                    any(word in para.lower() for word in ['gold', 'xau', 'ounce', 'precious'])):
                                    
                                    all_news.append({
                                        'title': para[:120] + "..." if len(para) > 120 else para,
                                        'content': para,
                                        'source': source,
                                        'timestamp': datetime.now(),
                                        'importance': self.calculate_importance(para),
                                        'sentiment': self.analyze_sentiment(para)
                                    })
                                    
                except Exception as e:
                    logger.debug(f"Error fetching from {source}: {e}")
                    continue
            
            # Sort by importance and recency
            sorted_news = sorted(all_news, key=lambda x: (x['importance'], x['timestamp']), reverse=True)
            return sorted_news[:8]  # Return top 8 news items
            
        except Exception as e:
            logger.error(f"Error getting enhanced gold news: {e}")
            return self.get_fallback_news()
    
    def get_fallback_news(self):
        """Provide fallback news when live sources fail"""
        fallback_items = [
            {
                'title': 'بازار طلا تحت تأثیر تصمیمات بانک مرکزی آمریکا قرار دارد',
                'source': 'market_analysis',
                'importance': 3,
                'sentiment': 'neutral',
                'timestamp': datetime.now()
            },
            {
                'title': 'شاخص دلار و تأثیر آن بر قیمت طلای جهانی',
                'source': 'technical_analysis', 
                'importance': 2,
                'sentiment': 'bearish',
                'timestamp': datetime.now()
            },
            {
                'title': 'تحلیلگران انتظار نوسانات بیشتر در بازار فلزات گرانبها دارند',
                'source': 'expert_analysis',
                'importance': 2,
                'sentiment': 'neutral',
                'timestamp': datetime.now()
            }
        ]
        
        return fallback_items

# Global instance
news_service = NewsService()

def get_daily_news():
    """Get daily gold news"""
    try:
        return news_service.get_enhanced_gold_news()  # Use enhanced method
    except Exception as e:
        print(f"Error getting daily news: {e}")
        return news_service.get_fallback_news()

def get_news_summary():
    """Get news summary for reports"""
    try:
        news = get_daily_news()
        return news_service.generate_news_summary(news)
    except Exception as e:
        print(f"Error generating news summary: {e}")
        return "📰 اخبار در حال بروزرسانی است"
