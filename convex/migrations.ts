import { mutation } from "./_generated/server";

export const clearLegacyBudgets = mutation({
  args: {},
  handler: async (ctx) => {
    const allBudgets = await ctx.db.query("budgets").collect();
    for (const budget of allBudgets) {
      if ("categoryId" in budget && budget.categoryId !== "total") {
        // Keep the total if it exists, or just clear everything for a fresh start
        // Given the prompt, let's just delete everything that doesn't fit the new model
        await ctx.db.delete(budget._id);
      }
    }
  },
});
