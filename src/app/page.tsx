'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { sendGTMEvent } from '@next/third-parties/google';

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}
import {
  CheckCircle2, 
  ChevronDown, 
  X, 
  BookOpen, 
  Award, 
  Users2, 
  Building2, 
  TrendingUp, 
  ShieldCheck, 
  Lock, 
  Download, 
  Globe2,
  Layers,
  Clock,
  BarChart3,
  PieChart,
  ShieldAlert,
  Coins,
  Landmark,
  Handshake,
  LineChart,
  Smartphone,
  FileText
} from 'lucide-react';

const SYLLABUS_DOWNLOAD_PATH = '/api/syllabus';

const triggerSyllabusDownload = () => {
  const link = document.createElement('a');
  link.href = SYLLABUS_DOWNLOAD_PATH;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Modal Component
const CounsellingModal = ({ 
  isOpen, 
  onClose, 
  initialPhone = '', 
  initialName = '',
  initialStep = 1,
  shouldDownloadSyllabus = false,
}: { 
  isOpen: boolean; 
  onClose: () => void;
  initialPhone?: string;
  initialName?: string;
  initialStep?: number;
  shouldDownloadSyllabus?: boolean;
}) => {
  const [step, setStep] = useState(initialStep);
  const [phone, setPhone] = useState(initialPhone);
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState('');
  const [experience, setExperience] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [finalStepError, setFinalStepError] = useState('');
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  // Sync state when modal opens with new props
  React.useEffect(() => {
    if (isOpen) {
      setStep(initialStep);
      setPhone(initialPhone);
      setName(initialName);
      setEmail('');
      setExperience('');
      setIsSubmitted(false);
      setIsLoading(false);
      setFinalStepError('');
    }
  }, [isOpen, initialPhone, initialName, initialStep]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-[420px] bg-white rounded-[32px] shadow-2xl overflow-hidden p-6 sm:p-10 animate-fade-in duration-200">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition p-2"
        >
          <X className="w-6 h-6" />
        </button>

        {isSubmitted ? (
          <div className="py-12 text-center animate-scale-in">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-brand-primary font-heading leading-tight mb-4 tracking-tight">
              Thank you for your interest
            </h2>
            <p className="text-gray-500 text-base sm:text-lg font-medium font-sans">
              Our team will get in touch with you shortly
            </p>
            <button 
              onClick={onClose}
              className="mt-10 px-8 py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-dark transition-all"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="mb-8 mt-4 sm:mt-0">
              <h2 className="text-2xl sm:text-[28px] font-bold text-brand-primary font-heading leading-tight mb-2 tracking-tight">MBA in Finance & Accounting</h2>
              <p className="text-gray-500 text-sm sm:text-base font-sans">Connect with our career counselor for program details and fee structure</p>
            </div>

            {step === 1 ? (
              <div id="modal-form" className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-brand-primary mb-3 uppercase tracking-wider font-heading">Phone Number</label>
                  <div className="flex border-2 border-gray-100 bg-gray-50 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-primary focus-within:border-brand-primary focus-within:bg-white transition-all">
                    <div className="bg-gray-100 px-4 py-4 border-r border-gray-200 text-gray-600 font-bold font-heading">
                      +91
                    </div>
                    <input 
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="98765 43210"
                      className="flex-1 px-4 py-4 outline-none text-lg tracking-widest bg-transparent placeholder:text-gray-300 font-medium font-sans"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-primary mb-2 uppercase tracking-wider font-heading">Full Name</label>
                  <input 
                    id="name"
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe" 
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:bg-white outline-none transition font-medium font-sans" 
                  />
                </div>

                <button 
                  onClick={async () => {
                    if (name.trim().length === 0 || phone.length !== 10 || isLoading) return;

                    setIsLoading(true);
                    try {
                      fetch('/api/lead', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        keepalive: true,
                        body: JSON.stringify({ name, phone, stage: 'initial' })
                      }).catch((err) => {
                        console.error('Initial submission error:', err);
                      });
                    } catch (err) {
                      console.error('Initial submission error:', err);
                    } finally {
                      setIsLoading(false);
                      setStep(2);
                    }
                  }}
                  disabled={name.trim().length === 0 || phone.length !== 10 || isLoading}
                  className="w-full bg-brand-secondary text-white py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-base sm:text-lg shadow-xl hover:shadow-2xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale uppercase tracking-tight font-heading"
                >
                  {isLoading ? 'Processing...' : 'Continue'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-brand-primary mb-2 uppercase tracking-wider font-heading">Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (finalStepError) setFinalStepError('');
                    }}
                    placeholder="john@example.com" 
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:bg-white outline-none transition font-medium font-sans" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-primary mb-2 uppercase tracking-wider font-heading">Select Experience</label>
                  <select 
                    value={experience}
                    onChange={(e) => {
                      setExperience(e.target.value);
                      if (finalStepError) setFinalStepError('');
                    }}
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:bg-white outline-none transition font-medium appearance-none font-sans"
                  >
                    <option value="" disabled>Select experience</option>
                    <option>Graduate and Above - No Experience</option>
                    <option>0-1 Yr</option>
                    <option>2-5 Yrs</option>
                    <option>5+ Yrs</option>
                  </select>
                </div>
                <button 
                  onClick={() => {
                    const experienceValue = experience.trim();

                    if (!isEmailValid && !experienceValue) {
                      setFinalStepError('Fill the email and select experience.');
                      return;
                    }

                    if (!isEmailValid) {
                      setFinalStepError('Fill the email.');
                      return;
                    }

                    if (!experienceValue) {
                      setFinalStepError('Select experience.');
                      return;
                    }

                    if (isLoading) return;

                    setFinalStepError('');
                    setIsLoading(true);
                    const siteKey = process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHE_SITE_KEY;
                    
                    const submitData = async (token?: string) => {
                      try {
                        await fetch('/api/lead', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          keepalive: true,
                          body: JSON.stringify({ name, email, phone, experience, token, stage: 'final' })
                        });
                        
                        sendGTMEvent({ 
                          event: 'form_submit', 
                          form_name: 'counselling_modal',
                          recaptcha_token: token 
                        });
                        if (shouldDownloadSyllabus) {
                          triggerSyllabusDownload();
                          onClose();
                          return;
                        }
                        setIsSubmitted(true);
                      } catch (err) {
                        console.error('Submission error:', err);
                        // Still show success to user
                        if (shouldDownloadSyllabus) {
                          triggerSyllabusDownload();
                          onClose();
                          return;
                        }
                        setIsSubmitted(true);
                      } finally {
                        setIsLoading(false);
                      }
                    };

                    const grecaptcha = window.grecaptcha;

                    if (grecaptcha && siteKey) {
                      grecaptcha.ready(() => {
                        grecaptcha.execute(siteKey, { action: 'submit' })
                          .then((token: string) => submitData(token))
                          .catch((err: unknown) => {
                            console.error('reCAPTCHA error:', err);
                            submitData();
                          });
                      });
                    } else {
                      submitData();
                    }
                  }}
                  disabled={isLoading}
                  className="w-full bg-brand-secondary text-white py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-base sm:text-lg shadow-xl hover:bg-sky-400 transition-all mt-4 uppercase tracking-tight font-heading disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                       <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                       <span>Processing...</span>
                    </div>
                  ) : "Register Now"}
                </button>
                {finalStepError ? (
                  <p className="text-sm font-medium text-red-600 text-center">{finalStepError}</p>
                ) : null}
              </div>
            )}

            <div className="mt-8 flex items-center justify-center space-x-2 text-gray-400 text-[11px] font-bold uppercase tracking-widest font-heading">
              <Lock className="w-3.5 h-3.5" />
              <span>Encrypted Submission</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Navbar
const Navbar = ({ onOpenModal }: { onOpenModal: () => void }) => {
  const phoneNumber = "919061277777";
  const message = "I’m interested in Yenepoya MBA, need more details.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 sm:h-24">
          {/* Left Side: Logos */}
          <div className="flex items-center space-x-2 sm:space-x-5 min-w-0">
            <Image
              src="/favicon.svg"
              alt="Yenepoya University logo"
              width={170}
              height={48}
              className="h-10 sm:h-12 w-auto shrink-0"
              priority
            />
          </div>

          {/* Right Side CTA */}
          <div className="flex items-center space-x-3 sm:space-x-6 ml-2 sm:ml-4 shrink-0 font-heading">
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-md hover:scale-110 hover:shadow-lg transition-all duration-300 flex items-center justify-center shrink-0"
              aria-label="Chat on WhatsApp"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 sm:w-6 h-6">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
            <button 
              onClick={() => {
                sendGTMEvent({ event: 'button_click', button_name: 'navbar_apply_now' });
                onOpenModal();
              }}
              className="bg-brand-secondary text-white px-5 sm:px-10 py-2.5 sm:py-4 rounded-xl sm:rounded-2xl font-black shadow-lg hover:shadow-xl hover:bg-sky-400 active:scale-95 transition-all flex items-center justify-center border-b-4 border-sky-600/20 tracking-tight text-[10px] sm:text-sm font-heading"
            >
              Apply now
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const DeadlineTimer = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  React.useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const nextSunday = new Date();
      nextSunday.setDate(now.getDate() + (7 - now.getDay()) % 7);
      if (now.getDay() === 0 && now.getHours() >= 23 && now.getMinutes() >= 59) {
        nextSunday.setDate(nextSunday.getDate() + 7);
      }
      nextSunday.setHours(23, 59, 59, 999);

      const difference = nextSunday.getTime() - now.getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-3 text-white/80 font-heading">
      <Clock className="w-4 h-4 text-brand-secondary" />
      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">Application deadline:</span>
      <div className="flex gap-2 text-xs sm:text-sm font-black text-white tracking-tighter">
        <span className="bg-white/10 px-2 py-1 rounded-lg tabular-nums">{timeLeft.days}d</span>
        <span className="bg-white/10 px-2 py-1 rounded-lg tabular-nums">{timeLeft.hours}h</span>
        <span className="bg-white/10 px-2 py-1 rounded-lg tabular-nums">{timeLeft.minutes}m</span>
        <span className="bg-white/10 px-2 py-1 rounded-lg tabular-nums">{timeLeft.seconds}s</span>
      </div>
    </div>
  );
};

const Hero = ({ onOpenModal, onOpenDownloadModal }: { onOpenModal: () => void; onOpenDownloadModal: () => void }) => (
  <section className="pt-24 pb-12 md:pt-40 md:pb-20 bg-brand-primary hex-pattern relative overflow-hidden">
    <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10 flex justify-center">
      <div className="w-full max-w-4xl flex flex-col items-start">
        {/* Badge */}
        <div className="inline-flex items-center space-x-3 py-2 px-5 bg-brand-dark/40 border border-white/30 rounded-full mb-8 shadow-2xl backdrop-blur-sm font-heading">
          <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,1)] animate-pulse"></div>
          <span className="text-white font-black text-[10px] sm:text-xs uppercase tracking-widest font-heading">
            Admissions open 2026
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-6 tracking-tight font-heading text-left">
          Master business with <br className="hidden sm:block"/>
          a global <span className="text-white underline decoration-white/30 underline-offset-[8px]">MBA in Finance and accounting</span>.
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-white mb-10 leading-relaxed max-w-2xl text-left font-medium font-sans">
          Join an industry-integrated online MBA in Finance and accounting by <b>Yenepoya University</b>.
        </p>
        
        {/* Key Features Requested */}
        <div className="flex flex-col space-y-4 mb-12 items-start font-sans">
          {[
            "UGC category-I university degree",
            "Industry-integrated training modules",
            "100% Placement support & career mentoring"
          ].map((feature, i) => (
            <div key={i} className="flex items-start space-x-3 text-white font-bold text-sm sm:text-base md:text-lg">
              <div className="bg-white rounded-full p-0.5 shrink-0 mt-1">
                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-brand-primary" />
              </div>
              <span className="text-left leading-tight">{feature}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-start font-heading w-full sm:w-auto">
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => {
                sendGTMEvent({ event: 'button_click', button_name: 'hero_speak_to_counselor' });
                onOpenModal();
              }}
              className="flex items-center justify-center bg-brand-secondary text-white px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-black text-sm sm:text-lg hover:bg-sky-400 transition-all shadow-2xl shadow-sky-500/20 active:scale-[0.98] whitespace-nowrap tracking-tighter font-heading"
            >
              Speak to counselor
            </button>
            <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest text-center">Connect with experts</span>
          </div>
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => {
                sendGTMEvent({ event: 'button_click', button_name: 'hero_download_syllabus' });
                onOpenDownloadModal();
              }}
              className="flex items-center justify-center bg-white/10 text-white border-2 border-white/20 px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-black text-sm sm:text-lg hover:bg-white/20 transition-all active:scale-[0.98] whitespace-nowrap tracking-tighter backdrop-blur-sm font-heading"
            >
              Download detailed syllabus
            </button>
            <div className="flex justify-center">
              <DeadlineTimer />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Accreditations = () => (
  <section className="py-8 sm:py-12 bg-white border-b border-gray-100 overflow-hidden">
    <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading relative inline-block">
          Ranks and accreditations
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-brand-secondary rounded-full"></div>
        </h2>
      </div>
      {/* Mobile Auto-scroll Container */}
      <div className="relative w-full overflow-hidden">
        <div className="flex sm:flex-wrap items-center justify-start sm:justify-center gap-6 sm:gap-12 animate-marquee sm:animate-none whitespace-nowrap sm:whitespace-normal">
          {[
            { name: "NAAC A+", desc: "Accredited", img: "/naac.webp" },
            { name: "UGC", desc: "Entitled", img: "/ugc.webp" },
            { name: "NIRF", desc: "95th Ranked", img: "/nirf.webp" },
            { name: "THE", desc: "301-400 Band", img: "/the.png" },
            { name: "KSURF", desc: "3 Stars", img: "/ksurf.webp" }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center group shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 mb-2 group-hover:border-brand-primary transition-colors shadow-sm overflow-hidden p-2 sm:p-3 relative">
                <Image 
                  src={item.img} 
                  alt={item.name}
                  fill
                  className="object-contain p-2 sm:p-3 group-hover:scale-110 transition duration-300"
                />
              </div>
              <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center whitespace-normal max-w-[80px]">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const Stats = () => (
  <section className="py-8 sm:py-14 bg-white border-b border-gray-100 relative overflow-hidden">
    <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 items-stretch">
        {[
          { label: 'UGC entitled', value: 'Category-I' },
          { label: 'Yenepoya network', value: 'Global reach' },
          { label: 'Academic excellence', value: 'Industry led' },
          { label: 'Career support', value: '100% Placement' }
        ].map((stat, i) => (
          <div key={i} className="group h-full min-h-[190px] sm:min-h-[210px] bg-white border border-gray-100 rounded-2xl sm:rounded-[2rem] px-6 py-7 sm:px-7 sm:py-8 text-center shadow-sm hover:shadow-md transition duration-300 flex flex-col items-center justify-center">
            <div className="text-[2.1rem] sm:text-[2.55rem] font-semibold text-slate-900 mb-4 tracking-[-0.04em] font-heading leading-[1.12] max-w-[11ch]">
              {stat.value}
            </div>
            <div className="text-slate-500 font-medium text-xs sm:text-[13px] tracking-[0.08em] uppercase leading-snug">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const ProgramHighlights = () => {
  const highlights = [
    { title: "Corporate Finance", desc: "In-depth coverage of investment management, financial markets, and derivatives.", icon: <Building2 className="w-7 h-7 text-brand-secondary" /> },
    { title: "Financial Modeling", desc: "Hands-on training in valuations and data analysis using Excel and financial software.", icon: <TrendingUp className="w-7 h-7 text-brand-secondary" /> },
    { title: "Portfolio Management", desc: "Focus on financial instruments, market risk mitigation, and capital allocation.", icon: <ShieldCheck className="w-7 h-7 text-brand-secondary" /> },
    { title: "Global Perspective", desc: "Expertise in cross-border investments, financial regulations, and market operations.", icon: <Globe2 className="w-7 h-7 text-brand-secondary" /> },
  ];

  return (
    <section className="py-12 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 tracking-tight font-heading relative inline-block">
            Program Highlights
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-brand-secondary rounded-full"></div>
          </h2>
        </div>
        <div className="flex overflow-x-auto pb-8 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 snap-x snap-mandatory scrollbar-hide px-1">
          {highlights.map((item, idx) => (
            <div key={idx} className="group p-8 rounded-3xl bg-gray-50 hover:bg-white border border-transparent hover:border-brand-secondary/20 hover:shadow-2xl transition-all duration-500 shrink-0 w-[85%] sm:w-auto snap-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-secondary/5 rounded-bl-full transform translate-x-8 -translate-y-8 group-hover:translate-x-4 group-hover:-translate-y-4 transition-transform duration-500"></div>
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 transform group-hover:scale-110 transition duration-500">
                {item.icon}
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight font-heading">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium font-sans">{item.desc}</p>
            </div>
          ))}
          {/* Peeking card indicator for mobile */}
          <div className="sm:hidden shrink-0 w-[5%]"></div>
        </div>
      </div>
    </section>
  );
};

const Features = () => {
  return (
    <section className="py-12 sm:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 tracking-tight font-heading relative inline-block">
            The Yenepoya Advantage
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-brand-secondary rounded-full"></div>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {[
            { 
              icon: <Award className="w-7 h-7 text-brand-secondary" />,
              title: "University Approved Curriculum",
              desc: "MBA degree awarded by Yenepoya (Deemed to be University), Category-I by UGC."
            },
            { 
              icon: <Layers className="w-7 h-7 text-brand-secondary" />,
              title: "Professional Integration",
              desc: "Gain easy access to merge your degree with premier professional courses like MBA+ CPA through Lakshya’s specialized ecosystem."
            },
            { 
              icon: <Users2 className="w-7 h-7 text-brand-secondary" />,
              title: "Industry Expert Faculty",
              desc: "Learn from C-suite executives and senior corporate leaders."
            },
            { 
              icon: <Building2 className="w-7 h-7 text-brand-secondary" />,
              title: "Premier Placement Cell",
              desc: "Leverage Lakshya's robust placement network with over 190+ MNCs recruiting regularly."
            }
          ].map((item, idx) => (
            <div key={idx} className="flex gap-6 group">
              <div className="flex-shrink-0 w-1 bg-brand-secondary rounded-full group-hover:w-2 transition-all duration-300"></div>
              <div>
                <h4 className="text-xl font-black text-slate-900 mb-2 tracking-tight font-heading">{item.title}</h4>
                <p className="text-gray-500 leading-relaxed text-sm font-medium font-sans">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Curriculum = ({ onOpenDownloadModal }: { onOpenDownloadModal: () => void }) => {
  const [activeSem, setActiveSem] = useState<1 | 2 | 3 | 4>(1);
  const semData = {
    1: ["Management concepts", "Organizational behavior", "Business environment", "Managerial economics", "Accounting for managers", "Business communication"],
    2: ["Marketing management", "Human resource management", "Financial management", "Operations management", "Business research methods", "Business law"],
    3: ["Strategic management", "Investment management", "Financial markets", "Derivatives & risk", "Banking & insurance", "Taxation"],
    4: ["International finance", "Corporate restructuring", "Project management", "Business ethics", "Digital transformation", "Final project"]
  } as const;

  return (
    <section id="curriculum-section" className="py-8 sm:py-16 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mb-4 tracking-tight font-heading relative inline-block">
            MBA in Finance & accounting structure
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-brand-secondary rounded-full"></div>
          </h2>
        </div>

        <div className="flex overflow-x-auto pb-4 sm:pb-0 sm:justify-center gap-2 mb-8 scrollbar-hide px-2 font-heading">
          {[1, 2, 3, 4].map((sem) => (
            <button 
              key={sem}
              onClick={() => setActiveSem(sem as 1|2|3|4)}
              className={`flex-shrink-0 min-w-[100px] px-4 py-3 rounded-xl font-black transition-all border-2 text-[10px] uppercase tracking-widest ${activeSem === sem ? 'bg-brand-primary text-white border-brand-primary shadow-lg scale-105' : 'bg-white text-gray-400 border-gray-100 hover:border-brand-primary hover:text-brand-primary'}`}
            >
              Sem {sem}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 max-w-5xl mx-auto px-2 font-heading mb-10">
          {semData[activeSem].map((course, idx) => (
            <div key={idx} className="p-2.5 sm:p-4 bg-white border border-gray-100 rounded-xl flex items-center gap-2 sm:gap-4 hover:shadow-md hover:border-brand-secondary/20 transition-all duration-300 group cursor-pointer">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-brand-primary transition duration-300">
                <BookOpen className="text-brand-primary w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:text-white transition duration-300" />
              </div>
              <span className="text-[11px] sm:text-sm font-bold text-slate-900 tracking-tight leading-tight">{course}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-2">
          <button 
            onClick={() => {
              sendGTMEvent({ event: 'button_click', button_name: 'curriculum_download_syllabus' });
              onOpenDownloadModal();
            }}
            className="flex items-center justify-center bg-brand-secondary text-white px-8 sm:px-12 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-base sm:text-lg hover:bg-sky-400 transition-all shadow-xl shadow-sky-500/20 active:scale-[0.98] tracking-tight font-heading group"
          >
            <Download className="mr-2 sm:mr-3 w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-y-1 transition-transform" />
            Download detailed syllabus
          </button>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Get full curriculum PDF</span>
        </div>
      </div>
    </section>
  );
};

const FeeStructure = ({ onOpenModal }: { onOpenModal: () => void }) => (
  <section className="py-10 sm:py-14 bg-white relative overflow-hidden">
    <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] items-center gap-8 sm:gap-10 lg:gap-12">
        <div className="text-center lg:text-left max-w-xl lg:max-w-[520px] mx-auto lg:mx-0">
          <h2 className="text-3xl sm:text-4xl lg:text-[3rem] font-black text-slate-900 mb-5 tracking-tight font-heading relative inline-block">
            Fee Structure
            <div className="absolute -bottom-2 left-0 w-12 h-1 bg-brand-secondary rounded-full"></div>
          </h2>
          <p className="text-slate-500 text-base sm:text-lg font-medium font-sans leading-[1.65] max-w-[500px] lg:max-w-none">
            A globally recognized MBA in Finance and Accounting that accelerates your career at a fee designed to deliver maximum value.
          </p>
        </div>

        <div className="w-full max-w-sm mx-auto lg:mx-0 lg:justify-self-end">
          <div className="bg-white rounded-[2rem] shadow-[0_24px_70px_rgba(148,163,184,0.2)] border border-sky-100 overflow-hidden group hover:border-brand-secondary/30 transition-all duration-500">
            <div className="p-7 sm:p-8 text-center">
              <div className="inline-flex items-center justify-center px-5 py-2.5 bg-brand-primary/10 rounded-full text-brand-primary font-black text-[11px] tracking-[0.14em] mb-6">
                Total Program Fee
              </div>
              <div className="flex items-start justify-center mb-3">
                <span className="text-[30px] font-black text-slate-900 mr-2 mt-2">₹</span>
                <span className="text-6xl sm:text-[4.25rem] font-black text-slate-900 tracking-[-0.05em] leading-none">56,000</span>
              </div>
              <p className="text-slate-400 font-bold tracking-[0.14em] text-xs sm:text-[13px] mb-2 uppercase">Tuition Fee, Exam Fee</p>
              <p className="text-slate-400 text-[11px] mb-6 italic">*Terms & Conditions Apply</p>
               
              <button 
                onClick={() => {
                  sendGTMEvent({ event: 'button_click', button_name: 'fee_speak_to_counselor' });
                  onOpenModal();
                }}
                className="w-full px-8 sm:px-10 py-4 bg-brand-secondary text-white rounded-2xl font-black text-base sm:text-lg hover:bg-sky-400 transition-all shadow-2xl shadow-sky-500/20 tracking-tight font-heading"
              >
                Speak to counselor
              </button>
              <p className="mt-3 text-[10px] text-slate-400 font-bold uppercase tracking-[0.14em]">Connect with experts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);


const MobileStickyCTA = ({ onOpenModal, onOpenDownloadModal }: { onOpenModal: () => void; onOpenDownloadModal: () => void }) => (
  <div className="md:hidden fixed bottom-0 left-0 right-0 bg-brand-primary border-t border-brand-dark/20 p-3 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.15)]">
    <div className="flex gap-3">
      <button 
        onClick={() => {
          sendGTMEvent({ event: 'button_click', button_name: 'mobile_speak_to_counselor' });
          onOpenModal();
        }}
        className="flex-1 bg-brand-secondary rounded-xl py-2.5 px-2 flex items-center justify-center shadow-lg shadow-sky-500/20 active:scale-95 transition-transform"
      >
        <span className="text-white font-black text-[12px] font-heading tracking-tight">Speak to counselor</span>
      </button>
      <button 
        onClick={() => {
          sendGTMEvent({ event: 'button_click', button_name: 'mobile_download_syllabus' });
          onOpenDownloadModal();
        }}
        className="flex-1 border-2 border-white/40 bg-white/10 rounded-xl py-2.5 px-2 flex items-center justify-center active:scale-95 transition-transform backdrop-blur-sm"
      >
        <span className="text-white font-black text-[12px] font-heading tracking-tight">Download syllabus</span>
      </button>
    </div>
  </div>
);

export default function Home() {
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    phone: '',
    name: '',
    step: 1,
    shouldDownloadSyllabus: false,
  });
  const [placementPhone, setPlacementPhone] = useState('');
  const [placementName, setPlacementName] = useState('');

  const openModal = (phone = '', name = '', step = 1, shouldDownloadSyllabus = false) => {
    setModalConfig({ isOpen: true, phone, name, step, shouldDownloadSyllabus });
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  // Hiring partner logos
  const hiringLogos = [
    { name: 'Amazon', src: '/amazon.webp' },
    { name: 'Barclays', src: '/barclays.webp' },
    { name: 'Citi Bank', src: '/citi bank.webp' },
    { name: 'Deutsche Bank', src: '/deutsche bank.png' },
    { name: 'Goldman Sachs', src: '/Goldman_Sachs.webp' },
    { name: 'Google', src: '/google.webp' },
    { name: 'HSBC', src: '/HSBC.webp' },
    { name: 'JP Morgan', src: '/jp morgan.webp' },
    { name: 'KSurf', src: '/ksurf.webp' },
    { name: 'Morgan Stanley', src: '/Morgan stanley.png' }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-brand-secondary selection:text-white">
      <Navbar onOpenModal={() => openModal()} />
      <main className="flex-grow pb-20 md:pb-0">
        <Hero onOpenModal={() => openModal()} onOpenDownloadModal={() => openModal('', '', 1, true)} />
        <Accreditations />
        <Stats />
        <ProgramHighlights />
        <Features />
        <Curriculum onOpenDownloadModal={() => openModal('', '', 1, true)} />
        <FeeStructure onOpenModal={() => openModal()} />
        
        {/* Career Outcomes & Placement Section */}
        <section className="py-12 sm:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 tracking-tight font-heading relative inline-block">
                Access Elite Career Paths.
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-brand-secondary rounded-full"></div>
              </h2>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              <div className="order-2 lg:order-1 text-center lg:text-left">
                <p className="text-gray-600 text-lg sm:text-xl mb-10 leading-relaxed font-medium font-sans">
                  We bridge the gap between academia and global corporate hubs, preparing you for high-impact roles at top multinational firms.
                </p>
                <div className="grid grid-cols-2 gap-4 sm:gap-6 font-heading max-w-fit lg:max-w-none mx-auto lg:mx-0">
                  {[
                    { text: "Investment Banker", icon: <TrendingUp className="w-5 h-5" /> },
                    { text: "Financial Analyst", icon: <BarChart3 className="w-5 h-5" /> },
                    { text: "Portfolio Manager", icon: <PieChart className="w-5 h-5" /> },
                    { text: "Risk Manager", icon: <ShieldAlert className="w-5 h-5" /> },
                    { text: "Wealth Manager", icon: <Coins className="w-5 h-5" /> },
                    { text: "Corporate Treasurer", icon: <Landmark className="w-5 h-5" /> },
                    { text: "M&A Specialist", icon: <Handshake className="w-5 h-5" /> },
                    { text: "Private Equity Analyst", icon: <LineChart className="w-5 h-5" /> },
                    { text: "Fintech Specialist", icon: <Smartphone className="w-5 h-5" /> },
                    { text: "Tax Consultant", icon: <FileText className="w-5 h-5" /> }
                  ].map((item, i) => (
                    <div key={i} className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-start gap-4 group hover:shadow-xl hover:border-brand-secondary/20 transition-all duration-500">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-brand-primary group-hover:scale-110 transition duration-500 shadow-sm">
                        <div className="text-brand-primary group-hover:text-white transition duration-500">
                          {item.icon}
                        </div>
                      </div>
                      <span className="font-black text-xs sm:text-sm tracking-tight text-left text-slate-900 leading-tight">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="order-1 lg:order-2 flex flex-col items-center">
                <div className="w-full max-w-sm bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100 text-center relative overflow-hidden group">
                  <div className="w-20 h-20 bg-brand-primary/10 rounded-3xl flex items-center justify-center mb-8 mx-auto">
                    <TrendingUp className="w-10 h-10 text-brand-primary" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter font-heading">100% Placement</h3>
                  <p className="text-gray-500 mb-8 font-medium font-sans text-sm">Personalized MBA in finance and accounting career roadmaps and interview preparation with global industry mentors.</p>
                  
                  <div className="w-full mb-4">
                    <div className="flex border-2 border-gray-100 bg-gray-50 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-primary transition-all">
                      <div className="bg-gray-100 px-4 py-3 border-r border-gray-200 text-gray-600 font-bold text-xs flex items-center">
                        +91
                      </div>
                      <input 
                        type="tel"
                        value={placementPhone}
                        onChange={(e) => setPlacementPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="Mobile number"
                        className="flex-1 px-4 py-3 outline-none text-sm bg-transparent placeholder:text-gray-300 font-medium font-sans"
                      />
                    </div>
                  </div>
                  <div className="w-full mb-6">
                    <input 
                      type="text" 
                      value={placementName}
                      onChange={(e) => setPlacementName(e.target.value)}
                      placeholder="Full name" 
                      className="w-full px-4 py-3 border-2 border-gray-100 bg-gray-50 rounded-xl outline-none text-sm focus:ring-2 focus:ring-brand-primary transition-all font-medium font-sans placeholder:text-gray-300" 
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => {
                        const step = (placementPhone.length === 10 && placementName.trim().length > 0) ? 2 : 1;
                        sendGTMEvent({ event: 'button_click', button_name: 'career_speak_to_counselor' });
                        openModal(placementPhone, placementName, step);
                      }} 
                      className="w-full bg-brand-secondary text-white py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-base sm:text-lg hover:bg-sky-400 transition-all font-heading tracking-tight shadow-xl shadow-sky-500/20"
                    >
                      Speak to counselor
                    </button>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Start your journey today</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Hiring Partners Section */}
        <section className="py-12 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 text-center mb-10">
            <h2 className="text-brand-primary font-sans text-lg sm:text-xl font-medium tracking-tight">
              Land careers at the world&apos;s leading professional firms and multinational corporations.
            </h2>
          </div>
          
          <div className="relative w-full overflow-hidden marquee-mask py-4">
            <div className="animate-marquee-fast whitespace-nowrap flex items-center gap-5 sm:gap-10">
               {[...hiringLogos, ...hiringLogos, ...hiringLogos].map((logo, i) => (
                 <div key={`${logo.name}-${i}`} className="inline-flex items-center justify-center px-9 sm:px-16 py-7 sm:py-11 bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.03)] flex-shrink-0 min-w-[200px] sm:min-w-[290px] h-[116px] sm:h-[152px] transition-transform hover:scale-105 duration-300">
                   <Image
                     src={logo.src}
                     alt={`${logo.name} logo`}
                     width={245}
                     height={98}
                     className="max-h-[4.5rem] sm:max-h-[5.5rem] w-auto object-contain"
                   />
                 </div>
               ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 sm:py-24 bg-white">
          <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 mb-4 tracking-tight font-heading relative inline-block">
                FAQ Section
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-brand-secondary rounded-full"></div>
              </h2>
            </div>
            <div className="space-y-6">
              {[
                { q: "Is the online degree program offered by Yenepoya (Deemed-to-be University) UGC entitled?", a: "Yes, the University is entitled by the University Grants Commission (UGC) to offer online degree programs." },
                { q: "Does an online degree hold the same value as a offline degree?", a: "Yes. UGC notifies that online degrees are considered equivalent and holds the same value as offline ones." },
                { q: "Do the Online Degrees have a validity period?", a: "No. The Online Degree that you will receive from Yenepoya (Deemed-to-be University) is valid for lifetime." },
                { q: "What is the mode of learning?", a: "You will have 24*7 access to self-learning material and pre-recorded lectures on our Learning Management System (LMS), which can be accessed on any device." },
                { q: "How many credits does the program have?", a: "80 Credits" },
                { q: "Can I take the examination from anywhere?", a: "Yes, online proctored examinations will be conducted" }
              ].map((faq, i) => (
                <details key={i} className="group bg-gray-50 rounded-3xl border border-transparent p-8 cursor-pointer open:bg-white open:border-brand-secondary/20 open:shadow-2xl transition-all duration-500">
                  <summary className="flex justify-between items-center list-none outline-none font-heading">
                    <span className="text-xl font-black text-slate-900 tracking-tight pr-8">{faq.q}</span>
                    <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center group-open:bg-brand-primary group-open:border-brand-primary transition-colors shadow-sm">
                      <ChevronDown className="w-6 h-6 text-brand-primary group-open:rotate-180 transition-transform duration-500" />
                    </div>
                  </summary>
                  <div className="mt-8 text-gray-500 leading-relaxed font-medium text-lg animate-in fade-in slide-in-from-top-2 duration-500 font-sans">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-brand-footer text-white font-sans">
        <div className="max-w-7xl mx-auto px-5 py-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="bg-white p-4 rounded-xl inline-block">
            <div className="flex items-center space-x-3">
              <div className="flex flex-col leading-none">
                <span className="text-brand-primary font-black text-xl uppercase tracking-tighter">YENEPOYA</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:items-end gap-2 text-sm text-white/60 font-medium">
            <p>© 2026 IIC Lakshya. All Rights Reserved.</p>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>

      <CounsellingModal 
        isOpen={modalConfig.isOpen} 
        onClose={closeModal}
        initialPhone={modalConfig.phone}
        initialName={modalConfig.name}
        initialStep={modalConfig.step}
        shouldDownloadSyllabus={modalConfig.shouldDownloadSyllabus}
      />

      <MobileStickyCTA onOpenModal={() => openModal()} onOpenDownloadModal={() => openModal('', '', 1, true)} />
    </div>
  );
}
