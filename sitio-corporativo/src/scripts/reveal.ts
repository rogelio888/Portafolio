import { animate, inView } from 'motion';

function initReveal() {
  const elements = document.querySelectorAll<HTMLElement>('[data-reveal]');

  elements.forEach((el) => {
    const delay = Number(el.dataset.revealDelay || 0) / 1000;

    inView(
      el,
      () => {
        animate(
          el,
          { opacity: [0, 1], transform: ['translateY(20px)', 'translateY(0)'] },
          { duration: 0.7, delay, easing: [0.16, 1, 0.3, 1] }
        );
      },
      { margin: '0px 0px -10% 0px' }
    );
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initReveal);
} else {
  initReveal();
}
