import React, { useState, useRef, useEffect } from 'react';
import { Category, Gender, RegistrationFormData, FormErrors } from '../types';
import { PRICING_TIERS } from '../constants';
import { supabase } from '../supabaseClient';

const RegistrationForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [currentPrice, setCurrentPrice] = useState<string>('');
  const [isFormEnabled, setIsFormEnabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registrationId, setRegistrationId] = useState<string>('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [showWaiver, setShowWaiver] = useState(false);
  const MAX_SLOTS = 32;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<RegistrationFormData>({
    fullName: '',
    documentId: '',
    age: '',
    phone: '',
    email: '',
    category: '',
    gender: '',
    shirtSize: '',
    gym: '',
    emergencyName: '',
    emergencyPhone: '',
    paymentMethod: 'Transferencia Bancaria',
    termsAccepted: false,
    paymentProof: null
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Fetch real-time counts from Supabase
  const fetchAvailability = async () => {
    const { data, error } = await supabase
      .from('registrations')
      .select('category, gender');

    if (error) {
      console.error('Error fetching availability:', error);
      return;
    }

    const counts: Record<string, number> = {};
    data.forEach(reg => {
      const key = `${reg.category}_${reg.gender}`.toUpperCase();
      counts[key] = (counts[key] || 0) + 1;
    });
    setCategoryCounts(counts);
  };

  // Determine current price and availability dynamically
  useEffect(() => {
    const updateFormState = () => {
      const now = new Date();
      const activeTier = PRICING_TIERS.find(tier => {
        if (!tier.endDate) return now >= tier.startDate;
        return now >= tier.startDate && now <= tier.endDate;
      });

      if (activeTier) {
        setCurrentPrice(activeTier.formattedPrice);
        setIsFormEnabled(true);
      } else {
        setIsFormEnabled(false); // Disable if no active stage
      }
    };

    updateFormState();
    fetchAvailability();

    // Check every minute
    const interval = setInterval(() => {
      updateFormState();
      fetchAvailability();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const validateStep = (currentStep: number): boolean => {
    const newErrors: FormErrors = {};

    if (currentStep === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = "Requerido";
      if (!formData.documentId.trim()) newErrors.documentId = "Requerido";
      if (!formData.age.trim()) newErrors.age = "Requerido";

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email.trim()) newErrors.email = "Requerido";
      else if (!emailRegex.test(formData.email)) newErrors.email = "Email inválido";

      const phoneRegex = /^[0-9]+$/;
      if (!formData.phone.trim()) newErrors.phone = "Requerido";
      else if (!phoneRegex.test(formData.phone)) newErrors.phone = "Solo números";
    }

    if (currentStep === 2) {
      if (!formData.category) newErrors.category = 'Selecciona una categoría';
      if (!formData.gender) newErrors.gender = 'Selecciona tu género';
      if (!formData.shirtSize) newErrors.shirtSize = 'Selecciona tu talla';
      if (!formData.gym.trim()) newErrors.gym = 'Ingresa tu gimnasio o "Independiente"';
      if (!formData.emergencyName.trim()) newErrors.emergencyName = 'Contacto de emergencia requerido';
      if (!formData.emergencyPhone.trim()) newErrors.emergencyPhone = "Requerido";

      // Quota check
      if (formData.category && formData.gender) {
        const key = `${formData.category}_${formData.gender}`.toUpperCase();
        const current = categoryCounts[key] || 0;
        if (current >= MAX_SLOTS) {
          newErrors.category = "Cupo agotado para esta selección";
        }
      }
    }

    if (currentStep === 3) {
      if (!formData.termsAccepted) newErrors.termsAccepted = "Debes aceptar los términos";
      if (!formData.paymentProof) newErrors.paymentProof = "Comprobante requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
      window.scrollTo({ top: document.getElementById('register')?.offsetTop || 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
    window.scrollTo({ top: document.getElementById('register')?.offsetTop || 0, behavior: 'smooth' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs[name];
        return newErrs;
      });
    }
  };

  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedText(text);
        setTimeout(() => setCopiedText(null), 2000);
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    } else {
      // Fallback for non-secure contexts
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedText(text);
        setTimeout(() => setCopiedText(null), 2000);
      } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, termsAccepted: e.target.checked }));
    if (errors.termsAccepted) {
      setErrors(prev => ({ ...prev, termsAccepted: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate Type
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, paymentProof: "Solo JPG, PNG o PDF" }));
        return;
      }
      // Validate Size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, paymentProof: "Máximo 5MB" }));
        return;
      }

      setFormData(prev => ({ ...prev, paymentProof: file }));
      setErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs.paymentProof;
        return newErrs;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Final Quota Check
      const { data: countData, error: countError } = await supabase
        .from('registrations')
        .select('id')
        .eq('category', formData.category)
        .eq('gender', formData.gender);

      if (countError) throw new Error("Error verificando disponibilidad.");
      if (countData && countData.length >= MAX_SLOTS) {
        throw new Error("Lo sentimos, el cupo para esta categoría se acaba de agotar.");
      }

      const generatedId = `DL-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      // 1. Upload File to Supabase Storage
      const file = formData.paymentProof!;
      const fileExt = file.name.split('.').pop();
      const fileName = `${generatedId}.${fileExt}`;
      const categorySlug = `${formData.category}-${formData.gender}`.toLowerCase().replace(/[^a-z0-9-]/g, "");
      const filePath = `${categorySlug}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(filePath, file);

      if (uploadError) throw new Error(`Error al subir comprobante: ${uploadError.message}`);

      // 2. Insert Data to Supabase Database
      const { error: insertError } = await supabase
        .from('registrations')
        .insert([{
          registration_id: generatedId,
          full_name: formData.fullName,
          document_id: formData.documentId,
          age: parseInt(formData.age),
          phone: formData.phone,
          email: formData.email,
          category: formData.category,
          gender: formData.gender,
          gym: formData.gym.trim(),
          shirt_size: formData.shirtSize,
          emergency_name: formData.emergencyName.trim(),
          emergency_phone: formData.emergencyPhone,
          payment_method: formData.paymentMethod,
          payment_proof_path: uploadData.path
        }]);

      if (insertError) throw new Error(`Error al registrar datos: ${insertError.message}`);

      // Success
      setRegistrationId(generatedId);
      setIsSuccess(true);
      window.scrollTo({ top: document.getElementById('register')?.offsetTop || 0, behavior: 'smooth' });

    } catch (err: any) {
      console.error('Registration error:', err);
      setSubmitError(err.message || 'Error inesperado al procesar el registro.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-zinc-950 border border-primary/50 p-12 text-center shadow-[0_0_50px_rgba(239,53,61,0.2)]">
        <span className="material-symbols-outlined text-8xl text-zinc-500 mb-6">hourglass_top</span>
        <h3 className="font-display text-5xl text-white uppercase mb-4">Inscripción Recibida</h3>
        <div className="bg-zinc-900 p-6 mb-8 max-w-md mx-auto">
          <p className="font-body text-zinc-300 text-lg mb-4">
            Tu cupo <strong className="text-primary">NO está confirmado</strong> hasta que validemos tu pago.
          </p>
          <div className="flex justify-between border-b border-zinc-700 pb-2 mb-2">
            <span className="text-xs uppercase text-zinc-500">Estado</span>
            <span className="text-xs uppercase font-bold text-yellow-500">Pendiente de Validación</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs uppercase text-zinc-500">ID Referencia</span>
            <span className="text-xs uppercase font-bold text-white">#{registrationId}</span>
          </div>
        </div>
        <button
          onClick={() => {
            setIsSuccess(false);
            setStep(1);
            setFormData({
              fullName: '',
              documentId: '',
              age: '',
              phone: '',
              email: '',
              category: '',
              gender: '',
              gym: '',
              emergencyName: '',
              emergencyPhone: '',
              paymentMethod: 'Transferencia Bancaria',
              termsAccepted: false,
              paymentProof: null
            });
            setRegistrationId('');
          }}
          className="text-primary text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
        >
          Nueva Inscripción
        </button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 border border-zinc-900 shadow-2xl relative overflow-hidden">
      {!isFormEnabled && (
        <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm">
          <h3 className="font-display text-4xl text-white uppercase tracking-tighter">Inscripciones Cerradas</h3>
        </div>
      )}

      {/* Progress Bar */}
      <div className="flex bg-black">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex-1 h-2 relative">
            <div className={`absolute inset-0 transition-all duration-500 ${step >= s ? 'bg-primary' : 'bg-zinc-900'}`}></div>
          </div>
        ))}
      </div>

      <div className="p-8 md:p-12">
        <div className="flex justify-between items-center mb-12">
          <div>
            <span className="text-primary font-display text-xs tracking-widest uppercase">Paso 0{step} / 03</span>
            <h3 className="text-white font-display text-3xl uppercase tracking-tighter">
              {step === 1 && "Datos Personales"}
              {step === 2 && "Datos de Competencia"}
              {step === 3 && "Pago y Registro"}
            </h3>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-zinc-600 text-[10px] uppercase font-black tracking-widest">Estado Sistema</p>
            <p className="text-white font-display text-xl">LIVE</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          {step === 1 && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid md:grid-cols-2 gap-8">
                <InputGroup label="Nombre Completo" error={errors.fullName}>
                  <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="NOMBRE COMPLETO" className="w-full bg-black border-0 border-b border-zinc-800 p-4 text-white placeholder-zinc-800 focus:ring-0 focus:border-primary transition-all font-display uppercase text-lg" type="text" />
                </InputGroup>
                <InputGroup label="Documento ID" error={errors.documentId}>
                  <input name="documentId" value={formData.documentId} onChange={handleChange} placeholder="CÉDULA" className="w-full bg-black border-0 border-b border-zinc-800 p-4 text-white placeholder-zinc-800 focus:ring-0 focus:border-primary transition-all font-body text-lg" type="text" />
                </InputGroup>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <InputGroup label="Edad" error={errors.age}>
                  <input name="age" value={formData.age} onChange={handleChange} placeholder="EDAD" className="w-full bg-black border-0 border-b border-zinc-800 p-4 text-white placeholder-zinc-800 focus:ring-0 focus:border-primary transition-all font-body" type="number" />
                </InputGroup>
                <InputGroup label="WhatsApp" error={errors.phone}>
                  <input name="phone" value={formData.phone} onChange={handleChange} placeholder="CELULAR" className="w-full bg-black border-0 border-b border-zinc-800 p-4 text-white placeholder-zinc-800 focus:ring-0 focus:border-primary transition-all font-body" type="tel" />
                </InputGroup>

                <InputGroup label="Talla de Camisa" error={errors.shirtSize}>
                  <select
                    name="shirtSize"
                    value={formData.shirtSize}
                    onChange={handleChange}
                    className={`w-full bg-black border ${errors.shirtSize ? 'border-primary' : 'border-zinc-800'} p-3 text-white focus:border-primary outline-none appearance-none`}
                  >
                    <option value="">SELECCIONAR TALLA</option>
                    <option value="S">S - SMALL</option>
                    <option value="M">M - MEDIUM</option>
                    <option value="L">L - LARGE</option>
                    <option value="XL">XL - EXTRA LARGE</option>
                  </select>
                </InputGroup>

                <InputGroup label="Email" error={errors.email}>
                  <input name="email" value={formData.email} onChange={handleChange} placeholder="CORREO" className="w-full bg-black border-0 border-b border-zinc-800 p-4 text-white placeholder-zinc-800 focus:ring-0 focus:border-primary transition-all font-body" type="email" />
                </InputGroup>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid md:grid-cols-2 gap-8">
                <InputGroup label="Categoría" error={errors.category}>
                  <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-black border-0 border-b border-zinc-800 p-4 text-white focus:ring-0 focus:border-primary transition-all font-display uppercase">
                    <option value="">SELECCIONAR</option>
                    {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </InputGroup>
                <InputGroup label="Género" error={errors.gender}>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-black border-0 border-b border-zinc-800 p-4 text-white focus:ring-0 focus:border-primary transition-all font-display uppercase">
                    <option value="">SELECCIONAR</option>
                    {Object.values(Gender).map(g => {
                      const key = `${formData.category}_${g}`.toUpperCase();
                      const count = categoryCounts[key] || 0;
                      const isFull = count >= MAX_SLOTS;
                      const isLow = count >= (MAX_SLOTS - 5) && !isFull;
                      return (
                        <option key={g} value={g} disabled={isFull}>
                          {g} {formData.category ? `(${count}/${MAX_SLOTS})` : ''} {isFull ? '- AGOTADO' : isLow ? '- ¡ÚLTIMOS CUPOS!' : ''}
                        </option>
                      );
                    })}
                  </select>
                </InputGroup>
              </div>
              <InputGroup label="Box / Gimnasio" error={errors.gym}>
                <input name="gym" value={formData.gym} onChange={handleChange} placeholder="NOMBRE DEL BOX O INDEPENDIENTE" className="w-full bg-black border-0 border-b border-zinc-800 p-4 text-white placeholder-zinc-800 focus:ring-0 focus:border-primary transition-all font-display uppercase" type="text" />
              </InputGroup>
              <div className="grid md:grid-cols-2 gap-8">
                <InputGroup label="Nombre Contacto Emergencia" error={errors.emergencyName}>
                  <input name="emergencyName" value={formData.emergencyName} onChange={handleChange} placeholder="NOMBRE CONTACTO" className="w-full bg-black border-0 border-b border-zinc-800 p-4 text-white placeholder-zinc-800 focus:ring-0 focus:border-primary transition-all font-body" type="text" />
                </InputGroup>
                <InputGroup label="Tel Contacto Emergencia" error={errors.emergencyPhone}>
                  <input name="emergencyPhone" value={formData.emergencyPhone} onChange={handleChange} placeholder="TEL CONTACTO" className="w-full bg-black border-0 border-b border-zinc-800 p-4 text-white placeholder-zinc-800 focus:ring-0 focus:border-primary transition-all font-body" type="tel" />
                </InputGroup>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-12 animate-fade-in">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-zinc-900/50 border-l-4 border-[#9d69ff] p-6 hover:bg-zinc-900 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <img src="Nu.png" alt="Nu" className="w-8 h-8 object-contain" />
                    <h6 className="font-display text-white uppercase italic">Nu Bank</h6>
                  </div>
                  <div className="space-y-4">
                    <div onClick={() => copyToClipboard('53350851')} className="flex justify-between items-center cursor-pointer group/copy relative pb-4 border-b border-zinc-900/50 last:border-0">
                      <span className="text-[10px] text-zinc-500 uppercase font-black italic">Ahorros</span>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-body tracking-widest group-hover/copy:text-primary transition-colors">53350851</span>
                          <span className="material-symbols-outlined text-[14px] text-zinc-600 group-hover/copy:text-primary transition-colors">content_copy</span>
                        </div>
                        <span className="text-[7px] text-primary font-black uppercase tracking-[0.2em] opacity-100 md:opacity-0 md:group-hover/copy:opacity-100 transition-opacity absolute bottom-0 right-0">Toca para copiar</span>
                      </div>
                    </div>
                    <div onClick={() => copyToClipboard('@WRV034')} className="flex justify-between items-center cursor-pointer group/copy relative pb-4 border-b border-zinc-900/50 last:border-0">
                      <span className="text-[10px] text-zinc-500 uppercase font-black italic">Llave Nu</span>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-body tracking-widest group-hover/copy:text-primary transition-colors">@WRV034</span>
                          <span className="material-symbols-outlined text-[14px] text-zinc-600 group-hover/copy:text-primary transition-colors">content_copy</span>
                        </div>
                        <span className="text-[7px] text-primary font-black uppercase tracking-[0.2em] opacity-100 md:opacity-0 md:group-hover/copy:opacity-100 transition-opacity absolute bottom-0 right-0">Toca para copiar</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900/50 border-l-4 border-white p-6 hover:bg-zinc-900 transition-colors relative group">
                  <div className="flex items-center gap-3 mb-4">
                    <img src="nequi.png" alt="Nequi" className="w-8 h-8 object-contain" />
                    <h6 className="font-display text-white uppercase italic">Nequi</h6>
                  </div>
                  <div onClick={() => copyToClipboard('3136336446')} className="flex justify-between items-center cursor-pointer group/copy mb-2 relative pb-4">
                    <span className="text-[10px] text-zinc-500 uppercase font-black italic">Celular</span>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-body tracking-widest group-hover/copy:text-primary transition-colors">313 633 6446</span>
                        <span className="material-symbols-outlined text-[14px] text-zinc-600 group-hover/copy:text-primary transition-colors">content_copy</span>
                      </div>
                      <span className="text-[7px] text-primary font-black uppercase tracking-[0.2em] opacity-100 md:opacity-0 md:group-hover/copy:opacity-100 transition-opacity absolute bottom-0 right-0">Toca para copiar</span>
                    </div>
                  </div>
                  <div className="text-[9px] text-zinc-600 uppercase font-bold tracking-[0.2em] text-center bg-black/50 py-1">Titular: William Reyes V.</div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-12">
                <div className="space-y-6 text-center">
                  <div className="bg-white p-3 rounded shadow-2xl relative group/qr transform -rotate-1 hover:rotate-0 transition-transform max-w-[200px] mx-auto">
                    <img src="qr nequi.jpeg" alt="QR Nequi" className="w-full h-auto" />
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/qr:opacity-100 transition-opacity flex items-center justify-center p-4">
                      <span className="bg-black text-white text-[10px] font-black uppercase px-4 py-2 text-center leading-tight">Escanea desde tu <br /> app nequi</span>
                    </div>
                  </div>
                  <div className="bg-primary/5 border border-primary/20 p-6">
                    <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mb-1 leading-none">Total Inscripción</p>
                    <p className="text-white font-display text-4xl tracking-tighter">{currentPrice}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <InputGroup label="Adjuntar Comprobante" error={errors.paymentProof}>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`h-48 bg-black border-2 border-dashed ${errors.paymentProof ? 'border-primary' : 'border-zinc-800 hover:border-zinc-600'} flex flex-col items-center justify-center cursor-pointer transition-all group`}
                    >
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".jpg,.jpeg,.png,.pdf" />
                      <span className="material-symbols-outlined text-4xl text-zinc-700 group-hover:text-primary transition-colors mb-2">cloud_upload</span>
                      <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest text-center px-4 leading-relaxed">
                        {formData.paymentProof ? formData.paymentProof.name : "Subir comprobante (PNG, JPG o PDF)"}
                      </p>
                    </div>
                  </InputGroup>
                  <div className="flex items-center gap-4 p-3 bg-zinc-900/30 border border-zinc-800 hover:border-zinc-700 transition-colors">
                    <input
                      type="checkbox"
                      disabled={!formData.termsAccepted}
                      checked={formData.termsAccepted}
                      readOnly
                      className="form-checkbox h-5 w-5 text-primary bg-black border-zinc-700 focus:ring-0 focus:ring-offset-0 disabled:opacity-50"
                    />
                    <div className="flex-1">
                      <p className={`text-[10px] uppercase font-black tracking-widest leading-tight ${errors.termsAccepted ? 'text-primary' : 'text-zinc-500'}`}>
                        He leído y acepto el <button type="button" onClick={() => setShowWaiver(true)} className="text-white hover:text-primary underline decoration-primary underline-offset-4 transition-colors">Deslinde de Responsabilidad</button>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {submitError && (
                <div className="p-4 bg-primary/10 border border-primary text-primary text-[10px] font-black uppercase text-center animate-pulse tracking-widest">
                  {submitError}
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-12 pt-8 border-t border-zinc-900 flex justify-between gap-6">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-display uppercase tracking-widest py-5 px-8 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm text-primary">arrow_back</span> Atrás
              </button>
            ) : (
              <div></div>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="bg-primary hover:bg-white hover:text-black text-white font-display uppercase tracking-widest py-5 px-12 transition-all flex-grow md:flex-grow-0 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,53,61,0.2)]"
              >
                Continuar <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className={`
                  bg-primary text-white font-display uppercase tracking-widest py-5 px-12 transition-all flex-grow md:flex-grow-0 flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(239,53,61,0.3)]
                  ${isSubmitting ? 'opacity-50 cursor-wait' : 'hover:bg-white hover:text-black'}
                `}
              >
                {isSubmitting ? 'Procesando...' : 'Finalizar Registro'}
                {!isSubmitting && <span className="material-symbols-outlined text-sm">send</span>}
              </button>
            )}
          </div>
        </form>

        {/* Support Link */}
        <div className="mt-8 text-center pt-8 border-t border-zinc-900/50">
          <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest mb-3">¿Tienes dudas con tu inscripción?</p>
          <a
            href="https://wa.me/573136336446?text=Hola!%20Tengo%20una%20duda%20sobre%20la%20inscripción%20a%20Dare%20League"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <span className="material-symbols-outlined text-sm">chat</span> Hablar con Soporte WhatsApp
          </a>
        </div>
      </div>

      {/* Waiver Modal */}
      {showWaiver && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-900 w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-zinc-900 flex justify-between items-center">
              <h3 className="font-display text-2xl uppercase text-white">Deslinde de <span className="text-primary italic">Responsabilidad</span></h3>
              <button onClick={() => setShowWaiver(false)} className="text-zinc-500 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-8 overflow-y-auto flex-1 font-body text-zinc-400 text-sm leading-relaxed space-y-4">
              <p className="font-bold text-white uppercase tracking-widest">DARE LEAGUE 2026 - ACUERDO DE PARTICIPACIÓN</p>
              <p>
                Yo, al inscribirme en este evento, reconozco voluntariamente que la participación en DARE LEAGUE implica actividad física extenuante y conlleva riesgos inherentes de lesiones físicas, incluyendo pero no limitado a: paros cardíacos, esguinces, fracturas, y en casos extremos, la muerte.
              </p>
              <p>
                Declaro que estoy en buenas condiciones físicas y mentales para participar en este evento y que no tengo ninguna condición médica que me impida hacerlo de manera segura.
              </p>
              <p>
                Asumo total responsabilidad por cualquier lesión o daño que pueda sufrir durante el evento. Libero de toda responsabilidad a los organizadores, patrocinadores, voluntarios y dueños del recinto (Box Coach Pipe Rubio) por cualquier reclamo, demanda o acción legal que pueda surgir de mi participación.
              </p>
              <p>
                Entiendo y acepto que el valor de la inscripción <strong>NO ES REEMBOLSABLE</strong> bajo ninguna circunstancia, incluyendo lesiones previas al evento o descalificación por no cumplir los estándares.
              </p>
              <p>
                Autorizo el uso de mi imagen (fotografías y video) capturada durante el evento para fines promocionales de DARE LEAGUE sin compensación alguna.
              </p>
            </div>
            <div className="p-6 border-t border-zinc-900 bg-zinc-900/30">
              <button
                onClick={() => {
                  setFormData(prev => ({ ...prev, termsAccepted: true }));
                  setShowWaiver(false);
                  if (errors.termsAccepted) setErrors(prev => ({ ...prev, termsAccepted: '' }));
                }}
                className="w-full bg-primary hover:bg-white hover:text-black text-white font-display uppercase tracking-widest py-4 transition-all shadow-lg"
              >
                He leído y acepto los términos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification for Clipboard */}
      {copiedText && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-primary text-black font-display text-[10px] uppercase font-black px-6 py-3 tracking-widest animate-fade-in-up z-[100] shadow-2xl">
          Copiado al portapapeles
        </div>
      )}
    </div>
  );
};

const InputGroup = ({ label, children, error }: { label: string, children?: React.ReactNode, error?: string }) => (
  <div className="space-y-2">
    <div className="flex justify-between">
      <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">{label}</label>
      {error && <span className="text-[10px] font-bold text-primary uppercase animate-pulse">{error}</span>}
    </div>
    {children}
  </div>
);

export default RegistrationForm;