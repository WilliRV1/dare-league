import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Registration, RegistrationStatus } from '../types';
import AthleteFlyer from './AthleteFlyer';
import { toPng } from 'html-to-image';

const AdminView: React.FC = () => {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAthlete, setSelectedAthlete] = useState<Registration | null>(null);

    // Client-side Hardening: Check immediately
    if (sessionStorage.getItem('admin_auth') !== 'true') return null;
    const [isExporting, setIsExporting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
    const [rejectionNotes, setRejectionNotes] = useState('');
    const flyerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const fetchRegistrations = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('registrations')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching registrations:', error);
        } else {
            setRegistrations(data || []);
        }
        setLoading(false);
    };

    // --- Statistics ---
    const stats = {
        total: registrations.length,
        approved: registrations.filter(r => r.status === RegistrationStatus.APPROVED).length,
        pending: registrations.filter(r => r.status === RegistrationStatus.PENDING).length,
        revenue: registrations
            .filter(r => r.status === RegistrationStatus.APPROVED)
            .reduce((acc, curr) => acc + 170000, 0), // Base price for Etapa 1
        totalCapacity: 128, // 32 slots * 4 category variants
    };

    // --- Filtering Logic ---
    const filteredRegistrations = registrations.filter(reg => {
        const matchesSearch = reg.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            reg.registration_id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || reg.status === statusFilter;
        const matchesCategory = categoryFilter === 'ALL' || reg.category === categoryFilter;
        return matchesSearch && matchesStatus && matchesCategory;
    });

    // --- CSV Export ---
    const exportToCSV = () => {
        const headers = ['ID', 'Nombre', 'Cédula', 'Email', 'Teléfono', 'Categoría', 'Género', 'Talla Camisa', 'Estado', 'Fecha'];
        const csvRows = [
            headers.join(','),
            ...registrations.map(r => [
                r.registration_id,
                `"${r.full_name}"`,
                r.document_id,
                r.email,
                r.phone,
                r.category,
                r.gender,
                r.shirt_size || 'N/A',
                r.status,
                new Date(r.created_at).toLocaleDateString()
            ].join(','))
        ];

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `DARE-LEAGUE-REGISTRATIONS-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const openDocument = async (path: string) => {
        const { data, error } = await supabase.storage
            .from('payment-proofs')
            .createSignedUrl(path, 3600); // 1 hora

        if (error) {
            alert('Error al generar enlace: ' + error.message);
        } else if (data) {
            window.open(data.signedUrl, '_blank');
        }
    };

    const openFlyerWindow = () => {
        if (!selectedAthlete) return;
        const flyerHtml = `
            <html>
                <head>
                    <title>Flyer - ${selectedAthlete.full_name}</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Roboto+Condensed:wght@400;700&display=swap');
                        .font-display { font-family: 'Anton', sans-serif; }
                        .text-glow { text-shadow: 0 0 20px rgba(239, 53, 61, 0.5); }
                        .clip-path-slant { clip-path: polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%); }
                        .vertical-text { writing-mode: vertical-rl; text-orientation: mixed; }
                    </style>
                </head>
                <body class="bg-black flex items-center justify-center min-h-screen m-0">
                    <div style="width: 1080px; height: 1080px;">
                        ${flyerRef.current?.innerHTML || ''}
                    </div>
                </body>
            </html>
        `;
        const newWindow = window.open('', '_blank');
        if (newWindow) {
            newWindow.document.write(flyerHtml);
            newWindow.document.close();
        }
    };

    const downloadFlyer = async () => {
        if (!flyerRef.current || !selectedAthlete) return;
        setIsExporting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            const dataUrl = await toPng(flyerRef.current, {
                cacheBust: true,
                width: 1080,
                height: 1080,
                pixelRatio: 1,
                backgroundColor: '#000000',
            });
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `FLYER-${selectedAthlete.full_name.toUpperCase()}.png`;
            link.click();
        } catch (err) {
            console.error('Download failed, using fallback', err);
            openFlyerWindow();
        } finally {
            setIsExporting(false);
        }
    };

    const deleteRegistration = async (id: string, path: string) => {
        if (!window.confirm('¿ESTÁS SEGURO? Esto eliminará permanentemente el registro y el archivo. Esta acción NO se puede deshacer.')) return;

        // 1. Delete File
        if (path) {
            const { error: storageError } = await supabase.storage.from('payment-proofs').remove([path]);
            if (storageError) console.error('Storage delete error:', storageError);
        }

        // 2. Delete Record
        const { error } = await supabase.from('registrations').delete().eq('id', id);

        if (error) {
            alert('Error deleting: ' + error.message);
        } else {
            fetchRegistrations();
            setSelectedAthlete(null);
            setRejectionNotes('');
        }
    };

    const updateStatus = async (id: string, status: RegistrationStatus, notes?: string) => {
        const { error } = await supabase
            .from('registrations')
            .update({ status, rejection_notes: notes || null })
            .eq('id', id);

        if (error) {
            alert('Error updating status: ' + error.message);
        } else {
            fetchRegistrations();
            if (selectedAthlete?.id === id) {
                setSelectedAthlete(prev => prev ? { ...prev, status, rejection_notes: notes } : null);
            }
            setRejectionNotes(''); // Reset notes
        }
    };

    if (loading) return <div className="p-20 text-center uppercase font-display text-2xl animate-pulse text-white">Cargando Batallas...</div>;

    return (
        <div className="min-h-screen bg-black text-white p-6 font-body">
            <div className="max-w-[1600px] mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-zinc-900 pb-8 gap-6">
                    <div>
                        <h1 className="font-display text-6xl uppercase italic leading-none">Panel de <span className="text-primary not-italic">Control</span></h1>
                        <p className="text-zinc-500 uppercase tracking-widest text-sm font-bold mt-3">Sincronizado con Supabase Cloud</p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={exportToCSV} className="bg-green-600 hover:bg-green-500 px-6 py-3 text-xs font-black uppercase tracking-widest transition-all">Exportar CSV</button>
                        <button onClick={fetchRegistrations} className="bg-zinc-900 hover:bg-zinc-800 px-6 py-3 text-xs font-black uppercase tracking-widest transition-all">Refrescar</button>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    <StatCard label="Total Inscritos" value={stats.total} color="border-zinc-800" />
                    <StatCard label="Aprobados" value={stats.approved} color="border-green-800 text-green-500" />
                    <StatCard label="Pendientes" value={stats.pending} color="border-yellow-800 text-yellow-500" />
                    <StatCard label="Recaudación (Est.)" value={`$${(stats.revenue / 1000).toFixed(0)}.000`} color="border-primary text-primary" />
                </div>

                {/* Main Content */}
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* List Section */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Filters Bar */}
                        <div className="flex flex-col md:flex-row gap-4 bg-zinc-950 p-4 border border-zinc-900 mb-6">
                            <input
                                type="text"
                                placeholder="Buscar por nombre o ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 bg-black border border-zinc-800 px-4 py-3 text-sm focus:border-primary outline-none transition-all font-bold"
                            />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-black border border-zinc-800 px-4 py-3 text-sm font-bold outline-none cursor-pointer"
                            >
                                <option value="ALL">TODOS LOS ESTADOS</option>
                                <option value={RegistrationStatus.PENDING}>PENDIENTES</option>
                                <option value={RegistrationStatus.APPROVED}>APROBADOS</option>
                                <option value={RegistrationStatus.REJECTED}>RECHAZADOS</option>
                            </select>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="bg-black border border-zinc-800 px-4 py-3 text-sm font-bold outline-none cursor-pointer"
                            >
                                <option value="ALL">TODAS LAS CATEGORÍAS</option>
                                <option value="PRINCIPIANTE">PRINCIPIANTE</option>
                                <option value="INTERMEDIO">INTERMEDIO</option>
                            </select>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 max-h-[1200px] overflow-y-auto pr-2 custom-scrollbar">
                            {filteredRegistrations.length === 0 && (
                                <div className="col-span-2 py-20 text-center border border-zinc-900 border-dashed">
                                    <p className="text-zinc-700 uppercase font-black tracking-widest">Sin resultados</p>
                                </div>
                            )}
                            {filteredRegistrations.map((reg) => (
                                <div
                                    key={reg.id}
                                    onClick={() => setSelectedAthlete(reg)}
                                    className={`p-6 border transition-all cursor-pointer group relative overflow-hidden ${selectedAthlete?.id === reg.id ? 'bg-zinc-900 border-primary shadow-[0_0_20px_rgba(239,53,61,0.1)]' : 'bg-zinc-950 border-zinc-900 hover:border-zinc-700'}`}
                                >
                                    <div className="flex justify-between items-start relative z-10">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`h-2 w-2 rounded-full ${reg.status === RegistrationStatus.APPROVED ? 'bg-green-500' : reg.status === RegistrationStatus.REJECTED ? 'bg-primary' : 'bg-yellow-500'}`}></span>
                                                <h3 className="font-display text-2xl uppercase tracking-tighter leading-none">{reg.full_name}</h3>
                                            </div>
                                            <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">{reg.category} · {reg.gender} · {reg.gym}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-zinc-600 font-mono text-[9px] mb-1">#{reg.registration_id}</p>
                                            <span className={`text-[9px] font-black uppercase px-2 py-1 ${reg.status === RegistrationStatus.APPROVED ? 'bg-green-500/10 text-green-500' : reg.status === RegistrationStatus.REJECTED ? 'bg-primary/10 text-primary' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                                {reg.status.replace('_VALIDATION', '')}
                                            </span>
                                        </div>
                                    </div>
                                    {selectedAthlete?.id === reg.id && <div className="absolute top-0 right-0 w-16 h-16 bg-primary/20 blur-2xl"></div>}
                                    {reg.rejection_notes && <div className="mt-4 p-2 bg-primary/5 border-l-2 border-primary text-[9px] text-primary italic uppercase tracking-widest">{reg.rejection_notes}</div>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Detail/Flyer Section */}
                    <div className="relative">
                        {selectedAthlete ? (
                            <div className="sticky top-6 space-y-6">
                                <div className="bg-zinc-950 border border-zinc-900 p-8 shadow-2xl">
                                    <h4 className="font-display text-3xl uppercase mb-8 italic">Atleta</h4>
                                    <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
                                        <DetailItem label="Nombre Completo" value={selectedAthlete.full_name} />
                                        <DetailItem label="Documento" value={selectedAthlete.document_id} />
                                        <DetailItem label="Edad" value={`${selectedAthlete.age} años`} />
                                        <DetailItem label="WhatsApp" value={selectedAthlete.phone} />
                                        <DetailItem label="Email" value={selectedAthlete.email} />
                                        <DetailItem label="Gimnasio" value={selectedAthlete.gym} />
                                        <DetailItem label="Talla Camisa" value={selectedAthlete.shirt_size || '---'} />
                                    </div>

                                    <div className="border-t border-zinc-900 pt-8 mb-8">
                                        <DetailItem label="Emergencia" value={`${selectedAthlete.emergency_name} (${selectedAthlete.emergency_phone})`} />
                                    </div>

                                    <div className="mb-8 p-4 bg-zinc-900/50 border border-zinc-800">
                                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3">Verificación de Pago</p>
                                        <button
                                            onClick={() => openDocument(selectedAthlete.payment_proof_path)}
                                            className="w-full bg-zinc-800 hover:bg-zinc-700 p-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                        >
                                            COMPROBANTE EXTERNO ↗
                                        </button>
                                    </div>

                                    <div className="mb-8 p-4 bg-zinc-900 border border-zinc-800">
                                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3">Notas / Motivo de Rechazo</p>
                                        <textarea
                                            value={rejectionNotes}
                                            onChange={(e) => setRejectionNotes(e.target.value)}
                                            placeholder="Ej: Pago incompleto - faltan $10.000"
                                            className="w-full bg-black border border-zinc-800 p-3 text-xs focus:border-primary outline-none min-h-[80px]"
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => updateStatus(selectedAthlete.id, RegistrationStatus.REJECTED, rejectionNotes)}
                                            className="flex-1 border border-zinc-800 hover:border-primary hover:text-primary py-4 text-[10px] font-black uppercase transition-all"
                                        >
                                            RECHAZAR {rejectionNotes && 'CON MOTIVO'}
                                        </button>
                                        <button
                                            onClick={() => deleteRegistration(selectedAthlete.id, selectedAthlete.payment_proof_path)}
                                            className="flex-1 bg-red-900/50 hover:bg-red-900 border border-red-900 text-red-500 hover:text-white py-4 text-[10px] font-black uppercase transition-all"
                                        >
                                            ELIMINAR (LIBERAR CUPO)
                                        </button>
                                        <button
                                            onClick={() => updateStatus(selectedAthlete.id, RegistrationStatus.APPROVED)}
                                            className="flex-1 bg-green-600 hover:bg-green-500 py-4 text-[10px] font-black uppercase transition-all"
                                        >
                                            APROBAR PAGO
                                        </button>
                                    </div>
                                </div>

                                {selectedAthlete.status === RegistrationStatus.APPROVED && (
                                    <div className="bg-zinc-950 border border-zinc-900 p-8">
                                        <div className="flex flex-col gap-4 mb-8">
                                            <h4 className="font-display text-2xl uppercase italic text-glow">Flyer de Atleta</h4>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={downloadFlyer}
                                                    disabled={isExporting}
                                                    className="flex-1 bg-primary hover:bg-white hover:text-black px-4 py-3 text-[10px] font-black uppercase transition-all"
                                                >
                                                    {isExporting ? '...' : 'DESCARGAR JPG'}
                                                </button>
                                                <button
                                                    onClick={openFlyerWindow}
                                                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 px-4 py-3 text-[10px] font-black uppercase transition-all"
                                                >
                                                    CAPTURAR
                                                </button>
                                            </div>
                                        </div>

                                        <div className="relative w-full overflow-hidden" style={{ height: '238px' }}>
                                            <div className="absolute top-0 left-0 scale-[0.22] origin-top-left shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                                                <div ref={flyerRef}>
                                                    <AthleteFlyer
                                                        name={selectedAthlete.full_name}
                                                        category={selectedAthlete.category}
                                                        gender={selectedAthlete.gender}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8 border-t border-zinc-900 pt-8 space-y-3">
                                            <a
                                                href={`https://wa.me/${selectedAthlete.phone}?text=${encodeURIComponent(`¡Hola ${selectedAthlete.full_name.split(' ')[0]}! Tu inscripción a DARE LEAGUE ha sido aprobada. 🔥 ¡Nos vemos en el ruedo!`)}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="block w-full bg-green-600/10 border border-green-600/30 p-4 text-center text-[10px] font-black text-green-500 hover:bg-green-600 hover:text-white transition-all uppercase tracking-widest"
                                            >
                                                Enviar Confirmación 💬
                                            </a>
                                            {selectedAthlete.status === RegistrationStatus.REJECTED && (
                                                <a
                                                    href={`https://wa.me/${selectedAthlete.phone}?text=${encodeURIComponent(`Hola ${selectedAthlete.full_name.split(' ')[0]}, revisamos tu pago para DARE LEAGUE y parece que hay un inconveniente: ${rejectionNotes || selectedAthlete.rejection_notes || 'Favor revisar el comprobante'}. ¿Podrías confirmarnos?`)}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="block w-full bg-primary/10 border border-primary/30 p-4 text-center text-[10px] font-black text-primary hover:bg-primary hover:text-white transition-all uppercase tracking-widest"
                                                >
                                                    Enviar Notificación Cobro / Error 💬
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-[400px] border border-zinc-900 border-dashed flex items-center justify-center p-12 text-center text-zinc-800 uppercase font-black tracking-[0.3em] leading-relaxed">
                                Selecciona <br /> un atleta <br /> para gestionar
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, color }: { label: string, value: string | number, color?: string }) => (
    <div className={`bg-zinc-950 p-6 border ${color || 'border-zinc-900'}`}>
        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-4xl font-display uppercase tracking-tight leading-none">{value}</p>
    </div>
);

const DetailItem = ({ label, value }: { label: string, value: string }) => (
    <div className="overflow-hidden">
        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-bold truncate text-zinc-300">{value || '---'}</p>
    </div>
);

export default AdminView;
