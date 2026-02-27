import React, { useState } from 'react';

interface FAQItem {
    question: string;
    answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
    {
        question: "¿Qué incluye mi inscripción?",
        answer: "Acceso al bracket oficial, kit de competidor (placa numerada + shirt técnica), hidratación en zona de atletas, warm-up area exclusiva y registro fotográfico profesional. Las fotos se envían 72h post-evento. No incluye entrada para espectadores."
    },
    {
        question: "¿Pueden asistir espectadores?",
        answer: "Sí, pero el aforo es limitado para mantener el ambiente de competencia real. El costo de entrada se anuncia 2 semanas antes del evento. Esto no es un show, es un bracket de eliminatoria."
    },
    {
        question: "¿Hay estacionamiento disponible?",
        answer: "Espacios limitados en el Box. Llega con tiempo o usa transporte público. La competencia arranca puntual — heat perdido = descalificación automática."
    },
    {
        question: "¿Cómo se definen los heats?",
        answer: "El bracket y horarios se publican 48 horas antes en @dare_league2026 y por email. Estudia tu bracket. Conoce a tu rival. No hay cambios de horario una vez publicado."
    },
    {
        question: "¿Qué pasa si me lesiono antes del evento?",
        answer: "No hay reembolsos. Punto. Pero puedes transferir tu cupo a otro atleta de la misma categoría hasta 15 días antes del evento. Notifícanos por WhatsApp con los datos del nuevo competidor. Si no cumple los estándares, lo reubicamos."
    }
];

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-32 px-4 bg-zinc-950 border-t border-zinc-900 relative">
            <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none"></div>
            <div className="max-w-3xl mx-auto relative z-10">
                <h2 className="font-display text-5xl md:text-6xl uppercase mb-16 text-center text-white">Preguntas <span className="text-primary">Frecuentes</span></h2>

                <div className="space-y-4">
                    {FAQ_ITEMS.map((item, index) => (
                        <div
                            key={index}
                            className={`border transition-all duration-300 ${openIndex === index ? 'border-primary bg-zinc-900' : 'border-zinc-800 bg-black hover:border-zinc-700'}`}
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full text-left p-6 flex justify-between items-center group"
                            >
                                <span className={`font-display text-xl uppercase tracking-wide transition-colors ${openIndex === index ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                                    {item.question}
                                </span>
                                <span className={`material-symbols-outlined transition-transform duration-300 ${openIndex === index ? 'rotate-180 text-primary' : 'text-zinc-500'}`}>
                                    expand_more
                                </span>
                            </button>

                            <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
                            >
                                <div className="p-6 pt-0 text-zinc-400 font-body leading-relaxed border-t border-zinc-800/50">
                                    {item.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
