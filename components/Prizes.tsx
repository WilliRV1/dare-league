import React from 'react';

const Prizes: React.FC = () => {
    return (
        <section id="prizes" className="py-24 px-4 bg-zinc-950 border-t border-zinc-900 relative overflow-hidden scroll-mt-24">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none"></div>

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <h2 className="font-display text-5xl md:text-7xl uppercase mb-4 text-white">Premios <span className="text-primary">Cash</span></h2>
                    <p className="text-zinc-500 uppercase tracking-widest text-sm font-bold">
                        El esfuerzo se paga. La gloria es eterna.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 md:gap-16">
                    {/* Principiante */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-zinc-800 to-zinc-900 rounded-sm blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative bg-black border border-zinc-800 p-8 h-full">
                            <div className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-4">
                                <h3 className="font-display text-3xl uppercase italic text-white">Principiante</h3>
                                <span className="bg-zinc-900 text-zinc-400 text-[10px] font-black uppercase px-3 py-1 tracking-widest rounded-full">Total $1.1M</span>
                            </div>

                            <div className="space-y-6">
                                <PrizeRow place="1" label="Campeón" amount="$500.000" highlight />
                                <PrizeRow place="2" label="Subcampeón" amount="$350.000" />
                                <PrizeRow place="3" label="Tercer Lugar" amount="$250.000" />
                            </div>
                        </div>
                    </div>

                    {/* Intermedio */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-red-900/50 rounded-sm blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative bg-black border border-zinc-800 p-8 h-full">
                            <div className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-4">
                                <h3 className="font-display text-3xl uppercase italic text-white">Intermedio</h3>
                                <span className="bg-zinc-900 text-zinc-400 text-[10px] font-black uppercase px-3 py-1 tracking-widest rounded-full">Total $1.4M</span>
                            </div>

                            <div className="space-y-6">
                                <PrizeRow place="1" label="Campeón" amount="$600.000" highlight />
                                <PrizeRow place="2" label="Subcampeón" amount="$450.000" />
                                <PrizeRow place="3" label="Tercer Lugar" amount="$350.000" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-zinc-600 text-[10px] uppercase font-black tracking-widest">
                        * Premios sujetos a retenciones legales y cumplimiento de cupos mínimos por categoría.
                    </p>
                </div>
            </div>
        </section>
    );
};

const PrizeRow = ({ place, label, amount, highlight = false }: { place: string, label: string, amount: string, highlight?: boolean }) => (
    <div className={`flex items-center justify-between ${highlight ? 'scale-105 origin-left' : ''} transition-transform`}>
        <div className="flex items-center gap-4">
            <div className={`
        flex items-center justify-center w-12 h-12 font-display text-2xl skew-x-[-10deg]
        ${highlight ? 'bg-primary text-black' : 'bg-zinc-900 text-zinc-500'}
      `}>
                {place}
            </div>
            <span className={`uppercase font-bold tracking-widest text-sm ${highlight ? 'text-white' : 'text-zinc-400'}`}>
                {label}
            </span>
        </div>
        <span className={`font-display text-2xl tracking-tighter ${highlight ? 'text-primary text-glow' : 'text-white'}`}>
            {amount}
        </span>
    </div>
);

export default Prizes;
