import React, { useState, useEffect } from 'react';
import Countdown from './components/Countdown';
import PricingCards from './components/PricingCards';
import RegistrationForm from './components/RegistrationForm';
import AdminView from './components/AdminView';
import AthleteWall from './components/AthleteWall';
import RegistrationStatus from './components/RegistrationStatus';
import FAQ from './components/FAQ';
import Prizes from './components/Prizes';
import { CATEGORIES, MAX_SLOTS_PER_CATEGORY, PRICING_TIERS } from './constants';
import { supabase } from './supabaseClient';

// Agregar función de hash simple (no criptográfica, solo ofuscación):
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [showStatusCheck, setShowStatusCheck] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<string>('');

  useEffect(() => {
    // Check for obscure admin route (Hardening)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mode') === 'sys_admin_x9') {
      setIsAdmin(true);
      document.title = "DARE LEAGUE | ADMIN DASHBOARD";

      // Simple security: Check session storage first
      if (sessionStorage.getItem('admin_auth') === 'true') {
        setIsAuthenticated(true);
      }
    }

    const fetchCounts = async () => {
      const { data, error } = await supabase.from('registrations').select('category, gender');
      if (!error && data) {
        const counts: Record<string, number> = {};
        data.forEach(reg => {
          const key = `${reg.category}_${reg.gender}`.toUpperCase();
          counts[key] = (counts[key] || 0) + 1;
        });
        setCategoryCounts(counts);
      }
    };

    // Calculate Price
    const now = new Date();
    const activeTier = PRICING_TIERS.find(tier => {
      if (!tier.endDate) return now >= tier.startDate;
      return now >= tier.startDate && now <= tier.endDate;
    });
    if (activeTier) setCurrentPrice(activeTier.formattedPrice);

    fetchCounts();
    const interval = setInterval(fetchCounts, 60000); // Sync every minute

    const handleScroll = () => {
      // Header transparency logic
      setIsScrolled(window.scrollY > 50);

      // Scrollspy Logic
      const sections = ['competition', 'categories', 'prizes', 'bracket', 'pricing', 'payment-info', 'register'];
      // Offset matches the scroll-margin-top + visual comfort zone
      const scrollPosition = window.scrollY + 150;

      let current = '';
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            current = section;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to get number of registered athletes
  const getRegisteredCount = (catId: string, gender: 'M' | 'F') => {
    const key = `${catId}_${gender === 'M' ? 'MASCULINO' : 'FEMENINO'}`.toUpperCase();
    return categoryCounts[key] || 0;
  };

  if (isAdmin && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 font-body">
        <div className="max-w-md w-full bg-zinc-950 border border-zinc-900 p-8 text-center">
          <h2 className="font-display text-4xl uppercase italic mb-8">Acceso <span className="text-primary not-italic">Restringido</span></h2>
          <input
            type="password"
            placeholder="Contraseña Maestra"
            className="w-full bg-black border border-zinc-800 p-4 text-white mb-6 focus:border-primary focus:outline-none text-center tracking-widest"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const ADMIN_HASH = '69e9db8e'; // Hash de la contraseña real
                const inputHash = simpleHash((e.target as HTMLInputElement).value);

                if (inputHash === ADMIN_HASH) {
                  setIsAuthenticated(true);
                  sessionStorage.setItem('admin_auth', 'true');
                } else {
                  alert('Contraseña Incorrecta');
                }
              }
            }}
          />
          <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest">Presiona ENTER para ingresar</p>
        </div>
      </div>
    );
  }

  if (isAdmin) return <AdminView />;

  return (
    <div className="bg-dark min-h-screen text-gray-100 selection:bg-primary selection:text-white overflow-x-hidden">

      {/* Navigation */}
      <nav className={`fixed w-full z-50 top-0 left-0 transition-all duration-300 border-b ${isScrolled ? 'bg-black/95 border-zinc-900 py-3' : 'bg-transparent border-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div
            onClick={scrollToTop}
            className="flex items-center gap-3 cursor-pointer group"
          >
            {/* Logo Image - Scalable and Professional */}
            <img
              src="logo.png"
              alt="Dare League Logo"
              className="h-12 md:h-14 w-auto object-contain drop-shadow-[0_0_15px_rgba(239,53,61,0.6)] transition-all duration-300 group-hover:drop-shadow-[0_0_20px_rgba(239,53,61,0.8)]"
            />
            <span className="font-display text-2xl md:text-3xl uppercase tracking-tighter text-white group-hover:text-zinc-300 transition-colors">Dare <span className="text-primary">League</span></span>
          </div>
          <div className="hidden md:flex gap-8 font-display text-sm tracking-widest uppercase">
            <a
              href="#competition"
              onClick={(e) => scrollToSection(e, 'competition')}
              className={`transition-colors duration-300 ${activeSection === 'competition' ? 'text-primary scale-110 font-bold shadow-red-500/50 drop-shadow-sm' : 'text-zinc-400 hover:text-white'}`}
            >
              La Liga
            </a>
            <a
              href="#categories"
              onClick={(e) => scrollToSection(e, 'categories')}
              className={`transition-colors duration-300 ${activeSection === 'categories' ? 'text-primary scale-110 font-bold drop-shadow-sm' : 'text-zinc-400 hover:text-white'}`}
            >
              Categorías
            </a>
            <a
              href="#prizes"
              onClick={(e) => scrollToSection(e, 'prizes')}
              className={`transition-colors duration-300 ${activeSection === 'prizes' ? 'text-primary scale-110 font-bold drop-shadow-sm' : 'text-zinc-400 hover:text-white'}`}
            >
              Premios
            </a>
            <a
              href="#bracket"
              onClick={(e) => scrollToSection(e, 'bracket')}
              className={`transition-colors duration-300 ${activeSection === 'bracket' ? 'text-primary scale-110 font-bold drop-shadow-sm' : 'text-zinc-400 hover:text-white'}`}
            >
              Bracket
            </a>
            <a
              href="#pricing"
              onClick={(e) => scrollToSection(e, 'pricing')}
              className={`transition-colors duration-300 ${activeSection === 'pricing' ? 'text-primary scale-110 font-bold drop-shadow-sm' : 'text-zinc-400 hover:text-white'}`}
            >
              Precios
            </a>
            <a
              href="#payment-info"
              onClick={(e) => scrollToSection(e, 'payment-info')}
              className={`transition-colors duration-300 ${activeSection === 'payment-info' ? 'text-primary scale-110 font-bold drop-shadow-sm' : 'text-zinc-400 hover:text-white'}`}
            >
              Pago
            </a>
            <a
              href="#register"
              onClick={(e) => scrollToSection(e, 'register')}
              className={`transition-colors duration-300 ${activeSection === 'register' ? 'text-primary scale-110 font-bold drop-shadow-sm' : 'text-white hover:text-primary'}`}
            >
              Registro
            </a>
            <button
              onClick={() => setShowStatusCheck(true)}
              className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white px-4 py-1 border border-zinc-800 transition-all font-display text-[10px] uppercase tracking-widest flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">search</span> Mi Estado
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative min-h-screen flex flex-col justify-center items-center px-4 pt-20 overflow-hidden">
        {/* Backgrounds */}
        <div className="absolute inset-0 bg-hero-pattern bg-cover bg-center opacity-30 grayscale mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-dark z-0"></div>
        <div className="absolute inset-0 bg-noise opacity-20 z-0 pointer-events-none"></div>

        <div className="relative z-10 text-center w-full max-w-5xl mx-auto">

          <div className="mb-8 animate-fade-in-up">
            <h1 className="font-display text-7xl md:text-[10rem] uppercase leading-[0.85] tracking-tighter mb-4">
              DARE <span className="text-primary text-glow">LEAGUE</span>
            </h1>
            <h2 className="text-white text-2xl md:text-4xl font-display uppercase tracking-widest mb-4">
              Competencia 1 vs 1 de CrossFit
            </h2>
            <div className="text-zinc-400 text-lg md:text-xl font-body max-w-2xl mx-auto tracking-wide uppercase italic border-y border-zinc-800 py-4">
              <p>Bracket de eliminación directa. 32 atletas por categoría.</p>
              <p>Pierdes una vez y se acabó. Sin equipos, sin excusas.</p>
            </div>
          </div>

          <div className="mb-16">
            <Countdown />
            <div className="mt-8 flex flex-col items-center gap-2 animate-pulse">
              <div className="flex items-center gap-2 text-primary uppercase font-black tracking-widest text-xs">
                <span className="material-symbols-outlined text-sm">sell</span>
                Precio sube $25.000 al cambiar etapa
              </div>
              <div className="flex items-center gap-2 text-zinc-500 uppercase font-bold tracking-widest text-[10px]">
                <span className="material-symbols-outlined text-xs">group</span>
                <span>
                  {128 -
                    (categoryCounts['PRINCIPIANTE_MASCULINO'] || 0) -
                    (categoryCounts['PRINCIPIANTE_FEMENINO'] || 0) -
                    (categoryCounts['INTERMEDIO_MASCULINO'] || 0) -
                    (categoryCounts['INTERMEDIO_FEMENINO'] || 0)
                  } cupos totales disponibles
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 items-center justify-center">
            <a
              href="#register"
              onClick={(e) => scrollToSection(e, 'register')}
              className="bg-primary hover:bg-white hover:text-black text-white font-display uppercase tracking-widest px-12 py-5 shadow-[0_0_30px_rgba(239,53,61,0.4)] transition-all duration-300 text-xl md:text-2xl clip-path-slant"
            >
              Inscribirme
            </a>
            <a
              href="https://maps.app.goo.gl/X1GtP9rw6NHND4GSA"
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center md:items-start gap-1 group/loc"
            >
              <div className="flex items-center gap-3 text-zinc-500 uppercase font-bold tracking-widest text-xs group-hover/loc:text-primary transition-colors">
                <span className="material-symbols-outlined text-primary group-hover/loc:animate-bounce">location_on</span>
                <span>Cali, Colombia · Julio 18-20, 2026</span>
              </div>
              <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest pl-9 group-hover/loc:text-white transition-colors">
                Box Coach Pipe Rubio · La Merced
              </div>
            </a>
          </div>
        </div>
      </header>

      {/* Concept Section */}
      <section id="competition" className="py-32 px-4 bg-zinc-950 border-y border-zinc-900 relative scroll-mt-24">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none"></div>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center relative z-10">
          <div>
            <h2 className="font-display text-5xl md:text-7xl uppercase mb-8 leading-none">
              El <span className="text-primary italic">Underground</span> <br />Del CrossFit
            </h2>
            <div className="space-y-6 text-zinc-400 text-lg font-body leading-relaxed border-l-4 border-primary pl-8">
              <p><strong className="text-white">No hay equipos</strong>. <strong className="text-white">No hay donde esconderse</strong>. Es tu técnica contra la suya. Tu resistencia contra la suya. Tu voluntad contra la suya.</p>
              <p>Formato de eliminación directa. <strong className="text-white">Ganas y avanzas</strong>. <strong className="text-white">Pierdes y se acabó</strong>. La competencia más cruda diseñada para elevar a los atletas de Cali al siguiente nivel.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: 'sports_kabaddi', title: '1 VS 1', sub: 'Duelo Puro' },
              { icon: 'skull', title: 'Eliminación', sub: 'Sin Excusas' },
              { icon: 'military_tech', title: 'Elite', sub: 'Estándares Reales' },
              { icon: 'workspace_premium', title: 'Gloria', sub: 'Podio y Premios' },
            ].map((item, i) => (
              <div key={i} className="bg-black p-8 border border-zinc-900 flex flex-col items-center text-center group hover:border-primary transition-colors duration-500">
                <span className="material-symbols-outlined text-4xl text-primary mb-4 group-hover:scale-110 transition-transform">{item.icon}</span>
                <h3 className="font-display text-xl uppercase mb-2 text-white">{item.title}</h3>
                <p className="text-[10px] text-zinc-500 tracking-widest font-bold uppercase">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-32 px-4 bg-black scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-display text-6xl md:text-8xl uppercase mb-4 tracking-tighter text-white">
              Elige Tu <span className="text-primary">Batalla</span>
            </h2>
            <p className="text-zinc-500 uppercase tracking-widest text-sm font-bold">Divisiones Disponibles · Cupos Limitados</p>
            <p className="text-primary mt-4 font-black uppercase text-xs tracking-widest">
              * La organización puede reubicar atletas si no cumplen estándares
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {CATEGORIES.map((cat) => (
              <div key={cat.id} className="bg-zinc-950 border border-zinc-900 p-8 md:p-12 hover:border-primary/50 transition-colors group">
                <div className="flex justify-between items-start mb-8">
                  <h3 className="font-display text-5xl text-white leading-none">{cat.title}</h3>
                  <span className="material-symbols-outlined text-5xl text-zinc-800 group-hover:text-primary transition-colors">
                    {cat.id === 'PRINCIPIANTE' ? 'person' : 'fitness_center'}
                  </span>
                </div>
                <p className="text-zinc-400 font-body text-lg mb-8 h-16">{cat.description}</p>

                <div className="bg-black border border-zinc-900 mb-8">
                  <div className="grid grid-cols-12 bg-zinc-900/50 border-b border-zinc-800 py-3 px-4">
                    <div className="col-span-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Movimiento</div>
                    <div className="col-span-3 text-center text-[10px] font-black uppercase tracking-widest text-zinc-500">Masc</div>
                    <div className="col-span-3 text-center text-[10px] font-black uppercase tracking-widest text-zinc-500">Fem</div>
                  </div>
                  <div className="divide-y divide-zinc-900">
                    {cat.standards.map((std, i) => (
                      <div key={i} className="grid grid-cols-12 py-3 px-4 items-center hover:bg-zinc-900/30 transition-colors">
                        <div className="col-span-6 text-xs font-bold text-primary uppercase tracking-wider">{std.exercise}</div>
                        <div className="col-span-3 text-center text-xs font-bold text-zinc-300 uppercase">{std.male}</div>
                        <div className="col-span-3 text-center text-xs font-bold text-zinc-300 uppercase">{std.female}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Slots Calculation */}
                  <div className="bg-zinc-900/50 p-4 border border-zinc-800 text-center">
                    <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-1">Cupos Masculino</p>
                    <p className={`font-display text-xl ${getRegisteredCount(cat.id, 'M') >= MAX_SLOTS_PER_CATEGORY ? 'text-zinc-700 line-through' : 'text-white'}`}>
                      {getRegisteredCount(cat.id, 'M') >= MAX_SLOTS_PER_CATEGORY ? 'AGOTADO' : `${MAX_SLOTS_PER_CATEGORY - getRegisteredCount(cat.id, 'M')} / ${MAX_SLOTS_PER_CATEGORY}`}
                    </p>
                  </div>
                  <div className="bg-zinc-900/50 p-4 border border-zinc-800 text-center">
                    <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-1">Cupos Femenino</p>
                    <p className={`font-display text-xl ${getRegisteredCount(cat.id, 'F') >= MAX_SLOTS_PER_CATEGORY ? 'text-zinc-700 line-through' : 'text-white'}`}>
                      {getRegisteredCount(cat.id, 'F') >= MAX_SLOTS_PER_CATEGORY ? 'AGOTADO' : `${MAX_SLOTS_PER_CATEGORY - getRegisteredCount(cat.id, 'F')} / ${MAX_SLOTS_PER_CATEGORY}`}
                    </p>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prizes Section */}
      <Prizes />

      <AthleteWall />

      {/* Bracket Section (Locked) */}
      <section id="bracket" className="py-24 px-4 bg-zinc-900/30 border-t border-zinc-900 scroll-mt-24">
        <div className="max-w-4xl mx-auto text-center opacity-50 select-none">
          <span className="material-symbols-outlined text-6xl text-zinc-600 mb-4">lock</span>
          <h2 className="font-display text-5xl uppercase mb-2 text-zinc-500">Bracket en Vivo</h2>
          <p className="text-zinc-600 uppercase tracking-widest text-sm font-bold">
            El bracket se habilitará durante el evento.
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-4 bg-zinc-950 relative overflow-hidden scroll-mt-24">
        <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-display text-6xl md:text-8xl uppercase mb-4 text-white">Tarifas</h2>
            <div className="text-primary font-black uppercase tracking-[0.2em] text-sm italic space-y-2">
              <p>Kit oficial completo, bracket 1v1, seguro médico y tu nombre en el muro de atletas.</p>
              <p>Esto no es una carrera de 5K. El precio refleja el nivel.</p>
            </div>
          </div>
          <PricingCards />
        </div>
      </section>

      {/* Payment Info Section */}
      <section id="payment-info" className="py-24 px-4 bg-zinc-950 border-t border-zinc-900 scroll-mt-24">
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-12">
            <h2 className="font-display text-4xl md:text-6xl uppercase mb-4 text-white">
              Cómo <span className="text-primary">Pagar</span>
            </h2>
            <p className="text-zinc-500 uppercase tracking-widest text-sm font-bold">
              Realiza tu pago antes de completar el registro
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">

            {/* Nu Bank */}
            <div className="bg-zinc-900/50 border border-zinc-900 p-8 hover:border-[#9d69ff] transition-colors group">
              <div className="flex items-center justify-center gap-3 mb-6">
                <img src="/Nu.png" alt="Nu" className="w-10 h-10 object-contain grayscale group-hover:grayscale-0 transition-all" />
                <h3 className="font-display text-2xl text-white uppercase italic">Nu Bank</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                  <span className="text-zinc-500 text-xs font-black uppercase tracking-widest">Tipo</span>
                  <span className="text-white font-body tracking-wider">Ahorros</span>
                </div>
                <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                  <span className="text-zinc-500 text-xs font-black uppercase tracking-widest">Número</span>
                  <span className="text-white font-body tracking-wider text-xl flex items-center gap-2">
                    53350851
                    <button onClick={() => { navigator.clipboard.writeText('53350851'); alert('Copiado'); }} className="text-zinc-500 hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-sm">content_copy</span>
                    </button>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 text-xs font-black uppercase tracking-widest">Llave Nu</span>
                  <span className="text-white font-body tracking-wider flex items-center gap-2">
                    @WRV034
                    <button onClick={() => { navigator.clipboard.writeText('@WRV034'); alert('Copiado'); }} className="text-zinc-500 hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-sm">content_copy</span>
                    </button>
                  </span>
                </div>
              </div>
            </div>

            {/* Nequi */}
            <div className="bg-zinc-900/50 border border-zinc-900 p-8 hover:border-white transition-colors group">
              <div className="flex items-center justify-center gap-3 mb-6">
                <img src="/nequi.png" alt="Nequi" className="w-10 h-10 object-contain grayscale group-hover:grayscale-0 transition-all" />
                <h3 className="font-display text-2xl text-white uppercase italic">Nequi</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                  <span className="text-zinc-500 text-xs font-black uppercase tracking-widest">Celular</span>
                  <span className="text-white font-body tracking-wider text-xl flex items-center gap-2">
                    313 633 6446
                    <button onClick={() => { navigator.clipboard.writeText('3136336446'); alert('Copiado'); }} className="text-zinc-500 hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-sm">content_copy</span>
                    </button>
                  </span>
                </div>
                <div className="flex justify-center pt-2">
                  <img src="/qr nequi.jpeg" alt="QR Nequi" className="w-32 h-32 object-contain mix-blend-screen opacity-80" />
                </div>
                <div className="text-center">
                  <span className="text-zinc-600 text-[10px] uppercase font-black tracking-widest">Titular: William Reyes V.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Validation */}
          <div className="mb-12">
            <div className="inline-block bg-primary/10 border border-primary/30 p-6">
              <h4 className="text-primary font-black uppercase tracking-widest text-xs mb-2">Valor a transferir</h4>
              <div className="text-white font-display text-4xl mb-2">
                {currentPrice}
              </div>
              <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-widest">
                ⚠️ Guarda tu comprobante para adjuntarlo en el formulario
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4 text-left max-w-4xl mx-auto mb-12">
            <div className="bg-zinc-900 p-4 border-l-2 border-primary">
              <span className="block text-primary font-black text-xl mb-2">▸</span>
              <p className="text-zinc-400 text-xs uppercase font-bold leading-relaxed">Realiza la transferencia por el valor exacto mostrado en precios</p>
            </div>
            <div className="bg-zinc-900 p-4 border-l-2 border-primary">
              <span className="block text-primary font-black text-xl mb-2">▸</span>
              <p className="text-zinc-400 text-xs uppercase font-bold leading-relaxed">Guarda el comprobante de pago (screenshot o PDF)</p>
            </div>
            <div className="bg-zinc-900 p-4 border-l-2 border-primary">
              <span className="block text-primary font-black text-xl mb-2">▸</span>
              <p className="text-zinc-400 text-xs uppercase font-bold leading-relaxed">Completa el formulario de registro y adjunta tu comprobante</p>
            </div>
            <div className="bg-zinc-900 p-4 border-l-2 border-primary">
              <span className="block text-primary font-black text-xl mb-2">▸</span>
              <p className="text-zinc-400 text-xs uppercase font-bold leading-relaxed">Comprobantes falsos o alterados = descalificación sin reembolso</p>
            </div>
          </div>

          <div className="text-center">
            <a
              href="#register"
              onClick={(e) => scrollToSection(e, 'register')}
              className="inline-block bg-primary hover:bg-white hover:text-black text-white font-display uppercase tracking-widest px-12 py-4 transition-all shadow-[0_0_30px_rgba(239,53,61,0.3)] cursor-pointer"
            >
              Ya pagué, llenar formulario →
            </a>
          </div>
        </div>
      </section>

      {/* Registration Form Section */}
      <section id="register" className="py-32 px-4 bg-black relative scroll-mt-24">
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="font-display text-5xl md:text-7xl text-center uppercase mb-6 text-white">
            Reclama Tu <span className="text-primary">Puesto</span>
          </h2>
          <p className="text-center text-zinc-500 mb-16 uppercase tracking-widest text-sm font-bold">
            Sin segunda oportunidad. Completa tu registro oficial.
          </p>

          <RegistrationForm />
        </div>
      </section>

      {/* Legal Section */}
      <section className="py-12 px-4 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto text-center">
          <h4 className="text-xs font-black uppercase text-zinc-600 tracking-widest mb-4">Condiciones Generales</h4>
          <p className="text-zinc-700 text-xs leading-relaxed max-w-2xl mx-auto uppercase font-bold">
            No se realizan reembolsos bajo ninguna circunstancia. <br />
            No se permiten cambios de categoría una vez validado el registro, salvo disposición de la organización.<br />
            La organización se reserva el derecho de admisión y reubicación de atletas.
          </p>
        </div>
      </section>

      <FAQ />

      {/* Footer */}
      <footer className="bg-zinc-950 py-20 px-4 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div onClick={scrollToTop} className="flex items-center gap-3 mb-10 grayscale opacity-50 hover:opacity-100 hover:grayscale-0 transition-all cursor-pointer group">
            {/* Logo Footer - Added for consistency */}
            <img
              src="logo.png"
              alt="Dare League"
              className="h-12 w-auto object-contain drop-shadow-[0_0_10px_rgba(239,53,61,0.3)]"
            />
            <span className="font-display text-4xl uppercase tracking-tighter text-white">Dare League</span>
          </div>

          <div className="flex flex-wrap justify-center gap-8 md:gap-16 mb-16 font-display text-sm tracking-widest text-zinc-500 uppercase">
            <a href="https://www.instagram.com/dareleague2025/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Instagram</a>
            <a href="https://wa.me/573136336446" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">WhatsApp</a>
            <a href="#" className="hover:text-white transition-colors">Reglamento</a>
            <a href="https://www.instagram.com/coach.piperubio/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors italic text-[10px] font-black tracking-[.2em] self-center">COACH PIPE RUBIO</a>
          </div>

          <div className="text-center space-y-2 mb-12">
            <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest text-balance">
              Ubicación: Cuatro cuadras después del Comfandi de la 52, 51 N 56, Av. 2f Nte. #51n56, La Merced, Cali
            </p>
            <p className="text-[10px] text-zinc-700 uppercase tracking-[0.3em] font-black">
              SOLO LOS MÁS FUERTES PERMANECEN. © 2026 DARE LEAGUE.
            </p>
          </div>
          <div className="h-[1px] w-12 bg-primary"></div>
        </div>
      </footer>

      {/* Mobile Sticky CTA */}
      <div className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-black/90 backdrop-blur border-t border-primary/30 p-4">
        <a
          href="#register"
          onClick={(e) => scrollToSection(e, 'register')}
          className="block w-full bg-primary text-white font-display text-center uppercase tracking-widest py-4 text-xl shadow-[0_0_20px_rgba(239,53,61,0.3)]"
        >
          Inscribirme Ya
        </a>
      </div>

      {showStatusCheck && <RegistrationStatus onClose={() => setShowStatusCheck(false)} />}

    </div>
  );
}

export default App;