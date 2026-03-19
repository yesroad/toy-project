export interface ShoppingItem {
  id: string;
  name: string;
  amount: string;
  videoId: string;
  videoTitle: string;
  checked: boolean;
  addedAt: number;
}

const STORAGE_KEY = 'cookclip_shopping_list';

export function loadShoppingList(): ShoppingItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ShoppingItem[];
  } catch {
    return [];
  }
}

export function saveShoppingList(items: ShoppingItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage 용량 초과 등 무시
  }
}

export function addItems(
  existing: ShoppingItem[],
  newItems: Array<{ name: string; amount: string }>,
  videoId: string,
  videoTitle: string,
): ShoppingItem[] {
  const existingNames = new Set(existing.map((i) => i.name));
  const toAdd = newItems
    .filter((i) => !existingNames.has(i.name))
    .map((i) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: i.name,
      amount: i.amount,
      videoId,
      videoTitle,
      checked: false,
      addedAt: Date.now(),
    }));
  return [...existing, ...toAdd];
}

export function toggleItem(items: ShoppingItem[], id: string): ShoppingItem[] {
  return items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i));
}

export function removeItem(items: ShoppingItem[], id: string): ShoppingItem[] {
  return items.filter((i) => i.id !== id);
}

export function clearChecked(items: ShoppingItem[]): ShoppingItem[] {
  return items.filter((i) => !i.checked);
}
