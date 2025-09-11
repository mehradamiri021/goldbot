import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SignalModalProps {
  signal: any;
  open: boolean;
  onClose: () => void;
}

export default function SignalModal({ signal, open, onClose }: SignalModalProps) {
  const [entryPrice, setEntryPrice] = useState(signal?.entryPrice?.toString() || "");
  const [stopLoss, setStopLoss] = useState(signal?.stopLoss?.toString() || "");
  const [takeProfit, setTakeProfit] = useState(signal?.takeProfit?.toString() || "");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PATCH", `/api/signals/${signal.id}`, {
        status: "approved",
        approvedBy: "admin",
        entryPrice: parseFloat(entryPrice),
        stopLoss: parseFloat(stopLoss),
        takeProfit: parseFloat(takeProfit),
        additionalNotes
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/signals/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/signals/today"] });
      toast({
        title: "سیگنال تایید شد",
        description: "سیگنال با موفقیت به کانال ارسال شد",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "خطا در تایید سیگنال",
        description: `خطا: ${error}`,
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PATCH", `/api/signals/${signal.id}`, {
        status: "rejected",
        approvedBy: "admin",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/signals/pending"] });
      toast({
        title: "سیگنال رد شد",
        description: "سیگنال با موفقیت رد شد",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "خطا در رد سیگنال",
        description: `خطا: ${error}`,
        variant: "destructive",
      });
    },
  });

  const handleApprove = () => {
    if (!entryPrice || !stopLoss || !takeProfit) {
      toast({
        title: "خطا",
        description: "لطفاً تمام قیمت‌ها را وارد کنید",
        variant: "destructive",
      });
      return;
    }
    approveMutation.mutate();
  };

  const handleReject = () => {
    rejectMutation.mutate();
  };

  if (!signal) return null;

  const riskReward = entryPrice && stopLoss && takeProfit ? 
    Math.abs((parseFloat(takeProfit) - parseFloat(entryPrice)) / (parseFloat(entryPrice) - parseFloat(stopLoss))).toFixed(2) : 
    signal.riskReward?.toFixed(2) || "0";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md mx-4 vazir-font">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold vazir-font">تایید سیگنال معاملاتی</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Signal Info */}
          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className={`px-2 py-1 rounded text-xs ${
                signal.type === 'buy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {signal.type === 'buy' ? 'خرید' : 'فروش'}
              </span>
              <span className="text-xs text-slate-400">
                {new Date(signal.createdAt).toLocaleString('fa-IR')}
              </span>
            </div>
            <div className="text-sm text-slate-300">
              <div>نماد: {signal.symbol}</div>
              <div>اطمینان: {signal.confidence}%</div>
              <div>R/R: {riskReward}</div>
            </div>
          </div>

          {/* Editable Prices */}
          <div>
            <Label className="block text-sm font-medium mb-2 vazir-font">قیمت ورود</Label>
            <Input
              type="number"
              step="0.01"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white vazir-font"
              data-testid="input-entry-price"
            />
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2 vazir-font">Stop Loss</Label>
            <Input
              type="number"
              step="0.01"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white vazir-font"
              data-testid="input-stop-loss"
            />
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2 vazir-font">Take Profit</Label>
            <Input
              type="number"
              step="0.01"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white vazir-font"
              data-testid="input-take-profit"
            />
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2 vazir-font">توضیحات اضافی</Label>
            <Textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white h-20 vazir-font"
              placeholder="توضیحات سیگنال..."
              data-testid="input-additional-notes"
            />
          </div>

          {/* Signal Reasoning */}
          {signal.reasoning && (
            <div>
              <Label className="block text-sm font-medium mb-2 vazir-font">منطق سیگنال</Label>
              <div className="bg-slate-700/50 rounded-lg p-3 text-sm text-slate-300 vazir-font whitespace-pre-line">
                {signal.reasoning}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-3 mt-6">
          <Button
            onClick={handleApprove}
            disabled={approveMutation.isPending}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white vazir-font"
            data-testid="button-approve-signal"
          >
            {approveMutation.isPending ? "در حال ارسال..." : "ارسال سیگنال"}
          </Button>
          <Button
            onClick={handleReject}
            disabled={rejectMutation.isPending}
            variant="secondary"
            className="flex-1 bg-slate-600 hover:bg-slate-700 text-white vazir-font"
            data-testid="button-reject-signal"
          >
            {rejectMutation.isPending ? "در حال رد..." : "رد سیگنال"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
