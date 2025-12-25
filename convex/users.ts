import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getSettings = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

export const updateSettings = mutation({
  args: {
    userId: v.string(),
    banks: v.array(v.string()),
    creditCards: v.array(
      v.object({
        name: v.string(),
        bank: v.string(),
        type: v.string(),
      })
    ),
    categories: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        banks: args.banks,
        creditCards: args.creditCards,
        categories: args.categories,
      });
    } else {
      await ctx.db.insert("userSettings", {
        userId: args.userId,
        banks: args.banks,
        creditCards: args.creditCards,
        categories: args.categories,
      });
    }
  },
});
