import type { Metadata } from 'next';
import SavedRecipesView from './SavedRecipesView';

export const metadata: Metadata = {
  title: '나의 레시피',
};

export default function SavedPage() {
  return <SavedRecipesView />;
}
