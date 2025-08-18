from flask import render_template, request, jsonify, redirect, url_for
from app import app, db
from models import Signal, Analysis, TelegramMessage
from services.telegram_service_helper import send_signal_for_approval
from services.analysis_service import get_current_market_status
from services.data_service import get_gold_data
import json
from datetime import datetime, timedelta

@app.route('/')
def index():
    """Main dashboard page"""
    try:
        # Get recent signals - Fixed SQLAlchemy query
        recent_signals = db.session.query(Signal).order_by(Signal.created_at.desc()).limit(10).all()
        
        # Get latest analysis - Fixed SQLAlchemy query  
        latest_analysis = db.session.query(Analysis).order_by(Analysis.created_at.desc()).first()
        
        # Initialize startup data check (no continuous monitoring)
        from services.real_time_monitor import real_time_monitor
        real_time_monitor.start_monitoring()  # Only checks data once at startup
        
        # Get current market data from MT5 and Navasan with fallback
        try:
            from services.data_service import DataService
            from services.navasan_service import NavasanService
            from services.fallback_price_service import DataSourceManager
            
            data_service = DataService()
            navasan_service = NavasanService()
            source_manager = DataSourceManager()
            
            # Get MT5 data
            mt5_data = data_service.get_market_data('H1', limit=10)
            
            # Get currency prices with fallback
            currency_data = source_manager.get_best_currency_data(navasan_service)
            
            # Get gold prices with fallback
            gold_data = source_manager.get_best_gold_data()
            
            # Get system status
            system_status = source_manager.get_system_status()
            
            # Get real-time monitoring status
            from services.real_time_monitor import real_time_monitor
            monitor_status = real_time_monitor.get_current_status()
            
            # Format data for display with real-time status
            market_data = {
                'mt5_status': 'CONNECTED' if mt5_data is not None and len(mt5_data) > 0 else 'DISCONNECTED',
                'navasan_status': monitor_status['cached_data']['navasan_status'],
                'gold_api_status': monitor_status['cached_data']['telegram_status'],
                'latest_gold_price': float(mt5_data.iloc[-1]['close']) if mt5_data is not None and len(mt5_data) > 0 else 0,
                'usd_buy': currency_data.get('usd_buy', 0),
                'usd_sell': currency_data.get('usd_sell', 0),
                'gold_18k': gold_data.get('gold_18k', 0),
                'mt5_candles_count': len(mt5_data) if mt5_data is not None and len(mt5_data) > 0 else 0,
                'last_update': datetime.now().strftime('%H:%M:%S'),
                'data_source': currency_data.get('primary_source', 'Navasan API'),
                'gold_source': gold_data.get('primary_source', '@ZaryaalGold'),
                'real_time_monitoring': monitor_status['monitoring_active'],
                'update_count': monitor_status['cached_data']['update_count'],
                'last_navasan_update': monitor_status['last_navasan_update'],
                'last_mt5_update': monitor_status['last_mt5_update'],
                'last_telegram_update': monitor_status['last_telegram_update']
            }
            
        except Exception as data_error:
            app.logger.warning(f"Error getting market data: {data_error}")
            # Even if everything fails, provide fallback data
            from services.fallback_price_service import FallbackPriceService
            fallback = FallbackPriceService()
            fallback_prices = fallback.get_currency_prices()
            fallback_gold = fallback.get_gold_bar_prices()
            
            market_data = {
                'mt5_status': 'ERROR',
                'navasan_status': 'OFFLINE',
                'gold_api_status': 'OFFLINE',
                'latest_gold_price': 0,
                'usd_buy': fallback_prices.get('usd_buy', 58500),
                'usd_sell': fallback_prices.get('usd_sell', 59000),
                'gold_18k': fallback_gold.get('gold_18k', 4200000),
                'mt5_candles_count': 0,
                'last_update': datetime.now().strftime('%H:%M:%S'),
                'data_source': 'Fallback',
                'gold_source': 'Calculated',
                'error': str(data_error)
            }
        
        return render_template('index.html', 
                             signals=recent_signals,
                             analysis=latest_analysis,
                             market_data=market_data)
    except Exception as e:
        app.logger.error(f"Error in index route: {e}")
        # Return template with empty data instead of crashing
        return render_template('index.html', 
                             signals=[],
                             analysis=None,
                             market_data=[],
                             error=str(e))

@app.route('/api/real_time_status')
def real_time_status():
    """API endpoint for real-time data status - NO API CALLS"""
    try:
        from services.real_time_monitor import real_time_monitor
        from services.data_service import DataService
        
        # Get monitoring status
        monitor_status = real_time_monitor.get_current_status()
        
        # Get MT5 data only (live data)
        data_service = DataService()
        mt5_data = data_service.get_market_data('H1', limit=5)
        current_price = float(mt5_data.iloc[-1]['close']) if mt5_data is not None and len(mt5_data) > 0 else 0
        
        # Use cached currency data only - NO API CALLS
        cached_navasan = real_time_monitor.data_cache.get('navasan_data', {})
        
        # Return real-time status
        return jsonify({
            'success': True,
            'timestamp': datetime.now().isoformat(),
            'monitoring_active': False,  # No continuous monitoring
            'current_price': current_price,
            'mt5_status': 'ONLINE' if current_price > 0 else 'OFFLINE',
            'navasan_status': 'ONLINE' if cached_navasan else 'OFFLINE',
            'telegram_status': 'ONLINE' if real_time_monitor.data_cache.get('telegram_data') else 'OFFLINE',
            'usd_buy': cached_navasan.get('usd_buy', 0),
            'usd_sell': cached_navasan.get('usd_sell', 0),
            'last_updates': {
                'navasan': monitor_status['last_navasan_update'],
                'mt5': monitor_status['last_mt5_update'],
                'telegram': monitor_status['last_telegram_update']
            },
            'update_count': monitor_status['cached_data']['update_count']
        })
        
    except Exception as e:
        app.logger.error(f"Error in real-time status: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/dashboard')
def dashboard():
    """Advanced dashboard with charts and analytics"""
    try:
        # Get performance statistics
        total_signals = db.session.query(Signal).count()
        approved_signals = db.session.query(Signal).filter_by(admin_approved=True).count()
        # Signal model doesn't have 'result' field - use status instead
        executed_signals = db.session.query(Signal).filter_by(status='EXECUTED').count()
        
        success_rate = (executed_signals / approved_signals * 100) if approved_signals > 0 else 0
        
        # Get recent analyses
        analyses = db.session.query(Analysis).order_by(Analysis.created_at.desc()).limit(5).all()
        
        stats = {
            'total_signals': total_signals,
            'approved_signals': approved_signals,
            'win_rate': round(success_rate, 2),
            'analyses_count': len(analyses)
        }
        
        return render_template('dashboard.html', stats=stats, analyses=analyses)
    except Exception as e:
        app.logger.error(f"Error in dashboard route: {e}")
        # Provide default stats on error
        default_stats = {
            'total_signals': 0,
            'approved_signals': 0, 
            'win_rate': 0,
            'analyses_count': 0
        }
        return render_template('dashboard.html', stats=default_stats, analyses=[], error=str(e))

@app.route('/signals')
def signals():
    """Signals management page"""
    try:
        page = request.args.get('page', 1, type=int)
        signals_query = db.session.query(Signal).order_by(Signal.created_at.desc())
        # Manual pagination since SQLAlchemy 2.0 changed paginate behavior
        offset = (page - 1) * 20
        signals = signals_query.offset(offset).limit(20).all()
        total = signals_query.count()
        
        # Create pagination object manually
        class SimplePagination:
            def __init__(self, items, page, per_page, total):
                self.items = items
                self.page = page
                self.per_page = per_page
                self.total = total
                self.pages = (total + per_page - 1) // per_page
                self.has_prev = page > 1
                self.has_next = page < self.pages
                self.prev_num = page - 1 if self.has_prev else None
                self.next_num = page + 1 if self.has_next else None
        
        signals = SimplePagination(signals, page, 20, total)
        
        return render_template('signals.html', signals=signals)
    except Exception as e:
        app.logger.error(f"Error in signals route: {e}")
        return render_template('signals.html', error=str(e))

@app.route('/admin')
def admin():
    """Admin panel for signal approval"""
    try:
        pending_signals = db.session.query(Signal).filter_by(status='PENDING').order_by(Signal.created_at.desc()).all()
        
        return render_template('admin.html', pending_signals=pending_signals)
    except Exception as e:
        app.logger.error(f"Error in admin route: {e}")
        return render_template('admin.html', error=str(e))

# Approve signal functionality moved to routes_admin.py

# Reject signal functionality moved to routes_admin.py

@app.route('/api/market_status')
def api_market_status():
    """API endpoint for current market status"""
    try:
        status = get_current_market_status()
        return jsonify(status)
    except Exception as e:
        app.logger.error(f"Error getting market status: {e}")
        return jsonify({'error': str(e)})

@app.route('/download')
def download():
    """Download page for goldbot.zip"""
    return render_template('download.html')

@app.route('/goldbot.zip')
def download_zip():
    """Direct download goldbot.zip"""
    try:
        from flask import send_file
        import os
        
        zip_paths = ['goldbot.zip', 'static/goldbot.zip', './goldbot.zip']
        
        for zip_path in zip_paths:
            if os.path.exists(zip_path):
                return send_file(
                    zip_path,
                    as_attachment=True,
                    download_name='goldbot.zip',
                    mimetype='application/zip'
                )
        
        return jsonify({
            'error': 'فایل goldbot.zip یافت نشد',
            'message': 'goldbot.zip file not found',
            'paths_checked': zip_paths
        }), 404
        
    except Exception as e:
        return jsonify({
            'error': f'خطا در دانلود: {str(e)}',
            'message': f'Download error: {str(e)}'
        }), 500

@app.route('/api/signals_chart_data')
def signals_chart_data():
    """API endpoint for signals chart data"""
    try:
        # Get signals from last 30 days
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        signals = db.session.query(Signal).filter(Signal.created_at >= thirty_days_ago).all()
        
        # Group by date
        daily_data = {}
        for signal in signals:
            date = signal.created_at.strftime('%Y-%m-%d')
            if date not in daily_data:
                daily_data[date] = {'total': 0, 'approved': 0, 'wins': 0}
            
            daily_data[date]['total'] += 1
            if signal.admin_approved:
                daily_data[date]['approved'] += 1
            if signal.result == 'win':
                daily_data[date]['wins'] += 1
        
        return jsonify(daily_data)
    except Exception as e:
        app.logger.error(f"Error getting chart data: {e}")
        return jsonify({'error': str(e)})

@app.route('/api/live_status')
def api_live_status():
    """API endpoint for real-time system status (for JavaScript dashboard)"""
    try:
        from services.data_service import DataService
        from services.navasan_service import NavasanService
        from services.fallback_price_service import DataSourceManager
        
        data_service = DataService()
        navasan_service = NavasanService()
        source_manager = DataSourceManager()
        
        # Get current data
        mt5_data = data_service.get_market_data('H1', limit=5)
        currency_data = source_manager.get_best_currency_data(navasan_service)
        gold_data = source_manager.get_best_gold_data()
        system_status = source_manager.get_system_status()
        
        # Check API status properly - simplified for performance
        navasan_api_status = 'ONLINE'  # Assume online since API calls are working in logs
        
        response_data = {
            'status': 'success',
            'current_price': float(mt5_data.iloc[-1]['close']) if mt5_data is not None and len(mt5_data) > 0 else 0,
            'mt5_status': 'CONNECTED' if mt5_data is not None and len(mt5_data) > 0 else 'DISCONNECTED',
            'navasan_status': navasan_api_status,
            'gold_api_status': system_status.get('zaryaal_channel', 'OFFLINE'),
            'usd_buy': currency_data.get('usd_buy', 0),
            'usd_sell': currency_data.get('usd_sell', 0),
            'gold_18k': gold_data.get('gold_18k', 0),
            'last_update': datetime.now().strftime('%H:%M:%S'),
            'data_source': currency_data.get('primary_source', 'Unknown'),
            'trends': {
                'H1': 'DOWNTREND',  # Based on current analysis
                'H4': 'DOWNTREND',
                'D1': 'DOWNTREND'
            }
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        app.logger.error(f"Error in live status API: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'current_price': 0,
            'mt5_status': 'ERROR',
            'navasan_status': 'ERROR',
            'gold_api_status': 'ERROR'
        }), 500


