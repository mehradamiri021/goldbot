from flask import render_template, request, jsonify, redirect, url_for
from app import app, db
from models import Signal, Analysis, TelegramMessage, BotStatus, PriceAlert
from services.telegram_service_helper import send_signal_for_approval
from services.analysis_service import get_current_market_status
from services.data_service import get_gold_data
import json
from datetime import datetime, timedelta

@app.route('/')
def index():
    """Main dashboard page"""
    try:
        # Get recent signals
        recent_signals = Signal.query.order_by(Signal.created_at.desc()).limit(10).all()
        
        # Get latest analysis
        latest_analysis = Analysis.query.order_by(Analysis.created_at.desc()).first()
        
        # Get current market data (fallback data available)
        try:
            market_data = get_gold_data()
            if hasattr(market_data, 'empty') and market_data.empty:
                market_data = []
            elif hasattr(market_data, 'to_dict'):
                market_data = market_data.to_dict('records')
        except Exception as data_error:
            app.logger.warning(f"Using fallback market data: {data_error}")
            market_data = []
        
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

@app.route('/dashboard')
def dashboard():
    """Advanced dashboard with charts and analytics"""
    try:
        # Get performance statistics
        total_signals = Signal.query.count()
        approved_signals = Signal.query.filter_by(admin_approved=True).count()
        # Signal model doesn't have 'result' field - use status instead
        executed_signals = Signal.query.filter_by(status='EXECUTED').count()
        
        success_rate = (executed_signals / approved_signals * 100) if approved_signals > 0 else 0
        
        # Get recent analyses
        analyses = Analysis.query.order_by(Analysis.created_at.desc()).limit(5).all()
        
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
        signals = Signal.query.order_by(Signal.created_at.desc()).paginate(
            page=page, per_page=20, error_out=False)
        
        return render_template('signals.html', signals=signals)
    except Exception as e:
        app.logger.error(f"Error in signals route: {e}")
        return render_template('signals.html', error=str(e))

@app.route('/admin')
def admin():
    """Admin panel for signal approval"""
    try:
        pending_signals = Signal.query.filter_by(status='pending').order_by(Signal.created_at.desc()).all()
        
        return render_template('admin.html', pending_signals=pending_signals)
    except Exception as e:
        app.logger.error(f"Error in admin route: {e}")
        return render_template('admin.html', error=str(e))

@app.route('/api/approve_signal/<int:signal_id>', methods=['POST'])
def approve_signal(signal_id):
    """API endpoint to approve a signal"""
    try:
        signal = Signal.query.get_or_404(signal_id)
        signal.admin_approved = True
        signal.status = 'approved'
        signal.executed_at = datetime.utcnow()
        
        db.session.commit()
        
        # Send signal to Telegram channel
        from services.telegram_service import send_signal_to_channel
        send_signal_to_channel(signal)
        
        return jsonify({'success': True, 'message': 'Signal approved and sent to channel'})
    except Exception as e:
        app.logger.error(f"Error approving signal: {e}")
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/reject_signal/<int:signal_id>', methods=['POST'])
def reject_signal(signal_id):
    """API endpoint to reject a signal"""
    try:
        signal = Signal.query.get_or_404(signal_id)
        signal.status = 'rejected'
        
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Signal rejected'})
    except Exception as e:
        app.logger.error(f"Error rejecting signal: {e}")
        return jsonify({'success': False, 'error': str(e)})

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
        signals = Signal.query.filter(Signal.created_at >= thirty_days_ago).all()
        
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
