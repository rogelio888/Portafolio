import { error } from '@sveltejs/kit';
import { getRecipeBySlug, recipes } from '$lib/data/recipes';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => {
	return recipes.map((r) => ({ slug: r.slug }));
};

export const load: PageLoad = ({ params }) => {
	const recipe = getRecipeBySlug(params.slug);
	if (!recipe) {
		error(404, 'Receta no encontrada');
	}
	return { recipe };
};
