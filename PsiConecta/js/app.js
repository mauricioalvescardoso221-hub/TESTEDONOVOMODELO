// Gerenciador de Aplicação e Roteamento SPA
    const app = {
      routes: {
        'home': 'view-home',
        'psicologos': 'view-psicologos',
        'perfil-thayse': 'view-perfil-thayse',
        'perfil-mauricio': 'view-perfil-mauricio',
        'para-psicologos': 'view-para-psicologos',
        'para-pacientes': 'view-para-pacientes',
        'sobre': 'view-sobre',
        'faq': 'view-faq',
        'politica': 'view-politica',
        'termos': 'view-termos'
      },
      init() {
        document.getElementById('currentYear').textContent = new Date().getFullYear();
        window.addEventListener('hashchange', () => this.handleRouting());
        this.handleRouting();
        this.setupMobileMenu();
        this.setupFilters();
        this.setupAccordions();
      },
      handleRouting() {
        const hash = window.location.hash.replace('#', '') || 'home';
        const cleanRoute = hash.split('?')[0];
        const targetViewId = this.routes[cleanRoute] || 'view-home';
        // Esconde todas as visualizações
        document.querySelectorAll('.view-container').forEach(view => {
          view.classList.remove('active');
        });
        // Mostra a selecionada
        const targetView = document.getElementById(targetViewId);
        if (targetView) {
          targetView.classList.add('active');
        }
        // Atualiza estilo na navegação
        document.querySelectorAll('.main-nav .nav-link').forEach(link => {
          if (link.getAttribute('data-route') === cleanRoute) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
        // Fecha menu mobile
        const mainNav = document.getElementById('mainNavigation');
        if (mainNav) mainNav.classList.remove('mobile-active');
        // Scroll suave para o topo
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Verifica parâmetro de filtro na URL se existir
        if (cleanRoute === 'psicologos' && hash.includes('filtro=')) {
          const filterValue = decodeURIComponent(hash.split('filtro=')[1]);
          this.filtrarPorTema(filterValue);
        }
      },
      setupMobileMenu() {
        const toggleBtn = document.getElementById('mobileMenuToggle');
        const nav = document.getElementById('mainNavigation');
        if (toggleBtn && nav) {
          toggleBtn.addEventListener('click', () => {
            nav.classList.toggle('mobile-active');
          });
        }
      },
      setupFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn[data-filter]');
        const searchInput = document.getElementById('searchInput');
        filterBtns.forEach(btn => {
          btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            this.aplicarFiltros();
          });
        });
        if (searchInput) {
          searchInput.addEventListener('input', () => {
            this.aplicarFiltros();
          });
        }
      },
      filtrarPorTema(tema) {
        window.location.hash = '#psicologos';
        setTimeout(() => {
          const filterBtns = document.querySelectorAll('.filter-btn[data-filter]');
          let matched = false;
          filterBtns.forEach(btn => {
            if (btn.getAttribute('data-filter') === tema) {
              btn.classList.add('active');
              matched = true;
            } else {
              btn.classList.remove('active');
            }
          });
          if (!matched && filterBtns[0]) {
            filterBtns[0].classList.add('active');
          }
          this.aplicarFiltros();
        }, 80);
      },
      aplicarFiltros() {
        const activeBtn = document.querySelector('.filter-btn[data-filter].active');
        const currentCategory = activeBtn ? activeBtn.getAttribute('data-filter') : 'todos';
        const searchVal = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
        const cards = document.querySelectorAll('.psychologist-card');
        let visibleCount = 0;
        cards.forEach(card => {
          const specialties = (card.getAttribute('data-specialties') || '').toLowerCase();
          const name = (card.getAttribute('data-name') || '').toLowerCase();
          const approach = (card.getAttribute('data-approach') || '').toLowerCase();
          const matchesCategory = (currentCategory === 'todos') || specialties.includes(currentCategory.toLowerCase());
          const matchesSearch = !searchVal || name.includes(searchVal) || approach.includes(searchVal) || specialties.includes(searchVal);
          if (matchesCategory && matchesSearch) {
            card.style.display = 'flex';
            visibleCount++;
          } else {
            card.style.display = 'none';
          }
        });
        const alertBox = document.getElementById('noResultsAlert');
        if (alertBox) {
          alertBox.style.display = visibleCount === 0 ? 'block' : 'none';
        }
      },
      setupAccordions() {
        document.querySelectorAll('.accordion-trigger').forEach(trigger => {
          trigger.addEventListener('click', () => {
            const item = trigger.closest('.accordion-item');
            if (item) {
              item.classList.toggle('open');
            }
          });
        });
      },
      switchFaqTab(tab) {
        const btnPacientes = document.getElementById('faqTabPacientes');
        const btnPsicologos = document.getElementById('faqTabPsicologos');
        const groupPacientes = document.getElementById('faqGroupPacientes');
        const groupPsicologos = document.getElementById('faqGroupPsicologos');
        if (tab === 'pacientes') {
          btnPacientes.classList.add('active');
          btnPsicologos.classList.remove('active');
          groupPacientes.style.display = 'block';
          groupPsicologos.style.display = 'none';
        } else {
          btnPsicologos.classList.add('active');
          btnPacientes.classList.remove('active');
          groupPsicologos.style.display = 'block';
          groupPacientes.style.display = 'none';
        }
      },
    };
    document.addEventListener('DOMContentLoaded', () => {
      app.init();
    });
/* ===== ROTATIVIDADE + SETAS: Card em Destaque na Página Inicial ===== */
// 1) LISTA DOS PROFISSIONAIS QUE PAGARAM O DESTAQUE
// >> Adicione um bloco novo com vírgula no final do anterior para cada pagante.
const featuredProfiles = [
  {
    nome: "Thayse Bianchin Rambo",
    foto: "assets/fotos/sorrindo.jpeg",
    abordagem: "Terapia Cognitivo-Comportamental (TCC)",
    crp: "CRP 07/32555",
    descricao: "Prática clínica humanizada orientada a resultados e autonomia emocional. Atendimento individual para jovens e adultos.",
    tags: ["Ansiedade", "TDAH", "Depressão", "Relacionamentos"],
    preco: "R$ 150,00",
    whatsapp: "55997052670",
    linkPerfil: "#perfil-thayse"
  },
  {
    nome: "Maurício",
    foto: "",
    abordagem: "Terapia Cognitivo-Comportamental (TCC)",
    crp: "CRP 00/00000",
    descricao: "Atendimento acolhedor e objetivo, focado em ansiedade, depressão e autoconhecimento para adultos e jovens.",
    tags: ["Ansiedade", "Depressão", "Autoconhecimento"],
    preco: "R$ 120,00",
    whatsapp: "5500000000000",
    linkPerfil: "#perfil-mauricio"
  }
];
  // ,{ nome: "...", foto: "...", abordagem: "...", crp: "...", descricao: "...",
  //    tags: ["...", "..."], preco: "R$ ...", whatsapp: "55...", linkPerfil: "#perfil-..." }
// 2) TEMPO DA ROTAÇÃO AUTOMÁTICA (24 = 1x por dia | 6 = a cada 6h | 2 = a cada 2h)
const ROTATION_HOURS = 6;
const periodMs = ROTATION_HOURS * 60 * 60 * 1000;
// null = seguindo o relógio | número = modo manual (visitante clicou na seta)
let currentIndex = null;
// 3) QUAL POSIÇÃO DA LISTA DEVE APARECER AGORA
function getFeaturedIndex() {
  if (featuredProfiles.length === 0) return -1;
  if (currentIndex !== null) return currentIndex;
  return Math.floor(Date.now() / periodMs) % featuredProfiles.length;
}
// 4) MONTAR O CARD NA TELA (com as setas no final)
function renderFeaturedCard() {
  const index = getFeaturedIndex();
  const profile = featuredProfiles[index];
  const card = document.getElementById("featuredPsychologistCard");
  if (!card || !profile) return;
  const photoMarkup = profile.foto
    ? `<div class="profile-avatar-wrap featured-photo-wrap">
        <div class="avatar-monogram thayse" hidden>TB</div>
        <img src="${profile.foto}" alt="Foto de ${profile.nome}" class="profile-photo" onerror="this.hidden = true; this.previousElementSibling.hidden = false;">
      </div>`
    : `<div class="photo-placeholder photo-placeholder-featured" role="img" aria-label="Espaço reservado para foto de ${profile.nome}"></div>`;
  card.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
      <span class="badge-featured">Profissional em Destaque</span>
      <span class="badge-crp">Ativo ${profile.crp}</span>
    </div>
    <div style="display:flex;gap:16px;align-items:center;margin-bottom:16px;">
${photoMarkup}
      <div>
        <h3 style="margin:0;font-size:1.25rem;">${profile.nome}</h3>
        <p style="margin:2px 0 0 0;font-size:0.85rem;color:var(--color-brown-mid);font-weight:600;">${profile.crp} • ${profile.abordagem}</p>
      </div>
    </div>
    <p style="font-size:0.88rem;color:var(--text-muted);margin-bottom:14px;">${profile.descricao}</p>
    <div class="tag-cloud">
      ${profile.tags.map(t => `<span class="tag-item">${t}</span>`).join("")}
    </div>
    <div class="price-tag-row">
      <span style="font-size:0.85rem;color:var(--text-muted);">Sessão individual (50 min)</span>
      <span class="price-value">${profile.preco}</span>
    </div>
    <div style="display:flex;gap:10px;">
      <a href="${profile.linkPerfil}" class="btn-custom btn-secondary-soft" style="flex:1;font-size:0.85rem;">Ver Perfil</a>
      <a href="https://wa.me/${profile.whatsapp}?text=Ol%C3%A1!%20Encontrei%20seu%20perfil%20na%20PsiConecta." target="_blank" rel="noopener noreferrer" class="btn-custom btn-whatsapp" style="flex:1;font-size:0.85rem;">WhatsApp</a>
    </div>
    ${featuredProfiles.length > 1 ? `
    <div class="featured-nav">
      <button class="featured-arrow" id="featuredPrev" aria-label="Anterior">&#9664;</button>
      <span class="featured-counter">${index + 1} / ${featuredProfiles.length}</span>
      <button class="featured-arrow" id="featuredNext" aria-label="Próximo">&#9654;</button>
    </div>
    ` : ""}
  `;
  if (featuredProfiles.length > 1) {
    document.getElementById("featuredPrev").addEventListener("click", () => navigateFeatured(-1));
    document.getElementById("featuredNext").addEventListener("click", () => navigateFeatured(1));
  }
}
// 5) NAVEGAR COM AS SETAS (ativa o modo manual para este visitante)
function navigateFeatured(direction) {
  if (featuredProfiles.length === 0) return;
  const base = currentIndex !== null ? currentIndex : Math.floor(Date.now() / periodMs) % featuredProfiles.length;
  currentIndex = (base + direction + featuredProfiles.length) % featuredProfiles.length;
  renderFeaturedCard();
}
// 6) RODAR AO CARREGAR + ATUALIZAR A CADA MINUTO (só no modo automático)
document.addEventListener("DOMContentLoaded", renderFeaturedCard);
setInterval(() => {
  if (currentIndex === null) renderFeaturedCard();
}, 60000);
