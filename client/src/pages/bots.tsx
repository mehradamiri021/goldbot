import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Bots() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: botStatuses, isLoading } = useQuery({
    queryKey: ["/api/bots/status"],
    refetchInterval: false,
  });

  const { data: recentLogs } = useQuery({
    queryKey: ["/api/logs"],
    refetchInterval: false,
  });

  const startBotMutation = useMutation({
    mutationFn: async (botName: string) => {
      const response = await apiRequest("POST", `/api/bots/${botName}/start`, {});
      return response.json();
    },
    onSuccess: (data, botName) => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots/status"] });
      toast({
        title: "ربات راه‌اندازی شد",
        description: `ربات ${botName} با موفقیت راه‌اندازی شد`,
      });
    },
    onError: (error, botName) => {
      toast({
        title: "خطا در راه‌اندازی ربات",
        description: `خطا در راه‌اندازی ${botName}: ${error}`,
        variant: "destructive",
      });
    },
  });

  const stopBotMutation = useMutation({
    mutationFn: async (botName: string) => {
      const response = await apiRequest("POST", `/api/bots/${botName}/stop`, {});
      return response.json();
    },
    onSuccess: (data, botName) => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots/status"] });
      toast({
        title: "ربات متوقف شد",
        description: `ربات ${botName} با موفقیت متوقف شد`,
      });
    },
    onError: (error, botName) => {
      toast({
        title: "خطا در توقف ربات",
        description: `خطا در توقف ${botName}: ${error}`,
        variant: "destructive",
      });
    },
  });

  const getBotTitle = (botName: string) => {
    switch (botName) {
      case "analysis-bot":
        return "ربات تحلیل‌گر هوشمند";
      case "signal-bot":
        return "ربات سیگنال‌دهی XAUUSD";
      case "price-bot":
        return "ربات اعلام‌دهنده قیمت";
      case "main-bot":
        return "ربات اصلی (کنترلر مرکزی)";
      default:
        return botName;
    }
  };

  const getBotDescription = (botName: string) => {
    switch (botName) {
      case "analysis-bot":
        return "تحلیل اخبار و چارت‌های تکنیکال، ارسال گزارش‌های روزانه و هفتگی";
      case "signal-bot":
        return "تحلیل Price Action و Smart Money، تولید سیگنال‌های خرید/فروش";
      case "price-bot":
        return "دریافت و اعلام قیمت‌های لحظه‌ای از API نوسان و کانال ZaryaalGold";
      case "main-bot":
        return "کنترل و مانیتورینگ سایر ربات‌ها، پنل مدیریت وب";
      default:
        return "";
    }
  };

  const getBotSchedule = (botName: string) => {
    switch (botName) {
      case "analysis-bot":
        return "دوشنبه-جمعه: 10:10 و 16:16 | یکشنبه: 10:10 و 16:16";
      case "signal-bot":
        return "دوشنبه-جمعه، 8:00-21:00، هر 15 دقیقه";
      case "price-bot":
        return "روزهای کاری: 11:11، 14:14، 17:17";
      case "main-bot":
        return "فعال 24/7";
      default:
        return "";
    }
  };

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

  const getStatusText = (status: string) => {
    switch (status) {
      case "running":
        return "فعال";
      case "stopped":
        return "متوقف";
      case "error":
        return "خطا";
      default:
        return status;
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "bg-red-500/20 text-red-400";
      case "warning":
        return "bg-amber-500/20 text-amber-400";
      case "info":
        return "bg-blue-500/20 text-blue-400";
      default:
        return "bg-slate-500/20 text-slate-400";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-slate-700 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-slate-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-slate-700 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 p-6">
        <div>
          <h1 className="text-2xl font-bold vazir-font">مدیریت ربات‌ها</h1>
          <p className="text-slate-400 vazir-font">کنترل و مانیتورینگ چهار ربات تخصصی سیستم</p>
        </div>
      </header>

      <main className="p-6">
        {/* Bot Status Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {botStatuses?.map((bot: any) => (
            <Card key={bot.botName} className="bg-slate-800 border-slate-700" data-testid={`bot-detail-${bot.botName}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="vazir-font">{getBotTitle(bot.botName)}</CardTitle>
                    <p className="text-sm text-slate-400 vazir-font mt-1">
                      {getBotDescription(bot.botName)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={`${getStatusColor(bot.status)} text-white vazir-font`}
                      data-testid={`bot-status-${bot.botName}`}
                    >
                      {getStatusText(bot.status)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Bot Info */}
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400 vazir-font">زمان‌بندی:</span>
                      <span className="text-sm vazir-font text-left">{getBotSchedule(bot.botName)}</span>
                    </div>
                    {bot.lastRun && (
                      <div className="flex justify-between">
                        <span className="text-slate-400 vazir-font">آخرین اجرا:</span>
                        <span className="text-sm vazir-font" data-testid={`last-run-detail-${bot.botName}`}>
                          {new Date(bot.lastRun).toLocaleString('fa-IR')}
                        </span>
                      </div>
                    )}
                    {bot.errorMessage && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                        <div className="text-red-400 text-sm vazir-font">خطا:</div>
                        <div className="text-red-300 text-xs vazir-font mt-1">{bot.errorMessage}</div>
                      </div>
                    )}
                  </div>

                  {/* Control Buttons */}
                  <div className="flex gap-2 pt-4 border-t border-slate-700">
                    {bot.status === 'running' ? (
                      <Button
                        variant="destructive"
                        onClick={() => stopBotMutation.mutate(bot.botName)}
                        disabled={stopBotMutation.isPending}
                        className="flex-1 vazir-font"
                        data-testid={`stop-bot-${bot.botName}`}
                      >
                        {stopBotMutation.isPending ? "در حال توقف..." : "توقف ربات"}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => startBotMutation.mutate(bot.botName)}
                        disabled={startBotMutation.isPending}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 vazir-font"
                        data-testid={`start-bot-${bot.botName}`}
                      >
                        {startBotMutation.isPending ? "در حال راه‌اندازی..." : "راه‌اندازی ربات"}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 vazir-font"
                      data-testid={`restart-bot-${bot.botName}`}
                    >
                      راه‌اندازی مجدد
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* System Logs */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="vazir-font">لاگ‌های سیستم</CardTitle>
            <p className="text-sm text-slate-400 vazir-font">آخرین فعالیت‌های ربات‌ها</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3" data-testid="system-logs">
              {recentLogs && recentLogs.length > 0 ? (
                recentLogs.slice(0, 20).map((log: any, index: number) => (
                  <div key={log.id || index} className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg" data-testid={`log-item-${index}`}>
                    <Badge className={`${getLogLevelColor(log.level)} vazir-font`}>
                      {log.level.toUpperCase()}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-sm vazir-font">{log.message}</p>
                        <span className="text-xs text-slate-400 vazir-font whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString('fa-IR')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 vazir-font mt-1">منبع: {log.source}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-400 vazir-font py-8">
                  هیچ لاگی یافت نشد
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
