import React, { useState } from 'react';

interface FAQItem {
    question: string;
    answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
    {
        question: "¿Qué incluye mi inscripción?",
        answer: "Tu inscripción incluye el derecho a competir, placa oficial, hidratación durante el evento, acceso a la zona de calentamiento y fotografía profesional."
    },
    {
        question: "¿Pueden asistir espectadores?",
        answer: "Sí, la entrada para espectadores tiene un costo mínimo que se anunciará cerca a la fecha. El aforo es limitado para garantizar la seguridad de los atletas."
    },
    {
        question: "¿Hay estacionamiento disponible?",
        answer: "El Box Coach Pipe Rubio cuenta con espacios limitados. Recomendamos usar transporte público o llegar con tiempo para parquear en zonas aledañas seguras."
    },
    {
        question: "¿Cómo se definen los heats?",
        answer: "Los horarios de competencia (Heats) se publicarán 48 horas antes del evento en nuestra cuenta de Instagram @dareleague2025 y se enviarán por correo electrónico."
    },
    {
        question: "¿Qué pasa si me lesiono antes del evento?",
        answer: "Según nuestras políticas, la inscripción no es reembolsable. Sin embargo, puedes transferir tu cupo a otro atleta de la misma categoría hasta 15 días antes del evento previa notificación."
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
