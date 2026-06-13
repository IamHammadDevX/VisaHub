export type ApplicationStatus =
  | "payment_pending"
  | "paid"
  | "progress"
  | "under_review"
  | "completed";

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
  status: ApplicationStatus;
  basicInfo: BasicInfo;
  detailedForm?: Record<string, string>;
  receiptSent?: boolean;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  submittedAt?: string;
}
