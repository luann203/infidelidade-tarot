import React, { useState, useEffect, useRef } from 'react';
import { calculateNumerology } from './utils/numerology';
import type { FormData, NumerologyResult } from './types';

const Screen = {
  LANDING: 'LANDING',
  SCANNING: 'SCANNING',
  RESULTS: 'RESULTS',
  CHECKOUT: 'CHECKOUT',
  THANKS: 'THANKS',
  THANKS_TR: 'THANKS_TR',
  READING: 'READING',
} as const;

type ScreenType = (typeof Screen)[keyof typeof Screen];

const PERGUNTA_OPTIONS = [
  { value: 'cheating', label: 'Is he cheating on me?' },
  { value: 'other-person', label: 'Does he have someone else?' },
  { value: 'love', label: 'Does he truly love me?' },
  { value: 'stay', label: 'Should I stay with him?' },
  { value: 'leave', label: 'Is he going to leave me?' },
] as const;

/** URL do vídeo da taróloga ao vivo (loop). Arquivo em public/movie.mp4 */
const VIDEO_TAROT_URL = '/movie.mp4';

/** URL do checkout Kiwify */
const CHECKOUT_URL = 'https://pay.kiwify.com/lt0poUB';

function buildCheckoutUrlWithUtms(base: string): string {
  try {
    const currentParams = new URLSearchParams(window.location.search);
    const utmParams = new URLSearchParams();
    currentParams.forEach((value, key) => {
      if (key.toLowerCase().startsWith('utm_')) {
        utmParams.set(key, value);
      }
    });
    const utmString = utmParams.toString();
    if (!utmString) return base;
    return `${base}&${utmString}`;
  } catch {
    return base;
  }
}

const TESTIMONIALS = [
  {
    name: 'Emily S.',
    age: 34,
    text: 'The numerology showed a 71% risk. I did the tarot reading and Selena saw a brunette woman around him. It was true.',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    name: 'Rachel P.',
    age: 29,
    text: 'The numbers were accurate, but the tarot revealed DETAILS that left me speechless. Worth every cent.',
    avatar: 'https://i.pravatar.cc/150?img=5',
  },
  {
    name: 'Julia M.',
    age: 41,
    text: 'My risk was 68%. The tarot showed exactly when and how. I was able to prepare myself.',
    avatar: 'https://i.pravatar.cc/150?img=9',
  },
  {
    name: 'Camille F.',
    age: 36,
    text: 'I had suspected for months. The analysis showed 82% and confirmed everything I felt. I cried, but I needed to know.',
    avatar: 'https://i.pravatar.cc/150?img=16',
  },
  {
    name: 'Lauren R.',
    age: 32,
    text: 'The result was low risk and brought me peace. Sometimes we create stories in our head. Highly recommend.',
    avatar: 'https://i.pravatar.cc/150?img=20',
  },
  {
    name: 'Ashley B.',
    age: 27,
    text: 'I did it out of curiosity and was impressed by the accuracy. The numbers really reveal hidden things.',
    avatar: 'https://i.pravatar.cc/150?img=23',
  },
  {
    name: 'Vanessa T.',
    age: 44,
    text: 'After 15 years of marriage, the numbers showed what I was denying. The tarot reading completed everything.',
    avatar: 'https://i.pravatar.cc/150?img=25',
  },
  {
    name: 'Brittany C.',
    age: 31,
    text: 'A friend recommended it. It showed 74% risk and a week later I found messages on his phone.',
    avatar: 'https://i.pravatar.cc/150?img=32',
  },
];

const BASE_CHAT_MESSAGES = [
  { name: 'Amanda', text: 'You guys, the reading she did for me last week... I found out EVERYTHING' },
  { name: 'Carla', text: 'Anyone else here doing their second reading?' },
  { name: 'Julia', text: 'Is Selena on?' },
  { name: 'Mariana', text: 'How long is the wait today?' },
  { name: 'Bianca', text: 'Mine came in 8 hours, it was quick' },
  { name: 'Luana', text: 'Just checking if there are still spots available' },
  { name: 'Priscila', text: 'She mentioned that name I suspected... it was EXACTLY right' },
  { name: 'Renata', text: 'I confronted him yesterday. Everything she said was true.' },
  { name: 'Talita', text: 'Has anyone here done the past lives reading?' },
  { name: 'Fernanda', text: 'I\'m on my third reading with her already' },
  { name: 'Camila', text: 'Best tarot reader I\'ve ever consulted, seriously' },
  { name: 'Isabela', text: 'The accuracy is terrifying' },
  { name: 'Patricia', text: 'She described his "friend" in the smallest details' },
  { name: 'Sophie', text: "What's the queue like today?" },
  { name: 'Nina', text: 'I really need an urgent reading' },
  { name: 'Rachel', text: 'My sister did it and found out in 3 days' },
  { name: 'Diana', text: 'Can I do a reading about the same person again?' },
  { name: 'Erica', text: 'I broke up with him after the reading. Best decision.' },
  { name: 'Helen', text: 'Her cards never miss' },
  { name: 'Alice', text: 'Does anyone know if she works on weekends?' },
  { name: 'Sabrina', text: "He's acting weird again... I need another reading" },
  { name: 'Vanessa', text: 'The Tower card she pulled for me... EVERYTHING happened' },
  { name: 'Tanya', text: "You guys, I'm shaking here waiting" },
  { name: 'Megan', text: 'First time in the group, Amanda referred me' },
  { name: 'Bruna', text: 'How long until I receive it by email?' },
  { name: 'Olivia', text: 'She even saw the COLOR of the other woman\'s car' },
  { name: 'Kathy', text: 'I found out he had a secret Instagram, just like she said' },
  { name: 'Nicole', text: 'Has anyone done a reading to decide whether to go back or not?' },
  { name: 'Laura', text: 'How much is the complete reading again?' },
  { name: 'Bianca', text: "I'm addicted to her readings" },
  { name: 'Claire', text: "He confessed after I followed the cards' advice" },
  { name: 'Ivy', text: 'This woman changed my life' },
  { name: 'Paula', text: 'I need to know if he\'s going to leave the other one' },
  { name: 'Nora', text: 'Selena has saved my sanity so many times' },
  { name: 'Lily', text: 'Are there a lot of people waiting?' },
  { name: 'Jess', text: "I did it yesterday, haven't received it yet" },
  { name: 'Rose', text: 'Is it normal to take 12 hours?' },
  { name: 'Gabby', text: 'She told me to wait 15 days. I\'m going to wait.' },
  { name: 'Samantha', text: 'The dates she gives are very accurate' },
  { name: 'Chloe', text: 'I thought I was being paranoid... the cards confirmed everything' },
  { name: 'Mila', text: 'Anyone else with their heart racing here?' },
  { name: 'Tessa', text: 'My therapist gave me a solid recommendation' },
  { name: 'Erin', text: "I'm here again you guys" },
  { name: 'Joana', text: 'How many people does she see per day?' },
  { name: 'Caroline', text: "Those who've done the complete reading, is it worth it?" },
  { name: 'Bea', text: 'THANK YOU SO MUCH SELENE ❤️' },
  { name: 'Iris', text: "He's traveling... I need to know if it's true" },
  { name: 'Monica', text: 'Her reading gave me the courage to act' },
  { name: 'Flavia', text: 'I did it for my mom too, she loved it' },
  { name: 'Grace', text: 'Wonderful group, everyone here helps each other' },
] as const;

// ============ Decorative SVGs ============

const STAR_SEEDS = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  left: ((i * 73 + 17) % 97),
  top: ((i * 47 + 11) % 95),
  size: 1.5 + (i % 4) * 1,
  delay: (i * 0.5) % 5,
  duration: 1.8 + (i % 5) * 0.9,
  bright: i % 4 === 0,
}));

const TwinklingStars = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    {STAR_SEEDS.map((s) => (
      <div
        key={s.id}
        className="absolute rounded-full"
        style={{
          left: `${s.left}%`,
          top: `${s.top}%`,
          width: s.size,
          height: s.size,
          background: s.bright ? '#E0D4FF' : 'rgba(180,160,255,0.7)',
          animation: `${s.bright ? 'twinkle' : 'twinkleSoft'} ${s.duration}s ease-in-out ${s.delay}s infinite`,
          boxShadow: s.bright ? '0 0 8px 2px rgba(196,181,253,0.7)' : '0 0 3px 1px rgba(155,135,245,0.3)',
        }}
      />
    ))}
  </div>
);

const StarField = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(12)].map((_, i) => (
      <div
        key={i}
        className="absolute w-1 h-1 rounded-full bg-purple-soft/30"
        style={{
          left: `${8 + (i * 37) % 90}%`,
          top: `${5 + (i * 23) % 85}%`,
          animationDelay: `${i * 0.3}s`,
          opacity: 0.2 + (i % 3) * 0.15,
        }}
      />
    ))}
  </div>
);

// ============ App ============

const DEV_MOCK_RESULT: NumerologyResult = {
  yourDestinyNumber: 4,
  partnerDestinyNumber: 8,
  yourSoulNumber: 6,
  partnerSoulNumber: 3,
  yourPersonalityNumber: 7,
  partnerPersonalityNumber: 5,
  compatibilityPercentage: 42,
  personalCycle: 5,
  infidelityProbability: 87,
  fidelityNumber: 2,
};

function buildReadingText(yourFirst: string, partnerFirst: string): string {
  const you = yourFirst || 'Sarah';
  const him = partnerFirst || 'João';

  return [
    `${you}, I pulled your cards and... the energy here is VERY heavy.`,
    ``,
    `I see the Two of Cups Reversed, Seven of Swords and The Tower.`,
    ``,
    `In the last 3–4 months, ${him} has completely changed with you. You FEEL it, right? He’s different. Colder. More distant.`,
    ``,
    `The cards confirm what you already knew deep down.`,
    ``,
    `${you}... I need to tell you something delicate.`,
    ``,
    `I see a very strong FEMALE ENERGY around him.`,
    ``,
    `It’s not just anyone. It’s someone he SEES REGULARLY. Work, gym, some place he goes to every week.`,
    ``,
    `The energy shows details:`,
    ``,
    `BRUNETTE. Hair to the shoulders or longer. Younger than you – maybe 5 or 6 years.`,
    ``,
    `She’s the kind of woman who draws a lot of attention when she walks into a place. Looser and more outgoing than you.`,
    ``,
    `She MAKES HIM FEEL SPECIAL, you know?`,
    ``,
    `She admires him. Compliments him. Makes him feel things he no longer feels at home with you.`,
    ``,
    `The conversations started as “just friends”. But they evolved. Now there is EMOTIONAL INTIMACY.`,
    ``,
    `He tells her things. He vents. He laughs with her in a way he doesn’t laugh with you anymore.`,
    ``,
    `${you}, the cards are very clear: HE KNOWS this is wrong.`,
    ``,
    `That’s why the phone is always face down.`,
    `That’s why he deletes conversations.`,
    `That’s why he makes up excuses to go out.`,
    ``,
    `He KNOWS.`,
    ``,
    `And look... the cards revealed MUCH more here. NAME. INITIAL. Specific places. Times. But those are details I’ll only share with you in the full reading, with more time.`,
    ``,
    `His phone… it IS locked with a password, right? I see a very well-guarded secret there.`,
    ``,
    `And this last card, The Tower...`,
    ``,
    `${you}, it’s showing me something that will happen in the NEXT FEW DAYS.`,
    ``,
    `Something important.`,
    ``,
    `Stay alert.`,
  ].join('\n');
}

function getInitialScreen(): ScreenType {
  const path = window.location.pathname;
  if (path === '/result') return Screen.RESULTS;
  if (path === '/thanks-tr') return Screen.THANKS_TR;
  if (path === '/pagina2') return Screen.SCANNING;
  if (path === '/pagina3') return Screen.READING;

  const params = new URLSearchParams(window.location.search);
  const screenParam = (params.get('screen') || params.get('page') || '').toLowerCase();

  if (screenParam === 'result') return Screen.RESULTS;
  if (screenParam === 'thanks-tr' || screenParam === 'thanks_tr') return Screen.THANKS_TR;
   if (screenParam === 'reading') return Screen.READING;

  return Screen.LANDING;
}

const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenType>(getInitialScreen);

  const isDevResult = window.location.pathname === '/result';
  const [yourName, setYourName] = useState(isDevResult ? 'Mary Smith' : '');
  const [yourBirthdate, setYourBirthdate] = useState(isDevResult ? '1991-06-15' : '');
  const [partnerName, setPartnerName] = useState(isDevResult ? 'John Peter' : '');
  const [partnerBirthdate, setPartnerBirthdate] = useState(isDevResult ? '1989-03-22' : '');
  const [relationshipDuration, setRelationshipDuration] = useState(isDevResult ? '3-to-5' : '');
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState(2);

  // Tela 1 - Leitura ao vivo
  const [mainQuestion, setMainQuestion] = useState<string>('');
  const [partnerCity, setPartnerCity] = useState<string>('');

  const [scanProgress, setScanProgress] = useState(0);
  const [audienceCount, setAudienceCount] = useState(48);

  const [result, setResult] = useState<NumerologyResult | null>(isDevResult ? DEV_MOCK_RESULT : null);
  const [gaugeAnimated, setGaugeAnimated] = useState(0);
  const gaugeRef = useRef(0);
  const [chatLog, setChatLog] = useState<{ name: string; text: string }[]>([]);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [readingTyped, setReadingTyped] = useState('');
  const readingFullRef = useRef('');
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showOfferBlocks, setShowOfferBlocks] = useState(false);
  const [showSelectedMessage, setShowSelectedMessage] = useState(false);

  // Scanning
  useEffect(() => {
    if (screen !== Screen.SCANNING) return;
    // Reset sempre que entrar na tela de scanning
    setScanProgress(0);
    setShowSelectedMessage(false);
    setAudienceCount(48);

    const formData: FormData = {
      yourName,
      yourBirthdate,
      partnerName,
      partnerBirthdate,
      relationshipDuration: relationshipDuration as FormData['relationshipDuration'],
      email: '',
    };
    const res = calculateNumerology(formData);
    setResult(res);
  }, [screen, yourName, yourBirthdate, partnerName, partnerBirthdate, relationshipDuration]);

  // Barra de progresso começa a encher somente depois que a pergunta é selecionada
  useEffect(() => {
    if (screen !== Screen.SCANNING) return;
    if (!showSelectedMessage) return;

    setScanProgress(0);
    const start = Date.now();
    const dur = 28; // segundos para chegar em 100%

    const interval = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      if (elapsed >= dur) {
        setScanProgress(100);
        clearInterval(interval);
        // After finishing the "analysis", smoothly go to the reading page
        setTimeout(() => {
          setScreen(Screen.READING);
        }, 800);
      } else {
        setScanProgress(Math.min(100, Math.round((elapsed / dur) * 100)));
      }
    }, 100);

    return () => clearInterval(interval);
  }, [screen, showSelectedMessage]);

  // Alternates message "Selecting questions..." -> "Your question was selected"
  useEffect(() => {
    if (screen !== Screen.SCANNING) return;
    setShowSelectedMessage(false);
    const t = setTimeout(() => setShowSelectedMessage(true), 3000); // após ~3s
    return () => clearTimeout(t);
  }, [screen]);

  // Audience variation on screen 2
  useEffect(() => {
    if (screen !== Screen.SCANNING) return;
    const interval = setInterval(() => {
      setAudienceCount((prev) => {
        const delta = Math.random() < 0.5 ? -1 : 1;
        const next = prev + delta;
        return Math.min(60, Math.max(40, next));
      });
    }, 3500);
    return () => clearInterval(interval);
  }, [screen]);

  // Chat ao vivo na tela 2
  useEffect(() => {
    if (screen !== Screen.SCANNING) return;

    // inicia com algumas mensagens
    setChatLog((current) => {
      if (current.length > 0) return current;
      return BASE_CHAT_MESSAGES.slice(0, 6);
    });

    let index = 0;
    const interval = setInterval(() => {
      setChatLog((current) => {
        const nextBase = BASE_CHAT_MESSAGES[index % BASE_CHAT_MESSAGES.length];
        index += 1;
        const next = [...current, nextBase];
        // mantém no máximo 50 mensagens (as mais recentes)
        return next.slice(-50);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [screen]);

  // Typing effect for the reading (screen 3)
  useEffect(() => {
    if (screen !== Screen.READING) {
      setReadingTyped('');
      setShowHowItWorks(false);
       setShowOfferBlocks(false);
      return;
    }

    const full = buildReadingText(
      (yourName.split(' ')[0] || 'Sarah'),
      (partnerName.split(' ')[0] || 'João'),
    );
    readingFullRef.current = full;
    setReadingTyped('');

    let i = 0;
    let current = '';

    const interval = setInterval(() => {
      const target = readingFullRef.current;
      if (i >= target.length) {
        clearInterval(interval);
        return;
      }

      current += target[i];
      i += 1;
      setReadingTyped(current);
    }, 45); // digitação um pouco mais rápida

    return () => clearInterval(interval);
  }, [screen, yourName, partnerName]);

  // When the reading finishes, show offer blocks with small delay
  useEffect(() => {
    if (screen !== Screen.READING) return;
    const full = readingFullRef.current;
    if (!full || readingTyped.length < full.length) return;

    const timeout = setTimeout(() => setShowOfferBlocks(true), 1000); // ~1s após o fim da leitura
    return () => clearTimeout(timeout);
  }, [screen, readingTyped]);

  // Mantém o scroll do chat sempre no final quando chegar mensagem nova
  useEffect(() => {
    if (screen !== Screen.SCANNING) return;
    const el = chatContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [screen, chatLog]);

  // Gauge animation
  useEffect(() => {
    if (screen !== Screen.RESULTS || !result) return;
    setGaugeAnimated(0);
    gaugeRef.current = 0;
    const target = result.infidelityProbability;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const p = Math.min(step / 60, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setGaugeAnimated(Math.round(eased * target));
      if (step >= 60) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [screen, result]);

  const validateLandingTela1 = (): boolean => {
    const nameRegex = /^[A-Za-z][A-Za-z\s.'-]{2,79}$/;

    const yourNameTrimmed = yourName.trim();
    const partnerNameTrimmed = partnerName.trim();
    const cityTrimmed = partnerCity.trim();

    if (!nameRegex.test(yourNameTrimmed)) {
      setFormError('Please enter your full name using only letters.');
      return false;
    }

    if (!nameRegex.test(partnerNameTrimmed)) {
      setFormError('Please enter his full name using only letters.');
      return false;
    }

    if (!partnerBirthdate) {
      setFormError('Please enter his date of birth.');
      return false;
    }

    const birth = new Date(partnerBirthdate);
    const now = new Date();
    if (Number.isNaN(birth.getTime())) {
      setFormError('Please enter a valid date of birth.');
      return false;
    }
    // basic sanity: not in the future and at least 10 years old
    const tenYearsMs = 10 * 365 * 24 * 60 * 60 * 1000;
    if (birth.getTime() > now.getTime() - tenYearsMs) {
      setFormError('Please enter a date of birth that is at least 10 years in the past.');
      return false;
    }

    if (!cityTrimmed || cityTrimmed.length < 3) {
      setFormError('Please enter the city where you both live.');
      return false;
    }
    if (!/[A-Za-z]/.test(cityTrimmed)) {
      setFormError('Please enter a valid city name.');
      return false;
    }

    if (!mainQuestion) {
      setFormError('Please choose your main question.');
      return false;
    }
    setFormError(null);
    fetch('https://n8n.srv1140010.hstgr.cloud/webhook/tarot2-infidelidade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        yourName: yourName.trim(),
        partnerName: partnerName.trim(),
        partnerBirthdate,
        partnerCity: partnerCity.trim(),
        mainQuestion,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {});
    setYourBirthdate('1990-01-15');
    setPartnerBirthdate('1988-06-20');
    setRelationshipDuration('3-to-5');
    return true;
  };

  const getGaugeColor = (v: number) => v <= 30 ? '#4ECDC4' : v <= 60 ? '#9B87F5' : '#FF6B6B';
  const getRiskLabel = (v: number) => v <= 30 ? 'Low' : v <= 60 ? 'Medium' : 'High';

  // ==================== LANDING – Tela 1: Leitura de Tarot ao Vivo ====================

  const renderLanding = () => {
    const inputCls = "w-full rounded-xl bg-navy-light/80 border border-border px-4 py-3 text-[14px] text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-purple/40 focus:border-purple/40 transition-all";
    const labelCls = "text-[11px] font-semibold text-text-secondary uppercase tracking-wider";

    return (
      <div className="animate-fadeIn space-y-4 pb-10">
        {/* ── VÍDEO AO VIVO ── */}
        <div className="card-glow overflow-hidden relative rounded-2xl">
          <div className="aspect-[4/3] bg-gradient-to-b from-navy-card via-purple/5 to-navy-card flex items-center justify-center relative">
            {VIDEO_TAROT_URL ? (
              <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
                <source src={VIDEO_TAROT_URL} type="video/mp4" />
              </video>
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/40" />
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
              <div className="w-16 h-16 rounded-full bg-purple/20 border border-purple/30 flex items-center justify-center text-2xl mb-3">🔮</div>
              <p className="text-white/95 text-[14px] font-medium">Live tarot reader</p>
              <p className="text-white/80 text-[13px] mt-1">Selena is revealing everything that is hidden</p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-red-500/90 px-3 py-1.5 text-[11px] font-bold text-white uppercase tracking-wider shadow-lg">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                </span>
                Live now
              </div>
              <p className="mt-2 text-white/80 text-[12px] font-medium">⏰ 52 people watching</p>
            </div>
          </div>
        </div>

        {/* ── BOX: Título + Formulário ── */}
        <div className="card-glow p-5 space-y-4 relative overflow-hidden">
          <StarField />
          <div className="relative z-10 space-y-4">
            <div className="text-center space-y-2">
              <p className="text-[10px] text-text-secondary uppercase tracking-widest">
                {(() => {
                  const d = new Date();
                  const mm = String(d.getMonth() + 1).padStart(2, '0');
                  const dd = String(d.getDate()).padStart(2, '0');
                  const yyyy = d.getFullYear();
                  return `Day: ${mm}/${dd}/${yyyy}`;
                })()}
              </p>
              <h1 className="text-[20px] sm:text-[22px] font-extrabold text-white leading-tight">
                Tarot Reading
                <br />
                <span className="gradient-text">Theme: Infidelity</span>
              </h1>
              <p className="text-[13px] text-text-secondary leading-relaxed max-w-[320px] mx-auto">
                Find out today if he is cheating on you. Ask your question and, in a few minutes, the cards will bring the answer. The cards don&apos;t lie.
              </p>
            </div>

            {formError && (
              <div className="flex items-center gap-2 text-[12px] font-semibold text-alert bg-alert/10 border border-alert/20 rounded-xl py-2.5 px-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                {formError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className={labelCls}>Your full name</label>
              <input
                type="text"
                value={yourName}
                onChange={(e) => setYourName(e.target.value)}
                placeholder="e.g., Mary Smith"
                className={inputCls}
              />
            </div>

            <div className="space-y-1.5">
              <label className={labelCls}>His full name</label>
              <input
                type="text"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="e.g., John Brown"
                className={inputCls}
              />
            </div>

            <div className="space-y-1.5">
              <label className={labelCls}>His date of birth</label>
              <input
                type="date"
                value={partnerBirthdate}
                onChange={(e) => setPartnerBirthdate(e.target.value)}
                className={inputCls}
              />
            </div>

            <div className="space-y-1.5">
              <label className={labelCls}>City where you both live</label>
              <input
                type="text"
                value={partnerCity}
                onChange={(e) => setPartnerCity(e.target.value)}
                placeholder="e.g., New York, NY"
                className={inputCls}
              />
            </div>

            <div className="space-y-2">
              <label className={labelCls}>Your main question</label>
              <div className="space-y-2">
                {PERGUNTA_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setMainQuestion(opt.value)}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border transition-all text-left ${
                      mainQuestion === opt.value
                        ? 'bg-purple/10 border-purple/40 text-white'
                        : 'bg-navy-light/50 border-border text-text-secondary hover:border-purple/20'
                    }`}
                  >
                    <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      mainQuestion === opt.value ? 'border-purple bg-purple' : 'border-text-muted'
                    }`}>
                      {mainQuestion === opt.value && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  <span className="text-[13px] font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => { if (validateLandingTela1()) setScreen(Screen.SCANNING); }}
              className="gradient-btn animate-pulse-glow w-full text-white font-bold py-4 rounded-2xl text-[15px] transition-all"
            >
              Join the reading
            </button>

            <p className="flex items-center justify-center gap-1.5 text-[11px] text-text-muted">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              100% Confidential
            </p>

          </div>
        </div>
      </div>
    );
  };

  // ==================== SCANNING ====================

  const renderScanning = () => {
    const partnerFirst = partnerName.split(' ')[0] || 'ele';

    return (
      <div className="animate-fadeIn space-y-5 pb-6">
        {/* Vídeo + AO VIVO (mantém como está na tela 1) */}
        <div className="card-glow overflow-hidden relative rounded-2xl">
          <div className="aspect-[4/3] bg-gradient-to-b from-navy-card via-purple/5 to-navy-card flex items-center justify-center relative">
            {VIDEO_TAROT_URL ? (
              <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
                <source src={VIDEO_TAROT_URL} type="video/mp4" />
              </video>
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/40" />
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
              <div className="w-14 h-14 rounded-full bg-purple/20 border border-purple/30 flex items-center justify-center text-2xl mb-2">🔮</div>
              <p className="text-white/95 text-[13px] font-medium">Selena is revealing everything that is hidden</p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-red-500/90 px-3 py-1.5 text-[11px] font-bold text-white uppercase tracking-wider shadow-lg">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                </span>
                Live now
              </div>
              <p className="mt-2 text-white/80 text-[12px] font-medium">⏰ {audienceCount} people watching</p>
            </div>
          </div>
        </div>

        {/* Texto + barra de progresso + etapas */}
        <div className="card-glow p-5 space-y-5">
          <div className="text-center space-y-2">
            {!showSelectedMessage ? (
              <>
                <p className="text-[13px] font-bold text-text-secondary whitespace-nowrap">
                  Selecting questions...
                </p>
                <p className="text-[13px] text-text-secondary flex items-center justify-center gap-1">
                  <span className="inline-flex h-4 w-4 items-center justify-center">
                    <span className="h-4 w-4 rounded-full border-[2px] border-text-muted border-t-teal animate-spin-slow" />
                  </span>
                  Please wait a few seconds...
                </p>
              </>
            ) : (
              <>
                <p className="text-[14px] font-bold text-teal tracking-wide whitespace-nowrap">
                  ✅ Congratulations, your question has been selected
                </p>
                <p className="text-[13px] text-text-secondary flex items-center justify-center gap-1">
                  <span className="inline-flex h-4 w-4 items-center justify-center">
                    <span className="h-4 w-4 rounded-full border-[2px] border-text-muted border-t-teal animate-spin-slow" />
                  </span>
                  Please wait a few seconds...
                </p>
              </>
            )}
          </div>

          {/* Barra de progresso */}
          <div className="space-y-2">
            <div className="h-2.5 bg-navy-light rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple via-purple-soft to-pink transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-text-muted">Preparing reading...</span>
              <span className="text-purple-soft font-bold">{scanProgress}%</span>
            </div>
          </div>

          {/* Checklist de etapas */}
          <div className="space-y-2 pt-1">
            {[
              `Your question was received (about ${partnerFirst})`,
              'Selene is finishing the previous reading...',
              'Preparing your cards...',
              'Connecting with your energy...',
              'Shuffling the deck...',
              'Cleansing the cards...',
              'Your reading is next!',
              'Taking a photo of the spread...',
              'Transcribing your answer...',
            ].map((label, index) => {
              const threshold = ((index + 1) / 9) * 100; // distribui pelos 100%
              const done = scanProgress >= threshold;
              return (
                <div key={label} className="flex items-center gap-2.5">
                  {done ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ECDC4" strokeWidth="2.5" className="shrink-0">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 animate-spin-slow">
                      <circle cx="12" cy="12" r="10" stroke="rgba(123,97,245,0.3)" strokeWidth="2" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="#9B87F5" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )}
                  <span className={`text-[12px] ${done ? 'text-teal font-semibold' : 'text-text-secondary'}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat ao vivo estilo YouTube */}
        <div className="card p-0 overflow-hidden">
          {/* Header do chat */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-navy-card/70">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-text-secondary">Top chat</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7B87F5" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
              <span className="ml-2 rounded-full bg-navy-light/80 border border-border px-2 py-0.5 text-[9px] text-text-muted">
                Private room for premium members
              </span>
            </div>
            <span className="text-[10px] text-text-muted">{audienceCount} people watching</span>
          </div>

          {/* Mensagens */}
          <div
            ref={chatContainerRef}
            className="max-h-48 overflow-y-auto px-3 py-2 space-y-1.5 bg-black/40"
          >
            {chatLog.map((m, index) => (
              <div key={`${m.name}-${index}`} className="flex items-start gap-2 text-[11px] leading-snug">
                <div className="mt-0.5 h-6 w-6 rounded-full bg-gradient-to-br from-purple-soft to-pink flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                  {m.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-white mr-1">{m.name}</span>
                  <span className="text-text-secondary">{m.text}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Input desativado (apenas visual) */}
          <div className="border-t border-border bg-navy-card/80 px-3 py-2">
            <div className="flex items-center gap-2 text-[11px] text-text-muted bg-navy-light/80 rounded-full px-3 py-1.5">
              <span className="h-5 w-5 rounded-full bg-gradient-to-br from-purple-soft to-pink flex items-center justify-center text-[9px] font-bold text-white">
                You
              </span>
              <span className="flex-1">Say something...</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4A5578" strokeWidth="2">
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==================== RESULTS ====================

  const renderResults = () => {
    if (!result) return null;

    const prob = gaugeAnimated;
    const color = getGaugeColor(result.infidelityProbability);
    const riskLabel = getRiskLabel(result.infidelityProbability);
    const partnerFirst = partnerName.split(' ')[0];

    const size = 220;
    const sw = 14;
    const r = (size - sw) / 2;
    const circ = Math.PI * r;
    const offset = circ - (prob / 100) * circ;

    const fidelityText: Record<number, string> = {
      1: 'Extremely independent. Puts personal desires above the relationship when feeling trapped.',
      2: 'Constant need for outside validation. When he does not get attention at home, he looks for it elsewhere.',
      3: 'Needs constant admiration. If he does not feel “special” with you, he looks for someone who makes him feel that way.',
      4: 'Values routine, but when he feels stuck in it, he may have sudden impulses to escape.',
      5: 'Restless by nature. Gets bored quickly and looks for constant novelty — including in love.',
      6: 'Values family, but may feel overwhelmed and seek emotional “relief” outside the home.',
      7: 'Emotionally distant. Creates secret worlds and may develop hidden connections.',
      8: 'Associates power with conquests — including romantic ones. May maintain parallel relationships for ego.',
      9: 'Looks for meaning and gets disillusioned when the relationship does not meet his ideals.',
    };

    const soulText: Record<number, string> = {
      1: 'Needs autonomy. When he feels controlled, he looks for freedom — in any way.',
      2: 'Needs constant connection. If he does not get it at home, he finds it somewhere else.',
      3: 'Needs attention and admiration. Looks for someone who makes him feel special.',
      4: 'Values routine, but when stuck in it, may have unexpected escape impulses.',
      5: 'Needs variety and novelty. Gets bored with routine and looks for “something new”.',
      6: 'Values family, but may seek emotional relief outside when overwhelmed.',
      7: 'Introspective and mysterious. Develops deep connections without anyone knowing.',
      8: 'Seeks status and power. Uses relationships to affirm his position.',
      9: 'Looks for deep meaning. Gets disillusioned when the partner does not match his ideals.',
    };

    const destinyShort: Record<number, string> = {
      1: 'Independence', 2: 'Partnership', 3: 'Expression', 4: 'Stability',
      5: 'Adventure', 6: 'Family', 7: 'Introspection', 8: 'Ambition', 9: 'Idealism',
    };

    const fidelityTendenciesMap: Record<number, string[]> = {
      1: ['Makes decisions alone', 'Prioritizes personal desires', 'Often asks for “space”'],
      2: ['Keeps parallel conversations', 'Looks for compliments from other women', 'Creates emotional connections outside the relationship'],
      3: ['Flirts to feel admired', 'Seeks female attention online', 'Values those who flatter him too much'],
      5: ['Looks for adventures outside routine', 'Gets tired of predictability quickly', '"Needs space" without explaining why'],
      7: ['Hides conversations and feelings', 'Has a secret emotional life', 'Creates deep connections with other people'],
      8: ['Sees conquests as trophies', 'Maintains dubious “professional” contacts', 'Uses power to attract others'],
    };

    const soulSignsMap: Record<number, string[]> = {
      1: ['“I know what I’m doing”', 'Sudden unilateral decisions', 'Emotional distancing'],
      2: ['“You don’t give me attention”', 'Seeks approval from others', 'Excessive neediness followed by coldness'],
      3: ['“No one values me here”', 'Spends a lot of time on social media', 'Sudden increase in vanity'],
      4: ['“I need to get out of the routine”', 'Growing irritability', 'Abrupt mood changes'],
      5: ['“I need space”', 'New hobbies out of nowhere', 'Goes out alone without explaining'],
      6: ['“I am overwhelmed”', 'Seeks comfort in female friendships', 'Gradual distancing'],
      7: ['Long silences', 'Phone always locked', 'Evasive conversations about feelings'],
      8: ['“I am focused on work”', 'Frequent business trips', 'New “professional contacts”'],
      9: ['“Our relationship lost the magic”', 'Idealizes other people', 'Constant frustration'],
    };

    const checkoutUrls: Record<number, string> = {
      1: CHECKOUT_URL,
      2: CHECKOUT_URL,
      3: CHECKOUT_URL,
    };

    const SectionTitle = ({ children }: { children: React.ReactNode }) => (
      <p className="text-[12px] font-bold text-text-secondary uppercase tracking-widest px-1">{children}</p>
    );

    return (
      <div className="animate-fadeIn space-y-5 pb-8">

        {/* ── GAUGE ── */}
        <div className="card-glow p-6 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <span className="text-[16px]">🚨</span>
            <span className="text-[42px] font-black leading-none" style={{ color }}>{prob}%</span>
            <span className="text-[16px]">🚨</span>
          </div>
          <p className="text-[13px] font-extrabold text-white uppercase tracking-wide">
            Infidelity Probability
          </p>
          <div className="flex justify-center">
            <div className="relative" style={{ width: size, height: size / 2 + 24 }}>
              <svg width={size} height={size / 2 + sw} viewBox={`0 0 ${size} ${size / 2 + sw}`} className="overflow-visible">
                <path d={`M ${sw/2} ${size/2} A ${r} ${r} 0 0 1 ${size-sw/2} ${size/2}`} fill="none" stroke="rgba(123,97,245,0.1)" strokeWidth={sw} strokeLinecap="round" />
                <path d={`M ${sw/2} ${size/2} A ${r} ${r} 0 0 1 ${size-sw/2} ${size/2}`} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 0.1s ease-out', filter: `drop-shadow(0 0 8px ${color}40)` }} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center" style={{ paddingTop: size * 0.15 }}>
                <span className="text-[14px] font-extrabold uppercase tracking-wider" style={{ color }}>{riskLabel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── CRITICAL ALERT ── */}
        <div className="card p-5 space-y-3 border-l-4 border-l-alert">
          <p className="text-[14px] font-extrabold text-alert flex items-center gap-2">⚠️ CRITICAL ALERT</p>
          <p className="text-[13px] text-text-secondary leading-relaxed">
            The numbers indicate a <strong className="text-white">HIGH probability</strong> that {partnerFirst} is involved with someone else or open to it.
          </p>
        </div>

        {/* ── WHY IS THE RISK SO HIGH? ── */}
        <div className="space-y-3">
          <SectionTitle>Why is the risk so high?</SectionTitle>
          <div className="card p-5 space-y-5">

            {/* Fidelity */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-alert/15 flex items-center justify-center text-[12px] font-black text-alert">{result.fidelityNumber}</div>
                <p className="text-[13px] font-bold text-white">Fidelity Number: {result.fidelityNumber}</p>
              </div>
              <p className="text-[12px] text-text-secondary leading-relaxed pl-9">
                {fidelityText[result.fidelityNumber] || 'Profile that demands extra attention in the relationship dynamic.'}
              </p>
              {fidelityTendenciesMap[result.fidelityNumber] && (
                <div className="ml-9 px-3 py-2.5 rounded-xl bg-alert/5 border border-alert/10 space-y-1.5">
                  <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Tends to:</p>
                  {fidelityTendenciesMap[result.fidelityNumber].map((t) => (
                    <div key={t} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-alert mt-1.5 shrink-0" />
                      <span className="text-[12px] text-text-secondary">{t}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="h-px bg-border" />

            {/* Soul */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-alert/15 flex items-center justify-center text-[12px] font-black text-alert">{result.partnerSoulNumber}</div>
                <p className="text-[13px] font-bold text-white">Soul Number: {result.partnerSoulNumber}</p>
              </div>
              <p className="text-[12px] text-text-secondary leading-relaxed pl-9">
                {soulText[result.partnerSoulNumber] || 'Profile that looks for fulfillment outside routine.'}
              </p>
              {soulSignsMap[result.partnerSoulNumber] && (
                <div className="ml-9 px-3 py-2.5 rounded-xl bg-alert/5 border border-alert/10 space-y-1.5">
                  <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Common signs:</p>
                  {soulSignsMap[result.partnerSoulNumber].map((s) => (
                    <div key={s} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-alert mt-1.5 shrink-0" />
                      <span className="text-[12px] text-text-secondary">{s}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="h-px bg-border" />

            {/* Compatibility */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-alert/15 flex items-center justify-center text-[12px] font-black text-alert">{result.compatibilityPercentage}%</div>
                <p className="text-[13px] font-bold text-white">Compatibility: {result.compatibilityPercentage}%</p>
              </div>
              <p className="text-[12px] text-text-secondary leading-relaxed pl-9">
                You value different things. You are {destinyShort[result.yourDestinyNumber]}, he is {destinyShort[result.partnerDestinyNumber]}. He is probably looking <strong className="text-white">OUTSIDE</strong> the relationship for what he does not find in you.
              </p>
              <div className="ml-9 px-3 py-2.5 rounded-xl bg-navy-light/60 border border-border space-y-1.5">
                <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Profile of “the other woman”:</p>
                <p className="text-[12px] text-text-secondary leading-relaxed">
                  More adventurous, admires him, does not demand constant presence.
                </p>
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Personal Year */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-alert/15 flex items-center justify-center text-[11px] font-black text-alert">Y{result.personalCycle}</div>
                <p className="text-[13px] font-bold text-white">Personal Year {result.personalCycle} (2026)</p>
              </div>
              <p className="text-[12px] text-text-secondary leading-relaxed pl-9">
                Peak of restlessness and desire for change <strong className="text-white">RIGHT NOW</strong>.
              </p>
              <p className="text-[12px] text-text-secondary leading-relaxed pl-9">
                <strong className="text-white">68%</strong> of people in Personal Year {result.personalCycle} with low compatibility start affairs in this period.
              </p>
            </div>
          </div>
        </div>

        {/* ── CRITICAL COMBINATION ── */}
        <div className="gradient-border p-5 text-center space-y-3">
          <SectionTitle>Critical Combination</SectionTitle>
          <p className="text-[12px] text-text-muted">
            Fidelity {result.fidelityNumber} + Soul {result.partnerSoulNumber} + Year {result.personalCycle}
          </p>
          <p className="text-[13px] font-bold text-alert leading-relaxed">
            = Present in <strong className="text-white">78% of CONFIRMED cases</strong> of cheating
          </p>
        </div>

        {/* ── HIGHEST RISK PERIOD ── */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-[14px]">⏰</span>
            <p className="text-[13px] font-extrabold text-white">HIGHEST RISK PERIOD</p>
          </div>
          <p className="text-[18px] font-black text-alert">Next 90 days</p>

          <div className="px-3 py-3 rounded-xl bg-alert/5 border border-alert/15 space-y-2">
            <p className="text-[11px] font-bold text-alert uppercase tracking-wider">⚠️ Likely signs right now:</p>
            <div className="space-y-1.5">
                {[
                  'Phone more hidden or face down',
                  'Sudden “extra work” or overtime',
                  'Less sexual interest',
                  'More critical and distant with you',
                ].map((s) => (
                <div key={s} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-alert mt-1.5 shrink-0" />
                  <span className="text-[12px] text-text-secondary">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── WHAT THE NUMBERS SUGGEST ── */}
        <div className="space-y-3">
          <SectionTitle>What the numbers suggest</SectionTitle>
          <div className="card p-5 space-y-3">
            <p className="text-[13px] text-text-secondary">With an <strong className="text-white">{result.infidelityProbability}%</strong> probability:</p>
            <div className="space-y-3">
                {[
                  { n: '1️⃣', text: 'He already has someone else OR is open to it.' },
                  { n: '2️⃣', text: 'There is at least one “connection” outside the relationship.' },
                  { n: '3️⃣', text: 'In the next 3 months, things may get worse or you may find out.' },
                ].map((item) => (
                <div key={item.n} className="flex items-start gap-3 px-3 py-2.5 rounded-xl bg-navy-light/60 border border-border">
                  <span className="text-[14px]">{item.n}</span>
                  <span className="text-[12px] text-text-secondary leading-relaxed">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── BUT THE NUMBERS DO NOT REVEAL ── */}
        <div className="gradient-border p-6 space-y-4">
          <h3 className="text-[15px] font-extrabold text-white text-center">
            But the Numbers <span className="gradient-text">Do Not Reveal</span>
          </h3>
          <div className="space-y-2">
            {[
              'WHO the other person is (if she exists)',
              'WHERE they meet',
              'WHAT they do/talk about',
              'FOR HOW LONG this has been happening',
              'IF there has already been sex',
              'HIS PLANS from now on',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-alert/5 border border-alert/10">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="2" className="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                <span className="text-[12px] text-text-secondary">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-[14px] font-bold text-center text-white pt-1">
            For that, you need a{' '}
            <span className="gradient-text">Tarot Reading</span>.
          </p>
        </div>

        {/* ── TAROT READING ── */}
        <div className="card-glow p-6 space-y-5 relative overflow-hidden">
          <StarField />
          <div className="relative z-10 space-y-5">
            <div className="text-center space-y-2">
              <p className="text-[11px] font-bold text-purple-soft uppercase tracking-widest">🔮 The cards do not lie</p>
              <p className="text-[13px] text-text-secondary leading-relaxed">
                Choose what you want to ask and Selene will do an <strong className="text-white">exclusive reading</strong> for you.
              </p>
            </div>

            {/* Opções de pacote */}
            <div className="space-y-3">
              {([
                { id: 1, questions: 1, price: 17, popular: false },
                { id: 2, questions: 3, price: 27, popular: true },
                { id: 3, questions: 5, price: 37, popular: false },
              ] as const).map((pkg) => (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => setSelectedPlan(pkg.id)}
                  className={`w-full text-left px-4 py-4 rounded-2xl border-2 transition-all relative ${
                    selectedPlan === pkg.id
                      ? 'bg-purple/10 border-purple/50 shadow-[0_0_20px_rgba(123,97,245,0.15)]'
                      : 'bg-navy-light/50 border-border hover:border-purple/20'
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple to-pink text-[9px] font-bold text-white uppercase tracking-wider">
                      Mais escolhido
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        selectedPlan === pkg.id ? 'border-purple bg-purple' : 'border-text-muted'
                      }`}>
                        {selectedPlan === pkg.id && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-white">
                          {pkg.questions} {pkg.questions === 1 ? 'pergunta' : 'perguntas'}
                        </p>
                        <p className="text-[11px] text-text-muted">
                          {pkg.questions === 1 ? 'Ideal para uma dúvida específica' : pkg.questions === 3 ? 'Visão completa do relacionamento' : 'Análise profunda de tudo'}
                        </p>
                      </div>
                    </div>
                    <p className="text-[20px] font-black gradient-text">${pkg.price}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* What you receive */}
            <div className="px-3 py-3 rounded-xl bg-navy-light/60 border border-border space-y-2">
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">You receive within 24h:</p>
              <div className="space-y-1.5">
                {[
                  'PDF with a photo of the spread',
                  'Detailed explanation of each card',
                  'Clear answer for each question',
                  'Practical guidance on what to do',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ECDC4" strokeWidth="2.5" className="shrink-0 mt-0.5"><polyline points="20 6 9 17 4 12"/></svg>
                    <span className="text-[12px] text-text-secondary">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                const base = checkoutUrls[selectedPlan];
                if (base) {
                  const url = buildCheckoutUrlWithUtms(base);
                  window.location.href = url;
                }
              }}
              className="gradient-btn animate-pulse-glow w-full text-white font-bold py-4 rounded-2xl text-[15px] transition-all"
            >
              {selectedPlan === 1 ? 'Ask 1 Question — $17' : selectedPlan === 2 ? 'Ask 3 Questions — $27' : 'Ask 5 Questions — $37'}
            </button>

            <p className="text-[11px] text-text-muted text-center">
              After payment, you will be redirected to write your questions.
            </p>
          </div>
        </div>

        {/* ── TESTIMONIALS ── */}
        <div className="space-y-3">
          <p className="text-[12px] font-bold text-text-secondary uppercase tracking-widest px-1">Testimonials</p>
          {TESTIMONIALS.slice(0, 2).map((t) => (
            <div key={t.name} className="card p-4 space-y-3">
              <div className="flex items-center gap-3">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-purple/20" loading="lazy" />
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-white">{t.name}</p>
                  <p className="text-[11px] text-text-muted">{t.age} years old</p>
                </div>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((s) => (
                    <svg key={s} width="11" height="11" viewBox="0 0 24 24" fill="#FF6B9D"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/></svg>
                  ))}
                </div>
              </div>
              <p className="text-[12px] text-text-secondary leading-relaxed italic">"{t.text}"</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ==================== READING PAGE (Tela 3) ====================

  const renderReading = () => {
    const isReadingComplete =
      readingTyped.length >= (readingFullRef.current ? readingFullRef.current.length : 0);

    return (
      <div className="animate-fadeIn space-y-5 pb-8">
        {/* Vídeo ao vivo no topo (mesmo card) */}
        <div className="card-glow overflow-hidden relative rounded-2xl">
          <div className="aspect-[4/3] bg-gradient-to-b from-navy-card via-purple/5 to-navy-card flex items-center justify-center relative">
            {VIDEO_TAROT_URL ? (
              <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
                <source src={VIDEO_TAROT_URL} type="video/mp4" />
              </video>
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/40" />
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
              <div className="w-14 h-14 rounded-full bg-purple/20 border border-purple/30 flex items-center justify-center text-2xl mb-2">🔮</div>
              <p className="text-white/95 text-[13px] font-medium">Selena is revealing everything that is hidden</p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-red-500/90 px-3 py-1.5 text-[11px] font-bold text-white uppercase tracking-wider shadow-lg">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                </span>
                Live now
              </div>
              <p className="mt-2 text-white/80 text-[12px] font-medium">
                ⏰ {audienceCount} people watching
              </p>
            </div>
          </div>
        </div>

        {/* Reading header – large image of the cards + subtle caption */}
        <div className="card-glow overflow-hidden relative">
          <img
            src="/cartas.png"
            alt="Três cartas de tarot revelando passado, presente e futuro"
            className="w-full max-h-56 object-cover"
          />
          <span className="absolute top-2 right-3 rounded-full bg-black/40 px-2 py-0.5 text-[10px] text-text-secondary/80">
            photo of your reading
          </span>
        </div>

        {/* Initial reading block */}
        <div className="card p-5 space-y-3 text-slate-200">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[12px] font-bold text-purple-soft uppercase tracking-widest">🔮 Your reading</p>
            <span className="flex items-center gap-1 rounded-full bg-navy-light/80 border border-border px-2.5 py-0.5 text-[10px] text-text-secondary animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-teal" />
              <span>live transcription</span>
            </span>
          </div>
          <p className="text-[13px] leading-relaxed whitespace-pre-line">
            {readingTyped}
            {!isReadingComplete && (
              <span className="inline-block align-baseline w-[1px] h-4 bg-slate-200 ml-[1px] animate-pulse" />
            )}
          </p>
          {isReadingComplete && (
            <div className="mt-3 rounded-2xl border border-alert/40 bg-alert/10 px-3.5 py-2.5">
              <p className="text-[12px] font-bold text-alert flex items-center gap-2 mb-1">
                <span>⚠️</span>
                <span>Attention</span>
              </p>
              <p className="text-[12px] text-text-secondary leading-relaxed">
                Your reading has been completed. Selena is currently answering other questions live.
              </p>
            </div>
          )}
        </div>

        {showOfferBlocks && (
          <>
            {/* Oferta de desbloqueio */}
            <div
              className="card-glow p-5 space-y-4 animate-fadeIn"
              style={{ animationDelay: '0.05s', animationDuration: '1s' }}
            >
              <div className="text-center space-y-2">
                <div className="flex justify-center gap-0.5 text-[13px]">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i}>⭐</span>
                  ))}
                </div>
                <p className="text-[17px] font-extrabold text-white leading-snug">
                  Unlock your full
                  <br />
                  individual reading
                </p>
                <p className="text-[13px] text-text-secondary leading-relaxed">
                  Selena will go deeper into your reading and bring the specific answers the cards have for <span className="text-white font-semibold">you</span>.
                </p>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              <p className="text-[12px] font-bold text-text-secondary uppercase tracking-widest">
                What you will receive:
              </p>
              <ul className="space-y-1.5 text-[13px] text-text-secondary">
                <li>🔮 The FUTURE card</li>
                <li>🔮 What he is really hiding from you</li>
                <li>🔮 His true intentions with you</li>
                <li>🔮 The right moment to act</li>
                <li>🔮 Past-life reading</li>
                <li>🔮 The cards’ guidance</li>
                <li>🔮 Answers to specific questions</li>
                <li>🔮 The final message from the universe</li>
              </ul>

              <div className="pt-2 text-center space-y-1">
                <p className="text-[11px] text-text-muted uppercase tracking-widest">one-time payment</p>
                <p className="text-[60px] leading-none font-black gradient-text">$37</p>
              </div>

            <button
              type="button"
              onClick={() => {
                window.location.href = buildCheckoutUrlWithUtms(CHECKOUT_URL);
              }}
              className="gradient-btn animate-pulse-glow w-full text-white font-bold py-3.5 rounded-2xl text-[15px] transition-all"
            >
              Unlock full reading
            </button>

            <div className="mt-2 flex items-center justify-center gap-4 text-[10px] text-text-muted">
              <div className="flex items-center gap-1">
                <span className="text-xs">🔒</span>
                <span>Secure checkout</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs">💳</span>
                <span>SSL encrypted payment</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs">✅</span>
                <span>Hotmart buyer protection</span>
              </div>
            </div>
          </div>

            {/* How it works (accordion) */}
            <div
              className="card p-4 animate-fadeIn"
              style={{ animationDelay: '0.15s', animationDuration: '1s' }}
            >
              <button
                type="button"
                onClick={() => setShowHowItWorks((v) => !v)}
                className="w-full flex items-center justify-between text-[11px] font-semibold text-text-secondary uppercase tracking-widest"
              >
                <span>How it works</span>
                <span
                  className={`transition-transform duration-200 text-text-secondary ${
                    showHowItWorks ? 'rotate-180' : 'rotate-0'
                  }`}
                >
                  ▼
                </span>
              </button>

              {showHowItWorks && (
                <div className="mt-3 space-y-2 text-[12px] text-text-secondary leading-relaxed">
                <div className="flex items-start gap-3 rounded-xl bg-navy-light/80 border border-border px-3 py-2">
                  <div className="w-6 h-6 rounded-full bg-purple/25 flex items-center justify-center text-[12px] font-semibold text-purple-soft">
                    1
                  </div>
                  <p>
                    You make the payment (one-time, 100% secure) and secure your detailed reading.
                  </p>
                </div>

                  <div className="flex items-start gap-3 rounded-xl bg-navy-light/80 border border-border px-3 py-2">
                    <div className="w-6 h-6 rounded-full bg-purple/25 flex items-center justify-center text-[12px] font-semibold text-purple-soft">
                      2
                    </div>
                  <p>
                    After payment, you are redirected to a page where you can send up to{' '}
                    <span className="font-semibold">3 specific questions</span> to the cards.
                  </p>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl bg-navy-light/80 border border-border px-3 py-2">
                    <div className="w-6 h-6 rounded-full bg-purple/25 flex items-center justify-center text-[12px] font-semibold text-purple-soft">
                      3
                    </div>
                  <p>
                    Selena prepares your complete reading and sends it to your email within{' '}
                    <span className="font-semibold">12 hours</span>, with a{' '}
                    <span className="font-semibold">photo of the cards</span> + a detailed interpretation of the entire spread.
                  </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  // ==================== CHECKOUT ====================

  const renderCheckout = () => {
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const inputCls = "w-full rounded-xl bg-navy-light/80 border border-border px-4 py-3 text-[14px] text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-purple/40 focus:border-purple/40 transition-all";

    const handlePay = (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setTimeout(() => { setLoading(false); setDone(true); setTimeout(() => setScreen(Screen.THANKS), 1200); }, 2500);
    };

    if (done) {
      return (
        <div className="animate-fadeIn flex items-center justify-center min-h-[60vh]">
          <div className="card-glow p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-teal/10 border border-teal/20 mx-auto flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ECDC4" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 className="text-[18px] font-extrabold text-white">Pagamento Confirmado!</h2>
            <p className="text-[13px] text-text-secondary">Redirecionando...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="animate-fadeIn space-y-5 pb-8">
        <button onClick={() => setScreen(Screen.RESULTS)} className="flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-white transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Back to result
        </button>

        {/* Summary */}
        <div className="gradient-border p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple to-pink flex items-center justify-center text-[18px]">🔮</div>
            <div>
              <p className="text-[14px] font-bold text-white">Tarot Reading</p>
              <p className="text-[11px] text-text-muted">Personalized with Selena Noir</p>
            </div>
          </div>
          <div className="space-y-1.5 text-[12px] text-text-secondary">
            <p className="flex items-center gap-2"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ECDC4" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Exclusive reading</p>
            <p className="flex items-center gap-2"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ECDC4" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Full energetic analysis</p>
            <p className="flex items-center gap-2"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ECDC4" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Detailed predictions</p>
            <p className="flex items-center gap-2"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ECDC4" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>7-day guarantee</p>
          </div>
          <div className="flex items-end justify-between pt-3 border-t border-border">
            <span className="text-[13px] text-text-secondary">Total</span>
            <div className="text-right">
              <span className="text-[11px] text-text-muted line-through block">$197</span>
              <span className="text-[24px] font-black gradient-text">$67</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handlePay} className="card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9B87F5" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            <p className="text-[13px] font-bold text-white">Payment details</p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Name on card</label>
              <input type="text" placeholder="As it appears on the card" className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Card number</label>
              <input type="text" placeholder="0000 0000 0000 0000" inputMode="numeric" className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Expiration</label>
                <input type="text" placeholder="MM/AA" className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">CVV</label>
                <input type="text" placeholder="123" inputMode="numeric" className={inputCls} />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="gradient-btn w-full text-white font-bold py-4 rounded-2xl text-[15px] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? (
              <><div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /><span>Processing...</span></>
            ) : (
              <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg><span>Pay $67</span></>
            )}
          </button>
        </form>

        {/* Trust */}
        <div className="flex items-center justify-center gap-6 py-2">
            {[
              { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ECDC4" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, label: 'Secure' },
              { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9B87F5" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, label: 'Protected' },
              { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF6B9D" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>, label: '7 days' },
            ].map(({ icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              {icon}
              <span className="text-[9px] font-semibold text-text-muted uppercase tracking-wider">{label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ==================== THANKS ====================

  const renderThanks = () => (
    <div className="animate-fadeIn space-y-5 pb-8">
      <div className="card-glow p-7 text-center space-y-5 relative overflow-hidden">
        <StarField />
        <div className="relative z-10 space-y-5">
          <div className="w-16 h-16 rounded-full bg-teal/10 border border-teal/20 mx-auto flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4ECDC4" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2 className="text-[20px] font-extrabold text-white">Booking Confirmed!</h2>
          <p className="text-[13px] text-text-secondary leading-relaxed max-w-[280px] mx-auto">
            Selena Noir will contact you at your email within 24 hours.
          </p>
        </div>
      </div>

      <div className="card p-5 space-y-3">
        <p className="text-[12px] font-bold text-text-secondary uppercase tracking-widest">Next steps</p>
        {[
          'Check your email (and spam folder)',
          'Reply with your available times',
          'Selene will do your reading within 48h',
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-teal/5 border border-teal/10">
            <div className="w-6 h-6 rounded-lg bg-teal/15 flex items-center justify-center text-[10px] font-bold text-teal">{i + 1}</div>
            <span className="text-[12px] text-text-secondary">{item}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => setScreen(Screen.LANDING)}
        className="w-full py-3.5 rounded-2xl border border-border text-[14px] font-semibold text-text-secondary hover:text-white hover:border-purple/30 transition-all"
      >
        Back to start
      </button>
    </div>
  );

  // ==================== THANKS TR ====================

  const renderThanksTR = () => {
    const [trName, setTrName] = useState('');
    const [trEmail, setTrEmail] = useState('');
    const [trQuestionCount, setTrQuestionCount] = useState<1 | 2 | 3>(1);
    const [trQuestions, setTrQuestions] = useState<string[]>(['']);
    const [trSubmitted, setTrSubmitted] = useState(false);
    const [trSending, setTrSending] = useState(false);
    const [trError, setTrError] = useState<string | null>(null);

    const handleCountChange = (count: 1 | 2 | 3) => {
      setTrQuestionCount(count);
      setTrQuestions((prev) => {
        const arr = [...prev];
        while (arr.length < count) arr.push('');
        return arr.slice(0, count);
      });
    };

    const updateQuestion = (idx: number, val: string) => {
      setTrQuestions((prev) => {
        const arr = [...prev];
        arr[idx] = val;
        return arr;
      });
    };

    const handleSubmit = () => {
      if (trName.trim().length < 3) { setTrError('Please enter your full name.'); return; }
      if (!trEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trEmail.trim())) { setTrError('Please enter a valid email.'); return; }
      const filled = trQuestions.filter((q) => q.trim().length > 0);
      if (filled.length < trQuestionCount) {
        setTrError(`Fill in all ${trQuestionCount} question${trQuestionCount > 1 ? 's' : ''}.`);
        return;
      }
      setTrError(null);
      setTrSending(true);

      fetch('https://n8n.srv1140010.hstgr.cloud/webhook/tarot-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'tarot-questions',
          name: trName.trim(),
          email: trEmail.trim(),
          questionCount: trQuestionCount,
          questions: trQuestions.slice(0, trQuestionCount),
          timestamp: new Date().toISOString(),
        }),
      })
        .catch(() => {})
        .finally(() => {
          setTrSending(false);
          setTrSubmitted(true);
        });
    };

    if (trSubmitted) {
      return (
        <div className="animate-fadeIn space-y-5 pb-8">
          {/* Confirmation */}
          <div className="card-glow p-7 text-center space-y-4 relative overflow-hidden">
            <StarField />
            <div className="relative z-10 space-y-4">
              <div className="w-16 h-16 rounded-full bg-teal/10 border border-teal/20 mx-auto flex items-center justify-center">
                <span className="text-[28px]">✨</span>
              </div>
              <h2 className="text-[20px] font-extrabold text-white">QUESTIONS RECEIVED!</h2>
              <p className="text-[13px] text-text-secondary leading-relaxed">
                Your questions have been sent to <strong className="text-white">Selena Noir</strong>.
              </p>
              <p className="text-[13px] text-text-secondary leading-relaxed">
                Your full reading will be delivered within <strong className="text-white">24 hours</strong>.
              </p>
            </div>
          </div>

          {/* Important */}
          <div className="card p-5 space-y-4 border-l-4 border-l-purple">
            <p className="text-[14px] font-extrabold text-white flex items-center gap-2">📧 IMPORTANT</p>
            <p className="text-[13px] text-text-secondary leading-relaxed">
              You will receive the reading at the email used for purchase.
            </p>

            <div className="px-3 py-3 rounded-xl bg-alert/5 border border-alert/15">
              <p className="text-[12px] font-bold text-alert flex items-center gap-2">⚠️ Verifique sua caixa de spam ou promoções</p>
            </div>

            <div className="space-y-2 pt-1">
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">If you do not receive it within 24h:</p>
              {[
                'Check spam/junk folders',
                'Search for "Selena Noir"',
                'Add our email to your contacts',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-navy-light/60 border border-border">
                  <div className="w-6 h-6 rounded-lg bg-purple/15 flex items-center justify-center text-[10px] font-bold text-purple-soft">{i + 1}</div>
                  <span className="text-[12px] text-text-secondary">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Encerramento */}
          <div className="card-glow p-6 text-center space-y-3 relative overflow-hidden">
            <StarField />
            <div className="relative z-10 space-y-3">
                <p className="text-[14px] font-bold text-white">Prepare yourself for the truth.</p>
              <div>
                <p className="text-[13px] text-text-secondary italic">Light and protection,</p>
                <p className="text-[15px] font-extrabold gradient-text">Selena Noir 🔮</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="animate-fadeIn space-y-5 pb-8">
        {/* Payment Confirmed */}
        <div className="card-glow p-6 text-center space-y-3 relative overflow-hidden">
          <StarField />
          <div className="relative z-10 space-y-3">
            <div className="w-14 h-14 rounded-full bg-teal/10 border border-teal/20 mx-auto flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ECDC4" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 className="text-[20px] font-extrabold text-white">PAYMENT CONFIRMED!</h2>
            <p className="text-[13px] text-text-secondary leading-relaxed">
              Your Tarot Reading has been booked successfully.
            </p>
          </div>
        </div>

        {/* Ask your questions */}
        <div className="card p-6 space-y-5">
          <div className="text-center">
            <h3 className="text-[16px] font-extrabold text-white">ASK YOUR QUESTIONS</h3>
          </div>

          {/* Name and Email */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Your full name</label>
              <input type="text" value={trName} onChange={(e) => setTrName(e.target.value)} placeholder="E.g.: Mary Smith" className="w-full rounded-xl bg-navy-light/80 border border-border px-4 py-3 text-[14px] text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-purple/40 focus:border-purple/40 transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Your email</label>
              <input type="email" value={trEmail} onChange={(e) => setTrEmail(e.target.value)} placeholder="E.g.: mary@email.com" className="w-full rounded-xl bg-navy-light/80 border border-border px-4 py-3 text-[14px] text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-purple/40 focus:border-purple/40 transition-all" />
            </div>
          </div>

          {/* Question count */}
          <div className="space-y-3">
            <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
              How many questions do you want to ask the cards?
            </p>
            {([1, 2, 3] as const).map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => handleCountChange(count)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border transition-all text-left ${
                  trQuestionCount === count
                    ? 'bg-purple/10 border-purple/40 text-white'
                    : 'bg-navy-light/50 border-border text-text-secondary hover:border-purple/20'
                }`}
              >
                <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  trQuestionCount === count ? 'border-purple bg-purple' : 'border-text-muted'
                }`}>
                  {trQuestionCount === count && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <span className="text-[13px] font-medium">
                  {count} {count === 1 ? 'question' : 'questions'}
                </span>
              </button>
            ))}
          </div>

          {/* Dynamic fields */}
          <div className="space-y-4">
            {Array.from({ length: trQuestionCount }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                  Question {i + 1}
                </label>
                <textarea
                  value={trQuestions[i] || ''}
                  onChange={(e) => updateQuestion(i, e.target.value)}
                  placeholder={
                    i === 0 ? 'E.g.: Is he cheating on me with someone?' :
                    i === 1 ? 'E.g.: Who is the other person?' :
                    i === 2 ? 'E.g.: What is he hiding from me?' :
                    i === 3 ? 'E.g.: When did this start?' :
                    'E.g.: What should I do now?'
                  }
                  rows={2}
                  className="w-full rounded-xl bg-navy-light/80 border border-border px-4 py-3 text-[14px] text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-purple/40 focus:border-purple/40 transition-all resize-none"
                />
              </div>
            ))}
          </div>

          {trError && (
            <div className="flex items-center gap-2 text-[12px] font-semibold text-alert bg-alert/10 border border-alert/20 rounded-xl py-2.5 px-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              {trError}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={trSending}
            className="gradient-btn animate-pulse-glow w-full text-white font-bold py-4 rounded-2xl text-[15px] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {trSending ? (
              <><div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /><span>Sending...</span></>
            ) : (
              'Send Questions'
            )}
          </button>
        </div>
      </div>
    );
  };

  // ==================== MAIN ====================

  return (
    <div className="max-w-md mx-auto min-h-screen bg-navy flex flex-col border-x border-border shadow-[0_0_80px_rgba(123,97,245,0.05)] relative">
      <TwinklingStars />

      <main className="flex-1 px-5 py-6">
        {screen === Screen.LANDING && renderLanding()}
        {screen === Screen.SCANNING && renderScanning()}
        {screen === Screen.RESULTS && renderResults()}
        {screen === Screen.CHECKOUT && renderCheckout()}
        {screen === Screen.THANKS && renderThanks()}
        {screen === Screen.THANKS_TR && renderThanksTR()}
        {screen === Screen.READING && renderReading()}
      </main>

      {/* Footer */}
      <footer className="px-5 pb-6 pt-4 space-y-4">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <p className="text-center text-[10px] text-text-muted/40 font-semibold tracking-widest uppercase">
          © 2026 Tarot Reveal
        </p>
      </footer>

    </div>
  );
};

export default App;
