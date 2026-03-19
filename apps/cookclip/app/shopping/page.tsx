import type { Metadata } from 'next';
import ShoppingListView from './ShoppingListView';

export const metadata: Metadata = {
  title: '장보기 목록',
};

export default function ShoppingPage() {
  return <ShoppingListView />;
}
