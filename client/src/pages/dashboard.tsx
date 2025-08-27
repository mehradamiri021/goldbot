import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Zap,
  AlertTriangle,
  RefreshCw,
  Bot,
  Signal,
  BarChart3,
  Server
} from "lucide-react";

interface BotStatus {
  id: number;
  botName: string;
  status: "running" | "stopped" | "error";
  lastRun?: string;
  errorMessage?: string;
  updatedAt: string;
}

interface PriceData {
  usd: number;
  eur: number;
  cad: number;
  aed: number;
  bitcoin: number;
  ethereum: number;
  tether: number;
  gold18k: number;
  coin: number;
  goldBar?: {
    usd?: number;
    eur?: number;
    aed?: number;
    cny?: number;
  };
}

interface TradingSignal {
  id: number;
  symbol: string;
  type: "BUY" | "SELL";
  entryPrice: number;
  confidence: number;
  status: "pending" | "approved" | "rejected" | "sent";
  createdAt: string;
}

export default function Dashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // دریافت وضعیت ربات‌ها
  const { data: botStatuses = [], isLoading: botStatusesLoading } = useQuery<BotStatus[]>({
    queryKey: ["/api/bots/status"],
    refetchInterval: 30000,
  });

  // دریافت سیگنال‌های در انتظار
  const { data: pendingSignals = [] } = useQuery<TradingSignal[]>({
    queryKey: ["/api/signals/pending"],
    refetchInterval: 15000,
  });

  // دریافت سیگنال‌های امروز
  const { data: todaySignals = [] } = useQuery<TradingSignal[]>({
    queryKey: ["/api/signals/today"],
    refetchInterval: 30000,
  });

  // دریافت آخرین قیمت‌ها - همان endpoint صفحه prices
  const { data: latestPrices } = useQuery<PriceData>({
    queryKey: ["/api/prices"],
    refetchInterval: 30000, // همان فاصله صفحه prices
  });

  // دریافت آخرین اخبار
  const { data: latestNews = [] } = useQuery<any[]>({
    queryKey: ["/api/news"],
    refetchInterval: 300000,
  });

  // تست ارسال قیمت‌ها
  const sendPricesMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/actions/test-price-announcement", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "خطا در ارسال");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "قیمت‌ها ارسال شد",
        description: data?.message || "قیمت‌ها با موفقیت به کانال ارسال شد",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطا در ارسال قیمت‌ها",
        description: error?.message || "خطا در ارسال قیمت‌ها",
        variant: "destructive",
      });
    },
  });

  // به‌روزرسانی قیمت‌ها
  const updatePricesMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/actions/update-prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.details || "خطا در بروزرسانی");
      }
      return response.json();
    },
    onSuccess: (data) => {
      // بروزرسانی cache هر دو صفحه
      queryClient.invalidateQueries({ queryKey: ["/api/prices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/prices/latest"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bots/status"] });
      toast({
        title: "قیمت‌ها بروزرسانی شد",
        description: data?.message || "قیمت‌ها از منابع به‌روزرسانی شدند",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطا در بروزرسانی",
        description: error?.message || "خطا در بروزرسانی قیمت‌ها",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-emerald-500";
      case "stopped":
        return "bg-slate-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-amber-500";
    }
  };

  const getBotIcon = (botName: string) => {
    switch (botName) {
      case "analysis-bot":
        return BarChart3;
      case "signal-bot":
        return Signal;
      case "price-bot":
        return DollarSign;
      case "main-bot":
        return Server;
      default:
        return Bot;
    }
  };

  const getBotTitle = (botName: string) => {
    switch (botName) {
      case "analysis-bot":
        return "ربات تحلیل‌گر";
      case "signal-bot":
        return "ربات سیگنال";
      case "price-bot":
        return "ربات قیمت";
      case "main-bot":
        return "کنترلر مرکزی";
      default:
        return botName;
    }
  };

  const getBotDescription = (botName: string) => {
    switch (botName) {
      case "analysis-bot":
        return "تحلیل هوشمند بازار";
      case "signal-bot":
        return "سیگنال‌دهی XAUUSD";
      case "price-bot":
        return "اعلام قیمت‌ها";
      case "main-bot":
        return "مدیریت کلی سیستم";
      default:
        return "";
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('fa-IR').format(price);
  };

  const currentTime = new Date().toLocaleString('fa-IR', { 
    timeZone: 'Asia/Tehran',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-slate-900 text-white" data-testid="dashboard-page">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">داشبورد کنترل</h1>
            <p className="text-slate-400" data-testid="current-time">{currentTime}</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Telegram Channel Status */}
            <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-2 rounded-lg">
              <Bot className="w-4 h-4 text-blue-400" />
              <span className="text-sm">@gold_analysis021_bot</span>
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={() => updatePricesMutation.mutate()}
                disabled={updatePricesMutation.isPending}
                size="sm"
                variant="outline"
                data-testid="button-update-prices"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${updatePricesMutation.isPending ? 'animate-spin' : ''}`} />
                بروزرسانی قیمت‌ها
              </Button>
              
              <Button 
                onClick={() => sendPricesMutation.mutate()}
                disabled={sendPricesMutation.isPending}
                size="sm"
                data-testid="button-send-prices"
              >
                <Zap className="w-4 h-4 mr-2" />
                ارسال قیمت‌ها
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-6">
        {/* Status Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {botStatusesLoading ? (
            // Loading skeletons
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            botStatuses.map((bot) => {
              const IconComponent = getBotIcon(bot.botName);
              return (
                <Card key={bot.botName} className="bg-slate-800 border-slate-700" data-testid={`bot-card-${bot.botName}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-medium">{getBotTitle(bot.botName)}</h3>
                          <p className="text-sm text-slate-400">{getBotDescription(bot.botName)}</p>
                        </div>
                      </div>
                      <div className={`w-3 h-3 ${getStatusColor(bot.status)} rounded-full`} data-testid={`status-${bot.botName}`}></div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">وضعیت:</span>
                        <span data-testid={`status-text-${bot.botName}`}>
                          {bot.status === 'running' ? 'فعال' : bot.status === 'stopped' ? 'متوقف' : 'خطا'}
                        </span>
                      </div>
                      {bot.lastRun && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">آخرین اجرا:</span>
                          <span data-testid={`last-run-${bot.botName}`}>
                            {new Date(bot.lastRun).toLocaleTimeString('fa-IR')}
                          </span>
                        </div>
                      )}
                    </div>
                    {bot.status === 'error' && bot.errorMessage && (
                      <div className="mt-3 p-2 bg-red-500/10 rounded text-xs text-red-400">
                        {bot.errorMessage}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* آمار کلی */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">سیگنال‌های امروز</CardTitle>
              <Signal className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stats-today-signals">{todaySignals.length}</div>
              <p className="text-xs text-muted-foreground">
                {pendingSignals.length} در انتظار تایید
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">اخبار مهم</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stats-news">{latestNews.length}</div>
              <p className="text-xs text-muted-foreground">
                آخرین بروزرسانی
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">قیمت طلا 18 عیار</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="price-gold18k">
                {latestPrices?.gold18k ? `${formatPrice(latestPrices.gold18k)} تومان` : 'در حال بارگذاری...'}
              </div>
              <p className="text-xs text-muted-foreground">
                هر گرم
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">قیمت سکه</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="price-coin">
                {latestPrices?.coin ? `${formatPrice(latestPrices.coin)} تومان` : 'در حال بارگذاری...'}
              </div>
              <p className="text-xs text-muted-foreground">
                سکه امامی
              </p>
            </CardContent>
          </Card>
        </div>

        {/* دو ستون: قیمت‌ها و سیگنال‌ها */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* کارت قیمت‌ها */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  قیمت‌های بازار
                </CardTitle>
                <Button 
                  onClick={() => updatePricesMutation.mutate()}
                  disabled={updatePricesMutation.isPending}
                  size="sm"
                  variant="ghost"
                  data-testid="button-refresh-prices"
                >
                  <RefreshCw className={`w-4 h-4 ${updatePricesMutation.isPending ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {latestPrices ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded">
                    <span className="flex items-center gap-2">
                      💵 دلار آمریکا
                    </span>
                    <span className="font-mono font-bold" data-testid="price-usd">
                      {formatPrice(latestPrices.usd)} تومان
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded">
                    <span className="flex items-center gap-2">
                      💶 یورو
                    </span>
                    <span className="font-mono font-bold" data-testid="price-eur">
                      {formatPrice(latestPrices.eur)} تومان
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded">
                    <span className="flex items-center gap-2">
                      🔶 طلای 18 عیار
                    </span>
                    <span className="font-mono font-bold" data-testid="price-gold">
                      {formatPrice(latestPrices.gold18k)} تومان
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded">
                    <span className="flex items-center gap-2">
                      🟡 سکه امامی
                    </span>
                    <span className="font-mono font-bold" data-testid="price-coin-detail">
                      {formatPrice(latestPrices.coin)} تومان
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded">
                    <span className="flex items-center gap-2">
                      ₿ بیت‌کوین
                    </span>
                    <span className="font-mono font-bold" data-testid="price-bitcoin">
                      {formatPrice(latestPrices.bitcoin)} تومان
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
                  <p>در حال بارگذاری قیمت‌ها...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* کارت سیگنال‌های در انتظار */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                سیگنال‌های در انتظار تایید
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingSignals.length > 0 ? (
                <div className="space-y-3">
                  {pendingSignals.slice(0, 3).map((signal) => (
                    <div key={signal.id} className="p-3 bg-orange-500/10 border border-orange-500/20 rounded" data-testid={`pending-signal-${signal.id}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {signal.type === "BUY" ? 
                            <TrendingUp className="w-4 h-4 text-green-500" /> : 
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          }
                          <span className="font-medium">
                            {signal.type === "BUY" ? "خرید" : "فروش"} {signal.symbol}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {signal.confidence}% اعتماد
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-400">
                        قیمت ورود: {signal.entryPrice}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {new Date(signal.createdAt).toLocaleTimeString('fa-IR')}
                      </div>
                    </div>
                  ))}
                  
                  {pendingSignals.length > 3 && (
                    <div className="text-center text-sm text-slate-400">
                      و {pendingSignals.length - 3} سیگنال دیگر...
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>هیچ سیگنالی در انتظار تایید نیست</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* پیام‌های وضعیت */}
        {sendPricesMutation.isSuccess && (
          <Alert className="border-green-200 bg-green-950/50">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-300">
              قیمت‌ها با موفقیت به کانال ارسال شدند.
            </AlertDescription>
          </Alert>
        )}

        {updatePricesMutation.isSuccess && (
          <Alert className="border-blue-200 bg-blue-950/50">
            <RefreshCw className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-300">
              قیمت‌ها از منابع مختلف بروزرسانی شدند.
            </AlertDescription>
          </Alert>
        )}

        {(sendPricesMutation.isError || updatePricesMutation.isError) && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              خطا در انجام عملیات. لطفاً دوباره تلاش کنید.
            </AlertDescription>
          </Alert>
        )}

        {/* راهنما */}
        <Card className="border-blue-200 bg-blue-950/20 border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-300 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              راهنمای سیستم
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-200/80 space-y-2">
            <p><strong>ربات تحلیل‌گر:</strong> دوشنبه-جمعه 10:10 و 16:16، یکشنبه 10:10 و 16:16</p>
            <p><strong>ربات سیگنال:</strong> دوشنبه-جمعه 8:00-21:00 هر 15 دقیقه</p>
            <p><strong>ربات قیمت:</strong> شنبه-پنج‌شنبه 11:11، 14:14، 17:17</p>
            <p><strong>بارگذاری اخبار:</strong> هر شنبه به صورت دستی برای تحلیل هفتگی</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}