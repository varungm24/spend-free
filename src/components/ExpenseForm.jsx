import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { X } from "lucide-react";
import useStore from "../store/useStore";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export default function ExpenseForm() {
  const { user } = useUser();
  const { isExpenseModalOpen, setExpenseModalOpen } = useStore();
  const settings = useQuery(api.users.getSettings, { userId: user?.id || "" });
  const createExpense = useMutation(api.expenses.create);

  const [formData, setFormData] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    categoryId: "",
    description: "",
    amount: "",
    paymentType: "UPI", // UPI, Card, Cash
    sourceId: "", // Bank, or Card ID
    cardType: "Credit", // Credit, Debit
    transactionType: "Debit", // Debit, Credit
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (settings && settings.categories.length > 0) {
      setFormData((prev) => ({ ...prev, categoryId: settings.categories[0] }));
    }
  }, [settings]);

  if (!isExpenseModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.amount ||
      !formData.categoryId ||
      (formData.paymentType !== "Cash" && !formData.sourceId)
    )
      return;

    setIsSubmitting(true);
    try {
      await createExpense({
        userId: user.id,
        date: formData.date,
        categoryId: formData.categoryId,
        description: formData.description,
        amount: parseFloat(formData.amount),
        paymentType: formData.paymentType,
        sourceId: formData.sourceId || "Cash",
        transactionType: formData.transactionType,
      });
      setExpenseModalOpen(false);
      setFormData({
        date: format(new Date(), "yyyy-MM-dd"),
        categoryId: settings?.categories[0] || "",
        description: "",
        amount: "",
        paymentType: "UPI",
        sourceId: "",
        transactionType: "Debit",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSourceOptions = () => {
    if (formData.paymentType === "Card") {
      return (
        settings?.creditCards
          .filter((c) => c.type === formData.cardType)
          .map((c) => ({
            id: c.name,
            label: `${c.bank} - ${c.name}`,
          })) || []
      );
    }
    if (formData.paymentType === "UPI") {
      return settings?.banks.map((b) => ({ id: b, label: b })) || [];
    }
    return [];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="glass w-full max-w-lg rounded-3xl p-8 border border-white/10 shadow-2xl relative animate-in zoom-in-95 duration-300">
        <button
          onClick={() => setExpenseModalOpen(false)}
          className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-8">New Transaction</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Transaction Type Toggle */}
          <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5">
            {["Debit", "Credit"].map((t) => (
              <Button
                key={t}
                variant="ghost"
                type="button"
                onClick={() => setFormData({ ...formData, transactionType: t })}
                className={`flex-1 py-6 rounded-xl font-bold transition-all ${
                  formData.transactionType === t
                    ? "bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                {t}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="bg-white/5 border-white/10 h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="bg-white/5 border-white/10 h-12 rounded-xl font-bold"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(val) =>
                setFormData({ ...formData, categoryId: val })
              }
            >
              <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl">
                <SelectValue placeholder="Choose Category" />
              </SelectTrigger>
              <SelectContent>
                {settings?.categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              placeholder="What was this for?"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="bg-white/5 border-white/10 h-12 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Method</Label>
              <Select
                value={formData.paymentType}
                onValueChange={(val) =>
                  setFormData({
                    ...formData,
                    paymentType: val,
                    sourceId: "",
                  })
                }
              >
                <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UPI">UPI / Bank</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.paymentType === "Card" && (
              <div className="space-y-2">
                <Label>Card Type</Label>
                <Select
                  value={formData.cardType}
                  onValueChange={(val) =>
                    setFormData({ ...formData, cardType: val, sourceId: "" })
                  }
                >
                  <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Credit">Credit Card</SelectItem>
                    <SelectItem value="Debit">Debit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {formData.paymentType !== "Cash" && (
            <div className="space-y-2">
              <Label>
                {formData.paymentType === "UPI" ? "Select Bank" : "Select Card"}
              </Label>
              <Select
                value={formData.sourceId}
                onValueChange={(val) =>
                  setFormData({ ...formData, sourceId: val })
                }
              >
                <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl">
                  <SelectValue
                    placeholder={`Select ${
                      formData.paymentType === "UPI" ? "Bank" : "Card"
                    }`}
                  />
                </SelectTrigger>
                <SelectContent>
                  {getSourceOptions().length > 0 ? (
                    getSourceOptions().map((opt) => (
                      <SelectItem key={opt.id} value={opt.id}>
                        {opt.label}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      No options found in Settings.
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all"
          >
            {isSubmitting ? "Processing..." : "Log Transaction"}
          </Button>
        </form>
      </div>
    </div>
  );
}
