import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("system");

  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/settings"],
    refetchInterval: false,
  });

  const { data: botStatuses } = useQuery({
    queryKey: ["/api/bots/status"],
    refetchInterval: false,
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value, description }: { key: string; value: string; description?: string }) => {
      const response = await apiRequest("POST", "/api/settings", { key, value, description });
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "تنظیمات به‌روزرسانی شد",
        description: `${variables.key} با موفقیت به‌روزرسانی شد`,
      });
    },
    onError: (error) => {
      toast({
        title: "خطا در به‌روزرسانی تنظیمات",
        description: `خطا: ${error}`,
        variant: "destructive",
      });
    },
  });

  const backupMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/actions/backup", {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "بک‌آپ تهیه شد",
        description: "بک‌آپ سیستم با موفقیت تهیه شد",
      });
    },
    onError: (error) => {
      toast({
        title: "خطا در تهیه بک‌آپ",
        description: `خطا: ${error}`,
        variant: "destructive",
      });
    },
  });

  const getSetting = (key: string) => {
    return settings?.find((s: any) => s.key === key);
  };

  const handleSettingUpdate = (key: string, value: string, description?: string) => {
    updateSettingMutation.mutate({ key, value, description });
  };

  const SystemSettings = () => {
    const [telegramToken, setTelegramToken] = useState(getSetting('telegram_bot_token')?.value || '');
    const [channelId, setChannelId] = useState(getSetting('telegram_channel_id')?.value || '');
    const [adminId, setAdminId] = useState(getSetting('admin_telegram_id')?.value || '');
    const [navasanKey, setNavasanKey] = useState(getSetting('navasan_api_key')?.value || '');
    const [mt5Path, setMt5Path] = useState(getSetting('mt5_data_path')?.value || '');

    return (
      <div className="space-y-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="vazir-font">تنظیمات تلگرام</CardTitle>
            <p className="text-sm text-slate-400 vazir-font">پیکربندی ربات تلگرام و کانال‌ها</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="vazir-font">Token ربات تلگرام</Label>
              <Input
                value={telegramToken}
                onChange={(e) => setTelegramToken(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white vazir-font mt-1"
                placeholder="1234567890:ABCdef..."
                data-testid="telegram-token-input"
              />
            </div>
            <div>
              <Label className="vazir-font">شناسه کانال</Label>
              <Input
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white vazir-font mt-1"
                placeholder="-1001234567890"
                data-testid="channel-id-input"
              />
            </div>
            <div>
              <Label className="vazir-font">شناسه ادمین</Label>
              <Input
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white vazir-font mt-1"
                placeholder="1234567890"
                data-testid="admin-id-input"
              />
            </div>
            <Button
              onClick={() => {
                handleSettingUpdate('telegram_bot_token', telegramToken);
                handleSettingUpdate('telegram_channel_id', channelId);
                handleSettingUpdate('admin_telegram_id', adminId);
              }}
              disabled={updateSettingMutation.isPending}
              className="w-full bg-blue-500 hover:bg-blue-600 vazir-font"
              data-testid="save-telegram-settings"
            >
              {updateSettingMutation.isPending ? "در حال ذخیره..." : "ذخیره تنظیمات تلگرام"}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="vazir-font">تنظیمات API</CardTitle>
            <p className="text-sm text-slate-400 vazir-font">کلیدهای API و منابع داده</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="vazir-font">کلید API نوسان</Label>
              <Input
                value={navasanKey}
                onChange={(e) => setNavasanKey(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white vazir-font mt-1"
                placeholder="freeBY5YCsWyaVmR7DSu2QOLTH0KBsbu"
                data-testid="navasan-key-input"
              />
            </div>
            <div>
              <Label className="vazir-font">مسیر فایل‌های MT5</Label>
              <Input
                value={mt5Path}
                onChange={(e) => setMt5Path(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white vazir-font mt-1"
                placeholder="/home/trader/.wine/drive_c/MT5-CX/MQL5/Files/"
                data-testid="mt5-path-input"
              />
            </div>
            <Button
              onClick={() => {
                handleSettingUpdate('navasan_api_key', navasanKey);
                handleSettingUpdate('mt5_data_path', mt5Path);
              }}
              disabled={updateSettingMutation.isPending}
              className="w-full bg-emerald-500 hover:bg-emerald-600 vazir-font"
              data-testid="save-api-settings"
            >
              {updateSettingMutation.isPending ? "در حال ذخیره..." : "ذخیره تنظیمات API"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };

  const BotSettings = () => (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="vazir-font">پیکربندی ربات‌ها</CardTitle>
          <p className="text-sm text-slate-400 vazir-font">تنظیمات زمان‌بندی و عملکرد ربات‌ها</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Analysis Bot Settings */}
            <div className="border border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium vazir-font">ربات تحلیل‌گر</h4>
                  <p className="text-sm text-slate-400 vazir-font">تحلیل اخبار و چارت‌ها</p>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 vazir-font">فعال</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="vazir-font">گزارش صبحگاهی</Label>
                  <Input
                    defaultValue="10:10"
                    className="bg-slate-700 border-slate-600 text-white vazir-font mt-1"
                    data-testid="morning-report-time"
                  />
                </div>
                <div>
                  <Label className="vazir-font">گزارش عصرگاهی</Label>
                  <Input
                    defaultValue="16:16"
                    className="bg-slate-700 border-slate-600 text-white vazir-font mt-1"
                    data-testid="evening-report-time"
                  />
                </div>
              </div>
            </div>

            {/* Signal Bot Settings */}
            <div className="border border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium vazir-font">ربات سیگنال‌دهی</h4>
                  <p className="text-sm text-slate-400 vazir-font">تولید سیگنال‌های XAUUSD</p>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 vazir-font">فعال</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="vazir-font">فاصله بررسی (دقیقه)</Label>
                  <Input
                    defaultValue="15"
                    className="bg-slate-700 border-slate-600 text-white vazir-font mt-1"
                    data-testid="signal-interval"
                  />
                </div>
                <div>
                  <Label className="vazir-font">حداقل اطمینان (%)</Label>
                  <Input
                    defaultValue="70"
                    className="bg-slate-700 border-slate-600 text-white vazir-font mt-1"
                    data-testid="min-confidence"
                  />
                </div>
              </div>
            </div>

            {/* Price Bot Settings */}
            <div className="border border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium vazir-font">ربات اعلام قیمت</h4>
                  <p className="text-sm text-slate-400 vazir-font">ارسال قیمت‌های لحظه‌ای</p>
                </div>
                <Badge className="bg-amber-500/20 text-amber-400 vazir-font">بررسی</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="vazir-font">زمان اول</Label>
                  <Input
                    defaultValue="11:11"
                    className="bg-slate-700 border-slate-600 text-white vazir-font mt-1"
                    data-testid="price-time-1"
                  />
                </div>
                <div>
                  <Label className="vazir-font">زمان دوم</Label>
                  <Input
                    defaultValue="14:14"
                    className="bg-slate-700 border-slate-600 text-white vazir-font mt-1"
                    data-testid="price-time-2"
                  />
                </div>
                <div>
                  <Label className="vazir-font">زمان سوم</Label>
                  <Input
                    defaultValue="17:17"
                    className="bg-slate-700 border-slate-600 text-white vazir-font mt-1"
                    data-testid="price-time-3"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="vazir-font">کنترل کلی ربات‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600 vazir-font" data-testid="start-all-bots">
              <i className="fas fa-play ml-2"></i>
              شروع همه ربات‌ها
            </Button>
            <Button variant="destructive" className="flex-1 vazir-font" data-testid="stop-all-bots">
              <i className="fas fa-stop ml-2"></i>
              توقف همه ربات‌ها
            </Button>
            <Button variant="secondary" className="flex-1 bg-amber-500 hover:bg-amber-600 vazir-font" data-testid="restart-all-bots">
              <i className="fas fa-sync-alt ml-2"></i>
              راه‌اندازی مجدد
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const SystemManagement = () => (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="vazir-font">وضعیت سیستم</CardTitle>
          <p className="text-sm text-slate-400 vazir-font">نظارت بر سلامت و عملکرد سیستم</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* System Health */}
            <div className="space-y-4">
              <h4 className="font-medium vazir-font">وضعیت سرویس‌ها</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
                  <span className="text-sm vazir-font">API نوسان</span>
                  <Badge className="bg-emerald-500/20 text-emerald-400 vazir-font">متصل</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
                  <span className="text-sm vazir-font">فایل‌های MT5</span>
                  <Badge className="bg-emerald-500/20 text-emerald-400 vazir-font">در دسترس</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
                  <span className="text-sm vazir-font">کانال تلگرام</span>
                  <Badge className="bg-emerald-500/20 text-emerald-400 vazir-font">متصل</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
                  <span className="text-sm vazir-font">پایگاه داده</span>
                  <Badge className="bg-emerald-500/20 text-emerald-400 vazir-font">سالم</Badge>
                </div>
              </div>
            </div>

            {/* System Stats */}
            <div className="space-y-4">
              <h4 className="font-medium vazir-font">آمار سیستم</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400 vazir-font">مدت فعالیت:</span>
                  <span className="vazir-font" data-testid="uptime">۲۸ روز</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 vazir-font">کل سیگنال‌ها:</span>
                  <span className="vazir-font" data-testid="total-signals">۱۴۷</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 vazir-font">اعلام قیمت:</span>
                  <span className="vazir-font" data-testid="total-prices">۳۲۱</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 vazir-font">گزارش‌ها:</span>
                  <span className="vazir-font" data-testid="total-reports">۸۹</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="vazir-font">عملیات سیستم</CardTitle>
          <p className="text-sm text-slate-400 vazir-font">بک‌آپ، بازیابی و نگهداری سیستم</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => backupMutation.mutate()}
              disabled={backupMutation.isPending}
              className="bg-purple-500 hover:bg-purple-600 vazir-font"
              data-testid="backup-system"
            >
              <i className="fas fa-download ml-2"></i>
              {backupMutation.isPending ? "در حال تهیه بک‌آپ..." : "تهیه بک‌آپ کامل"}
            </Button>
            <Button variant="secondary" className="bg-slate-600 hover:bg-slate-700 vazir-font" data-testid="clear-logs">
              <i className="fas fa-trash ml-2"></i>
              پاک‌سازی لاگ‌ها
            </Button>
            <Button variant="secondary" className="bg-slate-600 hover:bg-slate-700 vazir-font" data-testid="optimize-db">
              <i className="fas fa-database ml-2"></i>
              بهینه‌سازی پایگاه داده
            </Button>
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 vazir-font" data-testid="system-report">
              <i className="fas fa-file-alt ml-2"></i>
              گزارش وضعیت سیستم
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-red-400 vazir-font">منطقه خطرناک</CardTitle>
          <p className="text-sm text-slate-400 vazir-font">عملیات‌های حساس و بازنشانی</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <h4 className="font-medium text-red-400 mb-2 vazir-font">بازنشانی کامل سیستم</h4>
              <p className="text-sm text-slate-400 mb-4 vazir-font">
                تمام داده‌ها، تنظیمات و تاریخچه پاک خواهد شد. این عملیات غیرقابل بازگشت است.
              </p>
              <Button variant="destructive" className="vazir-font" data-testid="reset-system">
                <i className="fas fa-exclamation-triangle ml-2"></i>
                بازنشانی کامل سیستم
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 p-6">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-700 rounded w-1/2 mb-2"></div>
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
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 p-6">
        <div>
          <h1 className="text-2xl font-bold vazir-font">تنظیمات سیستم</h1>
          <p className="text-slate-400 vazir-font">پیکربندی و مدیریت سیستم ربات‌های تحلیل طلا</p>
        </div>
      </header>

      <main className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-slate-700">
            <TabsTrigger value="system" className="vazir-font" data-testid="tab-system">
              تنظیمات سیستم
            </TabsTrigger>
            <TabsTrigger value="bots" className="vazir-font" data-testid="tab-bots">
              پیکربندی ربات‌ها
            </TabsTrigger>
            <TabsTrigger value="management" className="vazir-font" data-testid="tab-management">
              مدیریت سیستم
            </TabsTrigger>
          </TabsList>

          <TabsContent value="system" className="mt-6">
            <SystemSettings />
          </TabsContent>

          <TabsContent value="bots" className="mt-6">
            <BotSettings />
          </TabsContent>

          <TabsContent value="management" className="mt-6">
            <SystemManagement />
          </TabsContent>
        </Tabs>

        {/* Quick Info */}
        <Card className="bg-slate-800 border-slate-700 mt-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="text-slate-400 vazir-font">نسخه سیستم:</span>
                <span className="vazir-font">v1.0.0</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-slate-400 vazir-font">آخرین بک‌آپ:</span>
                <span className="vazir-font" data-testid="last-backup">
                  {new Date().toLocaleDateString('fa-IR')}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-slate-400 vazir-font">وضعیت:</span>
                <Badge className="bg-emerald-500/20 text-emerald-400 vazir-font">سالم</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
