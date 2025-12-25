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
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

export default function Settings() {
  const { user } = useUser();
  const settings = useQuery(api.users.getSettings, { userId: user?.id || "" });
  const updateSettings = useMutation(api.users.updateSettings);

  const [newBank, setNewBank] = useState("");
  const [newCard, setNewCard] = useState({
    name: "",
    bank: "",
    type: "Credit",
  });
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
      const sanitizedCards = (updates.creditCards || settings.creditCards).map(
        ({ name, bank, type }) => ({ name, bank, type })
      );

      await updateSettings({
        userId: user.id,
        banks: updates.banks || settings.banks,
        creditCards: sanitizedCards,
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
        handleUpdate({ banks: filteredBanks });
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
              <Input
                value={newBank}
                onChange={(e) => setNewBank(e.target.value)}
                placeholder="New Bank"
                className="flex-1 bg-transparent border-none outline-none px-3 py-1 font-bold text-sm shadow-none focus-visible:ring-0"
              />
              <Button
                size="icon"
                onClick={() => {
                  if (newBank) {
                    handleUpdate({ banks: [...settings.banks, newBank] });
                    setNewBank("");
                  }
                }}
                className="rounded-xl shadow-md h-9 w-9"
              >
                <Plus size={18} />
              </Button>
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
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">
                  Card Name / Label
                </Label>
                <Input
                  value={newCard.name}
                  onChange={(e) =>
                    setNewCard({ ...newCard, name: e.target.value })
                  }
                  placeholder="e.g. My Shopping Card"
                  className="bg-secondary/50 border-border font-bold text-sm h-11 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">
                    Card Type
                  </Label>
                  <Select
                    value={newCard.type}
                    onValueChange={(val) =>
                      setNewCard({ ...newCard, type: val })
                    }
                  >
                    <SelectTrigger className="bg-secondary/50 border-border font-bold text-sm h-11 rounded-xl">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Credit">Credit Card</SelectItem>
                      <SelectItem value="Debit">Debit Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">
                    Issuing Bank
                  </Label>
                  <Select
                    value={newCard.bank}
                    onValueChange={(val) =>
                      setNewCard({ ...newCard, bank: val })
                    }
                  >
                    <SelectTrigger className="bg-secondary/50 border-border font-bold text-sm h-11 rounded-xl">
                      <SelectValue placeholder="Select Bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {settings.banks.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={() => {
                  if (newCard.name && newCard.bank && newCard.type) {
                    handleUpdate({
                      creditCards: [...settings.creditCards, newCard],
                    });
                    setNewCard({
                      name: "",
                      bank: "",
                      type: "Credit",
                    });
                  }
                }}
                className="h-11 px-8 rounded-xl font-black text-sm"
              >
                Add Card
              </Button>
            </div>
            <div className="space-y-2">
              {settings.creditCards.map((card) => (
                <div
                  key={card.name}
                  className="flex items-center justify-between bg-card border border-border p-4 rounded-2xl group hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{card.name}</span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {card.type}
                      </span>
                    </div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground leading-none mt-1">
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
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New Category"
                className="flex-1 bg-transparent border-none outline-none px-3 py-1 font-bold text-sm shadow-none focus-visible:ring-0"
              />
              <Button
                size="icon"
                onClick={() => {
                  if (newCategory) {
                    handleUpdate({
                      categories: [...settings.categories, newCategory],
                    });
                    setNewCategory("");
                  }
                }}
                className="rounded-xl shadow-md h-9 w-9"
              >
                <Plus size={18} />
              </Button>
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
