import { 
  PANEL_PRICES, 
  BATTERY_PRICES, 
  BATTERY_WARRANTY, 
  WH_RATES, 
  ORIENTAL_DESDE, 
  ORIENTAL_HASTA
} from '../constants';
import { QuoteInputs, QuoteResults, MonthlyPayment } from '../types';

export function pmt(annualRate: number, years: number, principal: number): number {
  if (principal <= 0) return 0;
  const rate = annualRate / 12;
  const periods = years * 12;
  if (rate === 0) return principal / periods;
  return (rate * principal) / (1 - Math.pow(1 + rate, -periods));
}

export function calculateQuote(v: QuoteInputs): QuoteResults {
  const solarValue = PANEL_PRICES[v.panels] || 0;
  const systemSize = v.panels * 410;

  const solarWarrantyValue = v.extendedSolarWarranty ? systemSize * 0.15 : 0;
  const batteryValue = BATTERY_PRICES[v.batteries] || 0;
  const batteryWarrantyValue = v.extendedBatteryWarranty ? (BATTERY_WARRANTY[v.batteries] || 0) : 0;

  // Equipment base
  const totalCashValue = solarValue + batteryValue + solarWarrantyValue + batteryWarrantyValue;

  // Final financed value with manual down payment
  const activeFinancedValue = Math.max(totalCashValue - v.manualPronto, 0);

  let error: string | undefined;
  const monthlyPayments: MonthlyPayment[] = [];

  if (v.panels === 0 && v.batteries === 0) {
    error = "Selecciona placas o baterías para continuar";
  } else if (v.financing === 'WH') {
    const hasPanels = v.panels > 0;
    const hasBatteries = v.batteries > 0;

    if (hasPanels && hasBatteries) {
      if (v.panels < 8 || v.batteries < 1) {
        error = "⚠️ WH Financial requiere un mínimo de 8 placas + 1 batería para sistemas combinados.";
      }
    } else if (hasPanels && !hasBatteries) {
      if (v.panels < 4) {
        error = "⚠️ WH Financial requiere un mínimo de 4 placas para sistemas de solo placas.";
      }
    }

    if (!error && activeFinancedValue < 5000) {
      error = "⚠️ El financiamiento mínimo con WH Financial es de $5,000.";
    }

    if (!error) {
      Object.entries(WH_RATES).forEach(([years, rate]) => {
        const y = Number(years);
        // Reglas de WH:
        // 1. Si solo hay baterías, solo 10 años
        if (!hasPanels && hasBatteries && y !== 10) return;
        
        // 2. Si solo hay placas, solo 10 y 15 años
        if (hasPanels && !hasBatteries && (y === 20 || y === 25)) return;
        
        // 3. Placas + Baterías -> 10, 15, 20, 25 (permitidos todos)
        
        monthlyPayments.push({
          years: y,
          rate,
          amount: pmt(rate, y, activeFinancedValue)
        });
      });
    }
  } else {
    // Oriental Bank
    const hasPanels = v.panels > 0;
    const hasBatteries = v.batteries > 0;

    if (hasPanels && hasBatteries) {
      if (v.panels < 8 || v.batteries < 1) {
        error = "⚠️ Oriental Bank requiere un mínimo de 8 placas + 1 batería para sistemas combinados.";
      }
    } else {
      if (v.panels < 8) {
        error = "⚠️ Oriental Bank requiere un mínimo de 8 placas para financiamiento.";
      }
    }

    if (!error && activeFinancedValue < 10000) {
      error = "⚠️ El financiamiento mínimo con Oriental Bank es de $10,000.";
    }

    if (!error) {
      Object.keys(ORIENTAL_DESDE).forEach((years) => {
        const y = Number(years);
        const desde = ORIENTAL_DESDE[y];
        const hasta = ORIENTAL_HASTA[y];

        // Reglas de Oriental:
        // 1. Si solo hay placas:
        if (hasPanels && !hasBatteries) {
          // No permite 20 ni 25 años
          if (y === 20 || y === 25) return;
          // Monto entre 10k y 15k: solo 10 años
          if (activeFinancedValue >= 10000 && activeFinancedValue < 15000 && y !== 10) return;
        }
        
        // 2. Placas + Baterías -> 10, 15, 20, 25 (permitidos todos)

        monthlyPayments.push({
          years: y,
          rate: desde,
          amount: pmt(desde, y, activeFinancedValue),
          rateMax: hasta,
          amountMax: pmt(hasta, y, activeFinancedValue),
          label: 'Rango de Tasas'
        });
      });
    }
  }

  return {
    solarValue,
    solarWarrantyValue,
    batteryValue,
    batteryWarrantyValue,
    cashValue: totalCashValue,
    valorFinanciado: activeFinancedValue,
    systemSize,
    monthlyPayments,
    error
  };
}
