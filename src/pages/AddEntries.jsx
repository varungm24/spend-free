import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  PlusCircle,
  Calendar,
  ChevronRight,
  Sparkles,
  Info,
} from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import BulkExpenseTable from "../components/BulkExpenseTable";

export default function AddEntries() {
  const { user } = useUser();

  // Local state for month/year on this screen
  const [viewMonth, setViewMonth] = useState(new Date().getMonth() + 1);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());

  const startDate = format(
    startOfMonth(new Date(viewYear, viewMonth - 1)),
    "yyyy-MM-dd"
  );
  const endDate = format(
    endOfMonth(new Date(viewYear, viewMonth - 1)),
    "yyyy-MM-dd"
  );

  const expenses = useQuery(api.expenses.list, {
    userId: user?.id || "",
    startDate,
    endDate,
  });

  return (
    <div className="space-y-10 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
            <PlusCircle size={14} />
            Data Entry
          </div>
          <h2 className="text-4xl font-black tracking-tighter">
            Log Transactions
          </h2>
          <p className="text-muted-foreground font-medium">
            Add or edit records for any period.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="glass px-4 py-2.5 rounded-2xl flex items-center gap-3 border-border/50">
            <Calendar size={18} className="text-muted-foreground" />
            <select
              value={viewMonth}
              onChange={(e) => setViewMonth(parseInt(e.target.value))}
              className="bg-transparent border-none outline-none font-bold text-sm cursor-pointer"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i} value={i + 1} className="bg-background">
                  {format(new Date(2000, i), "MMMM")}
                </option>
              ))}
            </select>
            <div className="w-px h-4 bg-border" />
            <select
              value={viewYear}
              onChange={(e) => setViewYear(parseInt(e.target.value))}
              className="bg-transparent border-none outline-none font-bold text-sm cursor-pointer"
            >
              {[2024, 2025].map((y) => (
                <option key={y} value={y} className="bg-background">
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <div className="bg-primary/5 border border-primary/20 p-6 rounded-[2.5rem] flex items-start gap-4">
        <div className="p-3 bg-primary text-primary-foreground rounded-2xl shadow-lg shadow-primary/20">
          <Sparkles size={24} />
        </div>
        <div>
          <h4 className="font-bold text-lg">Batch Processing</h4>
          <p className="text-muted-foreground text-sm font-medium">
            Add new rows to quickly log multiple transactions. Changes are saved
            per-row. Use the date picker in the table to log entries for
            specific days.
          </p>
        </div>
      </div>

      <BulkExpenseTable expenses={expenses || []} />

      <section className="bg-secondary/20 p-8 rounded-[2.5rem] border border-border border-dashed flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground">
            <Info size={20} />
          </div>
          <div>
            <h4 className="font-bold">Entry Tips</h4>
            <p className="text-sm text-muted-foreground font-medium">
              Press{" "}
              <kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">
                Enter
              </kbd>{" "}
              to save a new row instantly.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
