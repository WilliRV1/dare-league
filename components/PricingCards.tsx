import React, { useEffect, useState } from 'react';
import { PRICING_TIERS } from '../constants';
import { PricingStage } from '../types';

const PricingCards: React.FC = () => {
  const [currentStage, setCurrentStage] = useState<PricingStage>(PricingStage.CLOSED);

  useEffect(() => {
    // Function to check and update active stage
    const updateActiveStage = () => {
      const now = new Date();

      const activeTier = PRICING_TIERS.find(tier => {
        if (!tier.endDate) return now >= tier.startDate;
        return now >= tier.startDate && now <= tier.endDate;
      });

      if (activeTier) {
        setCurrentStage(activeTier.id);
      } else {
        // Optionally handle pre/post event states here if needed, 
        // currently keeps default or previous state if no tier matches (e.g. gaps)
        // But for this logic, we just want to ensure if we move into a tier, it updates.
      }
    };

    updateActiveStage(); // Initial check

    // Re-check every minute to ensure stage updates automatically if user keeps tab open
    const interval = setInterval(updateActiveStage, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {PRICING_TIERS.map((tier) => {
        const isActive = tier.id === currentStage;
        const isPast = tier.endDate && new Date() > tier.endDate;
        const isFuture = new Date() < tier.startDate;

        return (
          <div
            key={tier.id}
            className={`
              relative flex flex-col p-8 md:p-10 border transition-all duration-300
              ${isActive
                ? 'bg-black border-primary scale-105 z-10 shadow-[0_0_40px_rgba(239,53,61,0.15)]'
                : 'bg-zinc-950/50 border-zinc-800 opacity-60 hover:opacity-100 hover:border-zinc-600'}
            `}
          >
            {isActive && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-black text-[10px] font-black uppercase px-6 py-2 tracking-widest shadow-lg">
                Precio Actual
              </div>
            )}

            <span className={`font-display text-lg uppercase tracking-widest mb-2 ${isActive ? 'text-zinc-400' : 'text-zinc-600'}`}>
              {tier.name}
            </span>

            <p className="text-primary text-[10px] font-black uppercase tracking-widest mb-4">
              {tier.startDate.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }).toUpperCase()}
              {tier.endDate ? ` - ${tier.endDate.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }).toUpperCase()}` : ''}
            </p>

            <h3 className={`font-display text-6xl mb-6 tracking-tighter leading-none ${isActive ? 'text-white' : 'text-zinc-500'}`}>
              {tier.formattedPrice}
            </h3>

            <ul className="space-y-4 mb-10 text-sm font-bold uppercase flex-grow">
              {tier.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-zinc-400">
                  <span className={`material-symbols-outlined text-lg ${isActive ? 'text-primary' : 'text-zinc-700'}`}>
                    check_circle
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mt-auto">
              {isActive ? (
                <a
                  href="#register"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="block w-full bg-primary text-white font-display uppercase tracking-widest py-4 text-center hover:bg-white hover:text-black transition-all duration-300"
                >
                  Inscribirme
                </a>
              ) : isPast ? (
                <button disabled className="w-full border border-zinc-800 text-zinc-700 font-display uppercase tracking-widest py-4 cursor-not-allowed">
                  Finalizado
                </button>
              ) : (
                <button disabled className="w-full border border-zinc-800 text-zinc-700 font-display uppercase tracking-widest py-4 cursor-not-allowed">
                  Próximamente
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PricingCards;