import { animate, inView } from 'motion';
import type { Action } from 'svelte/action';

export const reveal: Action<HTMLElement, number | undefined> = (node, delayMs = 0) => {
	const stop = inView(
		node,
		() => {
			animate(
				node,
				{ opacity: [0, 1], transform: ['translateY(20px)', 'translateY(0)'] },
				{ duration: 0.7, delay: delayMs / 1000, easing: [0.16, 1, 0.3, 1] }
			);
		},
		{ margin: '0px 0px -10% 0px' }
	);

	return {
		destroy() {
			stop?.();
		}
	};
};
