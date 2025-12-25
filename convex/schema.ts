import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  userSettings: defineTable({
    userId: v.string(), // Clerk userId
    banks: v.array(v.string()),
    creditCards: v.array(
      v.object({
        name: v.string(),
        bank: v.string(),
        type: v.string(),
      })
    ),
    categories: v.array(v.string()),
  }).index("by_userId", ["userId"]),

  expenses: defineTable({
    userId: v.string(),
    date: v.string(), // ISO string or numeric timestamp
    categoryId: v.string(),
    description: v.string(),
    amount: v.number(),
    paymentType: v.string(), // "Credit Card", "UPI", "Cash"
    sourceId: v.string(), // Bank name or Card name
    transactionType: v.string(), // "Debit", "Credit"
  })
    .index("by_userId", ["userId"])
    .index("by_userId_date", ["userId", "date"]),

  budgets: defineTable({
    userId: v.string(),
    amount: v.number(),
    month: v.number(),
    year: v.number(),
  }).index("by_userId_period", ["userId", "month", "year"]),
});
