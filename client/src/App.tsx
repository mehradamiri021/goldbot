import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Sidebar from "@/components/layout/sidebar";
import Dashboard from "@/pages/dashboard.tsx";
import Bots from "@/pages/bots";
import Signals from "@/pages/signals";
import News from "@/pages/news";
import Prices from "@/pages/prices";
import Analysis from "@/pages/analysis";
import Logs from "@/pages/logs";
import Settings from "@/pages/settings";
import ApiSettings from "@/pages/api-settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="flex h-screen bg-slate-900 text-white" dir="rtl">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/bots" component={Bots} />
          <Route path="/signals" component={Signals} />
          <Route path="/news" component={News} />
          <Route path="/prices" component={Prices} />
          <Route path="/analysis" component={Analysis} />
          <Route path="/logs" component={Logs} />
          <Route path="/settings" component={Settings} />
          <Route path="/api-settings" component={ApiSettings} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
