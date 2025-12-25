import { useState, useMemo } from "react";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import useStore from "../store/useStore";
import {
  Plus,
  Target,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { motion } from "framer-motion";

export default function Budget() {
  const { user } = useUser();
  const { currentMonth, currentYear, setMonth, setYear } = useStore();

  const settings = useQuery(api.users.getSettings, { userId: user?.id || "" });
  const budget = useQuery(api.budgets.getBudget, {
    userId: user?.id || "",
    month: currentMonth,
    year: currentYear,
  });

  const startDate = format(
    startOfMonth(new Date(currentYear, currentMonth - 1)),
    "yyyy-MM-dd"
  );
  const endDate = format(
    endOfMonth(new Date(currentYear, currentMonth - 1)),
    "yyyy-MM-dd"
  );

  const expenses = useQuery(api.expenses.list, {
    userId: user?.id || "",
    startDate,
    endDate,
  });

  const updateBudget = useMutation(api.budgets.updateBudget);

  const globalBudget = useMemo(() => {
    return budget?.amount || 0;
  }, [budget]);

  const [isEditingGlobal, setIsEditingGlobal] = useState(false);
  const [tempAmount, setTempAmount] = useState("");

  const budgetStats = useMemo(() => {
    if (!settings?.categories || !expenses) return [];

    // Group spending by category
    const spendingMap = {};
    expenses.forEach((e) => {
      if (e.transactionType === "Debit") {
        spendingMap[e.categoryId] = (spendingMap[e.categoryId] || 0) + e.amount;
      }
    });

    return settings.categories.map((cat) => ({
      name: cat,
      spent: spendingMap[cat] || 0,
    }));
  }, [settings, expenses]);

  const totalSpent = useMemo(
    () => budgetStats.reduce((acc, curr) => acc + curr.spent, 0),
    [budgetStats]
  );

  const handleGlobalUpdate = async () => {
    await updateBudget({
      userId: user.id,
      amount: parseFloat(tempAmount) || 0,
      month: currentMonth,
      year: currentYear,
    });
    setIsEditingGlobal(false);
  };

  return (
    <div className="min-h-screen pb-20 p-6 lg:p-12 space-y-12 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pt-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-primary">
            <Target size={32} strokeWidth={2.5} />
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-foreground">
              Budgeting
            </h1>
          </div>
          <p className="text-muted-foreground font-medium tracking-tight">
            Set one target and track where your money goes.
          </p>
        </div>

        <div className="flex items-center bg-card p-2 rounded-2xl border border-border shadow-sm">
          <button
            onClick={() =>
              currentMonth === 1
                ? (setMonth(12), setYear(currentYear - 1))
                : setMonth(currentMonth - 1)
            }
            className="p-3 hover:bg-secondary rounded-xl transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="px-6 py-2 text-center min-w-[140px]">
            <span className="text-sm font-black uppercase tracking-widest block opacity-40">
              Period
            </span>
            <span className="text-lg font-black text-foreground">
              {format(new Date(currentYear, currentMonth - 1), "MMMM yyyy")}
            </span>
          </div>
          <button
            onClick={() =>
              currentMonth === 12
                ? (setMonth(1), setYear(currentYear + 1))
                : setMonth(currentMonth + 1)
            }
            className="p-3 hover:bg-secondary rounded-xl transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </header>

      {/* Hero Global Budget Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-foreground text-background p-10 rounded-[3rem] shadow-2xl flex flex-col justify-between min-h-[300px] relative overflow-hidden group">
          <div className="relative z-10 space-y-8">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50">
                  Global Monthly Limit
                </span>
                <div className="mt-2">
                  {isEditingGlobal ? (
                    <div className="flex items-center gap-4">
                      <span className="text-5xl font-black">₹</span>
                      <input
                        autoFocus
                        type="number"
                        value={tempAmount}
                        onChange={(e) => setTempAmount(e.target.value)}
                        onBlur={handleGlobalUpdate}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleGlobalUpdate()
                        }
                        className="bg-transparent border-b-4 border-primary/50 text-5xl font-black outline-none w-full"
                      />
                    </div>
                  ) : (
                    <h2
                      onClick={() => {
                        setIsEditingGlobal(true);
                        setTempAmount(globalBudget.toString());
                      }}
                      className="text-7xl font-black tabular-nums cursor-pointer transition-colors"
                    >
                      ₹{globalBudget.toLocaleString()}
                    </h2>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setIsEditingGlobal(true);
                  setTempAmount(globalBudget.toString());
                }}
                className="p-4 bg-background/10 rounded-2xl border border-background/20 hover:scale-110 transition-transform"
              >
                <Plus size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <p className="text-sm font-bold opacity-60">
                  ₹{(globalBudget - totalSpent).toLocaleString()} Remaining
                </p>
                <p className="text-xl font-black italic">
                  {globalBudget > 0
                    ? ((totalSpent / globalBudget) * 100).toFixed(0)
                    : 0}
                  % Spent
                </p>
              </div>
              <div className="h-4 w-full bg-background/10 rounded-full overflow-hidden p-1 backdrop-blur-sm">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min((totalSpent / (globalBudget || 1)) * 100, 100)}%`,
                    backgroundColor:
                      totalSpent > globalBudget ? "#ef4444" : "#10b981",
                  }}
                  className="h-full rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                />
              </div>
            </div>
          </div>
          <Target
            size={180}
            className="absolute -bottom-10 -right-10 opacity-10 rotate-12"
          />
        </div>

        <div className="bg-card border border-border p-10 rounded-[3rem] flex flex-col justify-between min-h-[300px]">
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
              Budget Health
            </span>
            <h3 className="text-3xl font-black">
              {totalSpent > globalBudget ? "Over Budget" : "On Track"}
            </h3>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-secondary/30 rounded-3xl border border-border/50">
              <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground mb-4">
                <AlertCircle size={16} /> Insight
              </div>
              <p className="text-sm font-medium leading-relaxed">
                {totalSpent > globalBudget
                  ? `You are ₹${(totalSpent - globalBudget).toLocaleString()} over your limit. Consider trimming non-essential categories.`
                  : `You've utilized ${((totalSpent / (globalBudget || 1)) * 100).toFixed(0)}% of your capital. You have a safe margin of ₹${(globalBudget - totalSpent).toLocaleString()}.`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black tracking-tight">
            Spend Breakdown
          </h2>
          <span className="text-xs font-bold text-muted-foreground uppercase bg-secondary px-3 py-1 rounded-full">
            By Actuals
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {budgetStats.map((stat) => (
            <div
              key={stat.name}
              className="bg-card border border-border p-6 rounded-3xl space-y-4 hover:shadow-xl transition-all group"
            >
              <div className="flex justify-between items-start">
                <h4 className="font-black text-muted-foreground text-xs uppercase tracking-widest">
                  {stat.name}
                </h4>
                <div className="p-1.5 bg-primary/5 text-primary rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <TrendingUp size={12} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-black">
                  ₹{stat.spent.toLocaleString()}
                </p>
                <div className="flex justify-between text-[10px] font-bold opacity-40 uppercase">
                  <span>of total spend</span>
                  <span>
                    {totalSpent > 0
                      ? ((stat.spent / totalSpent) * 100).toFixed(0)
                      : 0}
                    %
                  </span>
                </div>
              </div>
              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${totalSpent > 0 ? (stat.spent / totalSpent) * 100 : 0}%`,
                  }}
                  className="h-full bg-primary/40 rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
