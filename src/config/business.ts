export interface BusinessRules {
  currency: "ARS";
  minimumMarginPercent: number;
  monthlyProductiveHours: number;
  reservePercent: number;
}

export const defaultBusinessRules: BusinessRules = {
  currency: "ARS",
  minimumMarginPercent: 30,
  monthlyProductiveHours: 140,
  reservePercent: 10,
};
