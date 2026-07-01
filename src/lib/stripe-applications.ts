import Stripe from "stripe";
import type { ApplicationStatus, BasicInfo, StoredApplication } from "@/types/application";

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe is not configured");
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

function metadataValue(
  metadata: Stripe.Metadata | null | undefined,
  key: string
) {
  return metadata?.[key] || "";
}

/** Reconstruct detailed form data from Stripe metadata (handles chunked storage) */
function parseDetailedForm(
  metadata: Stripe.Metadata | null | undefined
): Record<string, string> | undefined {
  if (!metadata) return undefined;
  // Single-key storage
  const raw = metadataValue(metadata, "detailedForm");
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // fall through to chunked
    }
  }
  // Chunked storage (for large forms)
  const chunks = parseInt(metadataValue(metadata, "dfChunks"), 10);
  if (chunks > 0) {
    let combined = "";
    for (let i = 0; i < chunks; i++) {
      combined += metadataValue(metadata, `df${i}`);
    }
    try {
      return JSON.parse(combined);
    } catch {
      return undefined;
    }
  }
  return undefined;
}

export function generateReferenceId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "";
  for (let i = 0; i < 8; i += 1) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `VH-${id.slice(0, 4)}-${id.slice(4)}`;
}

export function sessionToApplication(
  session: Stripe.Checkout.Session
): StoredApplication {
  const metadata = session.metadata || {};
  const basicInfo: BasicInfo = {
    fullName: metadataValue(metadata, "fullName"),
    email:
      metadataValue(metadata, "email") ||
      (typeof session.customer_details?.email === "string"
        ? session.customer_details.email
        : ""),
    phoneCountryCode: metadataValue(metadata, "phoneCountryCode"),
    phoneNumber: metadataValue(metadata, "phoneNumber"),
    nationality: metadataValue(metadata, "nationality"),
    dateOfBirth: metadataValue(metadata, "dateOfBirth"),
    passportNumber: metadataValue(metadata, "passportNumber"),
    travelDate: metadataValue(metadata, "travelDate"),
    notes: metadataValue(metadata, "notes"),
  };

  const paidAt = metadataValue(metadata, "paidAt");
  const submittedAt = metadataValue(metadata, "submittedAt");
  const paymentPending = session.payment_status !== "paid";

  // Determine status: prefer explicit metadata.status (set by admin)
  // otherwise derive from payment + form submission state
  const customStatus = metadataValue(metadata, "status");
  const validStatuses: ApplicationStatus[] = ["payment_pending", "paid", "progress", "under_review", "completed"];
  const derivedStatus: ApplicationStatus = paymentPending
    ? "payment_pending"
    : metadataValue(metadata, "formSubmitted") === "true"
      ? "progress"
      : "paid";
  const status: ApplicationStatus = validStatuses.includes(customStatus as ApplicationStatus)
    ? (customStatus as ApplicationStatus)
    : derivedStatus;

  return {
    referenceId: metadataValue(metadata, "referenceId"),
    sessionId: session.id,
    visaId: metadataValue(metadata, "visaId"),
    visaTypeId: metadataValue(metadata, "visaTypeId"),
    visaType: metadataValue(metadata, "visaType") || "Visa",
    originCountry: metadataValue(metadata, "originCountry"),
    destinationCountry: metadataValue(metadata, "destinationCountry"),
    amount: (session.amount_total || 0) / 100,
    currency: metadataValue(metadata, "currency") || "usd",
    status,
    basicInfo,
    adminNotes: metadataValue(metadata, "adminNotes"),
    detailedForm: parseDetailedForm(metadata),
    receiptSent: metadataValue(metadata, "receiptSent") === "true",
    createdAt: new Date(session.created * 1000).toISOString(),
    updatedAt: metadataValue(metadata, "updatedAt") || new Date().toISOString(),
    paidAt: paidAt || undefined,
    submittedAt: submittedAt || undefined,
  };
}

export async function findApplicationByReference(referenceId: string) {
  const stripe = getStripe();
  // search() not available in this SDK version — use list() + filter
  const results = await stripe.checkout.sessions.list({ limit: 100 });
  const session = results.data.find(
    (s) => s.metadata?.referenceId === referenceId
  );
  return session ? sessionToApplication(session) : null;
}

export async function getApplicationBySession(sessionId: string) {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return sessionToApplication(session);
}
