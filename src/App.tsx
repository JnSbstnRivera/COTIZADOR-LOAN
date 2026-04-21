import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sun,
  Moon,
  Battery,
  Calculator,
  ShieldCheck,
  DollarSign,
  Zap,
  CheckCircle2,
  TrendingUp,
  FileText,
  CreditCard,
  Building2,
  ArrowRight,
  Cloud,
  LayoutGrid,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { QuoteInputs } from './types';
import { calculateQuote, pmt } from './utils/calculations';
import { PANEL_PRICES, PANEL_WATTAGE, BATTERY_CAPACITY, WH_RATES, ORIENTAL_DESDE } from './constants';
import { PDFModal, type ClienteData, type ConsultorData } from './components/PDFModal';
import { generateLoanPDF } from './utils/generateLoanPDF';

const LOGO_URL = "https://i.postimg.cc/44pJ0vXw/logo.png";
const WH_LOGO_URL = "https://sales.p.whfinancial.digifi.io/api/branding/logo/b5c3e9d2-b49a-4b0b-8ab3-0486b316dfec-192c3bc4a390192c3bc4a3900010a8c898b-56363bd6-2be5-4f2c-9637-1f1fb609bd6a.jpg";
const ORIENTAL_LOGO_URL = "https://orientalbank.com/themes/orientalbank/images/logo_oriental-bank.png";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [checkRotation, setCheckRotation] = useState(0);
  const [inputs, setInputs] = useState<QuoteInputs>({
    panels: 0,
    batteries: 0,
    extendedSolarWarranty: false,
    extendedBatteryWarranty: false,
    financing: 'WH',
    manualPronto: 0,
  });

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('wh-theme') === 'dark');

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('wh-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('wh-theme', 'light');
    }
  }, [isDarkMode]);

  const results = useMemo(() => calculateQuote(inputs), [inputs]);
  const [pdfModalAbierto, setPdfModalAbierto] = useState(false);

  const loanResumen = {
    paneles:       inputs.panels > 0 ? `${inputs.panels} x QCells Q PEAK DUO BLK ML-G10+ 410` : 'Sin Paneles',
    baterias:      inputs.batteries > 0 ? `${inputs.batteries} x Tesla Powerwall 3` : 'Sin Baterias',
    sistemaKW:     Number((inputs.panels * 410 / 1000).toFixed(2)),
    financiera:    inputs.financing === 'WH' ? 'WH Financial' : 'Oriental Bank',
    pronto:        inputs.manualPronto,
    totalFinanciar: results.valorFinanciado,
    pagos:         results.monthlyPayments,
  };

  const handleGenerateLoanPDF = async (cliente: ClienteData, consultor: ConsultorData) => {
    await generateLoanPDF(cliente, consultor, loanResumen);
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const formatNumber = (val: number) => 
    new Intl.NumberFormat('en-US').format(val);

  const formatPercent = (val: number) => 
    `${(val * 100).toFixed(1)}%`;

  const updateInput = (key: keyof QuoteInputs, value: any) => {
    if (key === 'financing') {
      setCheckRotation(prev => prev + 360);
    }
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] dark:bg-[#0f1215] text-slate-900 dark:text-[#e8eaed] font-sans selection:bg-blue-100 relative overflow-x-hidden">
      {/* High-Impact Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-300/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-blue-500/5 blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] mix-blend-multiply" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Blueprint grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0.5, 0] }}
              transition={{ duration: 2.8, times: [0, 0.08, 0.72, 1], ease: 'easeInOut' }}
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(rgba(148,163,184,0.28) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.28) 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
              }}
            />

            {/* SVG casa + paneles solares */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg
                viewBox="0 0 200 200"
                className="w-72 h-72 md:w-[420px] md:h-[420px]"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <defs>
                  <filter id="line-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="1.8" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Contorno de la casa — blanco brillante */}
                <motion.path
                  d="M40,140 L40,80 L100,30 L160,80 L160,140 Z"
                  stroke="rgba(255,255,255,0.95)"
                  strokeWidth="2.2"
                  filter="url(#line-glow)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 2.4, ease: 'easeInOut', times: [0, 0.15, 0.78, 1] }}
                />

                {/* Paneles solares — naranja Windmar */}
                <motion.path
                  d="M60,80 L140,80 L140,140 L60,140 Z M60,100 L140,100 M60,120 L140,120 M73.3,80 L73.3,140 M86.6,80 L86.6,140 M100,80 L100,140 M113.3,80 L113.3,140 M126.6,80 L126.6,140"
                  stroke="rgba(248,155,36,0.95)"
                  strokeWidth="1.6"
                  filter="url(#line-glow)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
                  transition={{ delay: 0.35, duration: 2.1, ease: 'easeInOut', times: [0, 0.2, 0.78, 1] }}
                />
              </svg>
            </div>

            {/* Golden glow detrás del logo */}
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.42 }}
              transition={{ delay: 0.5, duration: 1.8, ease: 'easeOut' }}
              className="absolute w-[480px] h-[480px] rounded-full blur-[100px] pointer-events-none z-0"
              style={{ background: 'radial-gradient(circle, rgba(250,204,21,0.45) 0%, rgba(249,115,22,0.12) 55%, transparent 75%)' }}
            />

            {/* Logo — cristaliza cuando la casa ya está dibujada */}
            <motion.div
              initial={{ scale: 0.82, opacity: 0, filter: 'blur(16px) brightness(3)' }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px) brightness(1)' }}
              transition={{ delay: 1.1, duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-20"
            >
              <img
                src={LOGO_URL}
                alt="Windmar Home"
                className="w-64 md:w-80 drop-shadow-[0_0_40px_rgba(248,155,36,0.6)]"
                referrerPolicy="no-referrer"
              />
            </motion.div>

            {/* Progress bar + texto */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="absolute bottom-14 z-30 text-center space-y-3 w-full px-8"
            >
              <p className="text-[9px] font-black text-white/50 uppercase tracking-[0.45em]">
                Iniciando Cotizador Profesional LOAN
              </p>
              <div className="w-52 h-[3px] bg-white/10 mx-auto rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.3, duration: 3.3, ease: 'linear' }}
                  className="h-full rounded-full bg-gradient-to-r from-yellow-500 via-[#F89B24] to-orange-400"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Section / Header Integrated */}
      <div className="px-6 pt-6 pb-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <img src={LOGO_URL} alt="Windmar Home" className="h-16 md:h-24" referrerPolicy="no-referrer" />
          <div className="hidden md:block h-10 w-px bg-wh-grey/20" />
          <div className="hidden md:block">
            <h1 className="text-2xl font-black tracking-tighter text-wh-black dark:text-[#e8eaed] uppercase">
              Cotizador Solar Loan
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] transition-colors text-wh-blue">
              Windmar Home Professional
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/10 p-1 pr-3 rounded-full border border-slate-200 dark:border-white/15 shadow-sm">
            <motion.button
              onClick={() => setIsDarkMode(d => !d)}
              animate={{ rotate: isDarkMode ? 360 : 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className={`p-1.5 rounded-full transition-colors duration-500 ${
                isDarkMode
                  ? 'bg-[#F89B24] text-white shadow-[0_0_10px_rgba(248,155,36,0.3)]'
                  : 'bg-[#1D429B] text-white shadow-[0_0_10px_rgba(29,66,155,0.2)]'
              }`}
            >
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            </motion.button>
            <div className="flex flex-col items-start leading-none">
              <span className="text-[8px] font-black text-slate-400 dark:text-white/60 uppercase tracking-tighter">Tema</span>
              <span className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-[#F89B24]' : 'text-[#1D429B]'}`}>
                {isDarkMode ? 'Oscuro' : 'Claro'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="px-6 py-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Inputs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-5 space-y-6"
        >
          {/* Financing Selector - Visual Redesign */}
          <section className="space-y-3">
            <h3 className="text-[10px] font-black text-wh-grey uppercase tracking-[0.2em] ml-1">Institución Financiera</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => updateInput('financing', 'WH')}
                className={`relative p-4 rounded-3xl border-2 transition-all text-left group ${
                  inputs.financing === 'WH' 
                    ? 'border-wh-blue bg-wh-blue/5 shadow-2xl shadow-wh-blue/20 dark:shadow-wh-blue/10 z-20' 
                    : 'border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#161b22] hover:border-slate-300 z-0'
                }`}
              >
                <div className="flex flex-col gap-3 relative z-10">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors overflow-hidden ${
                    inputs.financing === 'WH' ? 'bg-white dark:bg-white/10' : 'bg-slate-100 dark:bg-[#0f1215]'
                  }`}>
                    <img src={WH_LOGO_URL} alt="WH Financial" className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <p className={`text-xs font-black uppercase tracking-tight ${
                      inputs.financing === 'WH' ? 'text-wh-blue' : 'text-wh-black dark:text-[#e8eaed]'
                    }`}>WH Financial</p>
                    <p className="text-[9px] font-bold text-wh-grey mt-0.5">Tasas fijas competitivas</p>
                  </div>
                </div>
                {inputs.financing === 'WH' && (
                  <motion.div 
                    layoutId="active-fin" 
                    animate={{ rotate: checkRotation }}
                    transition={{ 
                      layout: { duration: 0.8, ease: "easeInOut" },
                      rotate: { duration: 0.8, ease: "easeInOut" }
                    }}
                    className="absolute top-3 right-3 z-50"
                  >
                    <CheckCircle2 className="w-5 h-5 text-yellow-400" />
                  </motion.div>
                )}
              </button>

              <button 
                onClick={() => updateInput('financing', 'ORIENTAL')}
                className={`relative p-4 rounded-3xl border-2 transition-all text-left group ${
                  inputs.financing === 'ORIENTAL' 
                    ? 'border-wh-orange bg-wh-orange/5 shadow-2xl shadow-wh-orange/20 dark:shadow-wh-orange/10 z-20' 
                    : 'border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#161b22] hover:border-slate-300 z-0'
                }`}
              >
                <div className="flex flex-col gap-3 relative z-10">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors overflow-hidden ${
                    inputs.financing === 'ORIENTAL' ? 'bg-white dark:bg-white/10' : 'bg-slate-100 dark:bg-[#0f1215]'
                  }`}>
                    <img src={ORIENTAL_LOGO_URL} alt="Oriental Bank" className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <p className={`text-xs font-black uppercase tracking-tight ${
                      inputs.financing === 'ORIENTAL' ? 'text-wh-orange' : 'text-wh-black dark:text-[#e8eaed]'
                    }`}>Oriental Bank</p>
                    <p className="text-[9px] font-bold text-wh-grey mt-0.5">Opciones flexibles</p>
                  </div>
                </div>
                {inputs.financing === 'ORIENTAL' && (
                  <motion.div 
                    layoutId="active-fin" 
                    animate={{ rotate: checkRotation }}
                    transition={{ 
                      layout: { duration: 0.8, ease: "easeInOut" },
                      rotate: { duration: 0.8, ease: "easeInOut" }
                    }}
                    className="absolute top-3 right-3 z-50"
                  >
                    <CheckCircle2 className="w-5 h-5 text-slate-300" />
                  </motion.div>
                )}
              </button>
            </div>
          </section>

          <section className="bg-white dark:bg-[#161b22] rounded-[2rem] border border-slate-200 dark:border-white/[0.08] p-6 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
            {/* Combined Solar & Storage Row */}
            <div className="grid grid-cols-2 gap-6">
              {/* Solar Column */}
              <div className="flex flex-col items-center space-y-4">
                <motion.div 
                  initial="initial"
                  whileHover="hover"
                  className="relative flex flex-col items-center justify-center pt-4"
                >
                  <motion.div
                    variants={{
                      initial: { y: 0, opacity: 0 },
                      hover: { y: -50, opacity: 1 }
                    }}
                    transition={{ duration: 0.4, ease: "backOut" }}
                    className="absolute text-[9px] font-black text-white uppercase tracking-widest whitespace-nowrap px-2 py-0.5 bg-wh-blue rounded-md shadow-lg shadow-wh-blue/20 z-20"
                  >
                    PLACAS QCELLS (410w)
                  </motion.div>
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center relative group/logo">
                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-wh-orange/30 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-wh-orange/30 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-wh-orange/30 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-wh-orange/30 rounded-br-lg" />
                    
                    <img 
                      src="https://www.zonenco.nl/wp-content/uploads/2023/02/Website1024_4.png" 
                      alt="QCELLS" 
                      className="w-16 h-16 object-contain p-2 transition-transform duration-500 group-hover/logo:scale-110" 
                      referrerPolicy="no-referrer" 
                    />
                  </div>
                </motion.div>

                <div className="w-full space-y-3">
                  <InputGroup label="" className="relative z-30">
                    <CustomSelect 
                      value={inputs.panels}
                      options={Object.keys(PANEL_PRICES).map(k => ({ value: Number(k), label: `${k} Placas` }))}
                      onChange={(val) => updateInput('panels', val)}
                    />
                  </InputGroup>

                  {inputs.panels > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full p-1.5 bg-wh-blue/5 rounded-xl border border-wh-blue/10 text-center"
                    >
                      <p className="text-[8px] font-black text-wh-blue uppercase tracking-widest leading-none mb-0.5">Capacidad</p>
                      <p className="text-[10px] font-black text-wh-black dark:text-[#e8eaed]">
                        {formatNumber(inputs.panels * PANEL_WATTAGE)}W
                      </p>
                    </motion.div>
                  )}

                  <Toggle
                    active={inputs.extendedSolarWarranty}
                    onClick={() => updateInput('extendedSolarWarranty', !inputs.extendedSolarWarranty)}
                    subtitle="($0.15/watt)"
                    darkMode={isDarkMode}
                  />
                </div>
              </div>

              {/* Storage Column */}
              <div className="flex flex-col items-center space-y-4">
                <motion.div 
                  initial="initial"
                  whileHover="hover"
                  className="relative flex flex-col items-center justify-center pt-4"
                >
                  <motion.div
                    variants={{
                      initial: { y: 0, opacity: 0 },
                      hover: { y: -50, opacity: 1 }
                    }}
                    transition={{ duration: 0.4, ease: "backOut" }}
                    className="absolute text-[9px] font-black text-white uppercase tracking-widest whitespace-nowrap px-2 py-0.5 bg-wh-orange rounded-md shadow-lg shadow-wh-orange/20 z-20"
                  >
                    TESLA POWER WALL
                  </motion.div>
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center relative group/logo">
                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-wh-blue/30 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-wh-blue/30 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-wh-blue/30 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-wh-blue/30 rounded-br-lg" />

                    <img 
                      src="https://cdn.pixabay.com/photo/2022/08/25/00/32/tesla-logo-7408969_1280.png" 
                      alt="Tesla" 
                      className="w-16 h-16 object-contain p-2 transition-transform duration-500 group-hover/logo:scale-110" 
                      referrerPolicy="no-referrer" 
                    />
                  </div>
                </motion.div>

                <div className="w-full space-y-3">
                  <InputGroup label="" className="relative z-30">
                    <CustomSelect 
                      value={inputs.batteries}
                      options={[0, 1, 2, 3, 4].map(n => ({ value: n, label: n === 0 ? 'Sin Baterías' : `${n} Baterías` }))}
                      onChange={(val) => updateInput('batteries', val)}
                    />
                  </InputGroup>

                  {inputs.batteries > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full p-1.5 bg-wh-blue/5 rounded-xl border border-wh-blue/10 text-center"
                    >
                      <p className="text-[8px] font-black text-wh-blue uppercase tracking-widest leading-none mb-0.5">Capacidad</p>
                      <p className="text-[10px] font-black text-wh-black dark:text-[#e8eaed]">
                        {inputs.batteries * BATTERY_CAPACITY} kWh
                      </p>
                    </motion.div>
                  )}

                  <Toggle
                    active={inputs.extendedBatteryWarranty}
                    onClick={() => updateInput('extendedBatteryWarranty', !inputs.extendedBatteryWarranty)}
                    subtitle="($3k x bat)"
                    darkMode={isDarkMode}
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-white/[0.06]" />

            {/* Down Payment */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                  <DollarSign className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-black text-wh-black dark:text-[#e8eaed] uppercase tracking-tight">Inversión Inicial</h3>
              </div>
              
              <InputGroup label="Pronto Pago ($)">
                <input 
                  type="number"
                  value={inputs.manualPronto || ''}
                  onChange={(e) => updateInput('manualPronto', Number(e.target.value))}
                  className="w-full bg-transparent text-xs font-bold outline-none"
                  placeholder="Ej: 5000"
                />
              </InputGroup>
            </div>
          </section>
        </motion.div>

        {/* Right Column: Results */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-7 space-y-6"
        >
          {/* Monthly Payments */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black uppercase tracking-widest transition-colors text-wh-blue">Opciones de Mensualidad</h3>
              <div className="flex items-center gap-2 text-[10px] font-bold transition-colors text-wh-blue">
                <Building2 className="w-3.5 h-3.5" />
                {inputs.financing === 'WH' ? 'WH Financial' : 'Oriental Bank'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <AnimatePresence mode="popLayout">
                {results.error ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="col-span-full p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-[2rem] flex flex-col items-center text-center space-y-3"
                  >
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-black text-amber-900 dark:text-amber-200 uppercase tracking-tight">Financiamiento No Disponible</h4>
                      <p className="text-xs font-medium text-amber-800 dark:text-amber-300 max-w-md leading-relaxed">
                        {results.error}
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  results.monthlyPayments.map((pay, idx) => (
                    <motion.div
                      key={`${pay.years}-${pay.label}-${idx}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-white/[0.08] rounded-[1.25rem] p-3 transition-all group cursor-default hover:border-wh-blue hover:shadow-xl hover:shadow-wh-blue/20"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-[#0f1215] flex items-center justify-center transition-colors text-yellow-400 group-hover:bg-wh-blue group-hover:text-yellow-400">
                            <Calculator className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-wh-black dark:text-[#e8eaed]">{pay.years} Años ({pay.years * 12} meses)</p>
                            <p className="text-[8px] font-bold uppercase tracking-widest text-wh-blue">
                              {pay.amountMax ? 'Rango Estimado' : (pay.label || 'Tasa Fija')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] font-bold text-wh-grey uppercase">APR</p>
                          <p className="text-[10px] font-black px-1 rounded text-wh-blue bg-yellow-400/20">
                            {pay.amountMax 
                              ? `${(pay.rate * 100).toFixed(2)}% - ${(pay.rateMax! * 100).toFixed(2)}%`
                              : `${(pay.rate * 100).toFixed(2)}%`
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-end justify-between">
                        <div className="flex flex-col">
                          <p className="text-xl font-black tracking-tight text-wh-black dark:text-[#e8eaed]">
                            {pay.amountMax 
                              ? `${formatCurrency(pay.amount)} - ${formatCurrency(pay.amountMax)}`
                              : formatCurrency(pay.amount)
                            }
                            <span className="text-[10px] font-medium text-wh-grey ml-1">/mes</span>
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Details Breakdown */}
          <section className="bg-white dark:bg-[#161b22] rounded-[2rem] border border-slate-200 dark:border-white/[0.08] overflow-hidden">
            <div className="py-3 px-6 border-b-2 flex items-center justify-between transition-colors border-wh-blue bg-wh-blue/5">
              <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-wh-blue">Resumen del Proyecto</h3>
              <div className="flex items-center gap-3">
                {!results.error && (
                  <button
                    onClick={() => setPdfModalAbierto(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a56c4] text-white text-[11px] font-bold hover:bg-[#0d2050] transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Descargar PDF
                  </button>
                )}
                <FileText className="w-4 h-4 text-wh-blue" />
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`space-y-3 transition-opacity ${results.error ? 'opacity-30' : ''}`}>
                  <p className="text-[9px] font-black uppercase tracking-widest transition-colors text-wh-blue">Componentes</p>
                  <div className="space-y-2">
                    <DataRow label="Cantidad de Placas" value={`${inputs.panels} Placas`} financing="WH" />
                    <DataRow label="Cantidad de Baterías" value={`${inputs.batteries} Baterías`} financing="WH" />
                    <DataRow label="Capacidad Total" value={`${formatNumber(results.systemSize)}W`} financing="WH" />
                    <DataRow label="Placas Fotovoltaicas" value={formatCurrency(results.solarValue)} totalValue={results.solarValue} financing="WH" />
                    <DataRow label="Baterías Powerwall" value={formatCurrency(results.batteryValue)} totalValue={results.batteryValue} financing="WH" />
                    <DataRow label="Garantías Extendidas" value={formatCurrency(results.solarWarrantyValue + results.batteryWarrantyValue)} financing="WH" />
                  </div>
                </div>
                <div className={`space-y-3 transition-opacity ${results.error ? 'opacity-30' : ''}`}>
                  <p className="text-[9px] font-black uppercase tracking-widest transition-colors text-wh-blue">Financiamiento</p>
                  <div className="space-y-2">
                    <DataRow label="Institución" value={inputs.financing === 'WH' ? 'WH Financial' : 'Oriental Bank'} financing="WH" />
                    <DataRow label="Pronto Pago" value={`-${formatCurrency(inputs.manualPronto)}`} highlight financing="WH" />
                    <DataRow label="Total a Financiar" value={formatCurrency(results.valorFinanciado)} highlight financing="WH" />
                  </div>
                </div>
              </div>
              {results.error && (
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 p-2 rounded-xl border border-amber-100 dark:border-amber-800/20 flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {results.error}
                  </p>
                </div>
              )}
            </div>
          </section>
        </motion.div>
      </main>

      <PDFModal
        isOpen={pdfModalAbierto}
        onClose={() => setPdfModalAbierto(false)}
        tipo="loan"
        resumen={{
          'Paneles':          loanResumen.paneles,
          'Baterias':         loanResumen.baterias,
          'Sistema':          `${loanResumen.sistemaKW} KW`,
          'Financiera':       loanResumen.financiera,
          'Pronto Pago':      `$${loanResumen.pronto.toLocaleString()}`,
          'Total a Financiar': `$${loanResumen.totalFinanciar.toLocaleString()}`,
        }}
        onGenerate={handleGenerateLoanPDF}
      />

      {/* Footer */}
      <footer className="max-w-[1600px] mx-auto px-6 mt-8 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-slate-200 dark:border-white/[0.08]">
          <div className="flex gap-4">
            <div className="bg-blue-600/10 p-3 rounded-xl h-fit">
              <CreditCard className="text-blue-600" size={24} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-[#e8eaed] text-sm mb-1">Financiamiento Solar</h4>
              <p className="text-slate-600 dark:text-[#a0a4ad] text-xs leading-relaxed">Opciones de préstamo a 5, 7 y 10 años con tasas competitivas para tu sistema solar.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-emerald-600/10 p-3 rounded-xl h-fit">
              <ShieldCheck className="text-emerald-600" size={24} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-[#e8eaed] text-sm mb-1">Garantía Incluida</h4>
              <p className="text-slate-600 dark:text-[#a0a4ad] text-xs leading-relaxed">Protección completa del sistema durante todo el período de financiamiento.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-orange-400/10 p-3 rounded-xl h-fit">
              <TrendingUp className="text-orange-400" size={24} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-[#e8eaed] text-sm mb-1">Ahorro Real</h4>
              <p className="text-slate-600 dark:text-[#a0a4ad] text-xs leading-relaxed">Genera ahorros desde el primer mes y recupera tu inversión en pocos años.</p>
            </div>
          </div>
        </div>
        <div className="text-center pt-8 pb-4">
          <p className="text-[10px] font-black text-slate-400 dark:text-[#6b7280] uppercase tracking-[0.3em]">
            © 2026 Equipo de Análisis y Desarrollo — Call Center Windmar Home
          </p>
        </div>
      </footer>
      </div>
    </div>
  );
}

function CustomSelect({ value, options, onChange, placeholder }: { value: number, options: { value: number, label: string }[], onChange: (val: number) => void, placeholder?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-transparent text-xs font-bold outline-none cursor-pointer text-wh-black dark:text-[#e8eaed]"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-wh-grey transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-30" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-white/[0.08] rounded-2xl shadow-2xl shadow-wh-blue/20 z-50 max-h-48 overflow-y-auto py-2 scrollbar-hide"
            >
              {options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors hover:bg-wh-blue/5 ${
                    value === opt.value ? 'text-wh-blue bg-wh-blue/5 dark:bg-wh-blue/10' : 'text-wh-black dark:text-[#e8eaed]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function InputGroup({ label, children, className = "" }: { label: string, children: React.ReactNode, className?: string }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-xs font-bold text-slate-600 dark:text-[#a0a4ad] ml-1">{label}</label>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-white dark:bg-[#0f1215] border border-slate-300 dark:border-white/[0.08] rounded-xl px-3 py-2.5 shadow-md dark:shadow-none focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all relative"
      >
        {children}
      </motion.div>
    </div>
  );
}

function Toggle({ active, onClick, subtitle, darkMode = false }: { active: boolean, onClick: () => void, subtitle?: string, darkMode?: boolean }) {
  return (
    <motion.div
      initial={false}
      animate={{
        backgroundColor: active ? 'rgba(0, 76, 151, 0.08)' : (darkMode ? 'rgba(22, 27, 34, 0.5)' : 'rgba(241, 245, 249, 0.5)'),
        borderColor: active ? 'rgba(0, 76, 151, 0.2)' : (darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 1)')
      }}
      className="w-full p-2.5 rounded-xl border flex items-center justify-between transition-colors"
    >
      <div className="flex flex-col">
        <span className="text-[10px] font-black text-wh-black dark:text-[#e8eaed] uppercase tracking-tight">GARANTÍA EXTENDIDA</span>
        <AnimatePresence>
          {active && subtitle && (
            <motion.span 
              initial={{ opacity: 0, height: 0, y: -5 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -5 }}
              className="text-[9px] font-black text-wh-blue italic leading-none mt-0.5 overflow-hidden"
            >
              {subtitle}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      
      <motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={onClick}
        className={`w-12 h-6 rounded-full relative transition-colors duration-500 overflow-hidden ${active ? 'bg-wh-blue' : 'bg-slate-200 dark:bg-slate-600'}`}
      >
        <motion.div 
          animate={{ 
            x: active ? 26 : 4,
            rotate: active ? 360 : 0
          }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 30,
            rotate: { duration: 0.6, ease: "easeInOut" }
          }}
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg flex items-center justify-center z-10"
        >
          {active ? (
            <ShieldCheck className="w-3 h-3 text-wh-blue" />
          ) : (
            <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
          )}
        </motion.div>
      </motion.button>
    </motion.div>
  );
}

function DataRow({ label, value, highlight, muted, totalValue, financing }: { label: string, value: string, highlight?: boolean, muted?: boolean, totalValue?: number, financing?: 'WH' | 'ORIENTAL' }) {
  const [isOpen, setIsOpen] = useState(false);
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const baseValue = totalValue ? totalValue / 1.115 : 0;
  const ivuValue = totalValue ? totalValue - baseValue : 0;

  const labelColor = financing === 'WH' ? 'text-wh-blue' : 'text-wh-orange';
  const accentColor = financing === 'WH' ? 'text-wh-blue' : 'text-wh-orange';
  const hoverColor = financing === 'WH' ? 'hover:text-wh-blue' : 'hover:text-wh-orange';

  return (
    <div className={`space-y-1 ${muted ? 'opacity-30' : ''}`}>
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-1">
          <span className={`text-sm font-medium ${labelColor}`}>{label}</span>
          {totalValue !== undefined && (
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className={`p-1 hover:bg-slate-50 dark:hover:bg-white/5 rounded-md transition-colors ${hoverColor}`}
            >
              {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>
        <span className={`text-sm font-bold ${highlight ? (financing === 'WH' ? 'text-wh-blue bg-yellow-400/20 px-2 rounded-lg' : accentColor) : 'text-wh-black dark:text-[#e8eaed]'}`}>{value}</span>
      </div>
      <AnimatePresence>
        {isOpen && totalValue !== undefined && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden pl-4 space-y-1"
          >
            <div className={`flex justify-between text-[11px] font-bold italic ${accentColor}`}>
              <span>Valor sin IVU</span>
              <span>{formatCurrency(baseValue)}</span>
            </div>
            <div className={`flex justify-between text-[11px] font-bold italic ${accentColor}`}>
              <span>IVU (11.5%)</span>
              <span>{formatCurrency(ivuValue)}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
