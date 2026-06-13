export function buildDetailedFormEmail({
  referenceId,
  visaType,
  amount,
  originCountry,
  destinationCountry,
  applicantName,
  nationality,
  passportNumber,
  travelDate,
  dateOfBirth,
  phone,
  email,
  formData,
  trackLink,
}: {
  referenceId: string;
  visaType: string;
  amount: number;
  originCountry: string;
  destinationCountry: string;
  applicantName?: string;
  nationality?: string;
  passportNumber?: string;
  travelDate?: string;
  dateOfBirth?: string;
  phone?: string;
  email?: string;
  formData: Record<string, string>;
  trackLink: string;
}) {
  const formattedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedDob = dateOfBirth
    ? new Date(dateOfBirth).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

  const formattedTravel = travelDate
    ? new Date(travelDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

  // Build form detail rows (skip empty fields)
  const formRows = Object.entries(formData)
    .filter(([, val]) => val && val.trim())
    .map(
      ([key, value]) => `
        <tr>
          <td style="padding:8px 16px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;width:40%">${key}</td>
          <td style="padding:8px 16px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#0f172a;font-weight:500">${value}</td>
        </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 20px">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.04)">

      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#7C3AED,#6D28D9);padding:32px 40px;text-align:center">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td align="center">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:38px;height:38px;background:white;border-radius:10px;text-align:center;vertical-align:middle;font-size:18px;font-weight:700;color:#7C3AED">V</td>
                <td style="padding-left:10px"><span style="color:white;font-size:22px;font-weight:700;letter-spacing:-0.5px">VisaHub</span></td>
              </tr>
            </table>
          </td></tr>
        </table>
        <h1 style="color:rgba(255,255,255,0.95);font-size:20px;margin:16px 0 0;font-weight:600">Detailed Visa Form Submitted</h1>
        <p style="color:rgba(255,255,255,0.7);font-size:13px;margin:4px 0 0">We have received your visa application details</p>
      </td></tr>

      <!-- Status Bar -->
      <tr><td style="padding:0 40px">
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:-1px">
          <tr>
            <td style="width:33.33%;padding:16px 0;text-align:center;border-bottom:3px solid #7C3AED">
              <span style="font-size:11px;color:#7C3AED;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Submitted</span>
            </td>
            <td style="width:33.33%;padding:16px 0;text-align:center;border-bottom:3px solid #e2e8f0">
              <span style="font-size:11px;color:#94a3b8;font-weight:500;text-transform:uppercase;letter-spacing:0.5px">Review</span>
            </td>
            <td style="width:33.33%;padding:16px 0;text-align:center;border-bottom:3px solid #e2e8f0">
              <span style="font-size:11px;color:#94a3b8;font-weight:500;text-transform:uppercase;letter-spacing:0.5px">Decision</span>
            </td>
          </tr>
        </table>
      </td></tr>

      <tr><td style="padding:24px 40px 8px">
        <!-- Reference Badge -->
        <table cellpadding="0" cellspacing="0" style="margin:0 auto 20px">
          <tr><td style="background:#f8f4ff;border:1px solid #e8daff;border-radius:10px;padding:12px 24px;text-align:center">
            <p style="font-size:11px;color:#7C3AED;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;font-weight:600">Reference ID</p>
            <p style="font-family:monospace;font-size:20px;font-weight:700;color:#6D28D9;margin:0;letter-spacing:2px">${referenceId}</p>
          </td></tr>
        </table>

        <!-- Personal Information Card -->
        <div style="background:#fafbfc;border:1px solid #e2e8f0;border-radius:14px;padding:20px 24px;margin-bottom:16px">
          <p style="font-size:12px;color:#7C3AED;margin:0 0 14px;text-transform:uppercase;letter-spacing:0.8px;font-weight:600">Personal Information</p>
          <table width="100%" cellpadding="6" cellspacing="0">
            <tr><td style="font-size:13px;color:#64748b;width:45%">Full Name</td><td style="font-size:13px;color:#0f172a;font-weight:600">${applicantName || "-"}</td></tr>
            <tr><td style="font-size:13px;color:#64748b">Email</td><td style="font-size:13px;color:#0f172a">${email || "-"}</td></tr>
            <tr><td style="font-size:13px;color:#64748b">Phone</td><td style="font-size:13px;color:#0f172a">${phone || "-"}</td></tr>
            <tr><td style="font-size:13px;color:#64748b">Nationality</td><td style="font-size:13px;color:#0f172a;font-weight:500">${nationality || "-"}</td></tr>
            <tr><td style="font-size:13px;color:#64748b">Date of Birth</td><td style="font-size:13px;color:#0f172a">${formattedDob}</td></tr>
            <tr><td style="font-size:13px;color:#64748b">Passport No.</td><td style="font-size:13px;color:#0f172a;font-family:monospace;font-weight:500">${passportNumber || "-"}</td></tr>
          </table>
        </div>

        <!-- Visa Details Card -->
        <div style="background:#fafbfc;border:1px solid #e2e8f0;border-radius:14px;padding:20px 24px;margin-bottom:16px">
          <p style="font-size:12px;color:#7C3AED;margin:0 0 14px;text-transform:uppercase;letter-spacing:0.8px;font-weight:600">Visa & Travel Details</p>
          <table width="100%" cellpadding="6" cellspacing="0">
            <tr><td style="font-size:13px;color:#64748b;width:45%">Visa Type</td><td style="font-size:13px;color:#0f172a;font-weight:600">${visaType}</td></tr>
            <tr><td style="font-size:13px;color:#64748b">Origin Country</td><td style="font-size:13px;color:#0f172a">${originCountry || "-"}</td></tr>
            <tr><td style="font-size:13px;color:#64748b">Destination</td><td style="font-size:13px;color:#0f172a;font-weight:600">${destinationCountry || "-"}</td></tr>
            <tr><td style="font-size:13px;color:#64748b">Travel Date</td><td style="font-size:13px;color:#0f172a">${formattedTravel}</td></tr>
            <tr><td style="font-size:13px;color:#64748b">Service Fee</td><td style="font-size:13px;color:#059669;font-weight:700">$${amount.toLocaleString()}.00</td></tr>
          </table>
        </div>

        <!-- Form Details Card (only if there are additional fields) -->
        ${
          formRows
            ? `
        <div style="background:#fafbfc;border:1px solid #e2e8f0;border-radius:14px;padding:20px 24px;margin-bottom:16px">
          <p style="font-size:12px;color:#7C3AED;margin:0 0 14px;text-transform:uppercase;letter-spacing:0.8px;font-weight:600">Additional Information</p>
          <table width="100%" cellpadding="6" cellspacing="0">
            ${formRows}
          </table>
        </div>`
            : ""
        }

        <!-- CTA Button -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 8px">
          <tr><td align="center">
            <a href="${trackLink}" style="display:inline-block;background:#7C3AED;color:white;text-decoration:none;padding:14px 40px;border-radius:999px;font-size:15px;font-weight:600;letter-spacing:-0.3px;box-shadow:0 4px 12px rgba(124,58,237,0.3)">Track Application</a>
          </td></tr>
        </table>

        <p style="font-size:12px;color:#94a3b8;text-align:center;line-height:1.7;margin:0 0 4px">
          Use your reference ID to track your application status at any time.<br>
          Our team will review your application and get back to you within 24 hours.
        </p>
      </td></tr>

      <!-- Footer -->
      <tr><td style="border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;background:#fafbfc">
        <p style="font-size:11px;color:#94a3b8;margin:0 0 4px">
          VisaHub &bull; Your Trusted Visa Partner
        </p>
        <p style="font-size:11px;color:#cbd5e1;margin:0">
          This is an automated email. Please do not reply.
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

export function buildReceiptEmail({
  referenceId,
  visaType,
  amount,
  date,
  trackLink,
  formLink,
  originCountry,
  destinationCountry,
  applicantName,
  phone,
}: {
  referenceId: string;
  visaType: string;
  amount: number;
  date: string;
  trackLink: string;
  formLink?: string;
  originCountry: string;
  destinationCountry: string;
  applicantName?: string;
  phone?: string;
}) {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0b1e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0b1e;padding:40px 20px">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#0f1029;border-radius:16px;border:1px solid rgba(255,255,255,0.06);overflow:hidden">
      <tr><td style="background:linear-gradient(135deg,#06B6D4,#0891b2);padding:30px 40px;text-align:center">
        <div style="display:inline-flex;align-items:center;gap:10px">
          <div style="width:36px;height:36px;background:white;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#06B6D4">V</div>
          <span style="color:white;font-size:22px;font-weight:700;letter-spacing:-0.5px">VisaHub</span>
        </div>
        <p style="color:rgba(255,255,255,0.9);font-size:18px;margin:16px 0 0;font-weight:600">Payment Confirmed</p>
      </td></tr>

      <tr><td style="padding:30px 40px;color:#f1f5f9">
        <p style="font-size:15px;line-height:1.6;margin:0 0 20px;color:#94a3b8">
          Dear ${applicantName || "Applicant"},<br><br>
          Your payment is confirmed. Complete the detailed visa form next so our team can review your application and get back to you within 24 hours.
        </p>

        <div style="background:rgba(6,182,212,0.08);border:1px solid rgba(6,182,212,0.15);border-radius:12px;padding:16px 20px;text-align:center;margin-bottom:24px">
          <p style="font-size:11px;color:#94a3b8;margin:0 0 6px;text-transform:uppercase;letter-spacing:1px">Receipt ID</p>
          <p style="font-family:monospace;font-size:22px;font-weight:700;color:#06B6D4;margin:0;letter-spacing:2px">${referenceId}</p>
        </div>

        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:20px;margin-bottom:24px">
          <p style="font-size:12px;color:#94a3b8;margin:0 0 14px;text-transform:uppercase;letter-spacing:1px">Application Summary</p>
          <table width="100%" cellpadding="6" cellspacing="0">
            <tr><td style="font-size:13px;color:#94a3b8">Applicant</td><td style="font-size:13px;color:#f1f5f9;text-align:right;font-weight:600">${applicantName || "Applicant"}</td></tr>
            <tr><td style="font-size:13px;color:#94a3b8">Phone</td><td style="font-size:13px;color:#f1f5f9;text-align:right">${phone || "-"}</td></tr>
            <tr><td style="font-size:13px;color:#94a3b8">Visa Type</td><td style="font-size:13px;color:#f1f5f9;text-align:right;font-weight:600">${visaType}</td></tr>
            <tr><td style="font-size:13px;color:#94a3b8">Amount Paid</td><td style="font-size:13px;color:#22C55E;text-align:right;font-weight:700">$${amount.toLocaleString()}.00</td></tr>
            <tr><td style="font-size:13px;color:#94a3b8">Date</td><td style="font-size:13px;color:#f1f5f9;text-align:right">${formattedDate}</td></tr>
            <tr><td style="font-size:13px;color:#94a3b8">Route</td><td style="font-size:13px;color:#f1f5f9;text-align:right">${originCountry || "?"} to ${destinationCountry || "?"}</td></tr>
          </table>
        </div>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
          <tr><td align="center">
            <a href="${trackLink}" style="display:inline-block;background:#06B6D4;color:white;text-decoration:none;padding:14px 40px;border-radius:999px;font-size:15px;font-weight:600;letter-spacing:-0.3px">Track Application</a>
            ${
              formLink
                ? `<br><br><a href="${formLink}" style="display:inline-block;background:#22C55E;color:white;text-decoration:none;padding:14px 40px;border-radius:999px;font-size:15px;font-weight:600;letter-spacing:-0.3px">Complete Detailed Visa Form</a>`
                : ""
            }
          </td></tr>
        </table>

        <p style="font-size:12px;color:#64748b;text-align:center;line-height:1.6;margin:0">
          No login is required. Use your receipt ID to track your application from any browser or device.
        </p>
      </td></tr>

      <tr><td style="border-top:1px solid rgba(255,255,255,0.06);padding:20px 40px;text-align:center">
        <p style="font-size:11px;color:#475569;margin:0">
          Copyright ${new Date().getFullYear()} VisaHub. All rights reserved.<br>
          This is an automated email. Please do not reply.
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}
