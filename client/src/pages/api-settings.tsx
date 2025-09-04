import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, CheckCircle, Key, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ApiSettings() {
  const { toast } = useToast();
  const [navasanKey, setNavasanKey] = useState('');
  const [currentKeyStatus, setCurrentKeyStatus] = useState<'unknown' | 'working' | 'quota_exceeded' | 'invalid'>('unknown');

  // Test current API key
  const testCurrentKey = useMutation({
    mutationFn: () => apiRequest('/api/prices/test-navasan'),
    onSuccess: (data) => {
      if (data.success) {
        setCurrentKeyStatus('working');
        toast({
          title: "✅ API نوسان فعال",
          description: data.message,
        });
      } else {
        setCurrentKeyStatus(data.details?.includes('quota exceeded') ? 'quota_exceeded' : 'invalid');
        toast({
          title: "⚠️ مشکل API نوسان",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: () => {
      setCurrentKeyStatus('invalid');
      toast({
        title: "❌ خطا در تست API",
        description: "عدم اتصال به سرور API نوسان",
        variant: "destructive",
      });
    }
  });

  // Update API key
  const updateApiKey = useMutation({
    mutationFn: (apiKey: string) => apiRequest('/api/settings/update-navasan-key', {
      method: 'POST',
      body: JSON.stringify({ apiKey }),
      headers: { 'Content-Type': 'application/json' }
    }),
    onSuccess: (data) => {
      setCurrentKeyStatus('working');
      setNavasanKey('');
      toast({
        title: "✅ کلید API بروزرسانی شد",
        description: data.message,
      });
    },
    onError: (error: any) => {
      const errorMsg = error.message || 'خطا در بروزرسانی کلید API';
      toast({
        title: "❌ خطا",
        description: errorMsg,
        variant: "destructive",
      });
    }
  });

  const handleUpdateKey = () => {
    if (!navasanKey.trim()) {
      toast({
        title: "خطا",
        description: "کلید API را وارد کنید",
        variant: "destructive",
      });
      return;
    }
    updateApiKey.mutate(navasanKey.trim());
  };

  // Test current key on component mount
  useEffect(() => {
    testCurrentKey.mutate();
  }, []);

  const getKeyStatusColor = () => {
    switch (currentKeyStatus) {
      case 'working': return 'text-green-500';
      case 'quota_exceeded': return 'text-yellow-500';
      case 'invalid': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getKeyStatusText = () => {
    switch (currentKeyStatus) {
      case 'working': return '✅ فعال';
      case 'quota_exceeded': return '⚠️ Quota Exceeded';
      case 'invalid': return '❌ نامعتبر';
      default: return '🔄 در حال بررسی...';
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">🔑 مدیریت API</h1>
      </div>

      {/* API Key Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            مدیریت کلید API نوسان
          </CardTitle>
          <CardDescription>
            کلید API نوسان برای دریافت قیمت‌های زنده ارز و طلا
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Key Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">وضعیت کلید فعلی:</p>
              <p className={`text-sm ${getKeyStatusColor()}`}>
                {getKeyStatusText()}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => testCurrentKey.mutate()}
              disabled={testCurrentKey.isPending}
            >
              {testCurrentKey.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              تست مجدد
            </Button>
          </div>

          {/* Warning for quota exceeded */}
          {currentKeyStatus === 'quota_exceeded' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                کلید API فعلی quota exceeded است. برای دریافت کلید رایگان جدید:<br/>
                <strong>روش 1 (سریع):</strong> ربات تلگرام{' '}
                <a 
                  href="https://t.me/navasan_contact_bot" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  @navasan_contact_bot
                </a><br/>
                <strong>روش 2:</strong> وب‌سایت{' '}
                <a 
                  href="https://navasan.tech/en/api" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  navasan.tech
                </a>
                <br/>
                <small>رایگان: 120 درخواست/ماه</small>
              </AlertDescription>
            </Alert>
          )}

          {/* Update Key Form */}
          <div className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <Label htmlFor="navasan-key">کلید API جدید</Label>
              <Input
                id="navasan-key"
                type="password"
                value={navasanKey}
                onChange={(e) => setNavasanKey(e.target.value)}
                placeholder="کلید API جدید نوسان را وارد کنید..."
                disabled={updateApiKey.isPending}
              />
            </div>
            
            <Button 
              onClick={handleUpdateKey}
              disabled={updateApiKey.isPending || !navasanKey.trim()}
              className="w-full"
            >
              {updateApiKey.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  در حال بروزرسانی...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  بروزرسانی کلید API
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Info */}
      <Card>
        <CardHeader>
          <CardTitle>📊 اطلاعات API نوسان</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>URL:</strong> http://api.navasan.tech/latest/</p>
          <p><strong>داده‌ها:</strong> دلار، یورو، کانادا، درهم، بیتکوین، اتریوم، تتر، طلا 18 عیار، سکه</p>
          <p><strong>فرمت:</strong> JSON</p>
          <p><strong>نحوه درخواست:</strong> GET با پارامتر api_key</p>
          <div className="text-sm text-gray-400 border-t pt-2">
            برای دریافت کلید رایگان یا پرداختی به وب‌سایت API نوسان مراجعه کنید.
          </div>
        </CardContent>
      </Card>

      {/* ZaryaalGold Info */}
      <Card>
        <CardHeader>
          <CardTitle>📱 کانال ZaryaalGold</CardTitle>
        </CardHeader>
        <CardContent>
          <p>قیمت‌های شمش طلا از کانال تلگرام @ZaryaalGold به صورت خودکار دریافت می‌شود.</p>
          <p className="text-sm text-gray-400 mt-2">
            شامل: قیمت‌های خرید و فروش شمش طلا 995 به دلار، یورو، درهم و یوان
          </p>
        </CardContent>
      </Card>
    </div>
  );
}