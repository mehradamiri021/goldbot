import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Clock, BarChart3 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Analysis() {
  const { toast } = useToast();
  const [lastTestRun, setLastTestRun] = useState<string | null>(null);

  // Test morning analysis
  const morningTestMutation = useMutation({
    mutationFn: () => apiRequest("/api/actions/test-morning-analysis", { method: "POST" }),
    onSuccess: () => {
      setLastTestRun(`تست صبحانه: ${new Date().toLocaleTimeString('fa-IR')}`);
      toast({
        title: "موفق",
        description: "تست تحلیل صبحانه ارسال شد",
      });
    },
    onError: (error) => {
      toast({
        title: "خطا",
        description: "خطا در ارسال تست تحلیل صبحانه",
        variant: "destructive",
      });
    },
  });

  // Test afternoon analysis
  const afternoonTestMutation = useMutation({
    mutationFn: () => apiRequest("/api/actions/test-afternoon-analysis", { method: "POST" }),
    onSuccess: () => {
      setLastTestRun(`تست عصرانه: ${new Date().toLocaleTimeString('fa-IR')}`);
      toast({
        title: "موفق",
        description: "تست تحلیل عصرانه ارسال شد",
      });
    },
    onError: (error) => {
      toast({
        title: "خطا",
        description: "خطا در ارسال تست تحلیل عصرانه",
        variant: "destructive",
      });
    },
  });

  // Test weekly analysis
  const weeklyTestMutation = useMutation({
    mutationFn: () => apiRequest("/api/actions/test-weekly-analysis", { method: "POST" }),
    onSuccess: () => {
      setLastTestRun(`تست هفتگی: ${new Date().toLocaleTimeString('fa-IR')}`);
      toast({
        title: "موفق",
        description: "تست تحلیل هفتگی ارسال شد",
      });
    },
    onError: (error) => {
      toast({
        title: "خطا",
        description: "خطا در ارسال تست تحلیل هفتگی",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">ربات تحلیل‌گر هوشمند</h1>
        <Badge variant="outline" className="text-sm">
          📊 Bot 1: Analysis Bot
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تحلیل صبحانه</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">10:10</div>
            <p className="text-xs text-muted-foreground">
              دوشنبه تا جمعه
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تحلیل عصرانه</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">16:16</div>
            <p className="text-xs text-muted-foreground">
              دوشنبه تا جمعه
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">اخبار هفتگی</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">10:10</div>
            <p className="text-xs text-muted-foreground">
              یکشنبه‌ها
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تحلیل هفتگی</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">16:16</div>
            <p className="text-xs text-muted-foreground">
              یکشنبه‌ها
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🌅 تحلیل صبحانه
              <Badge variant="secondary">Daily</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              تحلیل تکنیکال + اخبار مهم روز برای بازار طلا
            </p>
            <ul className="text-sm space-y-1">
              <li>• روند بازار و سطوح کلیدی</li>
              <li>• تحلیل Smart Money</li>
              <li>• الگوهای Price Action</li>
              <li>• اخبار مؤثر بر طلا</li>
            </ul>
            <Button 
              onClick={() => morningTestMutation.mutate()}
              disabled={morningTestMutation.isPending}
              className="w-full"
              data-testid="button-test-morning"
            >
              {morningTestMutation.isPending ? "در حال ارسال..." : "تست تحلیل صبحانه"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🌆 تحلیل عصرانه
              <Badge variant="secondary">Intraday</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              بروزرسانی وضعیت بازار و اخبار جدید
            </p>
            <ul className="text-sm space-y-1">
              <li>• تغییرات اینترادی</li>
              <li>• اخبار جدید (6 ساعت اخیر)</li>
              <li>• تحلیل H4 و H1</li>
              <li>• پیش‌بینی شب</li>
            </ul>
            <Button 
              onClick={() => afternoonTestMutation.mutate()}
              disabled={afternoonTestMutation.isPending}
              className="w-full"
              data-testid="button-test-afternoon"
            >
              {afternoonTestMutation.isPending ? "در حال ارسال..." : "تست تحلیل عصرانه"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📰 تحلیل هفتگی
            <Badge variant="secondary">Weekly</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            اخبار اقتصادی هفته + تحلیل تکنیکال هفتگی
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">📅 اخبار هفتگی (یکشنبه 10:10)</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• تقویم اقتصادی</li>
                <li>• رویدادهای مهم</li>
                <li>• تأثیر بر بازار طلا</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">📈 تحلیل هفتگی (یکشنبه 16:16)</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• چارت‌های Weekly, Daily, H4</li>
                <li>• روند کلی بازار</li>
                <li>• چشم‌انداز هفته آینده</li>
              </ul>
            </div>
          </div>
          <Button 
            onClick={() => weeklyTestMutation.mutate()}
            disabled={weeklyTestMutation.isPending}
            className="w-full"
            data-testid="button-test-weekly"
          >
            {weeklyTestMutation.isPending ? "در حال ارسال..." : "تست تحلیل هفتگی"}
          </Button>
        </CardContent>
      </Card>

      {lastTestRun && (
        <Card className="bg-green-50 dark:bg-green-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">آخرین تست:</span>
              <span className="text-sm text-muted-foreground">{lastTestRun}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-blue-50 dark:bg-blue-950">
        <CardHeader>
          <CardTitle className="text-lg">📊 ویژگی‌های ربات تحلیل‌گر</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">🔍 منابع تحلیل</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• ForexFactory - اخبار لحظه‌ای</li>
                <li>• FXStreet - تحلیل‌های تخصصی</li>
                <li>• تحلیل Price Action</li>
                <li>• الگوریتم Smart Money</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">⏰ زمان‌بندی دقیق</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• دوشنبه-جمعه: 10:10, 16:16</li>
                <li>• یکشنبه: 10:10, 16:16</li>
                <li>• زمان تهران (Asia/Tehran)</li>
                <li>• فعال 24/7 با cron scheduler</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}