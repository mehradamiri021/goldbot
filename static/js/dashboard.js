// Dashboard JavaScript for Gold Trading Bot

// Global variables
let currentMarketData = {};
let liveCharts = {};
let updateInterval = null;

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    startLiveUpdates();
    setupEventListeners();
});

// Initialize dashboard components
function initializeDashboard() {
    console.log('Initializing Gold Trading Bot Dashboard...');
    
    // Initialize tooltips
    initializeTooltips();
    
    // Load initial data
    loadMarketData();
    loadRecentSignals();
    updateSystemStatus();
    
    // Setup auto-refresh
    setupAutoRefresh();
}

// Initialize Bootstrap tooltips
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Load current market data
function loadMarketData() {
    showLoadingState('market-data');
    
    fetch('/api/market_status')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showError('خطا در دریافت اطلاعات بازار: ' + data.error);
                return;
            }
            
            currentMarketData = data;
            updateMarketDisplay(data);
            updateTechnicalIndicators(data);
            updateSMCAnalysis(data);
            
            hideLoadingState('market-data');
        })
        .catch(error => {
            console.error('Error loading market data:', error);
            showError('خطا در ارتباط با سرور');
            hideLoadingState('market-data');
        });
}

// Update market display with new data
function updateMarketDisplay(data) {
    // Update current price
    const priceElement = document.getElementById('current-price');
    if (priceElement && data.current_price) {
        const price = parseFloat(data.current_price);
        priceElement.textContent = `$${price.toFixed(2)}`;
        
        // Add price movement class
        priceElement.className = 'text-warning price-display';
        
        // Store previous price for comparison
        const previousPrice = parseFloat(priceElement.dataset.previousPrice || price);
        if (price > previousPrice) {
            priceElement.classList.add('price-up');
            addPriceAnimation(priceElement, 'up');
        } else if (price < previousPrice) {
            priceElement.classList.add('price-down');
            addPriceAnimation(priceElement, 'down');
        }
        
        priceElement.dataset.previousPrice = price;
    }
    
    // Update trend status
    const trendElement = document.getElementById('trend-status');
    if (trendElement && data.trends) {
        const dailyTrend = data.trends.D1 || 'UNKNOWN';
        updateTrendDisplay(trendElement, dailyTrend);
    }
    
    // Update last update time
    updateLastUpdateTime();
}

// Update trend display
function updateTrendDisplay(element, trend) {
    element.innerHTML = '';
    
    let icon, text, className;
    
    switch (trend) {
        case 'BULLISH':
            icon = 'fas fa-arrow-up';
            text = 'صعودی';
            className = 'text-success';
            break;
        case 'BEARISH':
            icon = 'fas fa-arrow-down';
            text = 'نزولی';
            className = 'text-danger';
            break;
        case 'SIDEWAYS':
            icon = 'fas fa-minus';
            text = 'خنثی';
            className = 'text-warning';
            break;
        default:
            icon = 'fas fa-question';
            text = 'نامشخص';
            className = 'text-muted';
    }
    
    element.innerHTML = `<span class="${className}"><i class="${icon} me-1"></i>${text}</span>`;
}

// Add price animation
function addPriceAnimation(element, direction) {
    const animationClass = direction === 'up' ? 'price-up' : 'price-down';
    element.classList.add(animationClass);
    
    setTimeout(() => {
        element.classList.remove(animationClass);
    }, 2000);
}

// Update technical indicators
function updateTechnicalIndicators(data) {
    // RSI
    const rsiElement = document.getElementById('rsi-value');
    const rsiProgress = document.getElementById('rsi-progress');
    
    if (rsiElement && data.technical_indicators) {
        const rsi = data.technical_indicators.rsi || 50;
        rsiElement.textContent = rsi.toFixed(1);
        
        if (rsiProgress) {
            rsiProgress.style.width = `${rsi}%`;
            
            // Set color based on RSI value
            rsiProgress.className = 'progress-bar';
            if (rsi > 70) {
                rsiProgress.classList.add('bg-danger');
            } else if (rsi < 30) {
                rsiProgress.classList.add('bg-success');
            } else {
                rsiProgress.classList.add('bg-info');
            }
        }
        
        // Update badge class
        rsiElement.className = 'badge';
        if (rsi > 70) {
            rsiElement.classList.add('bg-danger');
        } else if (rsi < 30) {
            rsiElement.classList.add('bg-success');
        } else {
            rsiElement.classList.add('bg-secondary');
        }
    }
    
    // MACD Signal
    const macdElement = document.getElementById('macd-signal');
    if (macdElement && data.technical_indicators) {
        const macd = data.technical_indicators.macd_signal || 'Neutral';
        macdElement.textContent = macd;
        macdElement.className = 'badge bg-secondary';
    }
    
    // Overall Trend
    const trendElement = document.getElementById('trend-direction');
    if (trendElement && data.trends) {
        const trend = data.trends.D1 || 'UNKNOWN';
        trendElement.textContent = trend;
        
        trendElement.className = 'badge';
        switch (trend) {
            case 'BULLISH':
                trendElement.classList.add('bg-success');
                break;
            case 'BEARISH':
                trendElement.classList.add('bg-danger');
                break;
            default:
                trendElement.classList.add('bg-secondary');
        }
    }
}

// Update Smart Money Concepts analysis
function updateSMCAnalysis(data) {
    const smcData = data.smc_analysis || {};
    
    // Order Blocks
    const orderBlocksElement = document.getElementById('order-blocks-count');
    if (orderBlocksElement) {
        const count = smcData.order_blocks ? smcData.order_blocks.length : 0;
        orderBlocksElement.textContent = `${count} بلاک فعال`;
    }
    
    // Fair Value Gaps
    const fvgElement = document.getElementById('fvg-count');
    if (fvgElement) {
        const count = smcData.fair_value_gaps ? smcData.fair_value_gaps.length : 0;
        fvgElement.textContent = `${count} گپ شناسایی شده`;
    }
    
    // Market Structure
    const structureElement = document.getElementById('market-structure');
    if (structureElement) {
        const structure = smcData.market_structure ? smcData.market_structure.structure : 'نامشخص';
        structureElement.textContent = structure;
    }
    
    // BOS Signal
    const bosElement = document.getElementById('bos-signal');
    if (bosElement) {
        const bos = smcData.bos_signal ? smcData.bos_signal.type : 'عدم وجود سیگنال';
        bosElement.textContent = bos;
    }
}

// Load recent signals
function loadRecentSignals() {
    const signalsContainer = document.getElementById('recent-signals');
    if (!signalsContainer) return;
    
    showLoadingState('recent-signals');
    
    // This would typically fetch from an API endpoint
    // For now, we'll use the existing data from the page
    hideLoadingState('recent-signals');
}

// Update system status
function updateSystemStatus() {
    const statusElements = {
        'bot-status': { status: 'online', text: 'فعال' },
        'telegram-status': { status: 'online', text: 'متصل' },
        'database-status': { status: 'online', text: 'آنلاین' },
        'scheduler-status': { status: 'online', text: 'فعال' }
    };
    
    Object.keys(statusElements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            const { status, text } = statusElements[id];
            element.innerHTML = `<span class="badge bg-${status === 'online' ? 'success' : 'danger'}">${text}</span>`;
        }
    });
}

// Setup auto-refresh
function setupAutoRefresh() {
    // Refresh market data every 5 minutes
    setInterval(() => {
        loadMarketData();
    }, 5 * 60 * 1000);
    
    // Update timestamp every minute
    setInterval(() => {
        updateLastUpdateTime();
    }, 60 * 1000);
}

// Start live updates
function startLiveUpdates() {
    updateInterval = setInterval(() => {
        if (document.visibilityState === 'visible') {
            loadMarketData();
        }
    }, 30000); // 30 seconds
}

// Setup event listeners
function setupEventListeners() {
    // Page visibility change
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            loadMarketData();
        }
    });
    
    // Window focus
    window.addEventListener('focus', function() {
        loadMarketData();
    });
    
    // Error handling for network issues
    window.addEventListener('online', function() {
        showSuccess('اتصال اینترنت برقرار شد');
        loadMarketData();
    });
    
    window.addEventListener('offline', function() {
        showError('اتصال اینترنت قطع شده است');
    });
}

// Utility functions
function showLoadingState(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        const loader = document.createElement('div');
        loader.className = 'text-center p-3';
        loader.innerHTML = '<div class="spinner-gold"></div>';
        container.appendChild(loader);
    }
}

function hideLoadingState(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        const loaders = container.querySelectorAll('.spinner-gold');
        loaders.forEach(loader => {
            loader.parentElement.remove();
        });
    }
}

function showError(message) {
    showNotification(message, 'danger');
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; left: 20px; z-index: 1050; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function updateLastUpdateTime() {
    const elements = document.querySelectorAll('#last-update, #last-update-time');
    const now = new Date();
    const timeString = now.toLocaleTimeString('fa-IR', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    elements.forEach(element => {
        if (element) {
            element.textContent = timeString;
        }
    });
}

// Chart utilities
function createSimpleChart(canvasId, data, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    
    const ctx = canvas.getContext('2d');
    
    const defaultOptions = {
        responsive: true,
        plugins: {
            legend: {
                labels: {
                    color: 'white'
                }
            }
        },
        scales: {
            y: {
                ticks: { color: 'white' },
                grid: { color: 'rgba(255,255,255,0.1)' }
            },
            x: {
                ticks: { color: 'white' },
                grid: { color: 'rgba(255,255,255,0.1)' }
            }
        }
    };
    
    return new Chart(ctx, {
        ...data,
        options: { ...defaultOptions, ...options }
    });
}

// Signal management functions
function approveSignal(signalId) {
    if (!confirm('آیا از تأیید این سیگنال اطمینان دارید؟')) {
        return;
    }
    
    fetch(`/api/approve_signal/${signalId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showSuccess('سیگنال با موفقیت تأیید شد!');
            setTimeout(() => window.location.reload(), 1500);
        } else {
            showError('خطا در تأیید سیگنال: ' + data.error);
        }
    })
    .catch(error => {
        showError('خطا در ارتباط با سرور');
        console.error('Error:', error);
    });
}

function rejectSignal(signalId) {
    if (!confirm('آیا از رد این سیگنال اطمینان دارید؟')) {
        return;
    }
    
    fetch(`/api/reject_signal/${signalId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showSuccess('سیگنال رد شد');
            setTimeout(() => window.location.reload(), 1500);
        } else {
            showError('خطا در رد سیگنال: ' + data.error);
        }
    })
    .catch(error => {
        showError('خطا در ارتباط با سرور');
        console.error('Error:', error);
    });
}

// Format price with proper locale
function formatPrice(price, decimals = 2) {
    if (typeof price !== 'number') {
        return '--';
    }
    
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(price);
}

// Format Persian date/time
function formatPersianDateTime(date) {
    if (!date) return '--';
    
    const d = new Date(date);
    return d.toLocaleDateString('fa-IR') + ' ' + d.toLocaleTimeString('fa-IR', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Clean up when page unloads
window.addEventListener('beforeunload', function() {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
});

// Export functions for global use
window.GoldBot = {
    loadMarketData,
    approveSignal,
    rejectSignal,
    showSuccess,
    showError,
    formatPrice,
    formatPersianDateTime
};
