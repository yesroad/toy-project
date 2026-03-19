import type { Ingredient, CoupangLinks } from '@/types/api/routeApi/response';
import IngredientChip from '@/components/IngredientChip';

interface IngredientListProps {
  ingredients: Ingredient[];
  coupangLinks?: CoupangLinks;
}

export default function IngredientList({ ingredients, coupangLinks }: IngredientListProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {ingredients.map((ingredient, index) => (
        <IngredientChip
          key={`${index}-${ingredient.name}`}
          name={ingredient.name}
          amount={ingredient.amount}
          link={coupangLinks?.[ingredient.name]}
        />
      ))}
    </div>
  );
}
