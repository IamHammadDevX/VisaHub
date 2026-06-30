export interface VisaCard {
  id: number;
  visaType: string;
  visaTypeId: number;
  visaFee: number;
  serviceFee: number;
  totalFee: number;
  visaFeeSeparate: boolean;
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

export interface VisaDocumentRequirement {
  id: number;
  name: string;
}

export interface VisaDocumentGroup {
  id: number;
  name: string;
  documentIds: number[];
  documents: VisaDocumentRequirement[];
}

export interface VisaDocumentParams {
  visaId: number;
  originCountry: number;
  destinationCountry: number;
}
