import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Logs() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBot, setSelectedBot] = useState("all");
  const [logLevel, setLogLevel] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ["/api/logs", selectedBot, logLevel],
    refetchInterval: false,
  });

  const { data: logStats } = useQuery({
    queryKey: ["/api/logs/stats"],
    refetchInterval: false,
  });

  const downloadLogsMutation = useMutation({
    mutationFn: async ({ bot, level, date }: { bot: string; level: string; date?: string }) => {
      const params = new URLSearchParams();
      if (bot !== "all") params.append("bot", bot);
      if (level !== "all") params.append("level", level);
      if (date) params.append("date", date);
      
      const response = await fetch(`/api/logs/download?${params.toString()}`);
      if (!response.ok) throw new Error("خطا در دانلود لاگ‌ها");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `logs-${bot}-${level}-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "دانلود موفق",
        description: "فایل لاگ با موفقیت دانلود شد",
      });
    },
    onError: (error) => {
      toast({
        title: "خطا در دانلود",
        description: `خطا: ${error}`,
        variant: "destructive",
      });
    },
  });

  const clearLogsMutation = useMutation({
    mutationFn: async ({ bot, olderThan }: { bot?: string; olderThan?: number }) => {
      const response = await apiRequest("DELETE", "/api/logs/clear", { bot, olderThan });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/logs/stats"] });
      toast({
        title: "لاگ‌ها پاک شد",
        description: "لاگ‌های انتخاب شده با موفقیت پاک شد",
      });
    },
    onError: (error) => {
      toast({
        title: "خطا در پاک کردن لاگ‌ها",
        description: `خطا: ${error}`,
        variant: "destructive",
      });
    },
  });

  const getLogLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error': return 'bg-red-500/20 text-red-400';
      case 'warn': return 'bg-amber-500/20 text-amber-400';
      case 'info': return 'bg-blue-500/20 text-blue-400';
      case 'debug': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const filteredLogs = logs?.filter((log: any) => {
    if (searchTerm && !log.message.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  }) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 p-6">
        <div className="space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-slate-700 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-slate-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-700 rounded w-1/2"></div>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold vazir-font">مدیریت لاگ‌ها</h1>
            <p className="text-slate-400 vazir-font">نظارت بر لاگ‌های سیستم و ربات‌ها</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => refetch()}
              className="bg-blue-500 hover:bg-blue-600 vazir-font"
              data-testid="refresh-logs"
            >
              <i className="fas fa-sync-alt ml-2"></i>
              به‌روزرسانی
            </Button>
            <Button
              onClick={() => downloadLogsMutation.mutate({ bot: selectedBot, level: logLevel })}
              disabled={downloadLogsMutation.isPending}
              className="bg-emerald-500 hover:bg-emerald-600 vazir-font"
              data-testid="download-logs"
            >
              <i className="fas fa-download ml-2"></i>
              {downloadLogsMutation.isPending ? "در حال دانلود..." : "دانلود لاگ‌ها"}
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <i className="fas fa-exclamation-triangle text-red-400"></i>
                </div>
                <div>
                  <h3 className="font-medium vazir-font">خطاها</h3>
                  <p className="text-2xl font-bold text-red-400" data-testid="error-count">
                    {logStats?.error_count || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <i className="fas fa-exclamation-circle text-amber-400"></i>
                </div>
                <div>
                  <h3 className="font-medium vazir-font">هشدارها</h3>
                  <p className="text-2xl font-bold text-amber-400" data-testid="warning-count">
                    {logStats?.warning_count || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <i className="fas fa-info-circle text-blue-400"></i>
                </div>
                <div>
                  <h3 className="font-medium vazir-font">اطلاعات</h3>
                  <p className="text-2xl font-bold text-blue-400" data-testid="info-count">
                    {logStats?.info_count || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <i className="fas fa-list text-emerald-400"></i>
                </div>
                <div>
                  <h3 className="font-medium vazir-font">کل لاگ‌ها</h3>
                  <p className="text-2xl font-bold text-emerald-400" data-testid="total-logs">
                    {logStats?.total_count || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-slate-800 border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="vazir-font">فیلترها</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium vazir-font mb-2 block">ربات</label>
                <Select value={selectedBot} onValueChange={setSelectedBot}>
                  <SelectTrigger className="bg-slate-700 border-slate-600" data-testid="bot-filter">
                    <SelectValue placeholder="انتخاب ربات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه ربات‌ها</SelectItem>
                    <SelectItem value="analysis-bot">ربات تحلیل‌گر</SelectItem>
                    <SelectItem value="signal-bot">ربات سیگنال</SelectItem>
                    <SelectItem value="price-bot">ربات قیمت</SelectItem>
                    <SelectItem value="main-bot">ربات اصلی</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium vazir-font mb-2 block">سطح لاگ</label>
                <Select value={logLevel} onValueChange={setLogLevel}>
                  <SelectTrigger className="bg-slate-700 border-slate-600" data-testid="level-filter">
                    <SelectValue placeholder="انتخاب سطح" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه سطوح</SelectItem>
                    <SelectItem value="error">خطا</SelectItem>
                    <SelectItem value="warn">هشدار</SelectItem>
                    <SelectItem value="info">اطلاعات</SelectItem>
                    <SelectItem value="debug">دیباگ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium vazir-font mb-2 block">جستجو در پیام</label>
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="جستجو در لاگ‌ها..."
                  className="bg-slate-700 border-slate-600 text-white vazir-font"
                  data-testid="search-logs"
                />
              </div>

              <div className="flex items-end gap-2">
                <Button
                  onClick={() => clearLogsMutation.mutate({ olderThan: 7 })}
                  disabled={clearLogsMutation.isPending}
                  variant="destructive"
                  className="vazir-font"
                  data-testid="clear-old-logs"
                >
                  <i className="fas fa-trash ml-2"></i>
                  پاک کردن قدیمی‌ها
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Log Entries */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="vazir-font">لاگ‌های سیستم</CardTitle>
            <p className="text-sm text-slate-400 vazir-font">
              نمایش {filteredLogs.length} لاگ از {logs?.length || 0} لاگ
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto" data-testid="logs-container">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log: any, index: number) => (
                  <div
                    key={log.id || index}
                    className="border border-slate-700 rounded-lg p-4 hover:bg-slate-700/30 transition-colors"
                    data-testid={`log-entry-${index}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Badge className={`${getLogLevelColor(log.level)} vazir-font`}>
                          {log.level?.toUpperCase()}
                        </Badge>
                        <Badge className="bg-slate-600/50 text-slate-300 vazir-font">
                          {log.botName || log.source || 'سیستم'}
                        </Badge>
                      </div>
                      <span className="text-xs text-slate-400 vazir-font">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-slate-200 vazir-font mb-2">
                      {log.message}
                    </div>
                    
                    {log.details && (
                      <div className="text-xs text-slate-400 vazir-font bg-slate-900/50 p-2 rounded border-l-2 border-slate-600">
                        <pre className="whitespace-pre-wrap font-mono">
                          {typeof log.details === 'string' ? log.details : JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    )}
                    
                    {log.error && (
                      <div className="text-xs text-red-400 vazir-font bg-red-900/20 p-2 rounded border-l-2 border-red-500 mt-2">
                        <strong>خطا:</strong> {log.error}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-400 vazir-font py-8">
                  <i className="fas fa-file-alt text-4xl mb-4 block"></i>
                  هیچ لاگی یافت نشد
                  <p className="text-sm mt-2">فیلترهای خود را تغییر دهید یا منتظر لاگ‌های جدید باشید</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Log Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="vazir-font">مدیریت فایل‌های لاگ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div>
                    <div className="font-medium vazir-font">لاگ‌های امروز</div>
                    <div className="text-sm text-slate-400 vazir-font">تمام فعالیت‌های امروز</div>
                  </div>
                  <Button
                    onClick={() => downloadLogsMutation.mutate({ 
                      bot: "all", 
                      level: "all", 
                      date: new Date().toISOString().split('T')[0] 
                    })}
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 vazir-font"
                    data-testid="download-today"
                  >
                    دانلود
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div>
                    <div className="font-medium vazir-font">فقط خطاها</div>
                    <div className="text-sm text-slate-400 vazir-font">لاگ‌های خطا و هشدار</div>
                  </div>
                  <Button
                    onClick={() => downloadLogsMutation.mutate({ bot: "all", level: "error" })}
                    size="sm"
                    className="bg-red-500 hover:bg-red-600 vazir-font"
                    data-testid="download-errors"
                  >
                    دانلود
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div>
                    <div className="font-medium vazir-font">لاگ‌های ربات سیگنال</div>
                    <div className="text-sm text-slate-400 vazir-font">فعالیت‌های سیگنال‌دهی</div>
                  </div>
                  <Button
                    onClick={() => downloadLogsMutation.mutate({ bot: "signal-bot", level: "all" })}
                    size="sm"
                    className="bg-emerald-500 hover:bg-emerald-600 vazir-font"
                    data-testid="download-signals"
                  >
                    دانلود
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="vazir-font">تنظیمات نگهداری</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-slate-600 rounded-lg">
                  <h4 className="font-medium vazir-font mb-2">پاک‌سازی خودکار</h4>
                  <p className="text-sm text-slate-400 vazir-font mb-3">
                    لاگ‌های قدیمی‌تر از مدت مشخص شده حذف می‌شوند
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => clearLogsMutation.mutate({ olderThan: 30 })}
                      size="sm"
                      className="vazir-font"
                      data-testid="clear-30-days"
                    >
                      حذف +۳۰ روز
                    </Button>
                    <Button
                      onClick={() => clearLogsMutation.mutate({ olderThan: 7 })}
                      size="sm"
                      className="vazir-font"
                      data-testid="clear-7-days"
                    >
                      حذف +۷ روز
                    </Button>
                  </div>
                </div>

                <div className="p-4 border border-slate-600 rounded-lg">
                  <h4 className="font-medium vazir-font mb-2">آرشیو</h4>
                  <p className="text-sm text-slate-400 vazir-font mb-3">
                    لاگ‌های مهم را برای نگهداری طولانی‌مدت دانلود کنید
                  </p>
                  <Button
                    onClick={() => downloadLogsMutation.mutate({ bot: "all", level: "all" })}
                    size="sm"
                    className="w-full bg-purple-500 hover:bg-purple-600 vazir-font"
                    data-testid="archive-all"
                  >
                    <i className="fas fa-archive ml-2"></i>
                    آرشیو کامل
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}