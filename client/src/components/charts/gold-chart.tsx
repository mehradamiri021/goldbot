import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";

declare global {
  interface Window {
    Plotly: any;
  }
}

interface GoldChartProps {
  timeframe?: string;
  height?: number;
}

export default function GoldChart({ timeframe = "H1", height = 300 }: GoldChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  const { data: chartData, isLoading } = useQuery({
    queryKey: ["/api/chart", timeframe],
    refetchInterval: false,
  });

  const { data: latestData } = useQuery({
    queryKey: ["/api/chart/latest"],
    refetchInterval: false,
  });

  useEffect(() => {
    if (!chartData || !chartRef.current || isLoading) return;

    // Load Plotly if not already loaded
    if (!window.Plotly) {
      const script = document.createElement('script');
      script.src = 'https://cdn.plot.ly/plotly-latest.min.js';
      script.onload = () => renderChart();
      document.head.appendChild(script);
    } else {
      renderChart();
    }

    function renderChart() {
      if (!chartData || chartData.length === 0) {
        // Show no data message
        if (chartRef.current) {
          chartRef.current.innerHTML = '<div class="flex items-center justify-center h-full text-slate-400 vazir-font">داده‌ای برای نمایش وجود ندارد</div>';
        }
        return;
      }

      const traces = [{
        x: chartData.map((d: any) => d.datetime),
        close: chartData.map((d: any) => d.close),
        high: chartData.map((d: any) => d.high),
        low: chartData.map((d: any) => d.low),
        open: chartData.map((d: any) => d.open),
        type: 'candlestick',
        name: 'XAUUSD',
        increasing: { line: { color: '#10B981' } },
        decreasing: { line: { color: '#EF4444' } }
      }];

      const layout = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { 
          color: '#E2E8F0', 
          family: 'Vazir, sans-serif',
          size: 12
        },
        xaxis: {
          gridcolor: '#475569',
          showgrid: true,
          zeroline: false,
          color: '#E2E8F0'
        },
        yaxis: {
          gridcolor: '#475569',
          showgrid: true,
          zeroline: false,
          color: '#E2E8F0'
        },
        margin: { l: 50, r: 50, t: 20, b: 50 },
        height: height,
        showlegend: false
      };

      const config = {
        displayModeBar: false,
        responsive: true
      };

      window.Plotly.newPlot(chartRef.current, traces, layout, config);
    }
  }, [chartData, timeframe, height, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-slate-400 vazir-font">در حال بارگذاری چارت...</div>
      </div>
    );
  }

  return (
    <div>
      <div ref={chartRef} style={{ height: `${height}px` }} data-testid="gold-chart" />
      
      {/* Technical Analysis Summary */}
      {latestData && latestData.length > 0 && (
        <div className="grid grid-cols-3 gap-4 text-center mt-4">
          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-emerald-400 vazir-font" data-testid="rsi-value">
              52
            </div>
            <div className="text-sm text-slate-400 vazir-font">RSI (14)</div>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-400 vazir-font" data-testid="support-value">
              2,640
            </div>
            <div className="text-sm text-slate-400 vazir-font">حمایت</div>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-red-400 vazir-font" data-testid="resistance-value">
              2,680
            </div>
            <div className="text-sm text-slate-400 vazir-font">مقاومت</div>
          </div>
        </div>
      )}
    </div>
  );
}
