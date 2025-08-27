import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Coins, DollarSign, Bitcoin, Euro, RefreshCw, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Prices() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: prices, isLoading: pricesLoading } = useQuery({
    queryKey: ["/api/prices"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  interface PriceData {
    usd?: number;
    eur?: number;
    cad?: number;
    aed?: number;
    bitcoin?: number;
    ethereum?: number;
    tether?: number;
    gold18k?: number;
    coin?: number;
    // فروش شمش طلا ۹۹۵
    goldUSD?: number;
    goldEUR?: number;
    goldAED?: number;
    goldCNY?: number;
    // خرید شمش طلا ۹۹۵
    buyTomanFree?: number;
    buyTomanCenter?: number;
    buyUSDFree?: number;
    buyUSDGold?: number;
    buyUSDDebt?: number;
    lastUpdated?: string;
    navasanLastUpdate?: string;
    zaryaalLastUpdate?: string;
  }

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
      toast({
        title: "قیمت‌ها بروزرسانی شد",
        description: data?.message || "قیمت‌ها از API نوسان و کانال ZaryaalGold دریافت شد",
      });
    },
    onError: () => {
      toast({
        title: "خطا در بروزرسانی قیمت‌ها",
        description: "لطفاً دوباره تلاش کنید",
        variant: "destructive",
      });
    },
  });

  const testPriceBotMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/actions/test-price-announcement", {});
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "تست ارسال موفق",
        description: "پیام قیمت‌ها به کانال ارسال شد",
      });
    },
    onError: () => {
      toast({
        title: "خطا در تست ارسال",
        description: "لطفاً دوباره تلاش کنید",
        variant: "destructive",
      });
    },
  });

  const formatPrice = (value: number) => {
    if (!value || value === 0) return '0';
    return value.toLocaleString('fa-IR');
  };

  const formatCurrency = (currencyKey: string) => {
    const currencyNames: Record<string, string> = {
      usd: 'دلار آمریکا',
      eur: 'یورو',
      cad: 'دلار کانادا', 
      aed: 'درهم امارات',
      bitcoin: 'بیت‌کوین',
      ethereum: 'اتریوم',
      tether: 'تتر',
      gold18k: 'طلای 18 عیار',
      coin: 'سکه امامی',
      // فروش شمش طلا
      goldUSD: 'فروش شمش (USD)',
      goldEUR: 'فروش شمش (EUR)',
      goldAED: 'فروش شمش (AED)',
      goldCNY: 'فروش شمش (CNY)',
      // خرید شمش طلا
      buyTomanFree: 'خرید (بازار آزاد)',
      buyTomanCenter: 'خرید (مرکز مبادله)',
      buyUSDFree: 'خرید (دلار حواله)',
      buyUSDGold: 'خرید (دلار طلا)',
      buyUSDDebt: 'خرید (دلار رفع تعهدی)'
    };
    return currencyNames[currencyKey] || currencyKey;
  };

  const getCurrencyIcon = (currencyKey: string) => {
    const iconMap: Record<string, JSX.Element> = {
      usd: <DollarSign className="h-4 w-4" />,
      eur: <Euro className="h-4 w-4" />,
      cad: <DollarSign className="h-4 w-4" />,
      aed: <DollarSign className="h-4 w-4" />,
      bitcoin: <span className="text-orange-500">₿</span>,
      ethereum: <span className="text-purple-400">⧫</span>,
      tether: <span className="text-emerald-400">💎</span>,
      gold18k: <span className="text-amber-500">🔶</span>,
      coin: <span className="text-yellow-400">🟡</span>,
      // فروش شمش طلا
      goldUSD: <Coins className="h-4 w-4" />,
      goldEUR: <Coins className="h-4 w-4" />,
      goldAED: <Coins className="h-4 w-4" />,
      goldCNY: <Coins className="h-4 w-4" />,
      // خرید شمش طلا
      buyTomanFree: <Coins className="h-4 w-4 text-green-400" />,
      buyTomanCenter: <Coins className="h-4 w-4 text-green-400" />,
      buyUSDFree: <Coins className="h-4 w-4 text-green-400" />,
      buyUSDGold: <Coins className="h-4 w-4 text-green-400" />,
      buyUSDDebt: <Coins className="h-4 w-4 text-green-400" />
    };
    return iconMap[currencyKey] || <DollarSign className="h-4 w-4" />;
  };

  const getNextScheduledTime = () => {
    const now = new Date();
    const times = [
      { hour: 11, minute: 11 },
      { hour: 14, minute: 14 },
      { hour: 17, minute: 17 }
    ];

    // Check today's remaining times
    for (const time of times) {
      const scheduled = new Date(now);
      scheduled.setHours(time.hour, time.minute, 0, 0);
      
      if (scheduled > now) {
        return scheduled.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
      }
    }

    // If no more times today, return first time tomorrow
    return "11:11 (فردا)";
  };

  if (pricesLoading) {
    return (
      <div className="min-h-screen bg-slate-900 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-slate-700 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-slate-700 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">اعلام قیمت‌های لحظه‌ای</h1>
            <p className="text-slate-400 mt-2">
              ربات قیمت‌گذاری - زمان‌بندی: 11:11، 14:14، 17:17 (شنبه تا پنج‌شنبه)
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-slate-400">آخرین بروزرسانی:</div>
              <div className="text-sm font-medium">
                {prices?.lastUpdated ? 
                  new Date(prices.lastUpdated).toLocaleString('fa-IR') : 
                  'نامشخص'
                }
              </div>
              <div className="text-xs text-slate-500 mt-1">
                ارسال بعدی: {getNextScheduledTime()}
              </div>
            </div>
            <Button 
              onClick={() => updatePricesMutation.mutate()}
              disabled={updatePricesMutation.isPending}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
              data-testid="button-update-prices"
            >
              <RefreshCw className={`h-4 w-4 ${updatePricesMutation.isPending ? 'animate-spin' : ''}`} />
              {updatePricesMutation.isPending ? "در حال بروزرسانی..." : "بروزرسانی قیمت‌ها"}
            </Button>
            <Button 
              onClick={() => testPriceBotMutation.mutate()}
              disabled={testPriceBotMutation.isPending}
              className="gap-2 bg-green-600 hover:bg-green-700"
              data-testid="button-test-price-bot"
              variant="outline"
            >
              <Clock className={`h-4 w-4 ${testPriceBotMutation.isPending ? 'animate-spin' : ''}`} />
              {testPriceBotMutation.isPending ? "در حال ارسال..." : "تست ارسال به کانال"}
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5 text-blue-400" />
                منبع API نوسان
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">وضعیت:</span>
                  <Badge variant={prices?.navasanLastUpdate ? "default" : "destructive"}>
                    {prices?.navasanLastUpdate ? "فعال" : "غیرفعال"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">آخرین بروزرسانی:</span>
                  <span className="text-sm">
                    {prices?.navasanLastUpdate ? 
                      new Date(prices.navasanLastUpdate).toLocaleTimeString('fa-IR') : 
                      'نامشخص'
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Coins className="h-5 w-5 text-yellow-400" />
                کانال ZaryaalGold
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">وضعیت:</span>
                  <Badge variant={prices?.zaryaalLastUpdate ? "default" : "secondary"}>
                    {prices?.zaryaalLastUpdate ? "فعال" : "در حال توسعه"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">آخرین بروزرسانی:</span>
                  <span className="text-sm">
                    {prices?.zaryaalLastUpdate ? 
                      new Date(prices.zaryaalLastUpdate).toLocaleTimeString('fa-IR') : 
                      'نامشخص'
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navasan API Prices */}
        <div>
          <h2 className="text-xl font-bold mb-4">قیمت‌های API نوسان</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(['usd', 'eur', 'cad', 'aed', 'bitcoin', 'ethereum', 'tether', 'gold18k', 'coin'] as const).map((currency) => (
              <Card key={currency} className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getCurrencyIcon(currency)}
                      <span className="font-medium">{formatCurrency(currency)}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      TMN
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      {formatPrice((prices as PriceData)?.[currency] || 0)}
                    </div>
                    <div className="text-sm text-slate-400">
                      تومان
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* فروش شمش طلا (ZaryaalGold) */}
        <div>
          <h2 className="text-xl font-bold mb-4">فروش شمش طلا ۹۹۵ (کانال ZaryaalGold)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(['goldUSD', 'goldEUR', 'goldAED', 'goldCNY'] as const).map((goldType) => (
              <Card key={goldType} className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-yellow-400" />
                      <span className="font-medium">{formatCurrency(goldType)}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {goldType.replace('gold', '').toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      {formatPrice((prices as PriceData)?.[goldType] || 0)}
                    </div>
                    <div className="text-sm text-slate-400">
                      {goldType === 'goldUSD' && 'دلار'}
                      {goldType === 'goldEUR' && 'یورو'}
                      {goldType === 'goldAED' && 'درهم'}
                      {goldType === 'goldCNY' && 'یوان'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* خرید شمش طلا (ZaryaalGold) */}
        <div>
          <h2 className="text-xl font-bold mb-4">خرید شمش طلا ۹۹۵ (کانال ZaryaalGold)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {(['buyTomanFree', 'buyTomanCenter', 'buyUSDFree', 'buyUSDGold', 'buyUSDDebt'] as const).map((buyType) => (
              <Card key={buyType} className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-green-400" />
                      <span className="font-medium text-sm">{formatCurrency(buyType)}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {buyType.includes('Toman') ? 'TMN' : 'USD'}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">
                      {formatPrice((prices as PriceData)?.[buyType] || 0)}
                    </div>
                    <div className="text-sm text-slate-400">
                      {buyType.includes('Toman') ? 'تومان' : 'دلار'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Price Update Schedule */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-400" />
              برنامه زمان‌بندی ارسال قیمت‌ها
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-slate-700 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">11:11</div>
                <div className="text-sm text-slate-400">صبح</div>
              </div>
              <div className="text-center p-4 bg-slate-700 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">14:14</div>
                <div className="text-sm text-slate-400">ظهر</div>
              </div>
              <div className="text-center p-4 bg-slate-700 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">17:17</div>
                <div className="text-sm text-slate-400">عصر</div>
              </div>
            </div>
            <div className="mt-4 text-sm text-slate-400 text-center">
              قیمت‌ها در روزهای کاری (شنبه تا پنج‌شنبه) ارسال می‌شوند
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}