import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Trash2,
  Plus,
  X,
  CheckCircle2,
  Table as TableIcon,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";

const BulkExpenseTable = forwardRef(({ expenses, onExpensesChange }, ref) => {
  const { user } = useUser();
  const settings = useQuery(api.users.getSettings, { userId: user?.id || "" });
  const createExpense = useMutation(api.expenses.create);
  const deleteExpense = useMutation(api.expenses.deleteExpense);

  const updateExpense = useMutation(api.expenses.update);

  const [localRows, setLocalRows] = useState([]);
  const [editingCell, setEditingCell] = useState(null); // { rowIndex, field }
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [isSaving, setIsSaving] = useState(false);

  useImperativeHandle(ref, () => ({
    addCustomRow: (data) => {
      const newRow = {
        _id: `new-${Date.now()}`,
        date: data.date || format(new Date(), "yyyy-MM-dd"),
        description: data.description || "",
        categoryId: data.categoryId || settings?.categories[0] || "General",
        amount: data.amount || 0,
        paymentType: data.paymentType || "UPI",
        sourceId: data.sourceId || settings?.banks[0] || "Cash",
        transactionType: data.transactionType || "Debit",
        isNew: true,
      };
      setLocalRows([newRow, ...localRows]);
      if (onExpensesChange) onExpensesChange();
    },
  }));

  // Sync with prop when expenses change (e.g. month change)
  useEffect(() => {
    if (expenses) {
      setLocalRows(expenses.map((e) => ({ ...e, isNew: false })));
    }
  }, [expenses]);

  const addRow = () => {
    const newRow = {
      _id: `new-${Date.now()}`,
      date: format(new Date(), "yyyy-MM-dd"),
      description: "",
      categoryId: settings?.categories[0] || "General",
      amount: 0,
      paymentType: "UPI",
      sourceId: settings?.banks[0] || "Cash",
      transactionType: "Debit",
      isNew: true,
    };
    setLocalRows([newRow, ...localRows]);
    setEditingCell({ rowIndex: 0, field: "description" });
    if (onExpensesChange) onExpensesChange();
  };

  const handleCellEdit = async (rowIndex, field, value) => {
    const updated = [...localRows];
    const row = updated[rowIndex];

    // If we change paymentType, we might need to reset sourceId
    let newSourceId = row.sourceId;
    if (field === "paymentType") {
      if (value === "Card") {
        newSourceId = settings?.creditCards[0]?.name || "";
      } else if (value === "UPI") {
        newSourceId = settings?.banks[0] || "";
      } else {
        newSourceId = "Cash";
      }
    }

    updated[rowIndex] = { ...row, [field]: value, sourceId: newSourceId };
    setLocalRows(updated);

    // Auto-save if it's NOT a brand new row (existing expense)
    if (!row.isNew) {
      try {
        await updateExpense({
          id: row._id,
          [field]: field === "amount" ? parseFloat(value) : value,
          ...(field === "paymentType" ? { sourceId: newSourceId } : {}),
        });
        if (onExpensesChange) onExpensesChange();
      } catch (err) {
        console.error("Auto-save failed:", err);
      }
    }
  };

  const saveNewRow = async (rowIndex) => {
    const row = localRows[rowIndex];
    if (row.isNew) {
      setIsSaving(true);
      try {
        await createExpense({
          userId: user.id,
          date: row.date,
          categoryId: row.categoryId,
          description: row.description,
          amount: parseFloat(row.amount),
          paymentType: row.paymentType,
          sourceId: row.sourceId,
          transactionType: row.transactionType,
        });
        const updated = [...localRows];
        updated[rowIndex].isNew = false;
        setLocalRows(updated);
        if (onExpensesChange) onExpensesChange();
      } catch (err) {
        console.error(err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === localRows.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(localRows.map((r) => r._id.toString())));
    }
  };

  const toggleSelectRow = (id) => {
    const next = new Set(selectedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRows(next);
  };

  const bulkDelete = async () => {
    setIsSaving(true);
    try {
      for (const id of selectedRows) {
        if (!id.toString().startsWith("new-")) {
          await deleteExpense({ id });
        }
      }
      setLocalRows(
        localRows.filter((r) => !selectedRows.has(r._id.toString()))
      );
      setSelectedRows(new Set());
      if (onExpensesChange) onExpensesChange();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e, rowIndex) => {
    if (e.key === "Enter") {
      setEditingCell(null);
      if (localRows[rowIndex].isNew) {
        saveNewRow(rowIndex);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <TableIcon size={20} className="text-muted-foreground" />
            Ledger
          </h3>
          <AnimatePresence>
            {selectedRows.size > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-2 bg-destructive/10 text-destructive px-3 py-1.5 rounded-xl border border-destructive/20"
              >
                <span className="text-sm font-bold">
                  {selectedRows.size} Selected
                </span>
                <button
                  onClick={bulkDelete}
                  className="hover:scale-110 transition-transform"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={addRow}
          disabled={isSaving}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-sm disabled:opacity-50"
        >
          {isSaving ? (
            <Sparkles size={16} className="animate-spin" />
          ) : (
            <Plus size={16} />
          )}
          New Row
        </button>
      </div>

      <div className="glass rounded-[2rem] overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-black border-b border-border">
                <th className="px-6 py-4 w-12 text-center text-xs">
                  <input
                    type="checkbox"
                    checked={
                      localRows.length > 0 &&
                      selectedRows.size === localRows.length
                    }
                    onChange={toggleSelectAll}
                    className="accent-primary"
                  />
                </th>
                <th className="px-4 py-4 w-32">Date</th>
                <th className="px-4 py-4 min-w-[200px]">Description</th>
                <th className="px-4 py-4 w-32 text-center">Category</th>
                <th className="px-4 py-4 w-40 text-center">Method</th>
                <th className="px-4 py-4 w-40 text-center">Bank</th>
                <th className="px-4 py-4 w-32 text-right">Amount</th>
                <th className="px-4 py-4 w-24 text-center">Type</th>
                <th className="px-6 py-4 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {localRows.map((row, idx) => (
                <tr
                  key={row._id.toString()}
                  className={`group transition-all h-[64px] ${
                    selectedRows.has(row._id.toString())
                      ? "bg-primary/5"
                      : "hover:bg-secondary/30"
                  }`}
                >
                  <td className="px-6 py-2 text-center text-xs">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(row._id.toString())}
                      onChange={() => toggleSelectRow(row._id.toString())}
                      className="accent-primary"
                    />
                  </td>

                  {/* Date Cell */}
                  <td className="px-4 py-2">
                    {editingCell?.rowIndex === idx &&
                    editingCell?.field === "date" ? (
                      <input
                        type="date"
                        autoFocus
                        value={row.date}
                        className="w-full bg-card border border-primary rounded-lg px-2 py-1 outline-none shadow-sm text-sm"
                        onBlur={() => setEditingCell(null)}
                        onChange={(e) =>
                          handleCellEdit(idx, "date", e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                      />
                    ) : (
                      <div
                        className="cursor-pointer font-medium tabular-nums text-sm"
                        onClick={() =>
                          setEditingCell({ rowIndex: idx, field: "date" })
                        }
                      >
                        {format(new Date(row.date), "dd MMM")}
                      </div>
                    )}
                  </td>

                  {/* Description Cell */}
                  <td className="px-4 py-2">
                    {editingCell?.rowIndex === idx &&
                    editingCell?.field === "description" ? (
                      <input
                        autoFocus
                        value={row.description}
                        className="w-full bg-card border border-primary rounded-lg px-2 py-1 outline-none shadow-sm text-sm"
                        onBlur={() => setEditingCell(null)}
                        onChange={(e) =>
                          handleCellEdit(idx, "description", e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                      />
                    ) : (
                      <div
                        className="cursor-pointer truncate max-w-[200px] font-medium text-sm"
                        onClick={() =>
                          setEditingCell({
                            rowIndex: idx,
                            field: "description",
                          })
                        }
                      >
                        {row.description || (
                          <span className="text-muted-foreground/30 italic">
                            Add details...
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Category Cell */}
                  <td className="px-4 py-2 text-center">
                    <select
                      value={row.categoryId}
                      onChange={(e) =>
                        handleCellEdit(idx, "categoryId", e.target.value)
                      }
                      className="bg-transparent border-none outline-none font-bold text-[10px] uppercase cursor-pointer hover:bg-secondary/50 px-2 py-1 rounded-lg w-full"
                    >
                      {settings?.categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Method Cell */}
                  <td className="px-4 py-2 text-center">
                    <select
                      value={row.paymentType}
                      onChange={(e) =>
                        handleCellEdit(idx, "paymentType", e.target.value)
                      }
                      className="bg-transparent border-none outline-none text-[10px] font-black uppercase cursor-pointer hover:bg-secondary/50 px-2 py-1 rounded-lg w-full"
                    >
                      <option value="UPI">UPI</option>
                      <option value="Card">Card</option>
                      <option value="Cash">Cash</option>
                    </select>
                  </td>

                  {/* Bank/Card Selection Cell */}
                  <td className="px-4 py-2 text-center">
                    <select
                      value={row.sourceId}
                      onChange={(e) =>
                        handleCellEdit(idx, "sourceId", e.target.value)
                      }
                      disabled={row.paymentType === "Cash"}
                      className={`bg-transparent border-none outline-none text-[10px] font-bold uppercase cursor-pointer hover:bg-secondary/50 px-2 py-1 rounded-lg w-full text-muted-foreground ${row.paymentType === "Cash" ? "opacity-30 cursor-not-allowed" : ""}`}
                    >
                      {row.paymentType === "Card" ? (
                        settings?.creditCards.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.brand} • {c.name} ({c.bank})
                          </option>
                        ))
                      ) : row.paymentType === "UPI" ? (
                        settings?.banks.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))
                      ) : (
                        <option value="Cash">Cash</option>
                      )}
                    </select>
                  </td>

                  {/* Amount Cell */}
                  <td className="px-4 py-2 text-right">
                    {editingCell?.rowIndex === idx &&
                    editingCell?.field === "amount" ? (
                      <input
                        type="number"
                        autoFocus
                        value={row.amount}
                        className="w-24 bg-card border border-primary rounded-lg px-2 py-1 outline-none text-right text-sm"
                        onBlur={() => setEditingCell(null)}
                        onChange={(e) =>
                          handleCellEdit(idx, "amount", e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                      />
                    ) : (
                      <div
                        className={`cursor-pointer font-black tabular-nums text-sm ${row.transactionType === "Debit" ? "text-foreground" : "text-green-500"}`}
                        onClick={() =>
                          setEditingCell({ rowIndex: idx, field: "amount" })
                        }
                      >
                        ₹{parseFloat(row.amount || 0).toLocaleString("en-IN")}
                      </div>
                    )}
                  </td>

                  {/* Type Cell */}
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() =>
                        handleCellEdit(
                          idx,
                          "transactionType",
                          row.transactionType === "Debit" ? "Credit" : "Debit"
                        )
                      }
                      className={`text-[8px] px-2 py-0.5 rounded-full font-black border uppercase transition-colors ${
                        row.transactionType === "Debit"
                          ? "bg-secondary border-border text-muted-foreground"
                          : "bg-green-500/10 border-green-500/20 text-green-500"
                      }`}
                    >
                      {row.transactionType}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {row.isNew && (
                        <button
                          onClick={() => saveNewRow(idx)}
                          className="text-primary hover:scale-110 transition-transform"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (row.isNew) {
                            setLocalRows(localRows.filter((_, i) => i !== idx));
                          } else {
                            deleteExpense({ id: row._id });
                          }
                        }}
                        className="text-muted-foreground/30 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                      >
                        {row.isNew ? <X size={16} /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {localRows.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <TableIcon size={32} className="text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground font-medium">
                No ledger entries.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default BulkExpenseTable;
