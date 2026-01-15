import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Registration } from '../types';

interface StatusResult {
    status: string;
    id: string;
    name: string;
    category: string;
    rejectionNotes?: string;
}

const RegistrationStatus: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [documentId, setDocumentId] = useState('');
    const [result, setResult] = useState<StatusResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!documentId.trim()) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('registrations')
                .select('registration_id, status, full_name, category, rejection_notes')
                .eq('document_id', documentId.trim())
                .order('created_at', { ascending: false })
                .limit(1);

            if (fetchError) throw fetchError;

            if (data && data.length > 0) {
                setResult({
                    status: data[0].status,
                    id: data[0].registration_id,
                    name: data[0].full_name,
                    category: data[0].category,
                    rejectionNotes: data[0].rejection_notes
                });
            } else {
                setError('No se encontró ninguna inscripción con este documento.');
            }
        } catch (err: any) {
            console.error('Search error:', err);
            setError('Error al consultar. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
            <div className="bg-zinc-950 border border-zinc-900 w-full max-w-md p-8 relative shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                <h3 className="font-display text-3xl uppercase italic mb-2">Consultar <span className="text-primary not-italic">Mi Estado</span></h3>
                <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-8">Ingresa tu documento de identidad</p>

                <form onSubmit={handleSearch} className="space-y-6">
                    <div>
                        <input
                            type="text"
                            value={documentId}
                            onChange={(e) => setDocumentId(e.target.value)}
                            placeholder="CÉDULA / ID"
                            className="w-full bg-black border border-zinc-800 p-4 text-white focus:border-primary focus:outline-none font-body text-center tracking-widest uppercase"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black font-display text-xl uppercase py-4 hover:bg-primary hover:text-white transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Consultando...' : 'Verificar Registro'}
                    </button>
                </form>

                {error && (
                    <div className="mt-8 p-4 bg-primary/10 border border-primary text-primary text-[10px] font-black uppercase text-center animate-pulse">
                        {error}
                    </div>
                )}

                {result && (
                    <div className="mt-8 bg-zinc-900/50 p-6 border-l-4 border-primary animate-fade-in-up">
                        <h4 className="text-white font-display text-xl uppercase mb-4">{result.name}</h4>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                                <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">ID Registro</span>
                                <span className="text-white font-mono text-xs">#{result.id}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                                <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Categoría</span>
                                <span className="text-white font-display text-xs uppercase tracking-widest">{result.category}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Estado Actual</span>
                                <span
                                    className={`
                    text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded
                    ${result.status === 'APPROVED' ? 'bg-green-500/10 text-green-500' :
                                            result.status === 'REJECTED' ? 'bg-red-500/10 text-red-500' :
                                                'bg-yellow-500/10 text-yellow-500'}
                  `}
                                >
                                    {result.status === 'APPROVED' ? 'Aprobado 🔥' :
                                        result.status === 'REJECTED' ? 'Inconveniente' : 'Pendiente'}
                                </span>
                            </div>

                            {/* Rejection/Notes Display */}
                            {result.rejectionNotes && (
                                <div className="mt-4 p-3 bg-primary/10 border border-primary/30 rounded">
                                    <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-1 italic">Nota del Organizador:</p>
                                    <p className="text-white text-xs font-bold leading-relaxed">{result.rejectionNotes}</p>
                                </div>
                            )}
                        </div>

                        {result.status === 'PENDING' && !result.rejectionNotes && (
                            <p className="mt-6 text-[9px] text-zinc-600 uppercase font-bold text-center leading-relaxed">
                                Estamos validando tu pago. <br /> Esto puede tardar hasta 48 horas habiles.
                            </p>
                        )}

                        {result.status === 'APPROVED' && (
                            <p className="mt-6 text-green-500 text-[10px] uppercase font-black text-center animate-bounce">
                                ¡Prepara los straps, nos vemos en la arena!
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RegistrationStatus;
