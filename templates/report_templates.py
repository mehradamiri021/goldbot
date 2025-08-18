"""
قالب‌های گزارش‌دهی تلگرام بر اساس نمونه‌های ارائه شده
Telegram reporting templates based on provided samples
"""

def format_weekly_technical_analysis(analysis_data):
    """
    قالب تحلیل تکنیکال هفتگی انس جهانی طلا
    Weekly technical analysis template for global gold ounce
    """
    try:
        price = analysis_data.get('current_price', 3350.0)
        
        # Weekly resistance levels
        resistance_weekly_high = analysis_data.get('resistance_weekly_high', price * 1.025)
        resistance_weekly_low = analysis_data.get('resistance_weekly_low', price * 1.02)
        
        # Weekly support levels  
        support_weekly_high = analysis_data.get('support_weekly_high', price * 0.985)
        support_weekly_low = analysis_data.get('support_weekly_low', price * 0.975)
        
        # Daily levels
        resistance_daily_high = analysis_data.get('resistance_daily_high', price * 1.015)
        resistance_daily_low = analysis_data.get('resistance_daily_low', price * 1.01)
        support_daily_high = analysis_data.get('support_daily_high', price * 0.99)
        support_daily_low = analysis_data.get('support_daily_low', price * 0.985)
        
        # 4H levels
        resistance_4h = analysis_data.get('resistance_4h', price * 1.008)
        support_4h = analysis_data.get('support_4h', price * 0.995)
        
        template = f"""📊 تحلیل تکنیکال هفتگی انس جهانی طلا (XAU/USD)

━━━━━━━━━━━━━━━
🔹 مقاومت‌های هفتگی
💰 {resistance_weekly_low:,.0f} – {resistance_weekly_high:,.0f}: محدوده مقاومتی اصلی که چند بار مانع ادامه رشد شده. عبور و تثبیت بالای این سطح می‌تواند مسیر را تا {resistance_weekly_high * 1.02:,.0f} باز کند.
📌 استراتژی: در این ناحیه منتظر سیگنال‌های منفی (RSI بالای ۷۰ یا واگرایی منفی) برای فروش باشید.

🔹 حمایت‌های هفتگی
💵 {support_weekly_low:,.0f} – {support_weekly_high:,.0f}: حمایت کلیدی؛ حفظ این سطح نشانه قدرت خریداران است. شکست آن احتمال افت تا {support_weekly_low * 0.985:,.0f} را افزایش می‌دهد.
📌 استراتژی: در این ناحیه، RSI زیر ۳۰ یا سیگنال مثبت پرایس اکشن می‌تواند فرصت خرید باشد.

━━━━━━━━━━━━━━━
🔹 مقاومت‌های روزانه
💰 {resistance_daily_low:,.0f} – {resistance_daily_high:,.0f}: احتمال افزایش فشار فروش در این محدوده.
📌 استراتژی: برای فروش، تایید واگرایی منفی یا ضعف MACD ضروری است.

🔹 حمایت‌های روزانه
💵 {support_daily_low:,.0f} – {support_daily_high:,.0f}: حمایت کوتاه‌مدت؛ برگشت‌های قبلی از این سطح انجام شده.
📌 استراتژی: RSI زیر ۳۰ یا کندل بازگشتی می‌تواند نشانه خرید باشد.

━━━━━━━━━━━━━━━
🔹 مقاومت‌های ۴ ساعته
💰 {resistance_4h * 0.998:,.0f} – {resistance_4h:,.0f}: چند بار باعث اصلاح قیمت شده.
📌 استراتژی: با سیگنال معکوس یا شکست ناموفق، مناسب فروش کوتاه‌مدت.

🔹 حمایت‌های ۴ ساعته
💵 {support_4h:,.0f}: حمایت مهم کوتاه‌مدت.
📌 استراتژی: در صورت واکنش مثبت و تایید RSI، فرصت خرید کوتاه‌مدت.

━━━━━━━━━━━━━━━
⚠️ این تحلیل صرفاً جهت اطلاع‌رسانی و آموزش است. مسئولیت تصمیمات معاملاتی بر عهده فرد معامله‌گر است."""

        return template
        
    except Exception as e:
        return f"خطا در تولید تحلیل هفتگی: {str(e)}"


def format_economic_calendar(events_data):
    """
    قالب تقویم اقتصادی هفتگی
    Weekly economic calendar template  
    """
    try:
        # Sample events based on the provided template
        current_week = "۲۰ تا ۲۶ مرداد ۱۴۰۴"  # Can be dynamic
        
        template = f"""📅 اخبار مهم اقتصادی هفته (مرتبط با طلا)  
🗓 تاریخ: {current_week}  

تاریخ        ⏰ ساعت   🌍 کشور  📄 رویداد                                📊 پیش‌بینی   📈 اهمیت
-------------------------------------------------------------------------------------------------
۲۲ مرداد     17:00     🇺🇸 USD  شاخص قیمت مصرف‌کننده (CPI) ماهانه       0.3%         🔴 بالا
۲۲ مرداد     17:00     🇺🇸 USD  شاخص قیمت مصرف‌کننده (CPI) سالانه       3.0%         🔴 بالا
۲۴ مرداد     18:00     🇺🇸 USD  ذخایر نفت خام                           -3.0M        🔶 متوسط
۲۵ مرداد     16:00     🇺🇸 USD  شاخص قیمت تولیدکننده (PPI) ماهانه       0.2%         🔴 بالا
۲۵ مرداد     16:00     🇺🇸 USD  شاخص Core PPI (بدون غذا و انرژی)         0.2%         🔴 بالا
۲۵ مرداد     16:00     🇺🇸 USD  تعداد مدعیان بیمه بیکاری               230K         🔶 متوسط
۲۶ مرداد     14:30     🇺🇸 USD  دستورات کالاهای بادوام                   0.1%         🔶 متوسط
۲۶ مرداد     18:30     🇺🇸 USD  موجودی گاز طبیعی                        2 BCF        🟡 کم

🔍 نکات مهم هفته:
• شاخص CPI آمریکا بیشترین تأثیر را بر طلا خواهد داشت
• داده‌های PPI می‌تواند نشانگر فشارهای تورمی باشد  
• آمارهای اشتغال و بیکاری مهم برای سیاست Fed است

⚠️ این اطلاعات صرفاً جهت آگاهی است و برنامه‌ریزی معاملات باید با احتیاط انجام شود."""

        return template
        
    except Exception as e:
        return f"خطا در تولید تقویم اقتصادی: {str(e)}"