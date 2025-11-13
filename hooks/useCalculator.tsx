
import { useState, useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { parseExpression } from '../services/calculationEngine';
import { getLocalFix, findErrorDetails } from '../services/localErrorFixer';
import { HistoryItem, TaxSettings, ErrorState, AISuggestion } from '../types';
import { defaultButtonLayout } from '../constants';

interface UseCalculatorProps {
  showNotification: (message: string) => void;
}

export const useCalculator = ({ showNotification }: UseCalculatorProps) => {
  const [input, setInput] = useState('0');
  const [history, setHistory] = useLocalStorage<HistoryItem[]>('calcHistory_v2', []);
  const [lastAnswer, setLastAnswer] = useLocalStorage<string>('calcLastAnswer', '0');
  const [vibrationEnabled, setVibrationEnabled] = useLocalStorage<boolean>('calcVibration', true);
  const [taxSettings, setTaxSettings] = useLocalStorage<TaxSettings>('calcTaxSettings_v2', { isEnabled: false, mode: 'add-15', rate: 15, showTaxPerNumber: false });
  const [maxHistory, setMaxHistory] = useLocalStorage<number>('calcMaxHistory', 50);
  const [buttonLayout] = useLocalStorage('calcButtonLayout_v10', defaultButtonLayout);
  const [calculationExecuted, setCalculationExecuted] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);

  const entryCount = useMemo(() => {
      if (calculationExecuted) return 1;
      if (input === '0' || !input) return 0;
      const numbers = input.match(/\d+(\.\d+)?/g);
      return numbers ? numbers.length : 0;
  }, [input, calculationExecuted]);
  
  const vibrate = (duration = 30) => {
    if (vibrationEnabled && navigator.vibrate) {
      navigator.vibrate(duration);
    }
  };

  const clearAll = useCallback(() => {
    vibrate(50);
    setInput('0');
    setCalculationExecuted(false);
    setError(null);
    setAiSuggestion(null);
  }, [vibrationEnabled]);

  const backspace = useCallback(() => {
    vibrate(30);
    setError(null);
    setAiSuggestion(null);
    setInput(prev => {
      const newStr = prev.slice(0, -1);
      return newStr === '' || newStr === '0' ? '0' : newStr;
    });
    setCalculationExecuted(false);
  }, [vibrationEnabled]);

  const append = useCallback((value: string) => {
    vibrate(20);
    setError(null);
    setAiSuggestion(null);
    if (calculationExecuted) {
      const isOperator = ['+', '-', '×', '÷'].includes(value);
      setInput(isOperator ? input + value : value);
      setCalculationExecuted(false);
      return;
    }
    setInput(prev => {
      if (prev === '0' && !['.', '(', ')'].includes(value)) return value;
      
      const lastChar = prev.slice(-1);
      const operators = ['+', '-', '×', '÷'];

      if (lastChar === ')' && !['+', '-', '×', '÷', '%', ')'].includes(value)) {
          return prev + '×' + value;
      }

      if (operators.includes(value) && operators.includes(lastChar)) {
        return prev.slice(0, -1) + value;
      }
      
      return prev + value;
    });
  }, [calculationExecuted, input, vibrationEnabled]);

   const toggleSign = useCallback(() => {
    vibrate(30);
    const isSimpleNumber = /^-?\d+(\.\d+)?$/.test(input);
    if (calculationExecuted || isSimpleNumber) {
        setInput(prev => {
            if (prev === '0') return '0';
            const new_input = prev.startsWith('-') ? prev.slice(1) : '-' + prev;
            setCalculationExecuted(false);
            return new_input;
        });
    }
  }, [vibrationEnabled, calculationExecuted, input]);

  const handleParenthesis = useCallback(() => {
    vibrate(20);
    setError(null);
    setAiSuggestion(null);
    if (calculationExecuted) {
        setInput('(');
        setCalculationExecuted(false);
        return;
    }
    setInput(prev => {
        const openParenCount = (prev.match(/\(/g) || []).length;
        const closeParenCount = (prev.match(/\)/g) || []).length;
        const lastChar = prev.slice(-1);
        if (openParenCount > closeParenCount && !['(', '+', '-', '×', '÷'].includes(lastChar)) {
            return prev + ')';
        } else {
            if (prev === '0') return '(';
            if (!isNaN(parseInt(lastChar, 10)) || lastChar === ')') {
                return prev + '×(';
            }
            return prev + '(';
        }
    });
  }, [calculationExecuted, vibrationEnabled]);

   const appendAnswer = useCallback(() => {
    vibrate(20);
    setError(null);
    setAiSuggestion(null);
    if (calculationExecuted) {
        setInput(lastAnswer);
        setCalculationExecuted(false);
        return;
    }
    setInput(prev => {
        if (prev === '0') return lastAnswer;
        const lastChar = prev.slice(-1);
         if (!isNaN(parseInt(lastChar, 10)) || lastChar === ')') {
            return prev + '×' + lastAnswer;
        }
        return prev + lastAnswer;
    });
  }, [lastAnswer, calculationExecuted, vibrationEnabled]);

  const calculate = useCallback(async () => {
    vibrate(70);
    setError(null);
    setAiSuggestion(null);
    const expression = input;
    if (expression === '0') return;
    try {
      const safeExpr = expression.replace(/×/g, '*').replace(/÷/g, '/').replace(/%/g, '/100').replace(/(?<=^|\()(\+)/g, '');
      let result = parseExpression(safeExpr);
      if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
        throw new Error('تعبير غير صالح رياضيًا.');
      }
      const resultStr = result.toLocaleString('en-US', {maximumFractionDigits: 10, useGrouping: false});
      setLastAnswer(resultStr);
      
      let taxResultValue: number | null = null;
      let effectiveTaxRate = taxSettings.rate || 0;
      
      if (taxSettings.isEnabled) {
          switch(taxSettings.mode) {
              case 'add-15':
                  taxResultValue = result * 1.15;
                  effectiveTaxRate = 15;
                  break;
              case 'custom':
                  taxResultValue = result * (1 + effectiveTaxRate / 100);
                  break;
              case 'extract-custom':
                  taxResultValue = result / (1 + effectiveTaxRate / 100);
                  break;
              case 'divide-93':
                  taxResultValue = result / 0.93;
                  break;
          }
      }

      const taxResult = taxResultValue ? taxResultValue.toLocaleString('en-US', {maximumFractionDigits: 10, useGrouping: false}) : null;
      const taxLabel = taxSettings.mode === 'extract-custom' ? 'الأصل بدون ضريبة' : 'الإجمالي مع الضريبة';
      const now = new Date();
      
      const newItem: HistoryItem = {
        id: Date.now(),
        expression: expression,
        result: resultStr,
        taxResult: taxResult,
        taxMode: taxSettings.isEnabled ? taxSettings.mode : null,
        taxRate: taxSettings.isEnabled ? effectiveTaxRate : null,
        taxLabel: taxSettings.isEnabled ? taxLabel : null,
        date: now.toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' }),
        time: now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        notes: ''
      };
      setHistory(prev => [newItem, ...prev].slice(0, maxHistory));
      setInput(resultStr);
      setCalculationExecuted(true);
    } catch (e: any) {
        const errorMessage = e.message || 'خطأ غير معروف';
        setError({ message: errorMessage, details: findErrorDetails(expression, errorMessage) });
        setCalculationExecuted(false);
        
        const localFix = getLocalFix(expression);
        if (localFix && localFix.fix) {
            setAiSuggestion({ ...localFix });
        } else {
            setAiSuggestion(null);
        }
    }
  }, [input, taxSettings, setHistory, vibrationEnabled, maxHistory, setLastAnswer]);
  
  const applyAiFix = useCallback(() => {
    if (aiSuggestion?.fix) {
        setInput(aiSuggestion.fix);
        setError(null);
        setAiSuggestion(null);
    }
  }, [aiSuggestion]);

  const clearHistory = useCallback(() => {
    vibrate(50);
    setHistory([]);
  }, [setHistory, vibrationEnabled]);

  const deleteHistoryItem = useCallback((id: number) => {
    setHistory(prevHistory => prevHistory.filter(item => item.id !== id));
  }, [setHistory]);

  const loadFromHistory = useCallback((expression: string) => {
    setInput(expression);
    setCalculationExecuted(false);
    setError(null);
    setAiSuggestion(null);
  }, []);

  const updateInput = useCallback((value: string) => {
    setError(null);
    setAiSuggestion(null);
    if (calculationExecuted) {
        setCalculationExecuted(false);
    }
    setInput(value === '' ? '0' : value);
  }, [calculationExecuted]);

  const updateHistoryItemNote = useCallback((id: number, note: string) => {
      setHistory(prevHistory => 
          prevHistory.map(item =>
              item.id === id ? { ...item, notes: note } : item
          )
      );
  }, [setHistory]);
  
  return {
    input, history, error, aiSuggestion, isCalculationExecuted: calculationExecuted, entryCount,
    settings: {
      vibrationEnabled, setVibrationEnabled,
      taxSettings, setTaxSettings, maxHistory, setMaxHistory, buttonLayout
    },
    actions: {
      append, clearAll, backspace, calculate, toggleSign, handleParenthesis, appendAnswer, applyAiFix, clearHistory, deleteHistoryItem, loadFromHistory, updateInput, updateHistoryItemNote
    }
  };
};