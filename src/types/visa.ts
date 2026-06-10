export interface VisaCard {
  id: number;
  visaType: string;
  visaTypeId: number;
  visaFee: number;
  serviceFee: number;
  totalFee: number;
  processingTime: string;
  validity: string;
  stayDuration: string;
  entryType: string;
  description?: string;
}

export interface VisaSearchParams {
  originCountry: number;
  destinationCountry: number;
}
