import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, Globe, Calendar, TrendingUp, Clock, Upload } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CSVUploader } from "@/components/CSVUploader";
import { useState } from "react";

export default function News() {
  const [filterImpact, setFilterImpact] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: allNews, isLoading } = useQuery({
    queryKey: ["/api/news"],
    refetchInterval: 300000, // 5 minutes
  });

  const { data: analysisReports } = useQuery({
    queryKey: ["/api/reports"],
    refetchInterval: 300000,
  });

  const { data: weeklyNews } = useQuery({
    queryKey: ["/api/news/weekly"],
    refetchInterval: 300000,
  });

  const fetchNewsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/actions/fetch-news", {});
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      queryClient.invalidateQueries({ queryKey: ["/api/news/weekly"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      toast({
        title: "اخبار به‌روزرسانی شد",
        description: `${data.data?.length || 0} خبر جدید دریافت شد`,
      });
    },
    onError: (error) => {
      toast({
        title: "خطا در دریافت اخبار",
        description: `خطا: ${error}`,
        variant: "destructive",
      });
    },
  });

  const filteredNews = (allNews as any[])?.filter((news: any) => {
    const matchesImpact = filterImpact === "all" || news.impact === filterImpact;
    const matchesSearch = searchTerm === "" || 
      news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      news.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesImpact && matchesSearch;
  });

  const getImpactColor = (impact: string) => {
    const normalizedImpact = impact.toUpperCase();
    switch (normalizedImpact) {
      case "HIGH":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "MEDIUM":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "LOW":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const getImpactText = (impact: string) => {
    const normalizedImpact = impact.toUpperCase();
    switch (normalizedImpact) {
      case "HIGH":
        return "بالا";
      case "MEDIUM":
        return "متوسط";
      case "LOW":
        return "پایین";
      default:
        return impact;
    }
  };

  const formatTehranTime = (dateString: string) => {
    const date = new Date(dateString);
    // Convert to Tehran timezone (UTC+3:30)
    const tehranOffset = 3.5 * 60; // 3.5 hours in minutes
    const localOffset = date.getTimezoneOffset(); // Local timezone offset in minutes
    const tehranTime = new Date(date.getTime() + (tehranOffset + localOffset) * 60000);
    
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    
    const formatter = new Intl.DateTimeFormat('fa-IR', options);
    return formatter.format(tehranTime);
  };

  const formatEventDateTime = (eventDate: string, eventTime: string) => {
    if (!eventDate) return '';
    
    try {
      let dateTimeStr = '';
      if (eventTime && eventTime !== 'All Day') {
        dateTimeStr = `${eventDate} ${eventTime}`;
      } else {
        dateTimeStr = eventDate;
      }
      
      const date = new Date(dateTimeStr);
      if (isNaN(date.getTime())) return eventDate;
      
      return formatTehranTime(date.toISOString());
    } catch {
      return eventDate;
    }
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case "daily_morning":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "daily_evening":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "weekly_news":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "weekly_technical":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const getReportTypeText = (type: string) => {
    switch (type) {
      case "daily_morning":
        return "گزارش صبحگاهی";
      case "daily_evening":
        return "گزارش عصرگاهی";
      case "weekly_news":
        return "گزارش هفتگی اخبار";
      case "weekly_technical":
        return "گزارش هفتگی تکنیکال";
      default:
        return type;
    }
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case "daily_morning":
        return "🌅";
      case "daily_evening":
        return "🌆";
      case "weekly_news":
        return "📅";
      case "weekly_technical":
        return "📊";
      default:
        return "📄";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 p-6">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
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
          <h1 className="text-2xl font-bold vazir-font">تحلیل اخبار</h1>
          <p className="text-slate-400 vazir-font">اخبار اقتصادی مرتبط با طلا و گزارش‌های تحلیلی</p>
        </div>
      </header>

      <main className="p-6">
        {/* Filters */}
        <Card className="bg-slate-800 border-slate-700 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="جستجو در اخبار..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white vazir-font"
                  data-testid="search-news"
                />
              </div>
              <div className="w-full md:w-48">
                <Select value={filterImpact} onValueChange={setFilterImpact}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white vazir-font" data-testid="filter-impact">
                    <SelectValue placeholder="فیلتر اهمیت" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="all" className="vazir-font">همه اخبار</SelectItem>
                    <SelectItem value="HIGH" className="vazir-font">اهمیت بالا</SelectItem>
                    <SelectItem value="MEDIUM" className="vazir-font">اهمیت متوسط</SelectItem>
                    <SelectItem value="LOW" className="vazir-font">اهمیت پایین</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* News Column */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="vazir-font">اخبار اقتصادی</CardTitle>
                    <p className="text-sm text-slate-400 vazir-font">
                      آخرین اخبار از ForexFactory و FXStreet
                    </p>
                  </div>
                  <Button
                    onClick={() => fetchNewsMutation.mutate()}
                    disabled={fetchNewsMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 vazir-font"
                    data-testid="button-fetch-news"
                  >
                    {fetchNewsMutation.isPending ? "در حال دریافت..." : "دریافت اخبار جدید"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4" data-testid="news-list">
                  {filteredNews && filteredNews.length > 0 ? (
                    filteredNews.map((news: any, index: number) => (
                      <div key={news.id || index} className="border border-slate-700 rounded-lg p-4" data-testid={`news-item-${index}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge className={`${getImpactColor(news.impact)} vazir-font`}>
                              {getImpactText(news.impact)}
                            </Badge>
                            <Badge variant="outline" className="border-slate-600 text-slate-400 vazir-font">
                              {news.source}
                            </Badge>
                          </div>
                          <span className="text-xs text-slate-400 vazir-font" dir="rtl">
                            {news.eventDate && news.eventTime ? 
                              formatEventDateTime(news.eventDate, news.eventTime) : 
                              formatTehranTime(news.processedAt || new Date().toISOString())
                            }
                          </span>
                        </div>
                        
                        <h3 className="font-medium text-white mb-2 vazir-font" dir="rtl">{news.title}</h3>
                        
                        {news.description && (
                          <p className="text-sm text-slate-400 vazir-font mb-3">{news.description}</p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {news.relevanceScore && (
                              <div>
                                <span className="text-xs text-slate-500 vazir-font">امتیاز مرتبط بودن: </span>
                                <span className="text-xs font-medium vazir-font">{news.relevanceScore}%</span>
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 vazir-font">
                            {new Date(news.processedAt).toLocaleString('fa-IR')}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-slate-400 vazir-font py-8">
                      {(allNews as any[]) && (allNews as any[]).length > 0 ? 'هیچ خبری با فیلتر انتخابی یافت نشد' : 'هیچ خبری یافت نشد'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analysis Reports Column */}
          <div>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="vazir-font">گزارش‌های تحلیلی</CardTitle>
                <p className="text-sm text-slate-400 vazir-font">
                  آخرین گزارش‌های تولید شده توسط ربات تحلیل‌گر
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4" data-testid="analysis-reports">
                  {(analysisReports as any[]) && (analysisReports as any[]).length > 0 ? (
                    (analysisReports as any[]).slice(0, 10).map((report: any, index: number) => (
                      <div key={report.id || index} className="border border-slate-700 rounded-lg p-4" data-testid={`report-item-${index}`}>
                        <div className="flex items-center justify-between mb-3">
                          <Badge className={`${getReportTypeColor(report.reportType)} vazir-font`}>
                            {getReportTypeIcon(report.reportType)} {getReportTypeText(report.reportType)}
                          </Badge>
                          <span className="text-xs text-slate-400 vazir-font">
                            {new Date(report.scheduledFor).toLocaleString('fa-IR')}
                          </span>
                        </div>
                        
                        <div className="text-sm text-slate-300 vazir-font mb-3 whitespace-pre-line">
                          {report.content.substring(0, 200)}
                          {report.content.length > 200 && '...'}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-blue-400 hover:text-blue-300 vazir-font"
                            data-testid={`view-report-${index}`}
                          >
                            مشاهده کامل
                          </Button>
                          {report.sentAt && (
                            <span className="text-xs text-emerald-400 vazir-font">
                              <i className="fas fa-check-circle mr-1"></i>
                              ارسال شده
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-slate-400 vazir-font py-8">
                      هیچ گزارش تحلیلی یافت نشد
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* News Statistics */}
            <Card className="bg-slate-800 border-slate-700 mt-6">
              <CardHeader>
                <CardTitle className="vazir-font">آمار اخبار</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400 vazir-font">کل اخبار:</span>
                    <span className="font-medium vazir-font" data-testid="total-news-count">{(allNews as any[])?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 vazir-font">اهمیت بالا:</span>
                    <span className="font-medium text-red-400 vazir-font" data-testid="high-impact-count">
                      {(allNews as any[])?.filter((n: any) => n.impact === 'HIGH').length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 vazir-font">اهمیت متوسط:</span>
                    <span className="font-medium text-amber-400 vazir-font" data-testid="medium-impact-count">
                      {(allNews as any[])?.filter((n: any) => n.impact === 'MEDIUM').length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 vazir-font">گزارش‌ها:</span>
                    <span className="font-medium vazir-font" data-testid="reports-count">{(analysisReports as any[])?.length || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Weekly Calendar Table */}
        <Card className="bg-slate-800 border-slate-700 mt-6">
          <CardHeader>
            <CardTitle className="vazir-font">تقویم اخبار هفتگی</CardTitle>
            <p className="text-sm text-slate-400 vazir-font">
              تمام اخبار اقتصادی هفته از ForexFactory و FXStreet
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-right py-3 px-4 vazir-font text-slate-300">زمان (تهران)</th>
                    <th className="text-right py-3 px-4 vazir-font text-slate-300">ارز</th>
                    <th className="text-right py-3 px-4 vazir-font text-slate-300">رویداد</th>
                    <th className="text-center py-3 px-4 vazir-font text-slate-300">تاریخ و ساعت</th>
                    <th className="text-center py-3 px-4 vazir-font text-slate-300">اهمیت</th>
                    <th className="text-center py-3 px-4 vazir-font text-slate-300">منبع</th>
                  </tr>
                </thead>
                <tbody>
                  {(weeklyNews as any[]) && (weeklyNews as any[]).length > 0 ? (
                    (weeklyNews as any[])
                      .sort((a: any, b: any) => {
                        // Sort by event date/time if available, otherwise by processedAt
                        const aDate = a.eventDate ? new Date(`${a.eventDate} ${a.eventTime}`) : new Date(a.processedAt);
                        const bDate = b.eventDate ? new Date(`${b.eventDate} ${b.eventTime}`) : new Date(b.processedAt);
                        return aDate.getTime() - bDate.getTime(); // Ascending order (earliest first)
                      })
                      .map((news: any, index: number) => {
                        // Extract currency from title
                        const currency = news.title.split(' ')[0];
                        const eventName = news.title.replace(currency, '').trim();
                        
                        return (
                          <tr key={news.id || index} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                            <td className="py-3 px-4 vazir-font text-slate-300" dir="rtl">
                              {news.eventDate && news.eventTime ? 
                                formatEventDateTime(news.eventDate, news.eventTime) : 
                                formatTehranTime(news.processedAt || new Date().toISOString())
                              }
                            </td>
                            <td className="py-3 px-4 vazir-font">
                              <Badge variant="outline" className="border-slate-600 text-slate-300">
                                {currency}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 vazir-font text-slate-300" dir="rtl">
                              {eventName}
                            </td>
                            <td className="text-center py-3 px-4 vazir-font">
                              {news.eventDate && news.eventTime ? (
                                <div className="text-sm">
                                  <div>{new Date(news.eventDate).toLocaleDateString('fa-IR')}</div>
                                  <div className="text-slate-400">{news.eventTime}</div>
                                </div>
                              ) : (
                                <div className="text-sm">
                                  {new Date(news.processedAt).toLocaleDateString('fa-IR', { timeZone: 'Asia/Tehran' })}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Badge className={`${getImpactColor(news.impact)} vazir-font`}>
                                {getImpactText(news.impact)}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Badge 
                                variant="outline" 
                                className={news.source === 'ForexFactory' ? 
                                  'border-blue-500 text-blue-400' : 
                                  'border-green-500 text-green-400'
                                }
                              >
                                {news.source}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 vazir-font">
                        هیچ اطلاعاتی در تقویم هفتگی یافت نشد
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
