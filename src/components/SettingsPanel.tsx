import React, { useState } from 'react';
import { TaxSettings } from '../types';
import Icon from './Icon';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    vibrationEnabled: boolean;
    setVibrationEnabled: (enabled: boolean) => void;
    soundEnabled: boolean;
    setSoundEnabled: (enabled: boolean) => void;
    taxSettings: TaxSettings;
    setTaxSettings: React.Dispatch<React.SetStateAction<TaxSettings>>;
    maxHistory: number;
    setMaxHistory: (value: number) => void;
    orientation: 'auto' | 'portrait';
    setOrientation: (value: 'auto' | 'portrait') => void;
  };
  theme: string;
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  fontFamily: string;
  setFontFamily: (font: string) => void;
  fontScale: number;
  setFontScale: (scale: number) => void;
  buttonTextColor: string | null;
  setButtonTextColor: (color: string | null) => void;
  borderColor: string | null;
  setBorderColor?: (color: string | null) => void;
  numberBtnColor?: string | null;
  setNumberBtnColor?: (color: string | null) => void;
  funcBtnColor?: string | null;
  setFuncBtnColor?: (color: string | null) => void;
  calcBgColor?: string | null;
  setCalcBgColor?: (color: string | null) => void;
  onOpenSupport: () => void;
  onShowAbout: () => void;
  deferredPrompt?: any;
  onInstallApp?: () => void;
}

const convertArabicNumerals = (str: string | number): string => {
    if (typeof str !== 'string' && typeof str !== 'number') return '';
    return String(str)
        .replace(/[٠١٢٣٤٥٦٧٨٩]/g, d => String.fromCharCode(d.charCodeAt(0) - 1632))
        .replace(/[۰۱۲۳۴۵۶۷۸۹]/g, d => String.fromCharCode(d.charCodeAt(0) - 1776));
};

const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  isOpen, onClose, settings, theme, onThemeChange, fontFamily, setFontFamily, 
  fontScale, setFontScale, buttonTextColor, setButtonTextColor, borderColor, 
  setBorderColor, numberBtnColor, setNumberBtnColor, funcBtnColor, setFuncBtnColor, 
  calcBgColor, setCalcBgColor, onOpenSupport, onShowAbout, deferredPrompt, onInstallApp 
}) => {
  const { vibrationEnabled, setVibrationEnabled, soundEnabled, setSoundEnabled, taxSettings, setTaxSettings, maxHistory, setMaxHistory, orientation, setOrientation } = settings;
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ appearance: true, tax: true, general: true });

  const handleTaxChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setTaxSettings(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  
  const handleTaxRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const westernValue = convertArabicNumerals(e.target.value);
     if (/^\d*\.?\d*$/.test(westernValue)) {
        setTaxSettings(prev => ({...prev, rate: Number(westernValue) }));
     }
  };

  return (
    <div className={`fixed top-0 bottom-0 right-0 w-[320px] max-w-[85vw] bg-[var(--bg-panel)] text-[var(--text-primary)] z-[9999] p-5 shadow-2xl overflow-y-auto border-l-2 border-[var(--border-primary)] transition-all duration-300 transform ${isOpen ? 'translate-x-0 opacity-100 pointer-events-auto' : 'translate-x-full opacity-0 pointer-events-none'}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[var(--accent-color)] text-2xl font-bold">⚙️ الإعدادات</h3>
        <button onClick={onClose} className="text-2xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">✕</button>
      </div>
      
      {deferredPrompt && onInstallApp && (
        <div className="mb-6">
           <button onClick={onInstallApp} className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl py-3 font-bold text-lg shadow-lg hover:from-blue-700 transition-all flex items-center justify-center gap-2">
             📲 تثبيت التطبيق على الجهاز
           </button>
        </div>
      )}

      {/* APPEARANCE SECTION */}
      <div className="mb-4 border border-[var(--border-secondary)] rounded-xl bg-[var(--bg-inset-light)] p-3">
        <h4 className="font-bold text-[var(--text-primary)] mb-3">🎨 تخصيص المظهر والألوان</h4>
        <div className="space-y-3">
          <div><label className="text-xs text-[var(--text-secondary)] mb-1">النسق:</label>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => onThemeChange('light')} className={`py-1.5 rounded-lg text-xs transition-all border ${theme === 'light' ? 'bg-[var(--accent-color)] text-white border-transparent' : 'border-[var(--border-secondary)]'}`}>فاتح</button>
            <button onClick={() => onThemeChange('dark')} className={`py-1.5 rounded-lg text-xs transition-all border ${theme === 'dark' ? 'bg-[var(--accent-color)] text-white border-transparent' : 'border-[var(--border-secondary)]'}`}>داكن</button>
            <button onClick={() => onThemeChange('system')} className={`py-1.5 rounded-lg text-xs transition-all border ${theme === 'system' ? 'bg-[var(--accent-color)] text-white border-transparent' : 'border-[var(--border-secondary)]'}`}>نظام</button>
          </div></div>
          <div><label className="text-xs text-[var(--text-secondary)] mb-1 block">نوع الخط:</label>
          <select value={fontFamily} onChange={e => setFontFamily(e.target.value)} className="w-full p-2 rounded-lg border border-[var(--border-secondary)] bg-[var(--bg-panel)] text-[var(--text-primary)] text-sm">
            <option value='Tajawal'>Tajawal</option><option value='Cairo'>Cairo</option><option value='Almarai'>Almarai</option>
          </select></div>
          <div><label className="text-xs text-[var(--text-secondary)] mb-1 block">حجم الخط: {Math.round(fontScale * 100)}%</label>
          <input type='range' min='0.85' max='1.15' step='0.05' value={fontScale} onChange={e => setFontScale(parseFloat(e.target.value))} className='w-full h-1.5 rounded-lg' /></div>
        </div>
      </div>

      {/* TAX SECTION */}
      <div className="mb-4 border border-[var(--border-secondary)] rounded-xl bg-[var(--bg-inset-light)] p-3">
        <h4 className="font-bold text-[var(--text-primary)] mb-3">💰 إعدادات الضريبة</h4>
        <label className="flex items-center mb-4"><input type="checkbox" name="isEnabled" checked={taxSettings.isEnabled} onChange={handleTaxChange} className="ml-3 w-5 h-5" /> تفعيل الضريبة</label>
        <div className={taxSettings.isEnabled ? '' : 'opacity-50'}>
          <select name="mode" value={taxSettings.mode} onChange={handleTaxChange} disabled={!taxSettings.isEnabled} className="w-full p-2.5 rounded-lg border border-[var(--border-secondary)] bg-[var(--bg-panel)] text-[var(--text-primary)] mb-3 text-sm">
            <option value="add-15">إضافة 15%</option>
            <option value="extract-custom">استخلاص نسبة</option>
            <option value="divide-93">القسمة على 0.93</option>
            <option value="custom">نسبة مخصصة</option>
          </select>
          {['custom', 'extract-custom'].includes(taxSettings.mode) && (
            <input type="text" inputMode="decimal" value={taxSettings.rate} onChange={handleTaxRateChange} placeholder="%" className="w-full p-2 rounded-lg border border-[var(--border-secondary)] bg-[var(--bg-panel)] text-[var(--text-primary)] text-sm text-center" />
          )}
        </div>
      </div>

      {/* GENERAL SECTION */}
      <div className="mb-4 border border-[var(--border-secondary)] rounded-xl bg-[var(--bg-inset-light)] p-3">
        <h4 className="font-bold text-[var(--text-primary)] mb-3">🛠️ إعدادات عامة</h4>
        <div className="space-y-2">
          <label className="text-xs text-[var(--text-secondary)] block">اتجاه الشاشة:</label>
          <div className="flex gap-2 mb-3">
            <button onClick={() => setOrientation('auto')} className={`flex-1 py-1.5 rounded-lg text-xs transition-all border ${orientation === 'auto' ? 'bg-[var(--accent-color)] text-white border-transparent' : 'border-[var(--border-secondary)]'}`}>تلقائي</button>
            <button onClick={() => setOrientation('portrait')} className={`flex-1 py-1.5 rounded-lg text-xs transition-all border ${orientation === 'portrait' ? 'bg-[var(--accent-color)] text-white border-transparent' : 'border-[var(--border-secondary)]'}`}>عمودي</button>
          </div>
          <label className="flex items-center justify-between text-xs mb-2"><span>الحد الأقصى للسجل:</span><input type="number" value={maxHistory} onChange={(e) => setMaxHistory(Math.min(500, Math.max(1, parseInt(e.target.value) || 1)))} min="1" max="500" className="w-20 p-1.5 rounded-lg border border-[var(--border-secondary)] bg-[var(--bg-panel)] text-[var(--text-primary)] text-center" /></label>
          <label className="flex items-center justify-between text-xs mb-2"><span>الاهتزاز</span><input type="checkbox" checked={vibrationEnabled} onChange={(e) => setVibrationEnabled(e.target.checked)} className="w-5 h-5" /></label>
          <label className="flex items-center justify-between text-xs"><span>المؤثرات الصوتية</span><input type="checkbox" checked={soundEnabled} onChange={(e) => setSoundEnabled(e.target.checked)} className="w-5 h-5" /></label>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <button onClick={onShowAbout} className="w-full py-3 rounded-xl border border-[var(--border-secondary)] bg-[var(--bg-inset)] text-[var(--text-primary)] font-bold text-base hover:brightness-95 transition-colors">ℹ️ حول</button>
        <button onClick={onOpenSupport} className="w-full bg-gradient-to-br from-green-600/50 to-green-700/60 text-white border border-green-400/80 rounded-xl py-3 font-bold text-lg shadow-lg mt-3 hover:from-green-600/60 transition-colors">💬 الدعم</button>
      </div>
    </div>
  );
};

export default SettingsPanel;
