import React from 'react';

interface AthleteFlyerProps {
    name: string;
    category: string;
    gender: string;
}

const AthleteFlyer: React.FC<AthleteFlyerProps> = ({ name, category, gender }) => {
    return (
        <div id="athlete-flyer" className="relative w-[1080px] h-[1080px] bg-black overflow-hidden flex flex-col items-center justify-center font-display">
            {/* Background with Overlay */}
            <img
                src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2940&auto=format&fit=crop"
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale"
                crossOrigin="anonymous"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
            <div className="absolute inset-0 border-[30px] border-primary/20 pointer-events-none"></div>

            {/* Top Banner */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 text-center w-full">
                <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="h-1 w-20 bg-primary"></div>
                    <span className="text-zinc-500 tracking-[0.5em] text-xl font-bold uppercase">Competencia Oficial</span>
                    <div className="h-1 w-20 bg-primary"></div>
                </div>
                <h1 className="text-9xl text-white leading-none tracking-tighter uppercase italic">
                    DARE <span className="text-primary not-italic text-glow">LEAGUE</span>
                </h1>
            </div>

            {/* Main Content */}
            <div className="relative z-10 text-center px-12 mt-20">
                <p className="text-primary text-3xl font-bold tracking-[0.3em] uppercase mb-8">Atleta Confirmado</p>

                <div className="mb-12">
                    <h2 className="text-[10rem] text-white leading-[0.8] uppercase tracking-tighter break-words max-w-4xl mx-auto drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
                        {name.split(' ')[0]}
                    </h2>
                    <h2 className="text-8xl text-zinc-400 leading-[0.8] uppercase tracking-tighter italic">
                        {name.split(' ').slice(1).join(' ')}
                    </h2>
                </div>

                <div className="inline-block bg-primary px-12 py-6 clip-path-slant">
                    <p className="text-white text-4xl font-black uppercase tracking-widest italic">
                        {category} · {gender}
                    </p>
                </div>
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full text-center px-20">
                <div className="flex justify-between items-end border-t border-zinc-800 pt-8">
                    <div className="text-left">
                        <p className="text-zinc-500 uppercase text-sm font-bold tracking-widest mb-1 italic">Sede de la Batalla</p>
                        <p className="text-white text-3xl uppercase font-black">Cali, Colombia</p>
                    </div>
                    <div className="text-right">
                        <p className="text-zinc-500 uppercase text-sm font-bold tracking-widest mb-1 italic">Duelo 1 vs 1</p>
                        <p className="text-white text-3xl uppercase font-black">Julio 18 - 20, 2026</p>
                    </div>
                </div>
            </div>

            {/* Badge Styling */}
            <div className="absolute top-1/2 right-12 -translate-y-1/2 vertical-text opacity-10 pointer-events-none">
                <span className="text-[15rem] leading-none text-white font-black uppercase">ATHLETE</span>
            </div>
        </div>
    );
};

export default AthleteFlyer;
