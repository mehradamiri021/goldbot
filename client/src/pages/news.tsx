import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, TrendingUp, Calendar, Upload, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CSVUploader } from "@/components/CSVUploader";

export default function News() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch HIGH and MEDIUM impact news only
  const { data: highMediumNews, isLoading: newsLoading } = useQuery({
    queryKey: ["/api/news"],
    refetchInterval: 300000, // 5 minutes
  });

  // Fetch all weekly events for calendar
  const { data: weeklyEvents, isLoading: weeklyLoading } = useQuery({
    queryKey: ["/api/news/weekly"],
    refetchInterval: 300000,
  });

  // Fetch gold important news
  const { data: goldImportantNews, isLoading: goldLoading } = useQuery({
    queryKey: ["/api/news/gold-important"],
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
      queryClient.invalidateQueries({ queryKey: ["/api/news/gold-important"] });
      toast({
        title: "اخبار به‌روزرسانی شد",
        description: `${data.data?.length || 0} خبر جدید دریافت شد`,
      });
    },
    onError: () => {
      toast({
        title: "خطا در دریافت اخبار",
        description: "لطفاً دوباره تلاش کنید",
        variant: "destructive",
      });
    },
  });

  const getImpactColor = (impact: string) => {
    const normalizedImpact = impact?.toUpperCase();
    switch (normalizedImpact) {
      case "HIGH":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "MEDIUM":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "LOW":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const getImpactText = (impact: string) => {
    const normalizedImpact = impact?.toUpperCase();
    switch (normalizedImpact) {
      case "HIGH":
        return "بالا";
      case "MEDIUM":
        return "متوسط";
      case "LOW":
        return "پایین";
      default:
        return impact || "نامشخص";
    }
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
      
      // Convert to Tehran timezone display
      const tehranTime = new Date(date.getTime() + (3.5 * 60 * 60 * 1000));
      return tehranTime.toLocaleString('fa-IR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      return eventDate;
    }
  };

  if (newsLoading || weeklyLoading || goldLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
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
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">مدیریت اخبار و تقویم اقتصادی</h1>
          <Button 
            onClick={() => fetchNewsMutation.mutate()}
            disabled={fetchNewsMutation.isPending}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
            data-testid="button-refresh-news"
          >
            <RefreshCw className="h-4 w-4" />
            {fetchNewsMutation.isPending ? "در حال دریافت..." : "دریافت اخبار جدید"}
          </Button>
        </div>

        <Tabs defaultValue="news" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-slate-700">
            <TabsTrigger value="news" className="flex items-center gap-2 data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <TrendingUp className="h-4 w-4" />
              اخبار مهم
            </TabsTrigger>
            <TabsTrigger value="gold-important" className="flex items-center gap-2 data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              🥇 اخبار طلا
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2 data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <Calendar className="h-4 w-4" />
              تقویم هفتگی
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2 data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <Upload className="h-4 w-4" />
              بارگذاری
            </TabsTrigger>
          </TabsList>

        {/* HIGH and MEDIUM Impact News Tab */}
        <TabsContent value="news" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="h-5 w-5" />
                اخبار مهم (فقط High & Medium Impact)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-600 hover:bg-slate-700">
                      <TableHead className="text-slate-300">اهمیت</TableHead>
                      <TableHead className="text-slate-300">منبع</TableHead>
                      <TableHead className="text-slate-300">عنوان خبر</TableHead>
                      <TableHead className="text-slate-300">تاریخ و ساعت</TableHead>
                      <TableHead className="text-slate-300">وضعیت</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {highMediumNews && (highMediumNews as any[]).length > 0 ? (
                      (highMediumNews as any[]).map((news: any, index: number) => (
                        <TableRow key={news.id || index} className="border-slate-600 hover:bg-slate-700">
                          <TableCell>
                            <Badge className={getImpactColor(news.impact)}>
                              {getImpactText(news.impact)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-slate-500 text-slate-300">
                              {news.source}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-200 font-medium">
                            <div className="space-y-1">
                              <div>{news.title}</div>
                              {news.description && (
                                <div className="text-sm text-slate-400">{news.description.substring(0, 100)}...</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-300">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {news.eventDate && news.eventTime ? 
                                formatEventDateTime(news.eventDate, news.eventTime) : 
                                new Date(news.publishedAt || news.processedAt).toLocaleString('fa-IR')
                              }
                            </div>
                          </TableCell>
                          <TableCell>
                            {news.tags?.includes('gold') && (
                              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                                🟡 مرتبط با طلا
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-slate-400 py-8">
                          هیچ خبر مهمی یافت نشد. برای دریافت اخبار جدید روی دکمه بالا کلیک کنید.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gold Important News Tab */}
        <TabsContent value="gold-important" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                🥇 اخبار مهم طلا
              </CardTitle>
              <p className="text-slate-400 text-sm">
                فقط اخبار مرتبط با طلا که تأثیرگذار بر قیمت هستند
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-600 hover:bg-slate-700">
                      <TableHead className="text-slate-300">اهمیت</TableHead>
                      <TableHead className="text-slate-300">منبع</TableHead>
                      <TableHead className="text-slate-300">عنوان خبر</TableHead>
                      <TableHead className="text-slate-300">تاریخ و ساعت</TableHead>
                      <TableHead className="text-slate-300">امتیاز ربط</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {goldImportantNews && (goldImportantNews as any[]).length > 0 ? (
                      (goldImportantNews as any[]).map((news: any, index: number) => (
                        <TableRow key={news.id || index} className="border-slate-600 hover:bg-slate-700 bg-yellow-900/10">
                          <TableCell>
                            <Badge className={getImpactColor(news.impact)}>
                              {getImpactText(news.impact)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={`border-slate-500 text-xs ${
                                news.source === 'economic_calendar' 
                                  ? 'text-blue-400 border-blue-500/30' 
                                  : 'text-green-400 border-green-500/30'
                              }`}
                            >
                              {news.source === 'economic_calendar' ? 'CSV' : news.source}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-200 font-medium">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                🥇 {news.title}
                              </div>
                              {news.description && (
                                <div className="text-sm text-slate-400">{news.description.substring(0, 120)}...</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-300">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {news.eventDate && news.eventTime ? 
                                formatEventDateTime(news.eventDate, news.eventTime) : 
                                new Date(news.publishedAt || news.processedAt).toLocaleString('fa-IR')
                              }
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                              {news.relevanceScore || 75}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-slate-400 py-8">
                          هیچ خبر مهم مرتبط با طلا یافت نشد. برای دریافت اخبار جدید روی دکمه بالا کلیک کنید.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weekly Calendar Tab */}
        <TabsContent value="calendar" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Calendar className="h-5 w-5" />
                تقویم اقتصادی هفتگی (ترکیب CSV + ForexFactory)
              </CardTitle>
              <p className="text-slate-400 text-sm">
                داده‌ها از فایل CSV بارگذاری شده و سایت ForexFactory دریافت می‌شوند
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-600 hover:bg-slate-700">
                      <TableHead className="text-slate-300">تاریخ</TableHead>
                      <TableHead className="text-slate-300">ساعت</TableHead>
                      <TableHead className="text-slate-300">رویداد</TableHead>
                      <TableHead className="text-slate-300">ارز</TableHead>
                      <TableHead className="text-slate-300">اهمیت</TableHead>
                      <TableHead className="text-slate-300">منبع</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {weeklyEvents && (weeklyEvents as any[]).length > 0 ? (
                      (weeklyEvents as any[]).map((event: any, index: number) => (
                        <TableRow 
                          key={event.id || index} 
                          className={`border-slate-600 hover:bg-slate-700 ${
                            event.tags?.includes('gold') ? 'bg-yellow-900/20' : ''
                          }`}
                        >
                          <TableCell className="text-slate-300">{event.eventDate || event.date}</TableCell>
                          <TableCell className="text-slate-300">{event.eventTime || event.time}</TableCell>
                          <TableCell className="text-slate-200">
                            <div className="flex items-center gap-2">
                              {event.title}
                              {event.tags?.includes('gold') && (
                                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                                  طلا
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-slate-500 text-slate-300">
                              {event.currency || 'USD'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getImpactColor(event.impact)}>
                              {getImpactText(event.impact)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={`border-slate-500 text-xs ${
                                event.source === 'economic_calendar' 
                                  ? 'text-blue-400 border-blue-500/30' 
                                  : 'text-green-400 border-green-500/30'
                              }`}
                            >
                              {event.source === 'economic_calendar' ? 'CSV' : 'ForexFactory'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-slate-400 py-8">
                          هیچ رویدادی یافت نشد. لطفاً فایل CSV جدید بارگذاری کنید یا اخبار را به‌روزرسانی کنید.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

          {/* FXStreet File Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Upload className="h-5 w-5" />
                  بارگذاری فایل FXStreet یا CSV
                </CardTitle>
                <p className="text-slate-400 text-sm">
                  فایل .fxstreet، .txt یا CSV حاوی رویدادهای اقتصادی هفتگی را بارگذاری کنید
                </p>
              </CardHeader>
              <CardContent>
                <CSVUploader />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}