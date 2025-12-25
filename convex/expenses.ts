import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    userId: v.string(),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_userId_date", (q) =>
        q
          .eq("userId", args.userId)
          .gte("date", args.startDate)
          .lte("date", args.endDate)
      )
      .collect();
    return expenses;
  },
});

export const create = mutation({
  args: {
    userId: v.string(),
    date: v.string(),
    categoryId: v.string(),
    description: v.string(),
    amount: v.number(),
    paymentType: v.string(),
    sourceId: v.string(),
    transactionType: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("expenses", {
      ...args,
    });
  },
});

export const deleteExpense = mutation({
  args: { id: v.id("expenses") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const update = mutation({
  args: {
    id: v.id("expenses"),
    date: v.optional(v.string()),
    categoryId: v.optional(v.string()),
    description: v.optional(v.string()),
    amount: v.optional(v.number()),
    paymentType: v.optional(v.string()),
    sourceId: v.optional(v.string()),
    transactionType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const getBySource = query({
  args: { sourceId: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("expenses")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("sourceId"), args.sourceId))
      .first();
  },
});

export const getByCategory = query({
  args: { categoryId: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("expenses")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("categoryId"), args.categoryId))
      .first();
  },
});
export const checkUsage = mutation({
  args: {
    type: v.union(v.literal("source"), v.literal("category")),
    id: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) =>
        args.type === "source"
          ? q.eq(q.field("sourceId"), args.id)
          : q.eq(q.field("categoryId"), args.id)
      )
      .first();
    return !!expenses;
  },
});
