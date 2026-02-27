import React, { useState, useEffect } from 'react';
import { EVENT_START_DATE, PRICING_TIERS, REGISTRATION_OPEN_DATE } from '../constants';

const Countdown: React.FC = () => {
  const [targetDate, setTargetDate] = useState<Date>(EVENT_START_DATE);
  const [label, setLabel] = useState<string>('');
  
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  // Function to calculate which target date to show
  const calculateTarget = () => {
    const now = new Date();
    
    // 1. If before registration opens
    if (now < REGISTRATION_OPEN_DATE) {
      return { date: REGISTRATION_OPEN_DATE, text: 'Apertura de Inscripciones' };
    }

    // 2. Find current active pricing stage and target its end date
    const currentTier = PRICING_TIERS.find(tier => 
      tier.endDate && now >= tier.startDate && now <= tier.endDate
    );

    if (currentTier && currentTier.endDate) {
      return { date: currentTier.endDate, text: 'Cambio de Precio' };
    }

    // 3. Fallback to event start
    return { date: EVENT_START_DATE, text: 'Inicio del Evento' };
  };

  useEffect(() => {
    // Determine Target Date initially and periodically
    const updateTargetDate = () => {
      const { date, text } = calculateTarget();
      setTargetDate(date);
      setLabel(text);
    };

    updateTargetDate();
    
    // Re-check every minute to switch targets automatically (e.g., from Open Date to Stage 1 End)
    const interval = setInterval(updateTargetDate, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference <= 0) {
        // If expired, return all zeros
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isExpired: false
      };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.isExpired && label !== 'Inicio del Evento') {
    // If a stage just expired but logic hasn't swapped yet, or we want to hide it momentarily
    return null; 
  }

  const TimeBox = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center justify-center bg-black/80 border border-zinc-800 p-4 md:p-6 min-w-[80px] md:min-w-[120px]">
      <span className="font-display text-4xl md:text-7xl text-white tracking-tighter leading-none">
        {value < 10 ? `0${value}` : value}
      </span>
      <span className="text-[10px] md:text-xs font-black text-primary uppercase tracking-[0.3em] mt-2">
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-4">
      {label && <p className="text-primary text-xs font-black uppercase tracking-[0.3em] animate-pulse">{label}</p>}
      <div className="flex gap-2 md:gap-4 justify-center items-center max-w-4xl mx-auto px-4">
        <TimeBox value={timeLeft.days} label="Días" />
        <TimeBox value={timeLeft.hours} label="Horas" />
        <div className="flex flex-col items-center justify-center bg-primary p-4 md:p-6 min-w-[80px] md:min-w-[120px] shadow-[0_0_30px_rgba(239,53,61,0.4)]">
          <span className="font-display text-4xl md:text-7xl text-black tracking-tighter leading-none">
            {timeLeft.minutes < 10 ? `0${timeLeft.minutes}` : timeLeft.minutes}
          </span>
          <span className="text-[10px] md:text-xs font-black text-black uppercase tracking-[0.3em] mt-2">
            Min
          </span>
        </div>
        <TimeBox value={timeLeft.seconds} label="Seg" />
      </div>
    </div>
  );
};

export default Countdown;