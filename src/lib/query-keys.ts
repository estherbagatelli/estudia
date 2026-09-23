/** Central React Query key factory — keeps cache keys consistent & typo-free. */
export const queryKeys = {
  tasks: (userId: string) => ["tasks", userId] as const,
  shoppingList: (userId: string) => ["shopping_list", userId] as const,
  shoppingItems: (userId: string, listId: string) =>
    ["shopping_items", userId, listId] as const,
  cloudState: (userId: string, key: string) => ["planner_settings", userId, key] as const,
  profile: (userId: string) => ["profile", userId] as const,
};
