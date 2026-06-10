export interface VisaCard {
  id: number;
  visaType: string;
  visaFee: number;
  serviceFee: number;
  totalFee: number;
  processingTime: string;
  validity: string;
  stayDuration: string;
  description?: string;
}

export interface VisaSearchParams {
  originCountry: number;
  destinationCountry: number;
}
