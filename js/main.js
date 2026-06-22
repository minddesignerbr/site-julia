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

// Blog — busca os posts publicados via Decap CMS direto do GitHub
async function loadBlogPosts() {
  const grid = document.getElementById('blog-grid');
  if (!grid) return;

  try {
    const response = await fetch(
      'https://api.github.com/repos/minddesignerbr/site-julia/contents/_posts',
      { headers: { 'Accept': 'application/vnd.github.v3+json' } }
    );

    if (!response.ok) {
      grid.innerHTML = '<div class="blog-loading">Nenhum artigo publicado ainda.</div>';
      return;
    }

    const files = await response.json();
    const mdFiles = files.filter(f => f.name.endsWith('.md') && f.name !== '.gitkeep');

    if (mdFiles.length === 0) {
      grid.innerHTML = '<div class="blog-loading">Nenhum artigo publicado ainda.</div>';
      return;
    }

    const limit = grid.dataset.limit;
    const selectedFiles = limit === 'all' ? mdFiles : mdFiles.slice(0, parseInt(limit || '3', 10));

    const posts = await Promise.all(
      selectedFiles.map(async file => {
        const res = await fetch(file.download_url);
        const text = await res.text();
        return parsePost(text, file.name);
      })
    );

    grid.innerHTML = posts.map(post => `
      <article class="blog-card">
        ${post.thumbnail ? `<img class="blog-card-img" src="${escapeHtml(post.thumbnail)}" alt="${escapeHtml(post.title)}">` : '<div class="blog-card-img"></div>'}
        <div class="blog-card-body">
          <div class="blog-card-date">${formatDate(post.date)}</div>
          <h3 class="blog-card-title">${escapeHtml(post.title)}</h3>
          <p class="blog-card-excerpt">${escapeHtml(post.excerpt)}</p>
          <a href="#" class="blog-card-link">Ler artigo →</a>
        </div>
      </article>
    `).join('');

  } catch (error) {
    grid.innerHTML = '<div class="blog-loading">Nenhum artigo publicado ainda.</div>';
  }
}

function parsePost(text, filename) {
  const frontmatter = {};
  const fmMatch = text.match(/^---\n([\s\S]*?)\n---/);
  if (fmMatch) {
    fmMatch[1].split('\n').forEach(line => {
      const [key, ...val] = line.split(': ');
      if (key && val.length) frontmatter[key.trim()] = val.join(': ').trim().replace(/^"|"$/g, '');
    });
  }
  return {
    title: frontmatter.title || 'Sem título',
    date: frontmatter.date || '',
    excerpt: frontmatter.excerpt || '',
    thumbnail: frontmatter.thumbnail || null,
    slug: filename.replace('.md', ''),
  };
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

document.addEventListener('DOMContentLoaded', loadBlogPosts);
