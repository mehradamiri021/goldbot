import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Clock, TrendingUp, TrendingDown, AlertTriangle, Zap } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface TradingSignal {
  id: number;
  symbol: string;
  type: "BUY" | "SELL";
  entryPrice: number;
  stopLoss: number;
  takeProfit: number[];
  riskReward: number;
  confidence: number;
  analysis: string;
  status: "pending" | "approved" | "rejected" | "sent";
  createdAt: string;
  approvedBy?: string;
}

export default function Signals() {
  const [activeTab, setActiveTab] = useState("pending");
  const queryClient = useQueryClient();

  // دریافت سیگنال‌های امروز
  const { data: todaysSignals = [], isLoading: isLoadingSignals } = useQuery({
    queryKey: ["/api/signals/today"],
  });

  // تست تولید سیگنال
  const testSignalMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/actions/test-signal-generation", "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/signals/today"] });
    },
  });

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="flex items-center gap-1"><Clock className="w-3 h-3" />در انتظار</Badge>;
      case "approved":
        return <Badge variant="default" className="flex items-center gap-1 bg-green-500"><CheckCircle className="w-3 h-3" />تایید شده</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="w-3 h-3" />رد شده</Badge>;
      case "sent":
        return <Badge variant="default" className="flex items-center gap-1 bg-blue-500"><Zap className="w-3 h-3" />ارسال شده</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === "BUY" ? 
      <TrendingUp className="w-4 h-4 text-green-500" /> : 
      <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const filterSignalsByStatus = (signals: TradingSignal[], status: string) => {
    if (status === "pending") return signals.filter(s => s.status === "pending");
    if (status === "active") return signals.filter(s => s.status === "approved" || s.status === "sent");
    if (status === "completed") return signals.filter(s => s.status === "rejected");
    return signals;
  };

  return (
    <div className="container mx-auto py-6 space-y-6" data-testid="signals-page">
      {/* هدر صفحه */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="page-title">مدیریت سیگنال‌ها</h1>
          <p className="text-muted-foreground">ربات سیگنال‌دهی XAUUSD با الگوریتم Smart Money + Price Action</p>
        </div>
        <Button 
          onClick={() => testSignalMutation.mutate()}
          disabled={testSignalMutation.isPending}
          className="flex items-center gap-2"
          data-testid="button-test-signal"
        >
          <Zap className="w-4 h-4" />
          {testSignalMutation.isPending ? "در حال تست..." : "تست تولید سیگنال"}
        </Button>
      </div>

      {/* آمار کلی */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">سیگنال‌های امروز</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stats-today">{todaysSignals.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">در انتظار تایید</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500" data-testid="stats-pending">
              {filterSignalsByStatus(todaysSignals, "pending").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">فعال</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500" data-testid="stats-active">
              {filterSignalsByStatus(todaysSignals, "active").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تکمیل شده</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500" data-testid="stats-completed">
              {filterSignalsByStatus(todaysSignals, "completed").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* پیام تست */}
      {testSignalMutation.isSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            تست تولید سیگنال با موفقیت انجام شد. سیگنال جدید در صورت وجود شرایط مناسب تولید خواهد شد.
          </AlertDescription>
        </Alert>
      )}

      {testSignalMutation.isError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            خطا در تست تولید سیگنال. لطفاً دوباره تلاش کنید.
          </AlertDescription>
        </Alert>
      )}

      {/* تب‌های سیگنال‌ها */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" data-testid="tab-pending">
            در انتظار تایید ({filterSignalsByStatus(todaysSignals, "pending").length})
          </TabsTrigger>
          <TabsTrigger value="active" data-testid="tab-active">
            فعال ({filterSignalsByStatus(todaysSignals, "active").length})
          </TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed">
            تکمیل شده ({filterSignalsByStatus(todaysSignals, "completed").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <PendingSignals signals={filterSignalsByStatus(todaysSignals, "pending")} />
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <ActiveSignals signals={filterSignalsByStatus(todaysSignals, "active")} />
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <CompletedSignals signals={filterSignalsByStatus(todaysSignals, "completed")} />
        </TabsContent>
      </Tabs>

      {/* راهنما */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            راهنمای ربات سیگنال‌دهی
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700 space-y-2">
          <p><strong>زمان‌بندی:</strong> دوشنبه تا جمعه، ساعت 8:00 تا 21:00، هر 15 دقیقه</p>
          <p><strong>الگوریتم:</strong> Smart Money + Price Action + تحلیل AI</p>
          <p><strong>تایید ادمین:</strong> هر سیگنال 5 دقیقه در انتظار تایید می‌ماند</p>
          <p><strong>منبع داده:</strong> فایل‌های MT5 (M15, H1, H4) یا داده‌های نمونه</p>
          <p><strong>حداقل اعتماد:</strong> 70% برای ارسال سیگنال</p>
        </CardContent>
      </Card>
    </div>
  );
}

// کامپوننت سیگنال‌های در انتظار تایید
function PendingSignals({ signals }: { signals: TradingSignal[] }) {
  if (signals.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>هیچ سیگنالی در انتظار تایید نیست</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {signals.map((signal) => (
        <SignalCard key={signal.id} signal={signal} isPending />
      ))}
    </div>
  );
}

// کامپوننت سیگنال‌های فعال
function ActiveSignals({ signals }: { signals: TradingSignal[] }) {
  if (signals.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>هیچ سیگنال فعالی وجود ندارد</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {signals.map((signal) => (
        <SignalCard key={signal.id} signal={signal} />
      ))}
    </div>
  );
}

// کامپوننت سیگنال‌های تکمیل شده
function CompletedSignals({ signals }: { signals: TradingSignal[] }) {
  if (signals.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>هیچ سیگنال تکمیل شده‌ای وجود ندارد</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {signals.map((signal) => (
        <SignalCard key={signal.id} signal={signal} />
      ))}
    </div>
  );
}

// کامپوننت کارت سیگنال
function SignalCard({ signal, isPending = false }: { signal: TradingSignal; isPending?: boolean }) {
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const getTypeIcon = (type: string) => {
    return type === "BUY" ? 
      <TrendingUp className="w-4 h-4 text-green-500" /> : 
      <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="flex items-center gap-1"><Clock className="w-3 h-3" />در انتظار</Badge>;
      case "approved":
        return <Badge variant="default" className="flex items-center gap-1 bg-green-500"><CheckCircle className="w-3 h-3" />تایید شده</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="w-3 h-3" />رد شده</Badge>;
      case "sent":
        return <Badge variant="default" className="flex items-center gap-1 bg-blue-500"><Zap className="w-3 h-3" />ارسال شده</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card className={`${isPending ? 'border-orange-200 bg-orange-50' : ''}`} data-testid={`signal-card-${signal.id}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getTypeIcon(signal.type)}
            <span className={signal.type === "BUY" ? "text-green-600" : "text-red-600"}>
              {signal.type === "BUY" ? "خرید" : "فروش"} {signal.symbol}
            </span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              اعتماد: {signal.confidence}%
            </Badge>
            {getStatusBadge(signal.status)}
          </div>
        </div>
        <CardDescription>
          {new Date(signal.createdAt).toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* جزئیات سیگنال */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">ورود</p>
            <p className="font-mono font-bold text-lg">{formatPrice(signal.entryPrice)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">حد ضرر</p>
            <p className="font-mono font-bold text-lg text-red-500">{formatPrice(signal.stopLoss)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">هدف اول</p>
            <p className="font-mono font-bold text-lg text-green-500">{formatPrice(signal.takeProfit[0])}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">ریسک/ریوارد</p>
            <p className="font-mono font-bold text-lg">1:{signal.riskReward.toFixed(1)}</p>
          </div>
        </div>

        <Separator />

        {/* اهداف سود */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">اهداف سود:</p>
          <div className="grid grid-cols-3 gap-2">
            {signal.takeProfit.map((tp, index) => (
              <div key={index} className="text-center p-2 bg-green-50 rounded border">
                <p className="text-xs text-muted-foreground">TP{index + 1}</p>
                <p className="font-mono font-bold text-green-600">{formatPrice(tp)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* تحلیل */}
        {signal.analysis && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">تحلیل:</p>
            <div className="p-3 bg-gray-50 rounded text-sm whitespace-pre-line">
              {signal.analysis}
            </div>
          </div>
        )}

        {/* دکمه‌های تایید برای سیگنال‌های در انتظار */}
        {isPending && (
          <div className="flex gap-2 pt-2">
            <Button variant="default" size="sm" className="flex-1" data-testid={`button-approve-${signal.id}`}>
              <CheckCircle className="w-4 h-4 mr-2" />
              تایید و ارسال
            </Button>
            <Button variant="outline" size="sm" data-testid={`button-edit-${signal.id}`}>
              ویرایش
            </Button>
            <Button variant="destructive" size="sm" data-testid={`button-reject-${signal.id}`}>
              <XCircle className="w-4 h-4 mr-2" />
              رد
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}