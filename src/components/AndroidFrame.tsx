import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Wifi, Battery, ArrowLeft, Circle, Square } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  viewMode: 'mobile' | 'expanded';
  onToggleViewMode: (mode: 'mobile' | 'expanded') => void;
  onSystemBack: () => void;
  canGoBack: boolean;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  viewMode,
  onToggleViewMode,
  onSystemBack,
  canGoBack
}) => {
  const [currentTimeStr, setCurrentTimeStr] = useState('12:00');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#06070a] flex flex-col items-center">
      {/* Top Universal Mode Switcher Bar */}
      <header className="w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-4 py-2 flex items-center justify-between text-xs z-40">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-amber-500 tracking-tight text-sm">
            CineArchive
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400 font-medium hidden sm:inline">
            Android Media3 & Jetpack Compose Architecture
          </span>
        </div>

        {/* Viewport Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => onToggleViewMode('mobile')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${
              viewMode === 'mobile'
                ? 'bg-amber-500 text-black font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Pixel 9 Device Frame</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleViewMode('expanded')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${
              viewMode === 'expanded'
                ? 'bg-amber-500 text-black font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Fullscreen / Tablet Cinema</span>
          </button>
        </div>
      </header>

      {/* Frame Container */}
      {viewMode === 'mobile' ? (
        <div className="py-4 md:py-8 px-2 flex justify-center w-full">
          {/* Realistic Android Phone Chassis (Pixel 9 Pro style) */}
          <div className="relative w-full max-w-[420px] h-[860px] bg-[#0c0e14] rounded-[48px] p-3 shadow-2xl border-[6px] border-[#222533] flex flex-col overflow-hidden ring-1 ring-slate-800">
            {/* Top Android Status Bar */}
            <div className="w-full h-8 px-6 pt-1 flex items-center justify-between text-[11px] font-semibold text-slate-300 z-30 select-none bg-slate-950/60">
              <span>{currentTimeStr}</span>

              {/* Front Camera Punch Hole */}
              <div className="w-3.5 h-3.5 rounded-full bg-black border border-slate-800 shadow-inner" />

              <div className="flex items-center gap-1.5 text-slate-400">
                <Wifi className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-[10px] font-bold">5G</span>
                <Battery className="w-4 h-4 text-slate-300" />
              </div>
            </div>

            {/* Scrollable Android Screen Content */}
            <div className="relative flex-1 overflow-y-auto no-scrollbar bg-[#08090d] flex flex-col">
              {children}
            </div>

            {/* Bottom Android System Navigation Bar */}
            <div className="w-full h-11 bg-black/95 px-8 flex items-center justify-between text-slate-400 z-30 border-t border-slate-900 select-none">
              {/* Back Button */}
              <button
                type="button"
                aria-label="Android System Back Button"
                onClick={onSystemBack}
                disabled={!canGoBack}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  canGoBack ? 'text-slate-200 hover:text-white hover:bg-slate-800' : 'text-slate-600'
                }`}
                title="Android Back Button"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              {/* Home Gesture / Circle */}
              <button
                type="button"
                aria-label="Android Home"
                onClick={onSystemBack}
                className="p-2 text-slate-400 hover:text-white cursor-pointer"
              >
                <Circle className="w-3.5 h-3.5" />
              </button>

              {/* Overview / Task Switcher */}
              <button
                type="button"
                aria-label="Android Tasks"
                className="p-2 text-slate-400 hover:text-white cursor-pointer"
              >
                <Square className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Fullscreen Cinema / Tablet View */
        <div className="w-full flex-1 flex flex-col">
          {children}
        </div>
      )}
    </div>
  );
};
