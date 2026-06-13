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
