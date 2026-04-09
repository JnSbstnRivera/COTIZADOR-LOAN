export interface QuoteInputs {
  panels: number;
  batteries: number;
  extendedSolarWarranty: boolean;
  extendedBatteryWarranty: boolean;
  financing: 'WH' | 'ORIENTAL';
  manualPronto: number;
}

export interface QuoteResults {
  solarValue: number;
  solarWarrantyValue: number;
  batteryValue: number;
  batteryWarrantyValue: number;
  cashValue: number;
  valorFinanciado: number;
  systemSize: number;
  monthlyPayments: MonthlyPayment[];
  error?: string;
}

export interface MonthlyPayment {
  years: number;
  rate: number;
  amount: number;
  rateMax?: number;
  amountMax?: number;
  label?: string;
}
