import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "داشبورد",
    href: "/",
    icon: "fas fa-tachometer-alt",
  },
  {
    name: "مدیریت ربات‌ها",
    href: "/bots",
    icon: "fas fa-robot",
  },
  {
    name: "تحلیل اخبار",
    href: "/news",
    icon: "fas fa-newspaper",
  },
  {
    name: "ربات تحلیل‌گر",
    href: "/analysis",
    icon: "fas fa-chart-line",
  },
  {
    name: "سیگنال‌ها",
    href: "/signals",
    icon: "fas fa-signal",
  },
  {
    name: "قیمت‌ها",
    href: "/prices",
    icon: "fas fa-dollar-sign",
  },
  {
    name: "لاگ‌ها",
    href: "/logs",
    icon: "fas fa-file-alt",
  },
  {
    name: "تنظیمات",
    href: "/settings",
    icon: "fas fa-cog",
  },
  {
    name: "مدیریت API",
    href: "/api-settings",
    icon: "fas fa-key",
  },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-slate-800 border-l border-slate-700 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <i className="fas fa-chart-line text-white"></i>
          </div>
          <div>
            <h1 className="text-lg font-bold vazir-font">سیستم طلا</h1>
            <p className="text-sm text-slate-400 vazir-font">مدیریت ربات‌ها</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-colors vazir-font",
                    isActive
                      ? "bg-blue-500 text-white"
                      : "text-slate-300 hover:bg-slate-700"
                  )}
                  data-testid={`nav-${item.href.replace('/', '') || 'dashboard'}`}
                >
                  <i className={item.icon}></i>
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bot Status Summary */}
      <div className="p-4 border-t border-slate-700">
        <h3 className="text-sm font-medium text-slate-400 mb-3 vazir-font">وضعیت ربات‌ها</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm vazir-font">تحلیل‌گر</span>
            <div className="w-2 h-2 bg-emerald-500 rounded-full" data-testid="status-analysis"></div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm vazir-font">سیگنال‌دهی</span>
            <div className="w-2 h-2 bg-emerald-500 rounded-full" data-testid="status-signal"></div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm vazir-font">اعلام قیمت</span>
            <div className="w-2 h-2 bg-amber-500 rounded-full" data-testid="status-price"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
