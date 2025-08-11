import plotly.graph_objects as go
import plotly.offline as pyo
from plotly.subplots import make_subplots
import pandas as pd
import numpy as np
from datetime import datetime
import os
import logging

logger = logging.getLogger(__name__)

class ChartGenerator:
    def __init__(self):
        self.chart_dir = "static/charts"
        os.makedirs(self.chart_dir, exist_ok=True)
    
    def create_candlestick_chart(self, df, title="XAUUSD Chart", indicators=None, smc_data=None):
        """Create professional candlestick chart with indicators"""
        try:
            if df.empty:
                logger.warning("Empty dataframe provided for chart generation")
                return None
            
            # Create subplots
            fig = make_subplots(
                rows=3, cols=1,
                subplot_titles=[title, 'RSI', 'Volume'],
                vertical_spacing=0.05,
                row_heights=[0.7, 0.2, 0.1],
                specs=[[{"secondary_y": False}],
                       [{"secondary_y": False}],
                       [{"secondary_y": False}]]
            )
            
            # Main candlestick chart
            fig.add_trace(
                go.Candlestick(
                    x=df['timestamp'],
                    open=df['open'],
                    high=df['high'],
                    low=df['low'],
                    close=df['close'],
                    name='XAUUSD',
                    increasing_line_color='#26a69a',
                    decreasing_line_color='#ef5350'
                ),
                row=1, col=1
            )
            
            # Add technical indicators
            if indicators:
                # Moving averages
                if 'ma20' in indicators:
                    ma20 = indicators['ma20']
                    fig.add_trace(
                        go.Scatter(
                            x=df['timestamp'],
                            y=ma20,
                            mode='lines',
                            name='MA20',
                            line=dict(color='orange', width=1)
                        ),
                        row=1, col=1
                    )
                
                if 'ma50' in indicators:
                    ma50 = indicators['ma50']
                    fig.add_trace(
                        go.Scatter(
                            x=df['timestamp'],
                            y=ma50,
                            mode='lines',
                            name='MA50',
                            line=dict(color='blue', width=1)
                        ),
                        row=1, col=1
                    )
                
                # Bollinger Bands
                if 'bb_upper' in indicators and 'bb_lower' in indicators:
                    fig.add_trace(
                        go.Scatter(
                            x=df['timestamp'],
                            y=indicators['bb_upper'],
                            mode='lines',
                            name='BB Upper',
                            line=dict(color='rgba(128,128,128,0.3)', width=1),
                            showlegend=False
                        ),
                        row=1, col=1
                    )
                    
                    fig.add_trace(
                        go.Scatter(
                            x=df['timestamp'],
                            y=indicators['bb_lower'],
                            mode='lines',
                            name='BB Lower',
                            fill='tonexty',
                            fillcolor='rgba(128,128,128,0.1)',
                            line=dict(color='rgba(128,128,128,0.3)', width=1),
                            showlegend=False
                        ),
                        row=1, col=1
                    )
                
                # Support and Resistance levels
                if 'support_resistance' in indicators:
                    sr = indicators['support_resistance']
                    
                    # Resistance levels
                    for level in sr.get('resistance', []):
                        fig.add_hline(
                            y=level,
                            line_dash="dash",
                            line_color="red",
                            opacity=0.7,
                            row=1, col=1
                        )
                    
                    # Support levels
                    for level in sr.get('support', []):
                        fig.add_hline(
                            y=level,
                            line_dash="dash",
                            line_color="green",
                            opacity=0.7,
                            row=1, col=1
                        )
                
                # RSI
                if 'rsi' in indicators:
                    rsi = indicators['rsi']
                    fig.add_trace(
                        go.Scatter(
                            x=df['timestamp'],
                            y=rsi,
                            mode='lines',
                            name='RSI',
                            line=dict(color='purple', width=2)
                        ),
                        row=2, col=1
                    )
                    
                    # RSI levels
                    fig.add_hline(y=70, line_dash="dash", line_color="red", opacity=0.5, row=2, col=1)
                    fig.add_hline(y=30, line_dash="dash", line_color="green", opacity=0.5, row=2, col=1)
                    fig.add_hline(y=50, line_dash="dash", line_color="gray", opacity=0.3, row=2, col=1)
            
            # Add Smart Money Concepts
            if smc_data:
                # Order Blocks
                for ob in smc_data.get('order_blocks', []):
                    color = 'rgba(0,255,0,0.3)' if ob['type'] == 'bullish' else 'rgba(255,0,0,0.3)'
                    fig.add_shape(
                        type="rect",
                        x0=ob['timestamp'],
                        x1=df['timestamp'].iloc[-1],
                        y0=ob['low'],
                        y1=ob['high'],
                        fillcolor=color,
                        opacity=0.3,
                        line=dict(width=0),
                        row=1, col=1
                    )
                
                # Fair Value Gaps
                for fvg in smc_data.get('fair_value_gaps', []):
                    color = 'rgba(255,165,0,0.3)' if fvg['type'] == 'bullish' else 'rgba(255,0,255,0.3)'
                    fig.add_shape(
                        type="rect",
                        x0=fvg['timestamp'],
                        x1=df['timestamp'].iloc[-1],
                        y0=fvg['bottom'],
                        y1=fvg['top'],
                        fillcolor=color,
                        opacity=0.2,
                        line=dict(width=1, color=color.replace('0.3', '0.8')),
                        row=1, col=1
                    )
                
                # Liquidity zones
                for lz in smc_data.get('liquidity_zones', []):
                    color = 'blue' if lz['type'] == 'buy_side' else 'red'
                    fig.add_hline(
                        y=lz['price'],
                        line_dash="dot",
                        line_color=color,
                        opacity=0.6,
                        row=1, col=1
                    )
            
            # Volume
            colors = ['red' if close < open else 'green' 
                     for close, open in zip(df['close'], df['open'])]
            
            fig.add_trace(
                go.Bar(
                    x=df['timestamp'],
                    y=df['volume'] if 'volume' in df.columns else [1]*len(df),
                    name='Volume',
                    marker_color=colors,
                    opacity=0.7
                ),
                row=3, col=1
            )
            
            # Update layout
            fig.update_layout(
                title=dict(
                    text=title,
                    x=0.5,
                    font=dict(size=16, color='white')
                ),
                xaxis_rangeslider_visible=False,
                template='plotly_dark',
                height=800,
                showlegend=True,
                legend=dict(
                    yanchor="top",
                    y=0.99,
                    xanchor="left",
                    x=0.01
                )
            )
            
            # Update axes
            fig.update_xaxes(showgrid=True, gridwidth=0.5, gridcolor='rgba(128,128,128,0.2)')
            fig.update_yaxes(showgrid=True, gridwidth=0.5, gridcolor='rgba(128,128,128,0.2)')
            
            # Save chart
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"chart_{timestamp}.html"
            filepath = os.path.join(self.chart_dir, filename)
            
            fig.write_html(filepath, include_plotlyjs='cdn')
            
            return filepath
            
        except Exception as e:
            logger.error(f"Error creating chart: {e}")
            return None
    
    def create_analysis_chart_image(self, df, analysis_data):
        """Create chart image for Telegram"""
        try:
            # This would typically generate a PNG image for Telegram
            # For now, we'll create an HTML chart and return the path
            indicators = analysis_data.get('technical_indicators', {})
            smc_data = analysis_data.get('smc_data', {})
            
            title = f"Gold Analysis - {datetime.now().strftime('%Y-%m-%d %H:%M')}"
            
            return self.create_candlestick_chart(df, title, indicators, smc_data)
            
        except Exception as e:
            logger.error(f"Error creating analysis chart: {e}")
            return None

# Global instance
chart_generator = ChartGenerator()

def generate_chart(df, title="XAUUSD Chart", indicators=None, smc_data=None):
    """Convenience function to generate chart"""
    return chart_generator.create_candlestick_chart(df, title, indicators, smc_data)

def generate_analysis_chart(df, analysis_data):
    """Convenience function to generate analysis chart"""
    return chart_generator.create_analysis_chart_image(df, analysis_data)
