'use client';

import { useState, useEffect } from 'react';
import type { ShoppingItem } from '@/lib/shopping-list';
import {
  loadShoppingList,
  saveShoppingList,
  addItems,
  toggleItem,
  removeItem,
  clearChecked,
} from '@/lib/shopping-list';

export function useShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([]);

  useEffect(() => {
    setItems(loadShoppingList());
  }, []);

  const updateItems = (next: ShoppingItem[]) => {
    setItems(next);
    saveShoppingList(next);
  };

  const addIngredients = (
    ingredients: Array<{ name: string; amount: string }>,
    videoId: string,
    videoTitle: string,
  ) => updateItems(addItems(items, ingredients, videoId, videoTitle));

  const toggle = (id: string) => updateItems(toggleItem(items, id));
  const remove = (id: string) => updateItems(removeItem(items, id));
  const clearDone = () => updateItems(clearChecked(items));

  return { items, addIngredients, toggle, remove, clearDone };
}
