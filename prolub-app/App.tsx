import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, User, LogOut, CheckCircle, Trophy, Flag, MapPin, Truck, Phone, Package, Menu, X, Settings, Hash, CircleDot, ClipboardList, Building2, Shirt, Medal, Sparkles, Gauge, Calendar, Activity, ChevronRight, Speaker, Users, Download, Share2, ZoomIn, ArrowLeft, ArrowRight, FileText, Filter, ArrowDownUp } from 'lucide-react';
import { Client, Reward, OrderDetails, CartItem, OrderLog } from './types';
import { getDatabase, getPoints, deductPoints, addOrder } from './services/db';
import { sendOrderToGoogleSheet } from './services/googleSheets';
import { AdminPanel } from './components/AdminPanel';
import html2canvas from 'html2canvas';
import { jsPDF } from "jspdf";
import emailjs from '@emailjs/browser';

type ViewState = 'login' | 'store' | 'checkout' | 'success' | 'admin' | 'profile';

interface RewardCardProps {
  reward: Reward;
  currentUser: Client;
  currentPoints: number;
  onAddToCart: (reward: Reward, qty: number) => void;
  onViewDetails: (reward: Reward) => void;
}

interface ProductModalProps {
    reward: Reward | null;
    currentUser: Client | null;
    currentPoints: number;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (reward: Reward, qty: number) => void;
}

// --- Visual Components ---

const StadiumAtmosphere = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
    {/* Crowd Silhouette (CSS Gradient) */}
    <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#001030] to-transparent opacity-80 z-10"></div>
    
    {/* Pitch Perspective Lines */}
    <div className="absolute bottom-[-50%] left-[-50%] right-[-50%] h-[100%] z-0 opacity-10"
         style={{
           backgroundImage: `
             linear-gradient(0deg, transparent 24%, rgba(255,255,255,0.3) 25%, rgba(255,255,255,0.3) 26%, transparent 27%, transparent 74%, rgba(255,255,255,0.3) 75%, rgba(255,255,255,0.3) 76%, transparent 77%),
             linear-gradient(90deg, transparent 24%, rgba(255,255,255,0.3) 25%, rgba(255,255,255,0.3) 26%, transparent 27%, transparent 74%, rgba(255,255,255,0.3) 75%, rgba(255,255,255,0.3) 76%, transparent 77%)
           `,
           backgroundSize: '100px 100px',
           transform: 'perspective(1000px) rotateX(60deg)',
         }}>
    </div>

    {/* Stadium Lights */}
    <div className="absolute top-0 left-1/4 w-32 h-32 bg-white blur-[100px] opacity-40 rounded-full"></div>
    <div className="absolute top-0 right-1/4 w-32 h-32 bg-white blur-[100px] opacity-40 rounded-full"></div>
  </div>
);

const BuntingFlags = () => (
  <div className="absolute top-full left-0 w-full h-4 flex overflow-hidden z-20 pointer-events-none">
     {Array.from({ length: 40 }).map((_, i) => {
        const colors = ['#003594', '#F37121', '#B9D9EB', '#FFFFFF'];
        return (
          <div key={i} className="flex-1 h-full" style={{
             backgroundColor: colors[i % colors.length],
             clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
             margin: '0 2px'
          }}></div>
        );
     })}
  </div>
);

const SoccerBallPattern = ({ className }: { className?: string }) => (
    <svg className={className} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <pattern id="soccer-ball" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="10" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.1"/>
                <path d="M20 10 L29 16 L25 27 L15 27 L11 16 Z" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.1"/>
            </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#soccer-ball)" />
    </svg>
);

// --- Invoice Template Component (Hidden until download) ---
const InvoiceTemplate = React.forwardRef<HTMLDivElement, { 
    currentUser: Client | null, 
    cart: CartItem[], 
    orderDetails: OrderDetails,
    date: string,
    totalPoints: number
}>(({ currentUser, cart, orderDetails, date, totalPoints }, ref) => {
    if (!currentUser) return null;

    return (
        <div ref={ref} className="w-[800px] bg-white p-0 relative overflow-hidden font-body text-gray-800 shadow-none" style={{ minHeight: '1100px' }}>
            {/* Watermark Background */}
            <div className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none">
                <img src="https://upload.wikimedia.org/wikipedia/commons/d/d3/Soccerball.svg" alt="Pattern" className="w-full h-full object-cover opacity-20" />
            </div>
            
            {/* Header Strip */}
            <div className="bg-gradient-to-r from-gulf-blue to-[#001030] h-4 w-full"></div>
            
            {/* Brand Header */}
            <div className="px-12 py-8 flex justify-between items-center border-b-2 border-gulf-orange relative z-10">
                <div className="flex items-center gap-6">
                    <img src="https://i.postimg.cc/yYKJQBj6/Logo-GULF.png" alt="Gulf" className="h-16 object-contain" />
                    <div className="h-12 w-px bg-gray-300"></div>
                    <img src="https://i.postimg.cc/8PGFKD4z/Logo-Prolub-color.png" alt="Prolub" className="h-12 object-contain" />
                </div>
                <div className="text-right">
                    <h1 className="text-4xl font-sports text-gulf-blue uppercase tracking-widest leading-none">
                        COMPROBANTE DE CANJE
                    </h1>
                    <p className="text-gulf-orange text-sm font-bold uppercase tracking-[0.3em]">Mundial 2026 Rewards</p>
                </div>
            </div>

            <div className="px-12 py-8 relative z-10">
                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-12 mb-10">
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <h3 className="text-gulf-blue font-bold uppercase tracking-widest text-sm mb-4 border-b border-gray-200 pb-2 flex items-center gap-2">
                            <User size={16} /> Datos del Jugador (Cliente)
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Razón Social:</span>
                                <span className="font-bold">{currentUser.pointOfSale}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">ID Equipo:</span>
                                <span className="font-mono text-gulf-blue font-bold">{currentUser.businessId}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <h3 className="text-gulf-blue font-bold uppercase tracking-widest text-sm mb-4 border-b border-gray-200 pb-2 flex items-center gap-2">
                            <Truck size={16} /> Logística de Envío
                        </h3>
                        {/* Adjust Text size and wrapping for address to avoid cutoff */}
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-start">
                                <span className="text-gray-500 shrink-0 mr-2">Receptor:</span>
                                <span className="font-bold text-right">{orderDetails.receiver}</span>
                            </div>
                            <div className="flex justify-between items-start">
                                <span className="text-gray-500 shrink-0 mr-2">Ciudad:</span>
                                <span className="text-right">{orderDetails.city}</span>
                            </div>
                            <div className="flex justify-between items-start">
                                <span className="text-gray-500 shrink-0 mr-2">Dirección:</span>
                                <span className="text-right font-medium break-words w-[60%]">{orderDetails.address}</span>
                            </div>
                            <div className="flex justify-between items-start">
                                <span className="text-gray-500 shrink-0 mr-2">Teléfono:</span>
                                <span className="font-mono text-right">{orderDetails.phone}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Date Badge */}
                <div className="flex justify-end mb-4">
                    <div className="inline-flex items-center gap-2 bg-gulf-sky/20 px-4 py-2 rounded-lg border border-gulf-sky/50 text-gulf-blue">
                        <Calendar size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Fecha de Emisión:</span>
                        <span className="font-mono font-bold">{date}</span>
                    </div>
                </div>

                {/* Table */}
                <div className="border border-gray-200 rounded-xl overflow-hidden mb-8 shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="bg-gulf-blue text-white uppercase text-xs tracking-wider">
                            <tr>
                                <th className="px-6 py-4 text-left font-sports text-lg font-normal tracking-wide">Descripción del Premio</th>
                                <th className="px-6 py-4 text-center font-sports text-lg font-normal tracking-wide">Cantidad</th>
                                <th className="px-6 py-4 text-right font-sports text-lg font-normal tracking-wide">Puntos Unit.</th>
                                <th className="px-6 py-4 text-right font-sports text-lg font-normal tracking-wide">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {cart.map((item, idx) => (
                                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                    <td className="px-6 py-4 font-medium text-gray-700">{item.name}</td>
                                    <td className="px-6 py-4 text-center font-mono text-gray-500">{item.quantity}</td>
                                    <td className="px-6 py-4 text-right font-mono text-gray-500">{item.appliedPrice.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right font-bold font-mono text-gulf-blue">{(item.appliedPrice * item.quantity).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-50 border-t-2 border-gulf-orange">
                            <tr>
                                <td colSpan={3} className="px-6 py-4 text-right text-sm font-bold uppercase tracking-widest text-gray-500">Total Puntos Canjeados</td>
                                <td className="px-6 py-4 text-right text-3xl font-sports text-gulf-orange leading-none">{totalPoints.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Footer Notes */}
                <div className="mt-12 border-t border-gray-200 pt-6 text-center">
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Este documento es un comprobante oficial de redención de puntos.</p>
                    <p className="text-xs text-gray-400">Gracias por ser parte del equipo Prolub Gulf. ¡Vamos por más victorias!</p>
                </div>

                {/* Signature Fake */}
                <div className="mt-16 flex justify-between px-12">
                     <div className="text-center">
                         <div className="w-48 h-px bg-gray-300 mb-2"></div>
                         <p className="text-[10px] text-gray-400 uppercase">Firma Autorizada Prolub</p>
                     </div>
                     <div className="text-center">
                         <img src="https://i.postimg.cc/yYKJQBj6/Logo-GULF.png" alt="Stamp" className="w-24 opacity-20 rotate-12 -mt-10 mx-auto" />
                     </div>
                </div>
            </div>
            
            {/* Bottom Color Bar */}
            <div className="absolute bottom-0 left-0 w-full h-2 flex">
                <div className="w-1/3 bg-gulf-blue"></div>
                <div className="w-1/3 bg-gulf-orange"></div>
                <div className="w-1/3 bg-gulf-sky"></div>
            </div>
        </div>
    );
});

const StoreBanner = ({ currentUser, currentPoints }: { currentUser: Client, currentPoints: number }) => {
  return (
    <div className="relative w-full bg-gradient-to-r from-gulf-blue via-[#00205B] to-black overflow-hidden shadow-2xl border-b-4 border-gulf-orange group">
      {/* Background Textures */}
      <StadiumAtmosphere />
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      
      {/* Animated Elements */}
      <div className="absolute -right-20 top-0 w-96 h-96 bg-gulf-orange/20 blur-[100px] rounded-full animate-pulse"></div>
      <div className="absolute -left-20 bottom-0 w-64 h-64 bg-gulf-sky/10 blur-[80px] rounded-full"></div>

      {/* Floating Balls */}
      <img src="https://upload.wikimedia.org/wikipedia/commons/d/d3/Soccerball.svg" alt="" className="absolute top-10 right-[10%] w-32 h-32 opacity-10 animate-[spin_10s_linear_infinite] mix-blend-overlay" />
      <img src="https://upload.wikimedia.org/wikipedia/commons/d/d3/Soccerball.svg" alt="" className="absolute bottom-4 left-[5%] w-16 h-16 opacity-10 animate-bounce mix-blend-overlay" style={{animationDuration: '3s'}} />

      <div className="container mx-auto px-6 py-10 relative z-10">
         <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            
            {/* Left: Branding & Text */}
            <div className="text-center md:text-left flex-1">
               <div className="flex items-center justify-center md:justify-start gap-3 mb-2 animate-in slide-in-from-left duration-700">
                  <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded text-[10px] text-gulf-orange font-bold uppercase tracking-[0.3em] border border-white/10 shadow-sm">
                    Tienda Oficial
                  </span>
                  <div className="flex gap-1">
                     <div className="w-8 h-1 bg-yellow-400 transform -skew-x-12"></div>
                     <div className="w-8 h-1 bg-blue-600 transform -skew-x-12"></div>
                     <div className="w-8 h-1 bg-red-600 transform -skew-x-12"></div>
                  </div>
               </div>

               <h1 className="text-6xl lg:text-7xl font-sports text-white italic transform -skew-x-6 drop-shadow-[0_4px_0_rgba(0,0,0,0.5)] leading-none mb-0">
                  ESTADIO <span className="text-transparent bg-clip-text bg-gradient-to-r from-gulf-orange to-yellow-400">PROLUB GULF</span>
               </h1>
               
               <h2 className="text-2xl font-sports text-white uppercase tracking-widest mt-2 mb-2 drop-shadow-md">
                  {currentUser.pointOfSale}
               </h2>
               
               <p className="text-gulf-sky/80 text-sm font-bold tracking-widest uppercase flex items-center justify-center md:justify-start gap-2">
                  <MapPin size={16} className="text-gulf-orange" />
                  Sede Mundial 2026
               </p>
            </div>

            {/* Right: Scoreboard Widget */}
            <div className="relative transform hover:scale-105 transition-transform duration-300">
               {/* Decorative border frame */}
               <div className="absolute -inset-1 bg-gradient-to-br from-gulf-orange via-yellow-400 to-transparent rounded-2xl opacity-50 blur-sm"></div>
               
               <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-0 overflow-hidden min-w-[300px] shadow-[0_0_30px_rgba(0,0,0,0.5)] relative">
                  {/* Glossy top */}
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
                  
                  <div className="flex items-stretch h-24">
                      {/* Team Logo Section */}
                      <div className="w-24 bg-[#1a1a1a] flex flex-col items-center justify-center border-r border-white/10 p-2">
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-gulf-blue mb-1">
                             <img src="https://i.postimg.cc/yYKJQBj6/Logo-GULF.png" alt="Gulf" className="w-8 object-contain" />
                          </div>
                          <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">JUGADOR</span>
                      </div>

                      {/* Points Section */}
                      <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
                          <span className="text-[10px] text-gulf-orange font-bold uppercase tracking-[0.3em] mb-1">Puntos Disponibles</span>
                          <span className="text-5xl font-mono font-bold text-white tabular-nums tracking-tighter leading-none drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                             {currentPoints.toLocaleString()}
                          </span>
                      </div>
                  </div>
                  
                  {/* Bottom ticker */}
                  <div className="bg-[#111] py-1 px-2 border-t border-white/5 flex justify-between items-center">
                     <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[8px] text-gray-400 uppercase tracking-wider">Mercado Abierto</span>
                     </div>
                     <span className="text-[8px] text-gulf-sky font-mono">{currentUser.businessId}</span>
                  </div>
               </div>
            </div>

         </div>
      </div>
    </div>
  );
};

const SponsorsCarousel = () => {
  const banners = [
    "https://i.postimg.cc/029wN2wp/Identificaciones-genericas-Grandes-80x40-General.png",
    "https://i.postimg.cc/3J3vwJvk/Identificaciones-genericas-Grandes-80x40-HDDO.png",
    "https://i.postimg.cc/15yqz5qV/Identificaciones-genericas-Grandes-80x40-MCO.png",
    "https://i.postimg.cc/QxjTMxT5/Identificaciones-genericas-Grandes-80x40-PCMO.png",
    "https://i.postimg.cc/Y0JMyPty/BANNER.jpg"
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative z-10 w-full mb-8 rounded-xl overflow-hidden shadow-xl border-2 border-white bg-white group">
       {/* Adjusted container to be white and use object-contain for full visibility */}
       <div className="relative w-full aspect-[2.5/1] md:aspect-[4/1]">
          {banners.map((src, index) => (
             <div 
               key={index}
               className={`absolute inset-0 transition-opacity duration-1000 ease-in-out flex items-center justify-center p-4 md:p-8 ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
             >
                <img 
                    src={src} 
                    alt="Promoción Oficial" 
                    className="w-full h-full object-contain drop-shadow-sm" 
                />
             </div>
          ))}
       </div>
       
       <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
          {banners.map((_, idx) => (
             <button
               key={idx}
               onClick={() => setCurrentIndex(idx)}
               className={`w-2 h-2 rounded-full transition-all duration-300 shadow-sm border border-gray-200 ${idx === currentIndex ? 'bg-gulf-orange w-6' : 'bg-gray-300 hover:bg-gray-400'}`}
             />
          ))}
       </div>
       
       <button 
         onClick={() => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)}
         className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-gulf-orange text-gulf-blue hover:text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110 border border-gray-100"
       >
          <ArrowLeft size={20} />
       </button>
       <button 
         onClick={() => setCurrentIndex((prev) => (prev + 1) % banners.length)}
         className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-gulf-orange text-gulf-blue hover:text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110 border border-gray-100"
       >
          <ArrowRight size={20} />
       </button>
    </div>
  );
};

const CelebrationEffect = () => {
  const particles = Array.from({ length: 40 }).map((_, i) => {
    const angle = Math.random() * 360;
    const velocity = 40 + Math.random() * 60;
    const tx = Math.cos((angle * Math.PI) / 180) * velocity;
    const ty = Math.sin((angle * Math.PI) / 180) * velocity;
    
    const colors = ['bg-gulf-orange', 'bg-gulf-blue', 'bg-gulf-sky', 'bg-white'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const shape = Math.random() > 0.5 ? 'rounded-full' : 'rounded-sm';
    
    return { id: i, tx, ty, color, shape };
  });

  return (
    <>
      <style>
        {`
          @keyframes confetti-explode {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
            60% { opacity: 1; }
            100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0.5) rotate(180deg); opacity: 0; }
          }
        `}
      </style>
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
        {particles.map((p) => (
          <div
            key={p.id}
            className={`absolute top-1/2 left-1/2 w-3 h-3 ${p.color} ${p.shape} shadow-sm`}
            style={{
              '--tx': `${p.tx * 2}px`,
              '--ty': `${p.ty * 2}px`,
              animation: `confetti-explode ${0.8 + Math.random() * 0.5}s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </>
  );
};

const LoadingScreen = () => {
  const [textIndex, setTextIndex] = useState(0);
  const loadingTexts = [
    "INYECTANDO POTENCIA...",
    "CALENTANDO MOTORES...",
    "ALINEANDO ESTRATEGIA...",
    "LLENANDO EL TANQUE...",
    "JUGADA EN PROCESO..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-gulf-blue flex flex-col items-center justify-center overflow-hidden">
      <StadiumAtmosphere />
      
      {/* Logos Header */}
      <div className="absolute top-10 left-0 w-full flex justify-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
         <img src="https://i.postimg.cc/yYKJQBj6/Logo-GULF.png" alt="Gulf" className="h-12 object-contain" />
         <div className="w-px h-12 bg-white/20"></div>
         <img src="https://i.postimg.cc/8PGFKD4z/Logo-Prolub-color.png" alt="Prolub" className="h-12 object-contain" />
      </div>

      <style>{`
        @keyframes run-progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        @keyframes roll-ball {
          0% { left: 0%; transform: translate(-50%, -50%) rotate(0deg); }
          100% { left: 100%; transform: translate(-50%, -50%) rotate(720deg); }
        }
        .anim-progress { animation: run-progress 2.5s ease-in-out infinite; }
        .anim-ball { animation: roll-ball 2.5s ease-in-out infinite; }
      `}</style>
      
      <div className="relative z-10 flex flex-col items-center w-full max-w-lg px-8">
         
         {/* Animation Container */}
         <div className="w-full relative h-20 flex items-center mb-6">
             {/* The Track */}
             <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden relative border border-white/5 backdrop-blur-sm">
                {/* Field markings inside bar */}
                <div className="absolute inset-0 opacity-30" style={{backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(255,255,255,0.5) 20px)'}}></div>
                
                {/* Filling Energy */}
                <div className="h-full bg-gradient-to-r from-gulf-orange via-orange-400 to-yellow-400 anim-progress shadow-[0_0_20px_rgba(243,113,33,0.6)]"></div>
             </div>

             {/* The Ball (Leader) */}
             <div className="absolute top-1/2 w-12 h-12 anim-ball z-20">
                 {/* Glow Effect */}
                 <div className="absolute inset-0 bg-gulf-orange blur-lg opacity-60 rounded-full"></div>
                 {/* Actual Ball */}
                 <div className="relative w-full h-full bg-white rounded-full border-2 border-gray-800 shadow-lg overflow-hidden flex items-center justify-center">
                    <SoccerBallPattern className="w-[150%] h-[150%] text-gray-800" />
                 </div>
             </div>
         </div>

         {/* Text Status */}
         <div className="bg-black/20 backdrop-blur-md px-8 py-3 rounded-2xl border border-white/10 shadow-xl">
            <p className="text-white font-sports tracking-[0.2em] text-2xl font-bold animate-pulse text-center min-w-[280px]">
               {loadingTexts[textIndex]}
            </p>
         </div>

         <p className="mt-4 text-gulf-sky/60 text-[10px] uppercase tracking-widest">
            Mundial 2026 Rewards
         </p>
      </div>
    </div>
  );
};

const WhistleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} stroke="none">
     <path d="M6 3C4.34315 3 3 4.34315 3 6V9C3 10.6569 4.34315 12 6 12H7V18C7 19.6569 8.34315 21 10 21C11.6569 21 13 19.6569 13 18V12H15C18.3137 12 21 9.31371 21 6C21 5.30932 20.8255 4.66444 20.5144 4.09631C20.8122 3.82917 21 3.43949 21 3H6ZM9 12V18C9 18.5523 9.44772 19 10 19C10.5523 19 11 18.5523 11 18V12H9ZM19 6C19 8.20914 17.2091 10 15 10H15V6C15 5.56066 14.8698 5.15077 14.6479 4.80829C14.2831 4.29875 13.6845 4 13 4H10H9V3H18.2676C18.7183 3.65584 19 4.39463 19 5.23607V6Z" />
     <circle cx="11" cy="7" r="1.5" className="text-white" fill="white"/>
  </svg>
);

const ProductModal: React.FC<ProductModalProps> = ({ reward, currentUser, currentPoints, isOpen, onClose, onAddToCart }) => {
    const [currentImageIdx, setCurrentImageIdx] = useState(0);
    const [qty, setQty] = useState(1);
    const [isZoomed, setIsZoomed] = useState(false);

    useEffect(() => {
        setCurrentImageIdx(0);
        setQty(1);
        setIsZoomed(false);
    }, [reward]);

    if (!isOpen || !reward || !currentUser) return null;

    const price = currentUser.type === 'Pareto' ? reward.pointsPareto : reward.pointsNormal;
    const canAfford = currentPoints >= price;
    const images = reward.imageUrls && reward.imageUrls.length > 0 
        ? reward.imageUrls 
        : ['https://placehold.co/600x400/003594/FFFFFF?text=Sin+Imagen'];

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIdx((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIdx((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            
            <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl animate-in zoom-in duration-300 flex flex-col md:flex-row overflow-hidden">
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 z-30 bg-black/10 hover:bg-black/20 p-2 rounded-full transition-colors"
                >
                    <X size={24} className="text-gray-700" />
                </button>

                {/* Left: Gallery */}
                <div className="w-full md:w-1/2 bg-gray-100 p-8 flex flex-col items-center justify-center relative select-none">
                     <div 
                        className={`relative w-full aspect-square flex items-center justify-center cursor-zoom-in overflow-hidden rounded-xl bg-white shadow-inner mb-4 group`}
                        onMouseEnter={() => setIsZoomed(true)}
                        onMouseLeave={() => setIsZoomed(false)}
                     >
                        <img 
                            src={images[currentImageIdx]} 
                            alt={reward.name} 
                            className={`max-w-full max-h-full object-contain transition-transform duration-500 origin-center ${isZoomed ? 'scale-150' : 'scale-100'}`} 
                        />

                        {/* Navigation Arrows */}
                        {images.length > 1 && (
                            <>
                                <button 
                                    onClick={prevImage}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-gulf-orange text-gulf-blue hover:text-white p-3 rounded-full shadow-xl transition-all duration-300 z-20 opacity-0 group-hover:opacity-100 transform -translate-x-4 group-hover:translate-x-0 border border-gray-100"
                                    title="Anterior"
                                >
                                    <ArrowLeft size={20} strokeWidth={3} />
                                </button>
                                <button 
                                    onClick={nextImage}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-gulf-orange text-gulf-blue hover:text-white p-3 rounded-full shadow-xl transition-all duration-300 z-20 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 border border-gray-100"
                                    title="Siguiente"
                                >
                                    <ArrowRight size={20} strokeWidth={3} />
                                </button>
                                
                                {/* Counter Badge */}
                                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full z-20 pointer-events-none border border-white/10 shadow-lg">
                                    {currentImageIdx + 1} / {images.length}
                                </div>
                            </>
                        )}
                     </div>

                     {/* Thumbnails */}
                     <div className="flex gap-3 overflow-x-auto pb-2 w-full justify-center px-4">
                        {images.map((img, idx) => (
                            <button 
                                key={idx}
                                onClick={() => setCurrentImageIdx(idx)}
                                className={`w-16 h-16 rounded-lg border-2 overflow-hidden flex-shrink-0 transition-all ${currentImageIdx === idx ? 'border-gulf-orange ring-2 ring-gulf-orange/30 scale-105' : 'border-gray-300 hover:border-gray-400 opacity-60 hover:opacity-100'}`}
                            >
                                <img src={img} alt={`View ${idx}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                     </div>
                </div>

                {/* Right: Info */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col bg-white">
                    <div className="flex items-center gap-2 mb-2">
                        {price > 400 && (
                            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                <Sparkles size={10} /> Crack
                            </span>
                        )}
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl font-sports text-gulf-blue leading-none mb-6 uppercase">
                        {reward.name}
                    </h2>

                    <div className="prose prose-sm text-gray-500 mb-8 leading-relaxed whitespace-pre-line">
                        {reward.description}
                        <br />
                        <span className="italic text-xs text-gray-400">*Imagen de referencia</span>
                    </div>

                    <div className="mt-auto border-t border-gray-100 pt-6">
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Valor Total</p>
                                <div className="flex items-baseline gap-2">
                                    <span className={`text-5xl font-sports ${canAfford ? 'text-gulf-orange' : 'text-gray-400'}`}>
                                        {price * qty}
                                    </span>
                                    <span className="text-sm font-bold text-gray-500">PUNTOS</span>
                                </div>
                            </div>

                            <div className="flex items-center border-2 border-gray-100 rounded-xl overflow-hidden">
                                <button 
                                    onClick={() => setQty(Math.max(1, qty - 1))}
                                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-gulf-blue font-bold text-lg"
                                >-</button>
                                <span className="w-10 text-center font-bold text-lg">{qty}</span>
                                <button 
                                    onClick={() => setQty(qty + 1)}
                                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-gulf-blue font-bold text-lg"
                                >+</button>
                            </div>
                        </div>

                        <button 
                            onClick={() => {
                                onAddToCart(reward, qty);
                                onClose();
                            }}
                            disabled={!canAfford}
                            className={`w-full py-4 rounded-xl font-sports text-2xl tracking-wide shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-3
                                ${canAfford 
                                    ? 'bg-gradient-to-r from-gulf-orange to-orange-600 text-white hover:shadow-orange-500/30' 
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                            `}
                        >
                            <WhistleIcon className="w-6 h-6" />
                            {canAfford ? 'AGREGAR A LA ALINEACIÓN' : 'PUNTOS INSUFICIENTES'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const GamifiedProgressBar = ({ currentPoints }: { currentPoints: number }) => {
  const maxPoints = 2000;
  const percentage = Math.min(100, Math.max(0, (currentPoints / maxPoints) * 100));

  const milestones = [
    { points: 500, label: 'TITULAR' },
    { points: 1000, label: 'CAPITÁN' },
    { points: 1667, label: 'LEYENDA' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gulf-sky/30 p-6 mb-8 relative overflow-hidden group">
      {/* Pitch Texture Background */}
      <div className="absolute inset-0 bg-[#e8f5e9] opacity-30">
         <div className="w-full h-full" style={{
             backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 49px, rgba(0,0,0,0.03) 50px, rgba(0,0,0,0.03) 99px)',
         }}></div>
      </div>
      
      <div className="flex justify-between items-end mb-8 relative z-10">
         <div>
            <h3 className="text-2xl font-sports text-gulf-blue uppercase tracking-wider flex items-center gap-2">
              <Gauge className="text-gulf-orange" />
              <span>Termómetro de Juego</span>
            </h3>
            <p className="text-gray-400 text-xs font-bold mt-1 tracking-wide">
              ACELERA TU PUNTAJE PARA LLEGAR A LA ZONA DE GOL
            </p>
         </div>
         <div className="text-right">
            <span className="text-5xl font-sports text-gulf-blue leading-none">{currentPoints}</span>
            <div className="text-gulf-orange text-[10px] font-bold uppercase tracking-widest -mt-1">Puntos Actuales</div>
         </div>
      </div>

      <div className="relative h-12">
         {/* Field Bar */}
         <div className="absolute inset-0 bg-gray-200 rounded-full border-2 border-white shadow-inner overflow-hidden">
            {/* Grass Pattern in Bar */}
            <div className="absolute inset-0 opacity-20" style={{background: 'repeating-linear-gradient(90deg, #4ade80 0, #4ade80 10px, #22c55e 10px, #22c55e 20px)'}}></div>
            
            <div 
              className="absolute top-0 left-0 h-full transition-all duration-1000 ease-out flex items-center justify-end pr-2 relative z-10"
              style={{ 
                width: `${percentage}%`,
                background: 'linear-gradient(90deg, #F37121 0%, #F58025 60%, #003594 100%)'
              }}
            >
               <div className="absolute inset-0 w-full h-full opacity-30" style={{
                  backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.2) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.2) 50%,rgba(255,255,255,.2) 75%,transparent 75%,transparent)', 
                  backgroundSize: '20px 20px'
               }}></div>
            </div>
         </div>

         {milestones.map(m => (
           <div 
             key={m.points} 
             className="absolute top-0 bottom-0 w-px bg-black/10 z-10"
             style={{ left: `${(m.points / maxPoints) * 100}%` }}
           >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center group cursor-pointer">
                 <Trophy size={14} className="text-gray-400 group-hover:text-gulf-orange transition-colors" />
                 <div className="bg-gulf-blue text-white text-[8px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-1 whitespace-nowrap">
                   {m.label} ({m.points})
                 </div>
              </div>
           </div>
         ))}

         <div 
            className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-out z-20"
            style={{ left: `calc(${percentage}% - 20px)` }} 
         > 
             <div className="relative group">
                <div className="w-10 h-10 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center animate-bounce">
                   <img src="https://upload.wikimedia.org/wikipedia/commons/d/d3/Soccerball.svg" alt="Ball" className="w-full h-full opacity-80" />
                </div>
             </div>
         </div>
      </div>
    </div>
  );
};

const RewardCard: React.FC<RewardCardProps> = ({ 
  reward, 
  currentUser, 
  currentPoints, 
  onAddToCart,
  onViewDetails
}) => {
  const [qty, setQty] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  const price = currentUser.type === 'Pareto' ? reward.pointsPareto : reward.pointsNormal;
  const totalPrice = price * qty;
  const canAfford = currentPoints >= totalPrice;
  const isHighTier = price > 400;

  const images = reward.imageUrls && reward.imageUrls.length > 0 
      ? reward.imageUrls 
      : ['https://placehold.co/600x400/003594/FFFFFF?text=Sin+Imagen'];

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(reward, qty);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div 
        className={`relative group perspective-1000 select-none ${showSuccess ? 'z-20' : 'z-0'}`}
        onClick={() => onViewDetails(reward)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setCurrentImgIdx(0); }}
    >
      <style>{`
        @keyframes shine-pass {
          0% { left: -100%; opacity: 0; }
          50% { opacity: 0.5; }
          100% { left: 200%; opacity: 0; }
        }
        @keyframes pop-icon {
          0% { transform: scale(0) rotate(-45deg); opacity: 0; }
          70% { transform: scale(1.4) rotate(10deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .shine-effect {
           position: absolute;
           top: 0;
           width: 50%;
           height: 100%;
           background: linear-gradient(to right, transparent, rgba(255,255,255,0.8), transparent);
           transform: skewX(-20deg);
           left: -100%;
           pointer-events: none;
        }
        .group:hover .shine-effect {
           animation: shine-pass 0.8s ease-in-out forwards;
        }
        
        /* New global card shimmer effect */
        .card-shine-overlay {
           position: absolute;
           top: 0;
           left: -100%;
           width: 200%;
           height: 100%;
           background: linear-gradient(
             110deg, 
             transparent 30%, 
             rgba(255, 255, 255, 0.4) 45%, 
             rgba(255, 255, 255, 0.7) 50%, 
             rgba(255, 255, 255, 0.4) 55%, 
             transparent 70%
           );
           transform: skewX(-20deg);
           z-index: 50;
           pointer-events: none;
        }
        .group:hover .card-shine-overlay {
           animation: shine-pass 0.75s ease-in-out;
        }

        .pop-in {
            animation: pop-icon 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
      
      {/* Enhanced Card Body - Trading Card / Sticker Style */}
      <div className={`
        bg-white rounded-xl shadow-xl transition-all duration-300 transform 
        hover:-translate-y-3 hover:shadow-2xl hover:shadow-gulf-blue/20 border-0 overflow-hidden relative cursor-pointer
        ${showSuccess ? 'ring-4 ring-gulf-orange scale-105 shadow-[0_0_40px_rgba(243,113,33,0.5)]' : ''}
      `}>
          {/* Global Card Shine */}
          <div className="card-shine-overlay"></div>

          {/* Card Border / Frame Effect */}
          <div className={`absolute inset-0 border-[6px] rounded-xl pointer-events-none z-20 ${isHighTier ? 'border-yellow-400/30' : 'border-gray-100'}`}></div>

          {/* Dynamic Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-100 z-0"></div>
          <SoccerBallPattern className="absolute inset-0 text-gulf-blue/5 z-0" />
          
          {/* Top Flag Banner - Diagonal Cut */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-gulf-blue via-gulf-blue to-transparent opacity-10 rounded-bl-full z-0 pointer-events-none"></div>

          {/* Header Strip - "The Flag" */}
          <div className="relative z-10 h-3 flex shadow-sm">
             <div className="w-1/3 bg-[#003594]"></div>
             <div className="w-1/3 bg-[#F37121]"></div>
             <div className="w-1/3 bg-[#B9D9EB]"></div>
          </div>
          
          <div className="p-5 flex flex-col h-full relative z-10">
            
            {/* Image Area - Sticker Style */}
            <div className="relative h-48 mb-4">
               <div className="absolute inset-0 bg-white rounded-lg shadow-inner border border-gray-200 rotate-1 group-hover:rotate-0 transition-transform duration-500"></div>
               
               <div className="absolute inset-0 flex items-center justify-center p-4 overflow-hidden rounded-lg">
                  <img 
                    src={images[currentImgIdx]} 
                    alt={reward.name} 
                    className="max-w-full max-h-full object-contain drop-shadow-lg relative z-10 transition-transform duration-500 group-hover:scale-110" 
                  />
                  {/* Floor Shadow for object */}
                  <div className="absolute bottom-4 w-2/3 h-4 bg-black/20 blur-md rounded-[100%]"></div>
               </div>

               {/* Multi-Image Dots / Thumbs */}
               {images.length > 1 && (
                  <div className="absolute bottom-2 left-0 right-0 z-30 flex justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {images.map((_, idx) => (
                          <button 
                            key={idx}
                            onClick={(e) => { e.stopPropagation(); setCurrentImgIdx(idx); }}
                            className={`w-2 h-2 rounded-full border border-gulf-blue ${currentImgIdx === idx ? 'bg-gulf-orange' : 'bg-white'}`}
                          />
                      ))}
                  </div>
               )}

               {/* Shine Effect (Keep existing for image pop) */}
               <div className="shine-effect z-20"></div>

               {/* Badges */}
               {isHighTier && (
                 <div className="absolute -top-2 -right-2 z-30 animate-bounce" style={{animationDuration: '3s'}}>
                    <div className="bg-yellow-400 text-gulf-blue text-[10px] font-black italic px-3 py-1 rounded-full shadow-lg border-2 border-white flex items-center gap-1 transform rotate-12">
                       <Sparkles size={10} /> CRACK
                    </div>
                 </div>
               )}

               {!canAfford && (
                 <div className="absolute inset-0 bg-gray-200/80 backdrop-blur-[1px] z-20 flex items-center justify-center rounded-lg">
                    <div className="bg-red-600 text-white text-xs font-black px-4 py-2 transform -rotate-12 border-2 border-white shadow-2xl uppercase tracking-widest rounded-sm">
                       FUERA DE JUEGO
                    </div>
                 </div>
               )}
               
               {showSuccess && (
                 <div className="absolute inset-0 bg-gulf-blue/90 z-30 flex flex-col items-center justify-center rounded-lg animate-in fade-in duration-200 backdrop-blur-sm">
                    <CheckCircle className="text-gulf-orange w-16 h-16 mb-2 pop-in" strokeWidth={3} />
                    <span className="text-white font-sports text-2xl tracking-widest animate-pulse">¡FICHAJE!</span>
                 </div>
               )}
            </div>

            {/* Content */}
            <div className="flex-grow">
               <div className="flex justify-between items-start mb-2">
                  <h3 className="font-sports text-3xl leading-none text-gulf-blue uppercase truncate pr-2 tracking-wide group-hover:text-gulf-orange transition-colors">{reward.name}</h3>
               </div>
               
               {/* Description with icon */}
               <div className="flex gap-2 mb-4">
                  <div className="mt-0.5 min-w-[3px] h-full bg-gulf-orange/30 rounded-full"></div>
                  <div className="flex flex-col">
                    <p className="text-xs text-gray-500 font-medium line-clamp-2 leading-relaxed">
                      {reward.description}
                    </p>
                    <span className="text-[10px] text-gray-400 italic mt-1">*Imagen de referencia</span>
                  </div>
               </div>
            </div>

            {/* Price Tag & Controls */}
            <div className="mt-auto bg-gray-50 rounded-xl p-3 border border-gray-100" onClick={e => e.stopPropagation()}>
               <div className="flex items-end justify-between mb-3">
                  <div>
                     <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Valor de Pase</span>
                     <div className="flex items-center gap-1">
                        <span className={`text-4xl font-sports leading-none ${canAfford ? 'text-gulf-orange drop-shadow-sm' : 'text-gray-400'}`}>
                           {totalPrice}
                        </span>
                        <span className="text-[10px] font-bold text-gulf-blue bg-white px-1 rounded border border-gray-200 shadow-sm">PTS</span>
                     </div>
                  </div>
                  
                  {/* Quantity Selector - Styled like a scoreboard counter */}
                  <div className="flex flex-col items-end">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Cantidad</span>
                      <div className="flex items-center bg-white rounded-lg border border-gray-200 h-8 shadow-sm overflow-hidden">
                         <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 hover:bg-gray-100 text-gulf-blue font-bold transition-colors border-r border-gray-100 h-full flex items-center">-</button>
                         <span className="w-8 text-center font-mono font-bold text-lg text-gulf-blue">{qty}</span>
                         <button onClick={() => setQty(qty + 1)} className="px-3 hover:bg-gray-100 text-gulf-blue font-bold transition-colors border-l border-gray-100 h-full flex items-center">+</button>
                      </div>
                  </div>
               </div>

               <button 
                 onClick={handleClick}
                 disabled={!canAfford}
                 className={`
                   w-full relative overflow-hidden rounded-lg py-3 flex items-center justify-center gap-2 transition-all duration-300 group/btn
                   ${canAfford 
                     ? 'bg-gradient-to-r from-gulf-orange to-orange-600 text-white shadow-lg hover:shadow-orange-500/40 hover:-translate-y-1 border-b-4 border-[#c25a1a] active:border-b-0 active:translate-y-1' 
                     : 'bg-gray-200 text-gray-400 cursor-not-allowed border-b-4 border-gray-300'}
                 `}
               >
                  {/* Whistle Icon */}
                  <WhistleIcon className={`w-6 h-6 ${canAfford ? 'animate-pulse text-white' : 'text-gray-400'}`} />
                  
                  <span className="font-sports text-2xl tracking-wide pt-1 relative z-10">
                     {canAfford ? 'JUGAR BALÓN' : 'BLOQUEADO'}
                  </span>
                  
                  {/* Referee Stripe Pattern on Button Hover */}
                  {canAfford && (
                      <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-10 transition-opacity pointer-events-none" style={{
                          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #fff 10px, #fff 20px)'
                      }}></div>
                  )}
               </button>
            </div>
          </div>
      </div>
    </div>
  );
};

const HiddenJerseyCard = React.forwardRef<HTMLDivElement, { name: string }>(({ name }, ref) => (
  <div ref={ref} className="fixed left-[-2000px] top-[-2000px] w-[1080px] h-[1080px] bg-gulf-blue overflow-hidden flex flex-col items-center justify-between text-white font-body p-0 border-0">
    {/* High Quality Background */}
    <div className="absolute inset-0 bg-gradient-to-br from-[#003594] to-[#001030] z-0"></div>
    <div className="absolute inset-0 opacity-20 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzjwqFChAoMBJAoSIwIKCgQA8g8X66D6W84AAAAASUVORK5CYII=')] z-0"></div>
    
    {/* Stadium / Crowd Background Image blended */}
    <img 
      src="https://i.postimg.cc/DfB4LcTY/Estadio.png" 
      alt="Background" 
      crossOrigin="anonymous"
      className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay z-0"
    />

    {/* Header Area */}
    <div className="relative z-10 w-full flex flex-col items-center pt-16 pb-8">
        <div className="flex items-center gap-12 mb-6">
             <div className="bg-white p-4 rounded-2xl shadow-2xl">
                 <img src="https://i.postimg.cc/yYKJQBj6/Logo-GULF.png" crossOrigin="anonymous" alt="Gulf" className="h-20 object-contain" />
             </div>
             <div className="h-16 w-0.5 bg-white/50 rounded-full"></div>
             <div className="bg-white p-4 rounded-2xl shadow-2xl">
                 <img src="https://i.postimg.cc/8PGFKD4z/Logo-Prolub-color.png" crossOrigin="anonymous" alt="Prolub" className="h-20 object-contain" />
             </div>
        </div>
        
        <h1 className="text-8xl font-sports uppercase tracking-widest text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] mt-4">
           FICHAJE OFICIAL
        </h1>
        
        <div className="bg-white px-12 py-3 mt-4 shadow-[0_0_30px_rgba(255,255,255,0.2)] rounded-full flex items-center gap-4 border-4 border-gulf-orange">
           <Trophy className="text-gulf-orange w-8 h-8" fill="currentColor" />
           <p className="text-4xl text-gulf-blue uppercase tracking-[0.2em] font-bold">
              JUGADOR DE LA CANCHA
           </p>
           <Trophy className="text-gulf-orange w-8 h-8" fill="currentColor" />
        </div>
    </div>

    {/* The Full Kit Visual */}
    <div className="relative z-20 flex flex-col items-center justify-center flex-grow transform scale-[1.1] translate-y-[-10px]">
        
        {/* Jersey Container - explicit z-20 to be above shorts */}
        <div className="relative z-20">
            {/* Sleeves */}
            <div className="absolute top-4 -left-20 w-32 h-48 bg-[#002870] rounded-l-3xl transform -rotate-12 border-4 border-white/10 shadow-2xl flex items-center justify-center overflow-hidden">
                <div className="absolute bottom-0 w-full h-6 bg-gulf-orange"></div>
                <img src="https://upload.wikimedia.org/wikipedia/commons/d/d3/Soccerball.svg" crossOrigin="anonymous" className="w-12 h-12 opacity-50 mix-blend-overlay" />
            </div>
            <div className="absolute top-4 -right-20 w-32 h-48 bg-[#002870] rounded-r-3xl transform rotate-12 border-4 border-white/10 shadow-2xl flex items-center justify-center overflow-hidden">
                <div className="absolute bottom-0 w-full h-6 bg-gulf-orange"></div>
                <Flag className="w-12 h-12 text-white opacity-50" />
            </div>

            {/* Shirt Body */}
            <div className="relative w-80 h-96 bg-[#003594] rounded-t-[3rem] rounded-b-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-white/10 overflow-hidden flex flex-col items-center">
                
                {/* Texture */}
                <div className="absolute inset-0 opacity-10 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzjwqFChAoMBJAoSIwIKCgQA8g8X66D6W84AAAAASUVORK5CYII=')]"></div>
                
                {/* Design Lines */}
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="w-full h-full bg-gradient-to-b from-transparent via-gulf-blue to-black/20"></div>
                </div>

                {/* Collar */}
                <div className="w-40 h-8 border-b-8 border-white/20 rounded-b-full mb-8"></div>

                {/* Name - High Z-index for visibility */}
                <div className="w-full px-4 text-center z-50 mt-6 mb-2 flex items-center justify-center min-h-[4rem] relative">
                     <span className="font-sports text-3xl font-bold uppercase tracking-widest text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] leading-tight break-words max-w-full block">
                         {name}
                     </span>
                </div>

                {/* Number */}
                <div className="z-10 relative mt-2">
                     <span className="text-[12rem] font-sports text-white leading-none drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]" 
                           style={{ 
                             WebkitTextStroke: '4px #F37121',
                             textShadow: '0 10px 20px rgba(0,0,0,0.5)'
                           }}>
                        10
                     </span>
                </div>

                {/* Sponsor on lower back */}
                <div className="mt-auto mb-6 opacity-80 z-10">
                     <img src="https://i.postimg.cc/yYKJQBj6/Logo-GULF.png" crossOrigin="anonymous" className="h-8 filter brightness-0 invert" />
                </div>
            </div>
        </div>

        {/* Shorts - explicit z-10 to be below jersey */}
        <div className="relative -mt-10 z-10 flex w-80 h-48 filter drop-shadow-2xl">
             {/* Left Leg */}
             <div className="w-1/2 h-full bg-white rounded-bl-3xl border-r border-gray-200 relative overflow-hidden flex items-end justify-center pb-4">
                 <div className="absolute top-0 w-full h-full bg-gradient-to-b from-gray-100 to-white"></div>
                 {/* Stripe */}
                 <div className="absolute left-0 top-0 h-full w-4 bg-gulf-blue"></div>
                 {/* Logo */}
                 <img src="https://i.postimg.cc/8PGFKD4z/Logo-Prolub-color.png" crossOrigin="anonymous" className="h-10 object-contain relative z-10 mb-2" />
             </div>
             {/* Right Leg */}
             <div className="w-1/2 h-full bg-white rounded-br-3xl relative overflow-hidden flex items-end justify-center pb-4">
                 <div className="absolute top-0 w-full h-full bg-gradient-to-b from-gray-100 to-white"></div>
                 {/* Stripe */}
                 <div className="absolute right-0 top-0 h-full w-4 bg-gulf-orange"></div>
                 {/* Number */}
                 <span className="text-4xl font-sports text-gulf-blue font-bold relative z-10 mb-2">10</span>
             </div>
        </div>
    </div>

    {/* Footer info */}
    <div className="relative z-10 w-full bg-black/40 backdrop-blur-md py-6 mt-auto border-t-4 border-gulf-orange">
        <div className="flex justify-center gap-12 text-center">
             <div>
                <p className="text-gulf-sky text-xl uppercase tracking-widest">Posición</p>
                <p className="text-4xl font-sports text-white">CAPITÁN</p>
             </div>
             <div>
                <p className="text-gulf-sky text-xl uppercase tracking-widest">Equipo</p>
                <p className="text-4xl font-sports text-white">PROLUB GULF</p>
             </div>
             <div>
                <p className="text-gulf-sky text-xl uppercase tracking-widest">Temporada</p>
                <p className="text-4xl font-sports text-white">2026</p>
             </div>
        </div>
    </div>

  </div>
));

const App = () => {
  const [view, setView] = useState<ViewState>('login');
  const [currentUser, setCurrentUser] = useState<Client | null>(null);
  const [currentPoints, setCurrentPoints] = useState<number>(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [redemptionHistory, setRedemptionHistory] = useState<OrderLog[]>([]); 
  const [downloading, setDownloading] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

  // New Ref for Invoice PDF
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [redemptionDate, setRedemptionDate] = useState('');

  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number | ''>('');
  const [sortBy, setSortBy] = useState<string>('default');
  // Use initialized state from DB to prevent race condition on first render
  const [clientsList, setClientsList] = useState<Client[]>(getDatabase().clients);

  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    address: '', receiver: '', city: '', phone: ''
  });

  useEffect(() => {
    const db = getDatabase();
    setClientsList(db.clients);
  }, [view]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Check for Hidden Admin Credentials
    if (loginId === '1005715717' && loginPass === '0527') {
        setView('admin');
        return;
    }

    const user = clientsList.find(c => c.businessId === loginId && c.password === loginPass);
    if (user) {
      setCurrentUser(user);
      setCurrentPoints(getPoints(user.pointOfSale));
      const allOrders = getDatabase().orders || [];
      setRedemptionHistory(allOrders.filter(o => o.client === user.pointOfSale));
      setView('store');
    } else {
      alert('TARJETA ROJA: ID o Contraseña incorrectos.');
    }
  };

  const addToCart = (reward: Reward, qty: number) => {
    if (qty <= 0) return;
    const price = currentUser?.type === 'Pareto' ? reward.pointsPareto : reward.pointsNormal;
    const existing = cart.find(c => c.id === reward.id);
    if (existing) {
      setCart(cart.map(c => c.id === reward.id ? { ...c, quantity: c.quantity + qty } : c));
    } else {
      setCart([...cart, { ...reward, quantity: qty, appliedPrice: price || 0 }]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(c => c.id !== id));
  };

  const calculateTotal = () => {
    return cart.reduce((acc, item) => acc + (item.appliedPrice * item.quantity), 0);
  };

  const generatePDFBlob = async (): Promise<string | null> => {
      if (!invoiceRef.current) return null;
      try {
          // Wait for rendering
          await new Promise(resolve => setTimeout(resolve, 500));
          const canvas = await html2canvas(invoiceRef.current, {
              scale: 2,
              useCORS: true,
              logging: false
          });
          const imgData = canvas.toDataURL('image/jpeg', 0.9);
          const pdf = new jsPDF({
              orientation: 'portrait',
              unit: 'mm',
              format: 'a4'
          });
          const imgProps = pdf.getImageProperties(imgData);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
          pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
          
          return pdf.output('datauristring'); // Return as Base64 Data URI
      } catch (e) {
          console.error("Error generating PDF Blob", e);
          return null;
      }
  };

  const handleDownloadInvoice = async () => {
      if (invoiceRef.current) {
          setDownloading(true);
          try {
              const canvas = await html2canvas(invoiceRef.current, { scale: 2, useCORS: true });
              const imgData = canvas.toDataURL('image/png');
              const pdf = new jsPDF('p', 'mm', 'a4');
              const pdfWidth = pdf.internal.pageSize.getWidth();
              const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
              pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
              pdf.save(`Comprobante_Gulf_${currentUser?.businessId}_${Date.now()}.pdf`);
          } catch (e) {
              console.error(e);
              alert("Error al descargar el PDF");
          }
          setDownloading(false);
      }
  };

  const handleDownloadJersey = async () => {
    if (exportRef.current) {
      setDownloading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        const canvas = await html2canvas(exportRef.current, {
          scale: 1, 
          useCORS: true,
          backgroundColor: '#003594',
          allowTaint: true,
          logging: false
        });
        const link = document.createElement('a');
        link.download = `Uniforme_ProlubGulf_${currentUser?.businessId || '10'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (err) {
        console.error("Error generating image", err);
        alert("Hubo un error generando tu uniforme. Intenta de nuevo.");
      }
      setDownloading(false);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = calculateTotal();
    if (!currentUser) return;
    if (total > currentPoints) {
      const missing = total - currentPoints;
      alert(`¡Oh no! Te faltan ${missing.toLocaleString()} puntos para este premio. Sigue jugando para conseguirlos.`);
      return;
    }
    
    setLoading(true);
    const now = new Date();
    const currentDateStr = now.toLocaleDateString('es-CO');
    const currentTimeStr = now.toLocaleTimeString('es-CO');
    setRedemptionDate(currentDateStr + ' ' + currentTimeStr);

    let emailSent = false;
    let emailError = '';

    const itemsText = cart.map(c => `- ${c.quantity}x ${c.name} (${c.appliedPrice} pts)`).join('\n');
    const itemsLine = cart.map(c => `${c.quantity}x ${c.name}`).join(', ');

    // Construct detailed shipping block for Email
    const logisticsBlock = `
DATOS DE LOGÍSTICA DE ENVÍO:
----------------------------
CLIENTE: ${currentUser.pointOfSale} (ID: ${currentUser.businessId})
RECEPTOR: ${orderDetails.receiver}
CIUDAD: ${orderDetails.city}
DIRECCIÓN: ${orderDetails.address}
TELÉFONO: ${orderDetails.phone}
----------------------------
`;

    try {
        const SERVICE_ID = 'service_hdlsj5r';
        const TEMPLATE_ID = 'template_rrqgdym';
        const PUBLIC_KEY = 'pfbP31YCRZ3dzBat5';
        
        const adminEmails = "asismercadeo@gulfcolombia.com,msilva@prolub.com.co";

        emailjs.init(PUBLIC_KEY);

        const templateParams = {
            to_email: adminEmails,
            email: adminEmails, // Added to ensure recipient address is found by EmailJS template
            nombre: currentUser.pointOfSale,
            nombre_cliente: currentUser.pointOfSale,
            producto: cart.map(item => item.name).join(", "),
            receptor: orderDetails.receiver,
            cantidad: cart.reduce((acc, item) => acc + item.quantity, 0),
            direccion: orderDetails.address,
            telefono: orderDetails.phone,
            ciudad: orderDetails.city,
            puntos: total,
        };
        
        console.log("Enviando Email...", templateParams);

        const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
        console.log('EmailJS Response:', response);

        if (response.status === 200) {
           emailSent = true;
        } else {
           throw new Error(`Status ${response.status}: ${response.text}`);
        }

    } catch (error: any) {
        let errorMsg = 'Unknown error';
        if (error instanceof Error) errorMsg = error.message;
        else if (typeof error === 'object' && error?.text) errorMsg = error.text;
        else errorMsg = String(error);

        console.error('Email Failed (Checkout continued):', errorMsg);
        emailSent = false;
        emailError = errorMsg;
    }

    const success = deductPoints(currentUser.pointOfSale, total);
    
    setLoading(false);

    if (success) {
        // Save Order to Database (Local & Cloud)
        const newOrder: OrderLog = {
            date: currentDateStr,
            time: currentTimeStr,
            client: currentUser.pointOfSale,
            receiver: orderDetails.receiver,
            city: orderDetails.city,
            address: orderDetails.address,
            phone: orderDetails.phone,
            items: itemsLine,
            points: total
        };
        addOrder(newOrder); // Save Local
        sendOrderToGoogleSheet(newOrder); // Save to Google Sheet

        setRedemptionHistory(prev => [newOrder, ...prev]);
        setCurrentPoints(prev => prev - total);
        setView('success');
    } else {
        alert('Error CRÍTICO: No se pudieron descontar los puntos. Por favor intenta de nuevo o contacta soporte.');
    }
  };

  const handleExitSuccess = () => {
      setCart([]); // Clear cart only when leaving success screen
      setView('profile');
  };

  const Header = () => (
    <header className="bg-gulf-blue text-white shadow-xl sticky top-0 z-50 relative">
      <BuntingFlags />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-gulf-orange via-gulf-sky to-gulf-orange z-30"></div>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center relative z-30">
        <div className="flex items-center space-x-4 cursor-pointer group" onClick={() => currentUser && setView('store')}>
          <div className="bg-white p-1.5 rounded-full shadow-lg border-2 border-gulf-sky/30 group-hover:scale-110 transition-transform">
             <img src="https://i.postimg.cc/yYKJQBj6/Logo-GULF.png" alt="Gulf Logo" className="w-8 h-8 object-contain" />
          </div>
          <div>
             <h1 className="text-2xl font-sports tracking-wide leading-none text-white italic">PROLUB GULF</h1>
             <div className="flex items-center gap-1">
                 <Flag size={10} className="text-gulf-orange" />
                 <p className="text-[10px] text-gulf-sky font-bold tracking-[0.2em] uppercase">Mundial 2026</p>
             </div>
          </div>
        </div>
        
        {currentUser && view !== 'login' && view !== 'admin' && (
          <div className="flex items-center space-x-6">
            {/* Scoreboard Style Widget */}
            <div className="hidden md:flex bg-black/80 text-gulf-orange border-2 border-gray-700 rounded-lg px-3 py-1 font-mono items-center space-x-3 shadow-lg transform skew-x-[-10deg]">
               <div className="transform skew-x-[10deg] flex flex-col items-center leading-none border-r border-gray-600 pr-2">
                  <span className="text-[8px] text-gray-400">HOME</span>
                  <span className="text-white text-lg font-bold">{currentUser.businessId.slice(-3)}</span>
               </div>
               <div className="transform skew-x-[10deg] flex flex-col items-center leading-none">
                  <span className="text-[8px] text-gray-400">PUNTOS</span>
                  <span className="text-xl font-bold text-yellow-400 animate-pulse">{currentPoints.toLocaleString()}</span>
               </div>
            </div>
            
            {view !== 'profile' ? (
                <button onClick={() => setView('profile')} className="group flex flex-col items-center hover:text-gulf-orange transition-colors" title="El Camerino">
                   <div className="relative p-1 bg-white/10 rounded-full">
                      <Shirt size={20} />
                      <div className="absolute top-0 right-0 w-2 h-2 bg-gulf-orange rounded-full animate-pulse border border-gulf-blue"></div>
                   </div>
                </button>
            ) : (
                <button onClick={() => setView('store')} className="hover:text-gulf-orange transition-colors flex items-center gap-1 text-sm font-bold bg-white/10 px-3 py-1 rounded-full">
                  <ChevronRight size={16} /> CAMPO DE JUEGO
                </button>
            )}
            
            <button onClick={() => cart.length > 0 && setView('checkout')} className="relative p-2 hover:bg-white/10 rounded-full transition-colors group">
              <ShoppingCart size={20} className="group-hover:text-yellow-400 transition-colors" />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm border border-white">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </button>

            <button onClick={() => { setCurrentUser(null); setView('login'); setCart([]); setRedemptionHistory([]); }} className="text-gulf-sky hover:text-red-400 transition-colors" title="Salir">
              <LogOut size={20} />
            </button>
          </div>
        )}
      </div>
    </header>
  );

  // ... (Login, Admin, Profile Views remain the same structure, returning earlier) ...

  if (view === 'login') {
      return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-gulf-blue">
        
        <style>{`
          @keyframes float-logo {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes wave-flag {
             0%, 100% { transform: translateY(0); }
             50% { transform: translateY(-10px); }
          }
          .anim-float { animation: float-logo 3s ease-in-out infinite; }
          .anim-wave { animation: wave-flag 2s ease-in-out infinite; }
        `}</style>

        {/* --- ESTADIO GULF - PROLUB BACKGROUND --- */}
        <div className="absolute inset-0 z-0">
           {/* Stadium Crowd Image */}
           <img 
             src="https://i.postimg.cc/DfB4LcTY/Estadio.png" 
             alt="Estadio Gulf Prolub" 
             className="w-full h-full object-cover"
           />
           {/* Blue Branding Overlay (Multiplying the Gulf Blue over the image) */}
           <div className="absolute inset-0 bg-gulf-blue/80 mix-blend-multiply"></div>
           
           {/* Architectural Header Signage */}
           <div className="absolute top-0 left-0 w-full z-10">
              <div className="w-full h-32 bg-gradient-to-b from-black/90 to-transparent flex items-start justify-center pt-6">
                  <div className="bg-[#00205B] border-y-4 border-gulf-orange px-12 py-3 transform -skew-x-12 shadow-[0_0_50px_rgba(243,113,33,0.6)] relative overflow-hidden">
                     {/* Gloss effect on sign */}
                     <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 pointer-events-none"></div>
                     <h1 className="text-white font-sports text-4xl md:text-5xl tracking-[0.2em] transform skew-x-12 drop-shadow-[0_4px_0_#000]">
                       ESTADIO GULF - PROLUB
                     </h1>
                  </div>
              </div>
           </div>

           {/* Animated Crowd & Flags Layer at bottom */}
           <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-black via-black/50 to-transparent flex items-end justify-center pb-0 overflow-hidden">
              <div className="flex gap-4 opacity-60 w-[200%] animate-[marquee_20s_linear_infinite]">
                 {Array.from({length: 30}).map((_, i) => (
                    <div key={i} className="flex flex-col items-center transform scale-75 md:scale-100" style={{ animationDelay: `${i * 0.1}s` }}>
                       <div className={`w-1 h-24 bg-gray-400 transform origin-bottom rotate-${Math.random() > 0.5 ? '6' : '-6'}`}></div>
                       <div className={`w-16 h-10 ${['bg-red-600','bg-yellow-400','bg-blue-600','bg-white','bg-green-600'][i%5]} absolute top-0 animate-pulse`}></div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Prolub Logo Top Left (Floating above stadium) */}
        <div className="absolute top-8 left-8 z-20 anim-float hidden md:block">
           <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.3)] border-2 border-gulf-orange">
             <img src="https://i.postimg.cc/8PGFKD4z/Logo-Prolub-color.png" alt="Prolub Logo" className="w-32 object-contain" />
           </div>
        </div>

        <div className="relative z-10 w-full max-w-md flex flex-col items-center animate-in fade-in zoom-in duration-700 mt-20">
            
            {/* Center Logo with Glow */}
            <div className="mb-8 text-center flex flex-col items-center relative">
                <div className="absolute inset-0 bg-gulf-orange/40 blur-[60px] rounded-full scale-150 animate-pulse"></div>
                <div className="flex items-center justify-center gap-6 mb-6 relative z-10">
                    <img src="https://i.postimg.cc/yYKJQBj6/Logo-GULF.png" alt="Gulf Logo" className="w-32 h-32 object-contain drop-shadow-2xl" />
                </div>
                
                <h2 className="text-3xl font-sports text-white tracking-widest uppercase drop-shadow-md bg-black/40 px-4 py-1 rounded">
                  Mundial 2026
                </h2>
            </div>

            {/* Login Card styled like a VIP Ticket/Pass */}
            <div className="w-full bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] relative overflow-hidden group border border-white/40">
                {/* Decorative Ticket Holes */}
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-black/80 rounded-full border border-gray-600"></div>
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-black/80 rounded-full border border-gray-600"></div>
                
                <div className="bg-gradient-to-r from-gulf-blue to-[#001540] p-6 text-center border-b-4 border-gulf-orange relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzjwqFChAoMBJAoSIwIKCgQA8g8X66D6W84AAAAASUVORK5CYII=')]"></div>
                    <h2 className="text-2xl text-white font-sports tracking-wide flex items-center justify-center gap-2 relative z-10">
                      <Users size={24} className="text-gulf-orange"/> ACCESO JUGADORES
                    </h2>
                    <p className="text-gulf-sky text-[10px] uppercase tracking-[0.3em] mt-1">Zona Exclusiva</p>
                </div>

                <div className="p-8 pt-6">
                  <form onSubmit={handleLogin} className="space-y-5">
                      <div className="space-y-1.5">
                          <label className="text-gulf-blue text-[10px] font-bold uppercase tracking-widest ml-1">ID de Equipo</label>
                          <div className="relative group">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gulf-orange transition-colors">
                                  <CircleDot className="w-5 h-5" />
                              </div>
                              <input 
                                  type="text"
                                  required
                                  placeholder="Ingresa tu ID"
                                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-gulf-orange focus:ring-0 outline-none transition-all text-gray-800 font-bold tracking-wide"
                                  value={loginId}
                                  onChange={(e) => setLoginId(e.target.value)}
                              />
                          </div>
                      </div>

                      <div className="space-y-1.5">
                          <label className="text-gulf-blue text-[10px] font-bold uppercase tracking-widest ml-1">Contraseña</label>
                          <div className="relative group">
                              <Settings className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-gulf-orange transition-colors" />
                              <input 
                                  type="password"
                                  required
                                  placeholder="••••••••"
                                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-gulf-orange focus:ring-0 outline-none transition-all text-gray-800 font-bold tracking-wide"
                                  value={loginPass}
                                  onChange={(e) => setLoginPass(e.target.value)}
                              />
                          </div>
                      </div>

                      <button 
                          type="submit" 
                          className="w-full mt-6 bg-gradient-to-r from-gulf-orange to-orange-600 hover:from-orange-500 hover:to-orange-500 text-white font-sports text-2xl pt-2 pb-1 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 border-b-4 border-[#c25a1a] active:border-b-0 active:translate-y-1 relative overflow-hidden"
                      >
                          <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform duration-300"></div>
                          <span className="flex items-center justify-center gap-2 relative z-10">
                             ENTRAR AL CAMPO
                          </span>
                      </button>
                  </form>
                </div>
            </div>
        </div>
      </div>
    );
  }

  if (view === 'admin') {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Header />
        <main className="container mx-auto p-4 flex-grow">
          <AdminPanel onLogout={() => setView('login')} />
        </main>
      </div>
    );
  }

  // ... (Profile View same as before)
  if (view === 'profile' && currentUser) {
      return (
      <div className="min-h-screen bg-gulf-blue flex flex-col relative overflow-hidden text-white font-body">
        <Header />
        <StadiumAtmosphere />
        <HiddenJerseyCard ref={exportRef} name={currentUser.pointOfSale} />
        
        <div className="container mx-auto px-4 py-8 relative z-10 flex flex-col lg:flex-row gap-12 items-center lg:items-start justify-center flex-grow">
          
          <div className="flex flex-col items-center w-full lg:w-auto">
             {/* Name Plate */}
             <div className="bg-white/10 backdrop-blur-md border border-gulf-sky/30 rounded-lg px-8 py-4 mb-8 text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gulf-orange"></div>
                <div className="absolute top-0 right-0 w-1 h-full bg-gulf-orange"></div>
                <p className="text-gulf-sky text-xs font-bold uppercase tracking-[0.3em] mb-1">Ficha Técnica</p>
                <h2 className="text-3xl md:text-4xl font-sports tracking-wider text-white uppercase leading-none">
                  {currentUser.pointOfSale}
                </h2>
                <div className="inline-block bg-gulf-orange text-white px-3 py-0.5 rounded text-sm font-bold mt-2 uppercase shadow-sm">
                   JUGADOR OFICIAL
                </div>
             </div>

             {/* Locker Room Visual */}
             <div className="relative w-full max-w-sm bg-gray-800 rounded-t-3xl border-8 border-gray-700 shadow-2xl overflow-hidden p-6 flex flex-col items-center min-h-[400px]">
                {/* Bench */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#3a2e2a] border-t-4 border-[#2a211e]"></div>
                
                {/* Jersey Hanging */}
                <div className="relative z-10 transform hover:scale-105 transition-transform cursor-pointer">
                   {/* Hanger */}
                   <div className="w-32 h-2 border-t-4 border-gray-400 rounded-t-full mx-auto mb-1"></div>
                   
                   {/* Jersey Body */}
                   <div className="w-48 h-56 bg-white rounded-t-3xl rounded-b-xl relative overflow-hidden shadow-lg flex flex-col items-center pt-8">
                       {/* Collar */}
                       <div className="absolute top-0 w-24 h-6 border-b-4 border-gulf-blue rounded-b-full"></div>
                       {/* Stripes */}
                       <div className="w-full h-full flex">
                          <div className="w-1/4 bg-gulf-blue h-full"></div>
                          <div className="w-1/4 bg-white h-full"></div>
                          <div className="w-1/4 bg-gulf-blue h-full"></div>
                          <div className="w-1/4 bg-white h-full"></div>
                       </div>
                       {/* Back Jersey Info (Number & Name) */}
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full">
                          <div className="bg-black/20 backdrop-blur-[1px] mb-1 mx-2 rounded">
                            <p className="text-[10px] font-sports text-gulf-orange uppercase truncate px-1">
                                {currentUser.pointOfSale}
                            </p>
                          </div>
                          <div className="text-6xl font-sports text-gulf-orange drop-shadow-md stroke-black" style={{WebkitTextStroke: '1px black'}}>
                             10
                          </div>
                       </div>
                       
                       {/* Gulf Logo */}
                       <div className="absolute bottom-4 bg-white px-2 py-1 rounded">
                          <span className="text-gulf-blue font-bold text-xs">GULF</span>
                       </div>
                   </div>
                </div>

                <div className="absolute bottom-4 z-20 text-center w-full">
                    <button 
                      onClick={handleDownloadJersey} 
                      disabled={downloading}
                      className="group relative inline-flex items-center gap-2 bg-gulf-orange hover:bg-orange-600 text-white font-sports tracking-wide text-lg px-6 py-2 rounded-full shadow-lg border-b-4 border-[#c25a1a] active:translate-y-1 active:border-b-0 transition-all"
                    >
                        {downloading ? (
                          <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                        ) : (
                          <Download size={18} className="group-hover:animate-bounce" />
                        )}
                        <span>{downloading ? 'GENERANDO...' : 'DESCARGAR UNIFORME'}</span>
                    </button>
                    <p className="text-[10px] text-white/50 uppercase mt-2">Formato Oficial 1080x1080</p>
                </div>
             </div>
          </div>
          
          <div className="flex flex-col gap-6 w-full max-w-md">
             <div className="bg-black/40 backdrop-blur-md border border-gulf-sky/20 rounded-xl p-6 shadow-2xl relative overflow-hidden">
                <SoccerBallPattern className="absolute top-0 right-0 text-white/5 w-32 h-32" />
                
                <h3 className="text-2xl font-sports text-gulf-orange mb-6 flex items-center border-b border-white/10 pb-2">
                   <ClipboardList className="mr-2" /> ESTADÍSTICAS DE TEMPORADA
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-gulf-blue/50 p-4 rounded-lg border border-white/10 text-center">
                      <p className="text-gulf-sky text-[10px] uppercase tracking-widest font-bold mb-1">Puntos en Juego</p>
                      <p className="text-4xl font-sports text-white">{currentPoints.toLocaleString()}</p>
                   </div>
                   
                   <div className="bg-gulf-blue/50 p-4 rounded-lg border border-white/10 text-center">
                      <p className="text-gulf-sky text-[10px] uppercase tracking-widest font-bold mb-1">Trofeos (Canjes)</p>
                      <div className="flex items-center justify-center gap-1 text-yellow-400">
                         <Trophy size={20} />
                         <span className="text-4xl font-sports text-white">{redemptionHistory.length}</span>
                      </div>
                   </div>
                </div>

                <div className="mt-8">
                  <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wider flex items-center">
                    <Activity size={14} className="mr-2 text-green-400" /> Historial de Partidos
                  </h4>
                  {redemptionHistory.length > 0 ? (
                      <ul className="space-y-2">
                         {redemptionHistory.slice(0, 5).map((order, idx) => (
                            <li key={idx} className="flex flex-col text-sm bg-white/5 p-3 rounded border-l-4 border-green-500">
                               <div className="flex justify-between items-center mb-1">
                                  <span className="text-gray-400 text-[10px] uppercase font-bold">{order.date}</span>
                                  <span className="text-green-400 font-mono font-bold">-{order.points} PTS</span>
                               </div>
                               <span className="text-gray-200 line-clamp-2">{order.items}</span>
                            </li>
                         ))}
                      </ul>
                  ) : (
                      <p className="text-gray-500 text-sm italic">Aún no has saltado al campo. ¡Ve a la tienda!</p>
                  )}
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // ... (Store View same as before)
  if (view === 'store' && currentUser) {
    const rewards = getDatabase().rewards;
    const categories = ['All', ...Array.from(new Set(rewards.map(r => r.category || 'General')))];

    const filteredAndSortedRewards = rewards
      .filter(reward => {
        const categoryMatch = categoryFilter === 'All' || (reward.category || 'General') === categoryFilter;
        const priceMatch = maxPriceFilter === '' || (currentUser.type === 'Pareto' ? reward.pointsPareto : reward.pointsNormal) <= Number(maxPriceFilter);
        return categoryMatch && priceMatch;
      })
      .sort((a, b) => {
        if (sortBy === 'nameAsc') return a.name.localeCompare(b.name);
        if (sortBy === 'nameDesc') return b.name.localeCompare(a.name);
        
        const priceA = currentUser.type === 'Pareto' ? a.pointsPareto : a.pointsNormal;
        const priceB = currentUser.type === 'Pareto' ? b.pointsPareto : b.pointsNormal;
        
        if (sortBy === 'priceAsc') return priceA - priceB;
        if (sortBy === 'priceDesc') return priceB - priceA;
        if (sortBy === 'popularity') return (b.popularity || 0) - (a.popularity || 0);
        if (sortBy === 'dateAdded') return new Date(b.dateAdded || 0).getTime() - new Date(a.dateAdded || 0).getTime();
        
        return 0; // default
      });
    
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-body">
        <Header />
        
        {/* New Store Banner replacing the old Match Center Hero */}
        <StoreBanner currentUser={currentUser} currentPoints={currentPoints} />

        {/* Catalog */}
        <main className="container mx-auto px-4 py-8 flex-grow">
          {/* Decorative Field Lines on Background */}
          <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.02]" style={{
              backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)',
              backgroundSize: '100px 100px'
          }}></div>

          <SponsorsCarousel />

          <GamifiedProgressBar currentPoints={currentPoints} />

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 relative z-10">
            <div className="flex items-center gap-3">
               <div className="bg-gulf-blue text-white p-2 rounded-lg shadow-md">
                  <Medal size={24} />
               </div>
               <div>
                  <h3 className="text-3xl font-sports text-gulf-blue leading-none">MERCADO DE FICHAJES</h3>
                  <p className="text-xs text-gulf-orange font-bold uppercase tracking-wide">Refuerza tu equipo con los mejores premios</p>
               </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center bg-white rounded-md border border-gray-200 px-3 py-2 shadow-sm flex-grow md:flex-grow-0">
                <Filter size={16} className="text-gray-400 mr-2" />
                <select 
                  className="bg-transparent border-none text-sm focus:ring-0 outline-none w-full text-gray-700"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat === 'All' ? 'Todas las Categorías' : cat}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center bg-white rounded-md border border-gray-200 px-3 py-2 shadow-sm flex-grow md:flex-grow-0">
                <span className="text-gray-400 text-sm mr-2 font-bold">Pts Máx:</span>
                <input 
                  type="number" 
                  placeholder="Ej: 5000"
                  className="bg-transparent border-none text-sm focus:ring-0 outline-none w-24 text-gray-700"
                  value={maxPriceFilter}
                  onChange={(e) => setMaxPriceFilter(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>

              <div className="flex items-center bg-white rounded-md border border-gray-200 px-3 py-2 shadow-sm flex-grow md:flex-grow-0">
                <ArrowDownUp size={16} className="text-gray-400 mr-2" />
                <select 
                  className="bg-transparent border-none text-sm focus:ring-0 outline-none w-full text-gray-700"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="default">Ordenar por...</option>
                  <option value="popularity">Más Populares</option>
                  <option value="dateAdded">Novedades</option>
                  <option value="priceAsc">Menor Precio</option>
                  <option value="priceDesc">Mayor Precio</option>
                  <option value="nameAsc">Nombre (A-Z)</option>
                  <option value="nameDesc">Nombre (Z-A)</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
            {filteredAndSortedRewards.length > 0 ? (
              filteredAndSortedRewards.map(reward => (
                <RewardCard 
                  key={reward.id} 
                  reward={reward} 
                  currentUser={currentUser} 
                  currentPoints={currentPoints} 
                  onAddToCart={addToCart}
                  onViewDetails={setSelectedReward}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-lg">No se encontraron premios con los filtros actuales.</p>
                <button 
                  onClick={() => { setCategoryFilter('All'); setMaxPriceFilter(''); setSortBy('default'); }}
                  className="mt-4 text-gulf-blue font-bold hover:underline"
                >
                  Limpiar Filtros
                </button>
              </div>
            )}
          </div>

          <ProductModal 
            isOpen={!!selectedReward} 
            reward={selectedReward} 
            currentUser={currentUser} 
            currentPoints={currentPoints} 
            onClose={() => setSelectedReward(null)} 
            onAddToCart={addToCart}
          />
        </main>
        
        {/* Footer */}
        <footer className="bg-gulf-blue text-white py-12 mt-12 border-t-8 border-white relative overflow-hidden">
           <SoccerBallPattern className="absolute right-[-50px] bottom-[-50px] text-white/5 w-64 h-64" />
           <div className="container mx-auto text-center relative z-10">
              <div className="flex justify-center items-center gap-6 mb-6">
                  {/* Prolub Logo */}
                  <div className="bg-white p-3 rounded-lg shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                      <img src="https://i.postimg.cc/8PGFKD4z/Logo-Prolub-color.png" alt="Prolub" className="h-12 object-contain" />
                  </div>
                  
                  {/* Divider */}
                  <div className="h-8 w-px bg-white/20"></div>

                  {/* Gulf Logo */}
                  <div className="bg-white p-3 rounded-lg shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                      <img src="https://i.postimg.cc/yYKJQBj6/Logo-GULF.png" alt="Gulf" className="h-12 object-contain" />
                  </div>
              </div>
              
              <p className="text-3xl font-sports tracking-widest">PROLUB GULF 2026</p>
              <p className="text-xs text-gulf-sky uppercase tracking-[0.3em] mt-2 font-bold">Patrocinador Oficial de tus Victorias</p>
           </div>
        </footer>
      </div>
    );
  }

  // ... (Checkout view same as before)
  if (view === 'checkout') {
    return (
      <div className="min-h-screen bg-[#F5F9FC] flex flex-col relative">
        {loading && <LoadingScreen />}
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-5xl">
           <button onClick={() => setView('store')} className="mb-6 bg-white px-4 py-2 rounded-full shadow-sm text-gulf-blue hover:text-gulf-orange transition-colors flex items-center font-bold text-sm">
             <ChevronRight className="rotate-180 mr-1" size={16} /> Volver al Mercado
           </button>
           
           <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-white rounded-full border-4 border-gulf-blue flex items-center justify-center shadow-lg">
                 <Trophy className="text-gulf-orange" size={32} />
              </div>
              <div>
                  <h2 className="text-4xl font-sports text-gulf-blue uppercase leading-none">CONFIRMAR JUGADA</h2>
                  <p className="text-gray-500 text-sm">Asegura tu victoria completando los datos.</p>
              </div>
           </div>

           <div className="flex flex-col lg:flex-row gap-8">
              {/* Lineup Card */}
              <div className="lg:w-1/3 space-y-4">
                 <div className="bg-gradient-to-b from-gulf-blue to-black text-white p-6 rounded-xl shadow-2xl border-t-4 border-gulf-orange relative overflow-hidden">
                    <SoccerBallPattern className="absolute top-0 right-0 w-32 h-32 text-white/5" />
                    
                    <h3 className="text-xl font-sports mb-4 text-gulf-sky flex items-center relative z-10 border-b border-white/20 pb-2">
                       <ClipboardList className="mr-2" size={18} /> TU ALINEACIÓN
                    </h3>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                      {cart.map((item, idx) => (
                        <div key={idx} className="bg-white/10 p-3 rounded flex items-center space-x-3 border border-white/5 hover:bg-white/20 transition-colors">
                           <div className="w-10 h-10 bg-white rounded overflow-hidden flex-shrink-0 p-1">
                             <img src={item.imageUrls[0]} alt={item.name} className="w-full h-full object-contain" />
                           </div>
                           <div className="flex-grow min-w-0">
                              <p className="font-bold text-xs truncate uppercase">{item.name}</p>
                              <div className="flex justify-between items-center text-xs text-gulf-sky mt-1">
                                 <span className="bg-gulf-orange px-1.5 rounded text-[10px] text-black font-bold">x{item.quantity}</span>
                                 <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-white transition-colors">
                                    <X size={14} />
                                 </button>
                              </div>
                           </div>
                           <div className="text-right flex-shrink-0">
                             <p className="font-mono text-lg leading-none">{(item.appliedPrice * item.quantity).toLocaleString()}</p>
                           </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 pt-4 border-t-2 border-dashed border-white/20 relative z-10">
                       <div className="flex justify-between items-end">
                          <span className="text-xs opacity-80 uppercase font-bold tracking-wider">Total Puntos</span>
                          <span className="text-4xl font-sports text-yellow-400 leading-none">{calculateTotal().toLocaleString()}</span>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Tactics Board (Form) */}
              <div className="lg:w-2/3">
                 <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 relative">
                     {/* Chalkboard look header */}
                     <div className="bg-green-700 text-white -mx-8 -mt-8 px-8 py-4 rounded-t-xl mb-6 flex items-center shadow-inner">
                        <Truck className="mr-3" />
                        <h3 className="text-2xl font-sports uppercase tracking-wide">Logística de Envío</h3>
                     </div>
                     
                     <form onSubmit={handleCheckout} className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-between">
                           <div>
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Equipo (Usuario)</label>
                              <span className="font-mono font-bold text-lg text-gulf-blue">{currentUser?.businessId}</span>
                           </div>
                           <div className="bg-gulf-blue text-white px-2 py-1 rounded text-xs font-bold">VERIFICADO</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-1">
                              <label className="text-xs font-bold text-gulf-blue uppercase">Nombre del Receptor</label>
                              <input 
                                required 
                                type="text" 
                                placeholder="Capitán que recibe"
                                className="w-full px-4 py-3 bg-white border-2 border-gray-100 rounded-lg focus:border-gulf-blue focus:ring-0 outline-none transition-all" 
                                value={orderDetails.receiver} 
                                onChange={e => setOrderDetails({...orderDetails, receiver: e.target.value})} 
                              />
                           </div>
                           
                           <div className="space-y-1">
                              <label className="text-xs font-bold text-gulf-blue uppercase">Teléfono / Móvil</label>
                              <input 
                                required 
                                type="tel" 
                                placeholder="Contacto directo"
                                className="w-full px-4 py-3 bg-white border-2 border-gray-100 rounded-lg focus:border-gulf-blue focus:ring-0 outline-none transition-all"
                                value={orderDetails.phone} 
                                onChange={e => setOrderDetails({...orderDetails, phone: e.target.value})} 
                              />
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                               <label className="text-xs font-bold text-gulf-blue uppercase">Ciudad Sede</label>
                               <input 
                                 required 
                                 type="text" 
                                 placeholder="Ciudad de destino"
                                 className="w-full px-4 py-3 bg-white border-2 border-gray-100 rounded-lg focus:border-gulf-blue focus:ring-0 outline-none transition-all"
                                 value={orderDetails.city} 
                                 onChange={e => setOrderDetails({...orderDetails, city: e.target.value})} 
                               />
                            </div>
                            <div className="space-y-1">
                               <label className="text-xs font-bold text-gulf-blue uppercase">Dirección del Estadio</label>
                               <input 
                                 required 
                                 type="text" 
                                 placeholder="Dirección exacta"
                                 className="w-full px-4 py-3 bg-white border-2 border-gray-100 rounded-lg focus:border-gulf-blue focus:ring-0 outline-none transition-all"
                                 value={orderDetails.address} 
                                 onChange={e => setOrderDetails({...orderDetails, address: e.target.value})} 
                               />
                            </div>
                        </div>
                        
                        <div className="pt-6 mt-4 border-t border-gray-100">
                           <button 
                             type="submit" 
                             disabled={loading} 
                             className="w-full bg-gulf-orange hover:bg-orange-600 text-white font-sports text-3xl py-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-1 active:scale-95 border-b-4 border-[#c25a1a]"
                           >
                              {loading ? 'PATEANDO...' : '¡GOL! CONFIRMAR CANJE'}
                           </button>
                        </div>
                     </form>
                 </div>
              </div>
           </div>
        </main>
      </div>
    );
  }

  if (view === 'success') {
    // Keep the InvoiceTemplate mounted here but hidden off-screen to generate the PDF
    const totalPoints = cart.reduce((acc, item) => acc + (item.appliedPrice * item.quantity), 0);
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gulf-blue/95 backdrop-blur-md overflow-hidden">
        {/* Hidden Invoice for Generation */}
        <div style={{ position: 'absolute', top: 0, left: '-2000px' }}>
            <InvoiceTemplate 
                ref={invoiceRef}
                currentUser={currentUser}
                cart={cart}
                orderDetails={orderDetails}
                date={redemptionDate}
                totalPoints={totalPoints}
            />
        </div>

        <CelebrationEffect />
        <StadiumAtmosphere />
        
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative transform transition-all animate-in zoom-in duration-300 border-8 border-white z-20">
           
           {/* Animated Header */}
           <div className="bg-gradient-to-b from-gulf-sky/30 to-white h-64 relative flex items-center justify-center overflow-hidden border-b-4 border-gulf-orange">
              
              {/* Goal Post & Net */}
              <div className="absolute bottom-0 w-64 h-40 border-x-8 border-t-8 border-white rounded-t-xl shadow-[0_10px_20px_rgba(0,0,0,0.2)] z-10 mx-auto">
                   {/* Net Texture */}
                   <div className="absolute inset-0 bg-black/10 rounded-t-lg border border-black/5" 
                        style={{
                           backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 9px, rgba(255,255,255,0.8) 10px, transparent 11px), repeating-linear-gradient(-45deg, transparent, transparent 9px, rgba(255,255,255,0.8) 10px, transparent 11px)',
                           animation: 'netShake 0.4s ease-in-out 0.4s forwards'
                        }}>
                   </div>
              </div>

              {/* Ball Animation */}
              <div className="absolute z-20 animate-[goalScore_0.6s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards]">
                  <div className="w-16 h-16 bg-white rounded-full border-4 border-black shadow-xl flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 opacity-20 bg-black"></div> {/* Shadow */}
                      <img src="https://upload.wikimedia.org/wikipedia/commons/d/d3/Soccerball.svg" alt="Ball" className="w-full h-full object-cover animate-spin" style={{animationDuration: '3s'}} />
                  </div>
              </div>

              <style>{`
                 @keyframes goalScore {
                    0% { transform: scale(0.5) translate(-200%, 200%) rotate(-180deg); opacity: 0; }
                    60% { transform: scale(1.1) translate(0, 0) rotate(0deg); opacity: 1; }
                    80% { transform: scale(0.95) translate(0, 0); }
                    100% { transform: scale(1) translate(0, 0); }
                 }
                 @keyframes netShake {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05, 0.95); }
                    75% { transform: scale(0.95, 1.05); }
                    100% { transform: scale(1); }
                 }
              `}</style>
           </div>

           <div className="p-8 text-center relative z-20">
              <h2 className="text-7xl font-sports text-gulf-blue mb-0 leading-none tracking-wide drop-shadow-sm animate-pulse">¡GOLAZO!</h2>
              <div className="bg-gulf-orange text-white text-xl font-bold uppercase tracking-widest py-1 px-4 rounded-full inline-block mb-6 shadow-md transform -skew-x-12">
                 PREMIO CANJEADO
              </div>
              
              <p className="text-gray-500 mb-6 text-sm leading-relaxed font-medium">
                La jugada ha sido perfecta. <br/>
                Tu premio ya está en camino a la zona de anotación.
              </p>
              
              <button 
                onClick={handleDownloadInvoice} 
                disabled={downloading}
                className="w-full mb-4 bg-white border-2 border-gulf-blue text-gulf-blue hover:bg-gulf-blue hover:text-white font-sports text-2xl py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group"
              >
                {downloading ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></span>
                ) : (
                    <FileText size={20} />
                )}
                {downloading ? 'GENERANDO PDF...' : 'DESCARGAR COMPROBANTE (PDF)'}
              </button>

              <button onClick={handleExitSuccess} className="w-full bg-gulf-blue hover:bg-blue-900 text-white font-sports text-2xl py-4 rounded-xl shadow-xl border-b-4 border-black/20 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 group">
                <Trophy size={24} className="group-hover:text-yellow-400 transition-colors" />
                VOLVER AL CAMERINO
              </button>
           </div>
        </div>
      </div>
    );
  }

  return <LoadingScreen />;
};

export default App;