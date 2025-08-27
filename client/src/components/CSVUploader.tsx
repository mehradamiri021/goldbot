import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, Calendar, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CSVUploadResult {
  success: boolean;
  message: string;
  csvFile?: {
    id: number;
    filename: string;
    eventsCount: number;
    weekStart: string;
    weekEnd: string;
  };
  goldRelevantCount?: number;
  highMediumCount?: number;
}

export function CSVUploader() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<CSVUploadResult | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setUploadResult(null);
      } else {
        toast({
          title: "فرمت فایل نامعتبر",
          description: "لطفاً فقط فایل‌های CSV بارگذاری کنید",
          variant: "destructive"
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('csvFile', selectedFile);

    try {
      const response = await fetch('/api/upload-csv', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        setUploadResult(result);
        toast({
          title: "بارگذاری موفق",
          description: result.message,
          variant: "default"
        });
        // Clear the file input
        setSelectedFile(null);
        const fileInput = document.getElementById('csv-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        toast({
          title: "خطا در بارگذاری",
          description: result.error || "خطای نامشخص",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "خطا در اتصال",
        description: "لطفاً دوباره تلاش کنید",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          بارگذاری تقویم اقتصادی هفتگی
        </CardTitle>
        <CardDescription>
          فایل CSV تقویم اقتصادی هفته را برای مدیریت خودکار داده‌ها بارگذاری کنید
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Selection */}
        <div className="flex items-center gap-4">
          <Input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="flex-1"
            data-testid="input-csv-file"
          />
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="min-w-[120px]"
            data-testid="button-upload-csv"
          >
            {uploading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                بارگذاری...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                بارگذاری
              </div>
            )}
          </Button>
        </div>

        {/* Selected File Info */}
        {selectedFile && (
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              فایل انتخاب شده: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </AlertDescription>
          </Alert>
        )}

        {/* Upload Result */}
        {uploadResult && uploadResult.success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="space-y-2">
              <div className="font-medium text-green-800">
                بارگذاری موفقیت‌آمیز!
              </div>
              
              {uploadResult.csvFile && (
                <div className="text-sm text-green-700 space-y-1">
                  <div>📁 فایل: {uploadResult.csvFile.filename}</div>
                  <div>📅 دوره: {formatDate(uploadResult.csvFile.weekStart)} تا {formatDate(uploadResult.csvFile.weekEnd)}</div>
                  <div>📊 کل رویدادها: {uploadResult.csvFile.eventsCount}</div>
                  {uploadResult.goldRelevantCount !== undefined && (
                    <div>🟡 مرتبط با طلا: {uploadResult.goldRelevantCount}</div>
                  )}
                  {uploadResult.highMediumCount !== undefined && (
                    <div>🔴 اهمیت بالا/متوسط: {uploadResult.highMediumCount}</div>
                  )}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Instructions */}
        <div className="text-sm text-muted-foreground space-y-1">
          <div>📋 فرمت CSV مورد انتظار:</div>
          <div className="font-mono text-xs bg-muted p-2 rounded">
            Id,Start,Name,Impact,Currency<br/>
            e2f6a1e4...,08/26/2025 14:00:00,Consumer Confidence,MEDIUM,USD
          </div>
          <div className="mt-2 space-y-1">
            <div>• فایل باید شامل ستون‌های Id, Start, Name, Impact, Currency باشد</div>
            <div>• تاریخ و ساعت به صورت MM/DD/YYYY HH:mm:ss</div>
            <div>• Impact: HIGH, MEDIUM, LOW</div>
            <div>• حداکثر حجم فایل: 5MB</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}