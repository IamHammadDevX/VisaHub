export type ApplicationStatus =
  | "payment_pending"
  | "paid"
  | "progress"
  | "under_review"
  | "completed";

export interface AdminNote {
  text: string;
  timestamp: string;
}

export interface BasicInfo {
  fullName: string;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  nationality: string;
  dateOfBirth: string;
  passportNumber: string;
  travelDate: string;
  notes?: string;
}

export interface StoredApplication {
  referenceId: string;
  sessionId?: string;
  visaId: string;
  visaTypeId: string;
  visaType: string;
  originCountry: string;
  destinationCountry: string;
  amount: number;
  currency: string;
  status: ApplicationStatus;
  basicInfo: BasicInfo;
  detailedForm?: Record<string, string>;
  formLabels?: Record<string, string>;
  receiptSent?: boolean;
  adminNotes?: AdminNote[];
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  submittedAt?: string;
}
