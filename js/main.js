// Accordion FAQ — vanilla JS, sem dependências
document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('.accordion-item');

  items.forEach((item) => {
    const trigger = item.querySelector('.accordion-trigger');
    const panel = item.querySelector('.accordion-panel');

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      items.forEach((other) => {
        other.classList.remove('open');
        other.querySelector('.accordion-panel').style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });
});

// Animação de entrada das imagens — vanilla JS, sem dependências.
// As fotos já são visíveis por padrão (ver CSS); aqui apenas marcamos
// como "anim-ready" (escondidas) as que ainda não entraram na viewport,
// para então revelá-las com a transição ao rolar a página.
document.addEventListener('DOMContentLoaded', () => {
  if (!('IntersectionObserver' in window)) return;

  const images = document.querySelectorAll('.anim-img');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('anim-ready');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  images.forEach((img) => {
    const rect = img.getBoundingClientRect();
    const alreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (!alreadyVisible) {
      img.classList.add('anim-ready');
    }
    observer.observe(img);
  });
});
