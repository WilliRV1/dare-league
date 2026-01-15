import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

interface SimpleAthlete {
    full_name: string;
    gym: string;
    category: string;
}

const AthleteWall: React.FC = () => {
    const [athletes, setAthletes] = useState<SimpleAthlete[]>([]);

    useEffect(() => {
        const fetchLastAthletes = async () => {
            const { data, error } = await supabase
                .from('registrations')
                .select('full_name, gym, category')
                .order('created_at', { ascending: false })
                .limit(15);

            if (error) {
                console.error('Error fetching athletes for wall:', error);
                return;
            }

            if (data) {
                setAthletes(data);
            }
        };

        fetchLastAthletes();
        // Refresh every 5 minutes
        const interval = setInterval(fetchLastAthletes, 300000);
        return () => clearInterval(interval);
    }, []);

    if (athletes.length === 0) return null;

    // Duplicate list for infinite effect
    const displayAthletes = [...athletes, ...athletes, ...athletes];

    return (
        <div className="bg-black py-16 border-y border-zinc-900 overflow-hidden relative group">
            <div className="text-center mb-10">
                <h3 className="font-display text-2xl text-white uppercase tracking-tighter italic">Muro de Atletas</h3>
                <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mt-1">Nuevos guerreros se unen a la arena</p>
            </div>

            <div className="relative flex overflow-x-hidden">
                <div className="flex animate-marquee whitespace-nowrap py-4">
                    {displayAthletes.map((athlete, i) => (
                        <div
                            key={i}
                            className="inline-block mx-6 bg-zinc-900/50 border border-zinc-800 p-4 min-w-[200px] transform hover:scale-105 transition-transform cursor-default"
                        >
                            <div className="flex flex-col">
                                <span className="text-primary font-display text-xs uppercase tracking-widest mb-1 italic">
                                    {athlete.category}
                                </span>
                                <span className="text-white font-display text-lg uppercase tracking-tighter truncate max-w-[180px]">
                                    {athlete.full_name}
                                </span>
                                <span className="text-zinc-600 text-[10px] uppercase font-black tracking-widest mt-2 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[12px]">fitness_center</span>
                                    {athlete.gym || 'INDEPENDIENTE'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Overlays for fade effect */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-10"></div>
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-10"></div>
        </div>
    );
};

export default AthleteWall;
