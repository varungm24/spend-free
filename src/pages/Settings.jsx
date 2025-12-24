import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Plus,
  Trash2,
  Building2,
  CreditCard as CardIcon,
  Tag,
  AlertCircle,
  CheckCircle2,
  Info,
  Lock,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Settings() {
  const { user } = useUser();
  const settings = useQuery(api.users.getSettings, { userId: user?.id || "" });
  const updateSettings = useMutation(api.users.updateSettings);

  const [newBank, setNewBank] = useState("");
  const [newCard, setNewCard] = useState({ name: "", bank: "" });
  const [newCategory, setNewCategory] = useState("");
  const [status, setStatus] = useState(null);

  // We'll use this check to prevent deleting items tied to existing transactions
  const checkUsage = useMutation(api.expenses.checkUsage);

  if (!settings)
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
        <div className="h-64 bg-secondary/50 rounded-[2.5rem]" />
        <div className="h-64 bg-secondary/50 rounded-[2.5rem]" />
        <div className="lg:col-span-2 h-64 bg-secondary/50 rounded-[2.5rem]" />
      </div>
    );

  const handleUpdate = async (updates) => {
    try {
      await updateSettings({
        userId: user.id,
        banks: updates.banks || settings.banks,
        creditCards: updates.creditCards || settings.creditCards,
        categories: updates.categories || settings.categories,
      });
      setStatus({ type: "success", message: "Preferences synchronized" });
      setTimeout(() => setStatus(null), 3000);
    } catch {
      setStatus({ type: "error", message: "Synchronization failed" });
    }
  };

  const removeItem = async (type, item) => {
    // Check if the item is used in any expense
    const idToCheck = type === "card" ? item.name : item;
    const usageType = type === "category" ? "category" : "source";

    try {
      const inUse = await checkUsage({
        userId: user.id,
        type: usageType,
        id: idToCheck,
      });

      if (inUse) {
        setStatus({
          type: "error",
          message: `Cannot delete: "${idToCheck}" is linked to existing transactions.`,
        });
        return;
      }

      if (type === "bank") {
        const filteredBanks = settings.banks.filter((b) => b !== item);
        const filteredCards = settings.creditCards.filter(
          (c) => c.bank !== item
        );
        handleUpdate({ banks: filteredBanks, creditCards: filteredCards });
      } else if (type === "card") {
        const filteredCards = settings.creditCards.filter(
          (c) => c.name !== item.name
        );
        handleUpdate({ creditCards: filteredCards });
      } else if (type === "category") {
        const filteredCats = settings.categories.filter((c) => c !== item);
        handleUpdate({ categories: filteredCats });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Validation check failed" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header className="space-y-2">
        <h2 className="text-4xl font-black tracking-tighter">Settings</h2>
        <p className="text-muted-foreground font-medium">
          Configure your vault and spending taxonomy.
        </p>
      </header>

      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-2xl flex items-center justify-between border tracking-tighter font-bold shadow-xl ${
              status.type === "success"
                ? "bg-green-500/10 border-green-500/20 text-green-500"
                : "bg-destructive/10 border-destructive/20 text-destructive"
            }`}
          >
            <div className="flex items-center gap-3">
              {status.type === "success" ? (
                <CheckCircle2 size={18} />
              ) : (
                <AlertCircle size={18} />
              )}
              {status.message}
            </div>
            <button onClick={() => setStatus(null)}>
              <ChevronRight size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Banks Section */}
        <section className="glass p-8 rounded-[2.5rem] border-border/40 space-y-8 bg-card/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary text-primary-foreground">
                <Building2 size={20} />
              </div>
              <h3 className="text-xl font-bold">Banks</h3>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex gap-2 p-1.5 bg-secondary/50 rounded-2xl border border-border">
              <input
                value={newBank}
                onChange={(e) => setNewBank(e.target.value)}
                placeholder="New Bank"
                className="flex-1 bg-transparent border-none outline-none px-3 py-1 font-bold text-sm"
              />
              <button
                onClick={() => {
                  if (newBank) {
                    handleUpdate({ banks: [...settings.banks, newBank] });
                    setNewBank("");
                  }
                }}
                className="bg-foreground text-background p-2 rounded-xl shadow-md"
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="space-y-2">
              {settings.banks.map((bank) => (
                <div
                  key={bank}
                  className="flex items-center justify-between bg-card border border-border p-4 rounded-2xl group hover:shadow-md transition-shadow"
                >
                  <span className="font-bold">{bank}</span>
                  <button
                    onClick={() => removeItem("bank", bank)}
                    className="text-muted-foreground/30 hover:text-destructive transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Credit Cards Section */}
        <section className="glass p-8 rounded-[2.5rem] border-border/40 space-y-8 bg-card/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary text-primary-foreground">
              <CardIcon size={20} />
            </div>
            <h3 className="text-xl font-bold">Cards</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <input
                value={newCard.name}
                onChange={(e) =>
                  setNewCard({ ...newCard, name: e.target.value })
                }
                placeholder="Card Label"
                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 font-bold text-sm"
              />
              <div className="flex gap-2">
                <select
                  value={newCard.bank}
                  onChange={(e) =>
                    setNewCard({ ...newCard, bank: e.target.value })
                  }
                  className="flex-1 bg-secondary/50 border border-border rounded-xl px-4 py-3 outline-none text-sm font-bold appearance-none"
                >
                  <option value="">Select Bank</option>
                  {settings.banks.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    if (newCard.name && newCard.bank) {
                      handleUpdate({
                        creditCards: [...settings.creditCards, newCard],
                      });
                      setNewCard({ name: "", bank: "" });
                    }
                  }}
                  className="bg-foreground text-background px-6 rounded-xl font-black text-sm"
                >
                  Add
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {settings.creditCards.map((card) => (
                <div
                  key={card.name}
                  className="flex items-center justify-between bg-card border border-border p-4 rounded-2xl group hover:shadow-md transition-shadow"
                >
                  <div>
                    <p className="font-bold">{card.name}</p>
                    <p className="text-[10px] font-black uppercase text-muted-foreground leading-none">
                      {card.bank}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem("card", card)}
                    className="text-muted-foreground/30 hover:text-destructive transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="glass p-8 rounded-[2.5rem] border-border/40 space-y-8 bg-card/30 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary text-primary-foreground">
                <Tag size={20} />
              </div>
              <h3 className="text-xl font-bold">Categories</h3>
            </div>
            <div className="flex gap-2 p-1.5 bg-secondary/50 rounded-2xl border border-border w-64">
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New Category"
                className="flex-1 bg-transparent border-none outline-none px-3 py-1 font-bold text-sm"
              />
              <button
                onClick={() => {
                  if (newCategory) {
                    handleUpdate({
                      categories: [...settings.categories, newCategory],
                    });
                    setNewCategory("");
                  }
                }}
                className="bg-foreground text-background p-2 rounded-xl shadow-md"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {settings.categories.map((cat) => (
              <div
                key={cat}
                className="flex items-center justify-between bg-card border border-border px-4 py-3 rounded-2xl group hover:border-primary/20 transition-all"
              >
                <span className="font-bold text-sm">{cat}</span>
                <button
                  onClick={() => removeItem("category", cat)}
                  className="text-muted-foreground/30 hover:text-destructive transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Security / System Section */}
        <section className="bg-secondary/20 p-8 rounded-[2.5rem] border border-border border-dashed lg:col-span-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground">
              <Lock size={20} />
            </div>
            <div>
              <h4 className="font-bold underline decoration-primary/20 underline-offset-4">
                Vault Integrity
              </h4>
              <p className="text-sm text-muted-foreground font-medium">
                Items currently linked to a transaction cannot be deleted.
              </p>
            </div>
          </div>
          <div className="text-[10px] uppercase tracking-widest font-black text-muted-foreground flex items-center gap-2">
            <Info size={12} /> Live Protection Active
          </div>
        </section>
      </div>
    </div>
  );
}
