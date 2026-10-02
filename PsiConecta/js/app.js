// Gerenciador de Aplicação e Roteamento SPA
    const app = {
      routes: {
        'home': 'view-home',
        'psicologos': 'view-psicologos',
        'perfil-thayse': 'view-perfil-thayse',
        'para-psicologos': 'view-para-psicologos',
        'para-pacientes': 'view-para-pacientes',
        'sobre': 'view-sobre',
        'faq': 'view-faq',
        'politica': 'view-politica',
        'termos': 'view-termos',
        'login': 'view-login',
        'cadastro': 'view-cadastro',
        'planos': 'view-planos',
        'perfil-config': 'view-perfil-config',
        'painel': 'view-painel'
      },

      init() {
        document.getElementById('currentYear').textContent = new Date().getFullYear();

        window.addEventListener('hashchange', () => this.handleRouting());
        this.handleRouting();
        this.setupMobileMenu();
        this.setupFilters();
        this.setupAccordions();
        this.setupAuthFlow();
      },

      handleRouting() {
        const hash = window.location.hash.replace('#', '') || 'home';
        const cleanRoute = hash.split('?')[0];

        const session = this.getLoggedUser();

        // Se o usuário tentar acessar #painel ou #perfil-config sem sessão ativa nem rascunho de cadastro, redirecionar para login
        if ((cleanRoute === 'painel' || cleanRoute === 'perfil-config') && !session) {
          window.location.hash = '#login';
          return;
        }

        // Atualizar texto e link do botão da Área do Psicólogo no menu de navegação
        const navPsicoLink = document.getElementById('navPsicologoLink');
        if (navPsicoLink) {
          if (session) {
            navPsicoLink.textContent = 'Painel do Psicólogo';
            navPsicoLink.setAttribute('href', '#painel');
            navPsicoLink.setAttribute('data-route', 'painel');
          } else {
            navPsicoLink.textContent = 'Área do Psicólogo';
            navPsicoLink.setAttribute('href', '#login');
            navPsicoLink.setAttribute('data-route', 'login');
          }
        }

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

        // Se entrar no painel, renderizar os dados do usuário
        if (cleanRoute === 'painel' && session) {
          this.renderDashboard(session);
        }

        // Se entrar na configuração de perfil, carregar dados existentes para facilitar edição
        if (cleanRoute === 'perfil-config' && session) {
          this.preencherPerfilConfig(session);
        }

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

      // Armazenamento Local de Usuários e Sessão (localStorage)
      getStoredUsers() {
        try {
          const raw = localStorage.getItem('psiconecta_users');
          return raw ? JSON.parse(raw) : [];
        } catch (e) {
          return [];
        }
      },

      saveStoredUsers(users) {
        localStorage.setItem('psiconecta_users', JSON.stringify(users));
      },

      getLoggedUser() {
        try {
          const raw = localStorage.getItem('psiconecta_logged_user');
          return raw ? JSON.parse(raw) : null;
        } catch (e) {
          return null;
        }
      },

      setLoggedUser(user) {
        if (user) {
          localStorage.setItem('psiconecta_logged_user', JSON.stringify(user));
        } else {
          localStorage.removeItem('psiconecta_logged_user');
        }
      },

      updateUserRecord(updatedUser) {
        const users = this.getStoredUsers();
        const index = users.findIndex(u => u.email.toLowerCase() === updatedUser.email.toLowerCase());
        if (index !== -1) {
          users[index] = updatedUser;
        } else {
          users.push(updatedUser);
        }
        this.saveStoredUsers(users);
      },

      // ETAPA 3: Escolha de Plano
      selecionarPlano(tipo, preco) {
        let user = this.getLoggedUser();
        if (!user) {
          // Usuário anônimo que escolheu plano direto: cria rascunho de sessão
          user = {
            nome: 'Psicólogo(a) Cadastrado',
            email: 'usuario@exemplo.com',
            crp: '07/32000'
          };
        }

        user.plano = {
          tipo: tipo,
          nome: tipo === 'Destaque' ? 'Plano Destaque (R$ 49/mês)' : (tipo === 'Comissao' ? 'Plano Comissão' : 'Plano Gratuito (R$ 0/mês)'),
          preco: preco,
          data: new Date().toLocaleDateString('pt-BR')
        };

        this.setLoggedUser(user);
        this.updateUserRecord(user);

        // Avançar para a Etapa 4: Configuração do Perfil
        window.location.hash = '#perfil-config';
      },

      setupAuthFlow() {
        // --- 1. LOGIN ---
        const loginForm = document.getElementById('loginForm');
        const loginEmail = document.getElementById('loginEmail');
        const loginPassword = document.getElementById('loginPassword');
        const loginAlert = document.getElementById('loginAlertBox');
        const forgotLink = document.getElementById('forgotPasswordLink');

        if (forgotLink) {
          forgotLink.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Aviso da plataforma: A recuperação de senha via e-mail será habilitada com a ativação do Supabase Auth. Para fins de teste, você pode criar uma nova conta ou usar psicologo@exemplo.com / 123456.');
          });
        }

        if (loginForm) {
          loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let valid = true;
            loginAlert.style.display = 'none';

            const emailVal = loginEmail.value.trim();
            const passVal = loginPassword.value.trim();

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailVal)) {
              document.getElementById('loginEmailErr').style.display = 'block';
              loginEmail.classList.add('is-invalid');
              valid = false;
            } else {
              document.getElementById('loginEmailErr').style.display = 'none';
              loginEmail.classList.remove('is-invalid');
            }

            if (passVal.length < 6) {
              document.getElementById('loginPassErr').style.display = 'block';
              loginPassword.classList.add('is-invalid');
              valid = false;
            } else {
              document.getElementById('loginPassErr').style.display = 'none';
              loginPassword.classList.remove('is-invalid');
            }

            if (!valid) return;

            const users = this.getStoredUsers();
            let matched = users.find(u => u.email.toLowerCase() === emailVal.toLowerCase() && u.senha === passVal);

            // Conta de demonstração predefinida caso não haja conta criada
            if (!matched && emailVal === 'psicologo@exemplo.com' && passVal === '123456') {
              matched = {
                nome: 'Dra. Mariana Silva',
                email: 'psicologo@exemplo.com',
                crp: '07/34567',
                senha: '123456',
                plano: { tipo: 'Destaque', nome: 'Plano Destaque (R$ 49/mês)', preco: 49 },
                bio: 'Atendimento humanizado voltado a jovens e adultos com foco no acolhimento de ansiedade, regulação emocional e desenvolvimento de autoestima.',
                especialidades: ['Ansiedade', 'Depressão', 'Autoestima'],
                abordagem: 'TCC',
                valor: 150,
                whatsapp: '(51) 99999-1234',
                foto: ''
              };
              users.push(matched);
              this.saveStoredUsers(users);
            }

            if (matched) {
              this.setLoggedUser(matched);
              window.location.hash = '#painel';
            } else {
              loginAlert.textContent = 'E-mail ou senha não encontrados no armazenamento local. Clique em "Criar conta" para iniciar seu cadastro.';
              loginAlert.style.display = 'flex';
            }
          });
        }

        // --- 2. CADASTRO ("CRIAR CONTA") ---
        const cadForm = document.getElementById('cadastroForm');
        if (cadForm) {
          cadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let valid = true;

            const nome = document.getElementById('cadNome').value.trim();
            const email = document.getElementById('cadEmail').value.trim();
            const crp = document.getElementById('cadCrp').value.trim();
            const senha = document.getElementById('cadSenha').value.trim();
            const confSenha = document.getElementById('cadConfSenha').value.trim();

            if (nome.length < 3) {
              document.getElementById('cadNomeErr').style.display = 'block';
              document.getElementById('cadNome').classList.add('is-invalid');
              valid = false;
            } else {
              document.getElementById('cadNomeErr').style.display = 'none';
              document.getElementById('cadNome').classList.remove('is-invalid');
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
              document.getElementById('cadEmailErr').style.display = 'block';
              document.getElementById('cadEmail').classList.add('is-invalid');
              valid = false;
            } else {
              document.getElementById('cadEmailErr').style.display = 'none';
              document.getElementById('cadEmail').classList.remove('is-invalid');
            }

            if (crp.length < 5) {
              document.getElementById('cadCrpErr').style.display = 'block';
              document.getElementById('cadCrp').classList.add('is-invalid');
              valid = false;
            } else {
              document.getElementById('cadCrpErr').style.display = 'none';
              document.getElementById('cadCrp').classList.remove('is-invalid');
            }

            if (senha.length < 6) {
              document.getElementById('cadSenhaErr').style.display = 'block';
              document.getElementById('cadSenha').classList.add('is-invalid');
              valid = false;
            } else {
              document.getElementById('cadSenhaErr').style.display = 'none';
              document.getElementById('cadSenha').classList.remove('is-invalid');
            }

            if (senha !== confSenha) {
              document.getElementById('cadConfSenhaErr').style.display = 'block';
              document.getElementById('cadConfSenha').classList.add('is-invalid');
              valid = false;
            } else {
              document.getElementById('cadConfSenhaErr').style.display = 'none';
              document.getElementById('cadConfSenha').classList.remove('is-invalid');
            }

            if (!valid) return;

            // Salva o rascunho da conta no localStorage e avança para a escolha do plano
            const tempUser = {
              nome,
              email,
              crp,
              senha,
              plano: { tipo: 'Gratuito', nome: 'Plano Gratuito', preco: 0 }
            };

            this.updateUserRecord(tempUser);
            this.setLoggedUser(tempUser);

            window.location.hash = '#planos';
          });
        }

        // --- 4. CONFIGURAÇÃO DO PERFIL ---
        const perfilConfigForm = document.getElementById('perfilConfigForm');
        const configFotoInput = document.getElementById('configFotoInput');
        const configFotoPreview = document.getElementById('configFotoPreview');
        const configFotoMonogram = document.getElementById('configFotoMonogram');
        let fotoUploadBase64 = '';

        if (configFotoInput) {
          configFotoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
              if (file.size > 2 * 1024 * 1024) {
                alert('A imagem deve ter no máximo 2MB.');
                configFotoInput.value = '';
                return;
              }
              const reader = new FileReader();
              reader.onload = (event) => {
                fotoUploadBase64 = event.target.result;
                configFotoPreview.style.backgroundImage = `url(${fotoUploadBase64})`;
                configFotoMonogram.style.display = 'none';
              };
              reader.readAsDataURL(file);
            }
          });
        }

        if (perfilConfigForm) {
          perfilConfigForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let valid = true;

            const bio = document.getElementById('configBio').value.trim();
            const abordagem = document.getElementById('configAbordagem').value;
            const valor = document.getElementById('configValor').value.trim();
            const whatsapp = document.getElementById('configWhatsapp').value.trim();

            const checkedChips = document.querySelectorAll('input[name="perfilEsp"]:checked');
            const especialidades = Array.from(checkedChips).map(c => c.value);

            if (bio.length < 30) {
              document.getElementById('configBioErr').style.display = 'block';
              document.getElementById('configBio').classList.add('is-invalid');
              valid = false;
            } else {
              document.getElementById('configBioErr').style.display = 'none';
              document.getElementById('configBio').classList.remove('is-invalid');
            }

            if (especialidades.length === 0) {
              document.getElementById('configEspErr').style.display = 'block';
              valid = false;
            } else {
              document.getElementById('configEspErr').style.display = 'none';
            }

            if (!abordagem) {
              document.getElementById('configAbordagemErr').style.display = 'block';
              document.getElementById('configAbordagem').classList.add('is-invalid');
              valid = false;
            } else {
              document.getElementById('configAbordagemErr').style.display = 'none';
              document.getElementById('configAbordagem').classList.remove('is-invalid');
            }

            if (!valor || isNaN(valor) || Number(valor) <= 0) {
              document.getElementById('configValorErr').style.display = 'block';
              document.getElementById('configValor').classList.add('is-invalid');
              valid = false;
            } else {
              document.getElementById('configValorErr').style.display = 'none';
              document.getElementById('configValor').classList.remove('is-invalid');
            }

            if (!whatsapp || whatsapp.length < 8) {
              document.getElementById('configWhatsappErr').style.display = 'block';
              document.getElementById('configWhatsapp').classList.add('is-invalid');
              valid = false;
            } else {
              document.getElementById('configWhatsappErr').style.display = 'none';
              document.getElementById('configWhatsapp').classList.remove('is-invalid');
            }

            if (!valid) return;

            let user = this.getLoggedUser() || {};
            user.bio = bio;
            user.especialidades = especialidades;
            user.abordagem = abordagem;
            user.valor = Number(valor);
            user.whatsapp = whatsapp;
            if (fotoUploadBase64) {
              user.foto = fotoUploadBase64;
            }

            this.updateUserRecord(user);
            this.setLoggedUser(user);

            alert('Perfil salvo com sucesso no navegador! Seu perfil agora está ativo.');
            window.location.hash = '#painel';
          });
        }

        // --- 5. LOGOUT NO PAINEL ---
        const btnLogout = document.getElementById('btnDashLogout');
        if (btnLogout) {
          btnLogout.addEventListener('click', () => {
            if (confirm('Deseja realmente sair da Área do Psicólogo?')) {
              this.setLoggedUser(null);
              window.location.hash = '#login';
            }
          });
        }
      },

      preencherPerfilConfig(user) {
        if (user.bio) document.getElementById('configBio').value = user.bio;
        if (user.abordagem) document.getElementById('configAbordagem').value = user.abordagem;
        if (user.valor) document.getElementById('configValor').value = user.valor;
        if (user.whatsapp) document.getElementById('configWhatsapp').value = user.whatsapp;

        const configPreview = document.getElementById('configFotoPreview');
        const configMonogram = document.getElementById('configFotoMonogram');
        if (user.foto) {
          configPreview.style.backgroundImage = `url(${user.foto})`;
          configMonogram.style.display = 'none';
        } else {
          configPreview.style.backgroundImage = 'none';
          configMonogram.style.display = 'inline';
          const initials = (user.nome || 'Psi').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
          configMonogram.textContent = initials || 'Ψ';
        }

        if (user.especialidades && Array.isArray(user.especialidades)) {
          document.querySelectorAll('input[name="perfilEsp"]').forEach(cb => {
            cb.checked = user.especialidades.includes(cb.value);
          });
        }
      },

      renderDashboard(user) {
        document.getElementById('dashWelcomeName').textContent = user.nome || 'Dr(a). Psicólogo(a)';
        document.getElementById('dashCrpText').textContent = `Inscrição CRP: ${user.crp || '07/00000'} • Registro Ativo`;

        const initials = (user.nome || 'Psi')
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map(n => n[0].toUpperCase())
          .join('');

        const headerAvatar = document.getElementById('dashHeaderAvatar');
        const monogramSpan = document.getElementById('dashMonogram');
        if (user.foto) {
          headerAvatar.style.backgroundImage = `url(${user.foto})`;
          monogramSpan.style.display = 'none';
        } else {
          headerAvatar.style.backgroundImage = 'none';
          monogramSpan.style.display = 'inline';
          monogramSpan.textContent = initials || 'Ψ';
        }

        const plano = user.plano || { tipo: 'Gratuito', nome: 'Plano Gratuito' };
        const planBadge = document.getElementById('dashPlanBadge');
        const planLabel = document.getElementById('dashPlanLabel');

        if (plano.tipo === 'Destaque') {
          planBadge.textContent = '★ Plano Destaque';
          planBadge.className = 'badge-featured';
          planLabel.textContent = '★ Plano Destaque Ativo';
        } else if (plano.tipo === 'Comissao') {
          planBadge.textContent = 'Plano Comissão';
          planBadge.className = 'badge-crp';
          planLabel.textContent = 'Plano Comissão Ativo';
        } else {
          planBadge.textContent = 'Plano Gratuito';
          planBadge.className = 'badge-crp';
          planLabel.textContent = 'Plano Gratuito Ativo';
        }

        // Resumo dos dados cadastradoss
        document.getElementById('dashResumoBio').textContent = user.bio || 'Biografia em processo de edição.';
        document.getElementById('dashResumoAbordagem').textContent = user.abordagem || 'TCC';
        document.getElementById('dashResumoValor').textContent = user.valor ? `R$ ${user.valor},00` : 'R$ 150,00';
        document.getElementById('dashResumoEmail').textContent = user.email || 'Não informado';
        document.getElementById('dashResumoCrp').textContent = user.crp || '07/00000';
        document.getElementById('dashResumoWhatsapp').textContent = user.whatsapp || 'Não informado';

        // Especialidades
        const espContainer = document.getElementById('dashResumoEspecialidades');
        espContainer.innerHTML = '';
        const listEsp = user.especialidades && user.especialidades.length ? user.especialidades : ['Ansiedade', 'Depressão'];
        listEsp.forEach(esp => {
          const chip = document.createElement('span');
          chip.className = 'tag-item';
          chip.textContent = esp;
          espContainer.appendChild(chip);
        });

        // Link de teste de WhatsApp
        const testBtn = document.getElementById('dashWhatsappTestLink');
        if (testBtn) {
          let cleanPhone = (user.whatsapp || '').replace(/\D/g, '');
          if (cleanPhone.length >= 10 && !cleanPhone.startsWith('55')) {
            cleanPhone = '55' + cleanPhone;
          }
          if (cleanPhone) {
            testBtn.href = `https://wa.me/${cleanPhone}?text=Ol%C3%A1%2C%20Dr(a).%20Encontrei%20seu%20perfil%20na%20plataforma%20PsiConecta!`;
          } else {
            testBtn.href = '#perfil-config';
          }
        }
      }
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
    foto: "assets/fotos/thayse-bianchin-rambo.jpg",
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
    foto: "assets/fotos/mauricio.jpg",
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

  card.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
      <span class="badge-featured">Profissional em Destaque</span>
      <span class="badge-crp">Ativo ${profile.crp}</span>
    </div>
    <div style="display:flex;gap:16px;align-items:center;margin-bottom:16px;">
      <div style="width:48px;height:48px;border-radius:50%;overflow:hidden;border:2px solid #D6C7A9;flex-shrink:0;">
        <img src="${profile.foto}" alt="${profile.nome}" style="width:100%;height:100%;object-fit:cover;">
      </div>
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
