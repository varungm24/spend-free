import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getBudget = query({
  args: { userId: v.string(), month: v.number(), year: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("budgets")
      .withIndex("by_userId_period", (q) =>
        q
          .eq("userId", args.userId)
          .eq("month", args.month)
          .eq("year", args.year)
      )
      .unique();
  },
});

export const updateBudget = mutation({
  args: {
    userId: v.string(),
    amount: v.number(),
    month: v.number(),
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("budgets")
      .withIndex("by_userId_period", (q) =>
        q
          .eq("userId", args.userId)
          .eq("month", args.month)
          .eq("year", args.year)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { amount: args.amount });
    } else {
      await ctx.db.insert("budgets", { ...args });
    }
  },
});
