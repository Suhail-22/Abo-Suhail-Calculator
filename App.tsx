import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useCalculator } from './hooks/useCalculator';
import { useLocalStorage } from './hooks/useLocalStorage';
import Calculator from './components/Calculator';
import SettingsPanel from './components/SettingsPanel';
import HistoryPanel from './components/HistoryPanel';
import SupportPanel from './components/SupportPanel';
import AboutPanel from './components/AboutPanel';
import Overlay from './components/Overlay';
import Notification from './components/Notification';
import ConfirmationDialog from './components/ConfirmationDialog';
import { HistoryItem } from './types';

// إضافة نوع لحالة الاتصال
type OnlineStatus = 'online' | 'offline' | 'checking';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [notification, setNotification] = useState({ message: '', show: false });
  const [appUpdate, setAppUpdate] = useState<{ available: boolean; registration: ServiceWorkerRegistration | null }>({ available: false, registration: null });
  const [confirmation, setConfirmation] = useState<ConfirmationState>({ isOpen: false, onConfirm: () => {}, onCancel: () => {}, title: '', message: '' });
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  // إضافة حالة الاتصال
  const [onlineStatus, setOnlineStatus] = useState<OnlineStatus>('checking');

  const [theme, setTheme] = useLocalStorage<string>('calcTheme_v3', 'dark');
  const [fontFamily, setFontFamily] = useLocalStorage<string>('calcFontFamily_v2', 'Tajawal');
  const [fontScale, setFontScale] = useLocalStorage<number>('calcFontScale_v2', 1);
  
  const [buttonTextColor, setButtonTextColor] = useLocalStorage<string | null>('calcButtonTextColor_v1', null);
  const [borderColor, setBorderColor] = useLocalStorage<string | null>('calcBorderColor_v1', null);
  const [numberBtnColor, setNumberBtnColor] = useLocalStorage<string | null>('calcNumberBtnColor_v1', null);
  const [funcBtnColor, setFuncBtnColor] = useLocalStorage<string | null>('calcFuncBtnColor_v1', null);
  const [calcBgColor, setCalcBgColor] = useLocalStorage<string | null>('calcBgColor_v1', null);

  const showNotification = useCallback((message: string) => {
    setNotification({ message, show: true });
    setTimeout(() => {
      setNotification({ message: '', show: false });
    }, 3000);
  }, []);
  
  const calculator = useCalculator({ showNotification });

  // إدارة حالة الاتصال
  useEffect(() => {
    const updateOnlineStatus = () => {
      const isOnline = navigator.onLine;
      setOnlineStatus(isOnline ? 'online' : 'offline');
      
      if (!isOnline) {
        showNotification('⚡ التطبيق يعمل بدون اتصال');
      } else {
        showNotification('✅ الاتصال بالإنترنت متوفر');
      }
    };

    updateOnlineStatus();

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [showNotification]);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      showNotification('✅ تم تثبيت التطبيق بنجاح');
    }
  }, [deferredPrompt, showNotification]);

  // باقي الكود يبقى كما هو...
  // [الكود الحالي يبقى دون تغيير]

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed" style={{ background: 'var(--bg-primary-gradient)' }}>

      {/* إضافة مؤشر حالة الاتصال */}
      {onlineStatus === 'offline' && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white text-center py-2 text-sm font-bold">
          ⚡ وضع عدم الاتصال - التطبيق يعمل محلياً
        </div>
      )}

      <div className={`flex justify-center items-center min-h-screen w-full font-sans relative pt-24 pb-8 md:pt-8 transition-all duration-300 ${orientationStyle}`}>
        {/* باقي الكود يبقى كما هو... */}
        {appUpdate.available && (
           <div className="absolute top-4 z-20 w-[calc(100%-2rem)] max-w-[420px] bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between animate-fade-in-down">
             <div>
               <h4 className="font-bold">✨ تحديث جديد جاهز!</h4>
               <p className="text-xs opacity-90 mt-1">نسخة أحدث وأسرع متاحة الآن.</p>
             </div>
             <button onClick={onUpdateAccepted} className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors">تحديث</button>
           </div>
        )}

        <Calculator 
          calculator={calculator}
          onToggleSettings={() => setIsSettingsOpen(true)}
          onToggleHistory={() => setIsHistoryOpen(true)}
          onShare={showNotification}
          entryCount={calculator.entryCount}
          todayCount={todayCount}
          onlineStatus={onlineStatus} // تمرير حالة الاتصال
        />

        {/* باقي المكونات تبقى كما هي... */}
      </div>
    </div>
  );
}

export default App;