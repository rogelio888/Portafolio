export interface Recipe {
	slug: string;
	title: string;
	category: string;
	icon: 'tomato' | 'chili' | 'garlic' | 'knife' | 'pan' | 'pot' | 'herbs' | 'bread' | 'lemon' | 'egg';
	excerpt: string;
	time: string;
	difficulty: 'Fácil' | 'Media' | 'Alta';
	servings: string;
	ingredients: string[];
	steps: string[];
	note: string;
}

export const recipes: Recipe[] = [
	{
		slug: 'sopa-de-mani',
		title: 'Sopa de Maní con Chuño',
		category: 'Platos Fuertes',
		icon: 'pot',
		excerpt: 'La sopa que cura resfríos, resacas y días difíciles. Maní tostado, papa y chuño en un caldo espeso.',
		time: '1 h 10 min',
		difficulty: 'Media',
		servings: '6 porciones',
		ingredients: [
			'250 g de maní tostado, molido',
			'500 g de costilla de res',
			'2 papas medianas, en cubos',
			'4 chuños remojados',
			'1 zanahoria picada',
			'1 taza de arvejas',
			'2 litros de caldo de res',
			'Perejil fresco picado',
			'Sal y comino al gusto'
		],
		steps: [
			'Hervir la costilla en el caldo durante 40 minutos hasta que esté tierna.',
			'Disolver el maní molido en un poco de caldo tibio y agregar a la olla.',
			'Incorporar zanahoria, papa y chuño. Cocinar 20 minutos a fuego medio.',
			'Añadir las arvejas los últimos 5 minutos.',
			'Ajustar sal y comino, servir caliente con perejil fresco por encima.'
		],
		note: 'El secreto está en tostar el maní vos mismo, nunca uses maní ya molido de bolsa.'
	},
	{
		slug: 'salteñas-paceñas',
		title: 'Salteñas Paceñas',
		category: 'Desayunos',
		icon: 'bread',
		excerpt: 'El desayuno dominical por excelencia. Masa dulce, relleno jugoso y ese primer mordisco con cuidado.',
		time: '2 h 30 min',
		difficulty: 'Alta',
		servings: '12 unidades',
		ingredients: [
			'500 g de harina',
			'100 g de manteca',
			'1 cucharada de azúcar',
			'1 sobre de gelatina sin sabor (para el relleno gelatinizado)',
			'400 g de carne de res, cortada a cuchillo',
			'2 papas en cubos pequeños',
			'1 taza de arvejas',
			'Ají colorado, comino, orégano',
			'1 huevo para pintar'
		],
		steps: [
			'Preparar el relleno (jigote) un día antes y dejarlo enfriar hasta que gelatinice.',
			'Hacer la masa con harina, manteca, azúcar y agua tibia con color de ají.',
			'Estirar la masa en discos, rellenar con el jigote frío.',
			'Cerrar en repulgue, dejar reposar 20 minutos.',
			'Hornear a 220°C por 20-25 minutos hasta dorar.'
		],
		note: 'Comé la salteña siempre parada, nunca sentada — regla no escrita pero sagrada.'
	},
	{
		slug: 'aji-de-fideo',
		title: 'Ají de Fideo',
		category: 'Platos Fuertes',
		icon: 'chili',
		excerpt: 'Fideo bañado en ají amarillo, con papa, huevo duro y esa cremosidad que solo da el caldo reducido.',
		time: '45 min',
		difficulty: 'Fácil',
		servings: '4 porciones',
		ingredients: [
			'300 g de fideo cabello de ángel',
			'3 cucharadas de ají amarillo molido',
			'1 cebolla picada fina',
			'2 dientes de ajo',
			'2 papas cocidas',
			'2 huevos duros',
			'Caldo de pollo',
			'Aceite, sal, comino'
		],
		steps: [
			'Sofreír cebolla y ajo hasta transparentar.',
			'Agregar el ají amarillo molido, cocinar 5 minutos.',
			'Añadir caldo de pollo y llevar a hervor.',
			'Incorporar el fideo, cocinar hasta que absorba el caldo.',
			'Servir con papa cocida y medio huevo duro encima.'
		],
		note: 'Si el ají pica demasiado para tu gusto, agregá una cucharada de leche evaporada.'
	},
	{
		slug: 'humintas-al-horno',
		title: 'Humintas al Horno',
		category: 'Postres',
		icon: 'herbs',
		excerpt: 'Choclo molido, queso y un toque dulce, envueltos en su propia chala y horneados hasta dorar.',
		time: '1 h',
		difficulty: 'Media',
		servings: '10 unidades',
		ingredients: [
			'8 choclos grandes, desgranados',
			'150 g de queso fresco rallado',
			'100 g de mantequilla',
			'3 cucharadas de azúcar',
			'Anís en grano',
			'Chalas de choclo reservadas para envolver'
		],
		steps: [
			'Moler el choclo desgranado hasta obtener una masa espesa.',
			'Mezclar con mantequilla derretida, azúcar, anís y la mitad del queso.',
			'Armar las humintas envolviendo la masa en las chalas.',
			'Colocar en una fuente con un poco de agua en el fondo.',
			'Hornear a 180°C por 35-40 minutos hasta que la masa esté firme.'
		],
		note: 'Guardá las chalas más grandes y bonitas para el envoltorio exterior, así quedan prolijas.'
	},
	{
		slug: 'limonada-de-coco',
		title: 'Limonada de Coco',
		category: 'Bebidas',
		icon: 'lemon',
		excerpt: 'La bebida perfecta para un mediodía caluroso: limón fresco, leche de coco y hielo picado.',
		time: '10 min',
		difficulty: 'Fácil',
		servings: '4 vasos',
		ingredients: [
			'6 limones, el jugo',
			'400 ml de leche de coco',
			'4 cucharadas de azúcar o al gusto',
			'500 ml de agua fría',
			'Hielo',
			'Hojas de menta para decorar'
		],
		steps: [
			'Licuar el jugo de limón, leche de coco, azúcar y agua.',
			'Colar si se prefiere una textura más ligera.',
			'Servir sobre hielo picado.',
			'Decorar con menta fresca.'
		],
		note: 'Si la querés más espesa, usá la crema de coco en lugar de la leche.'
	},
	{
		slug: 'tostadas-con-palta-y-huevo',
		title: 'Tostadas con Palta y Huevo Pochado',
		category: 'Desayunos',
		icon: 'egg',
		excerpt: 'Pan de campo tostado, palta machacada con limón, y un huevo pochado perfecto encima.',
		time: '20 min',
		difficulty: 'Fácil',
		servings: '2 porciones',
		ingredients: [
			'4 rebanadas de pan de campo',
			'1 palta madura',
			'1 limón, el jugo',
			'2 huevos',
			'1 cucharada de vinagre blanco',
			'Chile seco molido, sal, aceite de oliva'
		],
		steps: [
			'Tostar el pan hasta dorar.',
			'Machacar la palta con jugo de limón, sal y aceite de oliva.',
			'Hervir agua con vinagre, formar un remolino y pochar el huevo 3 minutos.',
			'Untar la palta sobre el pan tostado.',
			'Colocar el huevo pochado encima, espolvorear chile seco.'
		],
		note: 'El vinagre en el agua es lo que mantiene la clara unida alrededor de la yema.'
	}
];

export const categories = ['Todas', 'Desayunos', 'Platos Fuertes', 'Postres', 'Bebidas'];

export function getRecipeBySlug(slug: string): Recipe | undefined {
	return recipes.find((r) => r.slug === slug);
}
