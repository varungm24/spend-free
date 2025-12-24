import { useMemo } from "react";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  TrendingDown,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Wallet2,
} from "lucide-react";
import useStore from "../store/useStore";
import { format, startOfMonth, endOfMonth } from "date-fns";
import ExportButton from "../components/ExportButton";
import BulkExpenseTable from "../components/BulkExpenseTable";

const DONUT_COLORS = ["#09090b", "#71717a", "#27272a", "#a1a1aa", "#52525b"];

const StatCardSkeleton = () => (
  <div className="h-32 bg-secondary/50 animate-pulse rounded-3xl border border-border" />
);

export default function Dashboard() {
  const { user } = useUser();
  const { currentMonth, currentYear, setMonth, setYear } = useStore();

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

  const totals = useMemo(() => {
    if (!expenses) return null;
    return expenses.reduce(
      (acc, curr) => {
        if (curr.transactionType === "Debit") acc.debit += curr.amount;
        else acc.credit += curr.amount;
        return acc;
      },
      { total: 0, credit: 0, debit: 0 }
    );
  }, [expenses]);

  const categoryData = useMemo(() => {
    if (!expenses) return [];
    const mapping = {};
    expenses
      .filter((e) => e.transactionType === "Debit")
      .forEach((e) => {
        mapping[e.categoryId] = (mapping[e.categoryId] || 0) + e.amount;
      });
    return Object.entries(mapping).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  // Smoothed Area Chart Data (Daily for current month)
  const areaData = useMemo(() => {
    if (!expenses) return [];
    const days = {};
    expenses.forEach((e) => {
      const day = format(new Date(e.date), "dd");
      days[day] =
        (days[day] || 0) + (e.transactionType === "Debit" ? e.amount : 0);
    });
    return Object.entries(days)
      .sort()
      .map(([name, amount]) => ({ name, amount }));
  }, [expenses]);

  const greetings = useMemo(() => {
    if (!user) return "Hello";
    const now = new Date();
    const hour = now.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }, [user]);

  return (
    <div className="space-y-12 pb-12">
      {/* Dynamic Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tighter">
            {greetings} {user?.firstName},
          </h2>
          <p className="text-muted-foreground font-medium">
            Your financial performance for{" "}
            {format(new Date(currentYear, currentMonth - 1), "MMMM yyyy")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="glass px-4 py-2.5 rounded-2xl flex items-center gap-3 border-border/50">
            <Calendar size={18} className="text-muted-foreground" />
            <select
              value={currentMonth}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="bg-transparent border-none outline-none font-bold text-sm cursor-pointer"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i} value={i + 1} className="bg-background">
                  {format(new Date(2000, i), "MMM")}
                </option>
              ))}
            </select>
            <div className="w-px h-4 bg-border" />
            <select
              value={currentYear}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="bg-transparent border-none outline-none font-bold text-sm cursor-pointer"
            >
              {[2024, 2025].map((y) => (
                <option key={y} value={y} className="bg-background">
                  {y}
                </option>
              ))}
            </select>
          </div>
          <ExportButton
            expenses={expenses || []}
            month={currentMonth}
            year={currentYear}
          />
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {!totals ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <div className="glass p-8 rounded-[2rem] border-border/40 group hover:border-primary/20 transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Outflow
                </span>
                <div className="p-2 rounded-xl bg-destructive/10 text-destructive">
                  <TrendingDown size={14} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-black tabular-nums">
                  ₹{totals.debit.toLocaleString("en-IN")}
                </h3>
                <span className="text-[10px] font-bold text-destructive flex items-center">
                  <ArrowDownRight size={10} /> 12%
                </span>
              </div>
            </div>

            <div className="glass p-8 rounded-[2rem] border-border/40 group hover:border-primary/20 transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Inflow
                </span>
                <div className="p-2 rounded-xl bg-green-500/10 text-green-500">
                  <TrendingUp size={14} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-black tabular-nums">
                  ₹{totals.credit.toLocaleString("en-IN")}
                </h3>
                <span className="text-[10px] font-bold text-green-500 flex items-center">
                  <ArrowUpRight size={10} /> 8%
                </span>
              </div>
            </div>

            <div className="bg-foreground text-background p-8 rounded-[2rem] shadow-2xl shadow-foreground/10 group">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-black uppercase tracking-widest opacity-60">
                  Balance
                </span>
                <Wallet2 size={16} />
              </div>
              <h3 className="text-3xl font-black tabular-nums truncate">
                ₹{(totals.credit - totals.debit).toLocaleString("en-IN")}
              </h3>
              <p className="text-[10px] font-bold opacity-40 mt-1 uppercase tracking-tighter">
                Current month delta
              </p>
            </div>
          </>
        )}
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <section className="lg:col-span-3 glass p-10 rounded-[2.5rem] border-border/40 space-y-8">
          <h3 className="text-xl font-bold tracking-tight">Spending Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.1}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#888" }}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                  }}
                  itemStyle={{ fontSize: 12, fontWeight: 700 }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="hsl(var(--primary))"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorAmt)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="lg:col-span-2 glass p-10 rounded-[2.5rem] border-border/40 space-y-8">
          <h3 className="text-xl font-bold tracking-tight">Allocations</h3>
          <div className="h-[300px] w-full">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground/50 border-2 border-dashed border-border rounded-3xl">
                Insufficient data
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Bulk Ledger Table */}
      <BulkExpenseTable expenses={expenses || []} />
    </div>
  );
}
