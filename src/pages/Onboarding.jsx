import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Trash2,
  Building2,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Coffee,
  ShoppingBag,
  Film,
  Plane,
  Car,
  ShoppingCart,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PRESET_CATEGORIES = [
  { name: "Food", icon: Coffee },
  { name: "Shopping", icon: ShoppingBag },
  { name: "Entertainment", icon: Film },
  { name: "Travel", icon: Plane },
  { name: "Cabs", icon: Car },
  { name: "Grocery", icon: ShoppingCart },
];

export default function Onboarding() {
  const { user } = useUser();
  const updateSettings = useMutation(api.users.updateSettings);
  const [step, setStep] = useState(1);
  const [banks, setBanks] = useState([]);
  const [newBank, setNewBank] = useState("");
  const [cards, setCards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCard, setNewCard] = useState({
    name: "",
    bank: "",
    type: "Credit",
  });

  const handleFinish = async () => {
    const sanitizedCards = cards.map(({ name, bank, type }) => ({
      name,
      bank,
      type,
    }));

    await updateSettings({
      userId: user.id,
      banks,
      creditCards: sanitizedCards,
      categories,
    });
  };

  const steps = [
    {
      id: 1,
      title: "Welcome",
      description: "Let's personalize your experience",
    },
    { id: 2, title: "Banks", description: "Connect your primary accounts" },
    { id: 3, title: "Cards", description: "Link your credit cards" },
    { id: 4, title: "Categories", description: "Organize your spending" },
  ];

  const containerVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Progress Track */}
      <div className="w-full max-w-2xl mb-12 flex justify-between items-center px-4">
        {steps.map((s) => (
          <div key={s.id} className="flex flex-col items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${
                step >= s.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step > s.id ? <CheckCircle2 size={24} /> : s.id}
            </div>
            <span
              className={`text-xs font-bold uppercase tracking-widest ${step >= s.id ? "text-primary" : "text-muted-foreground"}`}
            >
              {s.title}
            </span>
          </div>
        ))}
      </div>

      <div className="w-full max-w-2xl bg-card border border-border rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        {/* Animated Accent */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-muted">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(step / steps.length) * 100}%` }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <header className="space-y-2">
              <h2 className="text-4xl font-black tracking-tight">
                {steps[step - 1].title}
              </h2>
              <p className="text-muted-foreground text-lg">
                {steps[step - 1].description}
              </p>
            </header>

            {step === 1 && (
              <div className="space-y-8 py-4">
                <div className="flex items-center gap-6 p-6 rounded-3xl bg-secondary/50 border border-border">
                  <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-xl">
                    <TrendingUp size={32} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">Currency: INR (₹)</h3>
                    <p className="text-muted-foreground">
                      All transactions will be natively handled in Indian
                      Rupees.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Bank Shield",
                      desc: "No direct access, manual logging",
                      icon: ShieldCheck,
                    },
                    {
                      title: "Fast Logging",
                      desc: "Minimal taps for entry",
                      icon: Zap,
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="p-6 rounded-3xl border border-border bg-card hover:bg-secondary/30 transition-colors"
                    >
                      <item.icon className="text-primary mb-3" size={24} />
                      <h4 className="font-bold underline decoration-primary/30 decoration-2 underline-offset-4">
                        {item.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Bank Name (e.g. HDFC)"
                    value={newBank}
                    onChange={(e) => setNewBank(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      newBank &&
                      (setBanks([...banks, newBank]), setNewBank(""))
                    }
                    className="flex-1 bg-secondary border border-border rounded-xl px-4 py-3 focus:ring-2 ring-primary/20 outline-none transition-all"
                  />
                  <button
                    onClick={() => {
                      if (newBank) {
                        setBanks([...banks, newBank]);
                        setNewBank("");
                      }
                    }}
                    className="bg-primary text-primary-foreground px-6 rounded-xl font-bold"
                  >
                    Add
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <AnimatePresence>
                    {banks.map((bank, i) => (
                      <motion.div
                        key={bank}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-center justify-between p-4 rounded-2xl bg-secondary border border-border group"
                      >
                        <div className="flex items-center gap-3">
                          <Building2
                            size={18}
                            className="text-muted-foreground"
                          />
                          <span className="font-bold">{bank}</span>
                        </div>
                        <button
                          onClick={() =>
                            setBanks(banks.filter((_, idx) => idx !== i))
                          }
                          className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {banks.length === 0 && (
                  <div className="text-center py-12 rounded-3xl border-2 border-dashed border-border bg-muted/20">
                    <Building2
                      className="mx-auto text-muted-foreground mb-3"
                      size={32}
                    />
                    <p className="text-muted-foreground font-medium">
                      Add at least one bank account
                    </p>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    placeholder="Card Label (e.g. My Shopping Card)"
                    value={newCard.name}
                    onChange={(e) =>
                      setNewCard({ ...newCard, name: e.target.value })
                    }
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 focus:ring-2 ring-primary/20 outline-none"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={newCard.type}
                      onChange={(e) =>
                        setNewCard({ ...newCard, type: e.target.value })
                      }
                      className="flex-1 bg-secondary border border-border rounded-xl px-4 py-3 outline-none"
                    >
                      <option value="Credit">Credit Card</option>
                      <option value="Debit">Debit Card</option>
                    </select>
                    <select
                      value={newCard.bank}
                      onChange={(e) =>
                        setNewCard({ ...newCard, bank: e.target.value })
                      }
                      className="flex-1 bg-secondary border border-border rounded-xl px-4 py-3 outline-none"
                    >
                      <option value="">Link to Bank</option>
                      {banks.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      if (newCard.name && newCard.bank && newCard.type) {
                        setCards([...cards, newCard]);
                        setNewCard({
                          name: "",
                          bank: "",
                          type: "Credit",
                        });
                      }
                    }}
                    className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                  >
                    Link Card
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <AnimatePresence>
                    {cards.map((card, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-2xl bg-secondary border border-border flex justify-between group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold">{card.name}</p>
                            <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              {card.type}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">
                            {card.bank}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setCards(cards.filter((_, idx) => idx !== i))
                          }
                          className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="bg-primary/5 border border-primary/20 p-5 rounded-3xl flex items-start gap-4">
                  <div className="p-2 bg-primary/10 text-primary rounded-xl">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">
                      Note: Customize your vault
                    </h4>
                    <p className="text-muted-foreground text-xs font-medium leading-relaxed">
                      Tap the category cards below to include or exclude them
                      from your tracker. Selected categories will be available
                      when logging expenses.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {PRESET_CATEGORIES.map((cat) => {
                    const isSelected = categories.includes(cat.name);
                    return (
                      <button
                        key={cat.name}
                        onClick={() => {
                          if (isSelected)
                            setCategories(
                              categories.filter((c) => c !== cat.name)
                            );
                          else setCategories([...categories, cat.name]);
                        }}
                        className={`flex flex-col items-center gap-3 p-6 rounded-[2rem] border transition-all duration-300 ${
                          isSelected
                            ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 border-primary"
                            : "bg-secondary border-border text-muted-foreground grayscale hover:grayscale-0 hover:bg-card hover:border-muted-foreground/30"
                        }`}
                      >
                        <cat.icon size={32} strokeWidth={isSelected ? 3 : 2} />
                        <span className="font-black text-xs uppercase tracking-widest">
                          {cat.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-12 pt-8 border-t border-border">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 text-muted-foreground font-bold hover:text-foreground transition-colors"
            >
              Back
            </button>
          )}
          <div className="flex-1" />
          <motion.button
            whileTap={{ scale: 0.95 }}
            disabled={step === 2 && banks.length === 0}
            onClick={() => {
              if (step < 4) setStep(step + 1);
              else handleFinish();
            }}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black text-lg shadow-2xl shadow-primary/20 disabled:opacity-50"
          >
            {step === 4 ? "Begin Journey" : "Continue"}
            <ChevronRight size={24} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
