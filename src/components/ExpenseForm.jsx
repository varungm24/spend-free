import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  X,
  Calendar as CalIcon,
  IndianRupee,
  Tag,
  Info,
  Wallet,
  CreditCard as CardIcon,
} from "lucide-react";
import useStore from "../store/useStore";
import { format } from "date-fns";

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
    paymentType: "UPI", // UPI, Credit Card, Cash
    sourceId: "",
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
    if (formData.paymentType === "Credit Card") {
      return (
        settings?.creditCards.map((c) => ({
          id: c.name,
          label: `${c.name} (${c.bank})`,
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
              <button
                key={t}
                type="button"
                onClick={() => setFormData({ ...formData, transactionType: t })}
                className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${
                  formData.transactionType === t
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">
                Date
              </label>
              <div className="relative">
                <CalIcon
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={16}
                />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-1 ring-primary appearance-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">
                Amount (₹)
              </label>
              <div className="relative">
                <IndianRupee
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={16}
                />
                <input
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-1 ring-primary"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-muted-foreground">
              Category
            </label>
            <div className="relative">
              <Tag
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={16}
              />
              <select
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-1 ring-primary appearance-none"
              >
                {settings?.categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-background">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-muted-foreground">
              Description
            </label>
            <div className="relative">
              <Info
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={16}
              />
              <input
                type="text"
                placeholder="What was this for?"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-1 ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">
                Method
              </label>
              <div className="relative">
                <Wallet
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={16}
                />
                <select
                  value={formData.paymentType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paymentType: e.target.value,
                      sourceId: "",
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-1 ring-primary appearance-none"
                >
                  <option value="UPI" className="bg-background">
                    UPI
                  </option>
                  <option value="Credit Card" className="bg-background">
                    Credit Card
                  </option>
                  <option value="Cash" className="bg-background">
                    Cash
                  </option>
                </select>
              </div>
            </div>

            {formData.paymentType !== "Cash" && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">
                  Select {formData.paymentType === "UPI" ? "Bank" : "Card"}
                </label>
                <div className="relative">
                  <CardIcon
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    size={16}
                  />
                  <select
                    value={formData.sourceId}
                    onChange={(e) =>
                      setFormData({ ...formData, sourceId: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-1 ring-primary appearance-none"
                    required
                  >
                    <option value="">Select</option>
                    {getSourceOptions().map((opt) => (
                      <option
                        key={opt.id}
                        value={opt.id}
                        className="bg-background"
                      >
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Processing..." : "Log Transaction"}
          </button>
        </form>
      </div>
    </div>
  );
}
