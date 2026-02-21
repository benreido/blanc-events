import { Resend } from "resend";
import { siteConfig, formatCurrency } from "@/lib/config";

const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

async function sendEmail(to: string, subject: string, html: string) {
    if (!resend) {
        console.log(`[EMAIL MOCK] To: ${to} | Subject: ${subject}`);
        console.log(html);
        return;
    }
    await resend.emails.send({
        from: `${siteConfig.name} <noreply@${new URL(siteConfig.url).hostname}>`,
        to,
        subject,
        html,
    });
}

const emailWrapper = (content: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Inter,Arial,sans-serif;background:#f8fafc;margin:0;padding:40px 20px;">
<div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;">
<div style="background:#123A2F;padding:24px 32px;">
<h1 style="color:white;margin:0;font-size:20px;font-weight:800;letter-spacing:-0.5px;">BLANC. EVENTS</h1>
</div>
<div style="padding:32px;">${content}</div>
<div style="background:#f8fafc;padding:24px 32px;border-top:1px solid #e2e8f0;">
<p style="margin:0;color:#94a3b8;font-size:12px;">
${siteConfig.name} | ${siteConfig.address}<br/>
${siteConfig.contactEmail} | ${siteConfig.contactPhone}
</p></div></div></body></html>`;

export async function sendEnquiryNotification(enquiry: {
    name: string; email: string; phone: string; subject: string; message: string;
}) {
    const html = emailWrapper(`
    <h2 style="color:#123A2F;margin-top:0;">New Contact Enquiry</h2>
    <table style="width:100%;border-collapse:collapse;">
    <tr><td style="padding:8px 0;color:#64748b;width:120px;">Name:</td><td style="padding:8px 0;font-weight:600;">${enquiry.name}</td></tr>
    <tr><td style="padding:8px 0;color:#64748b;">Email:</td><td style="padding:8px 0;">${enquiry.email}</td></tr>
    <tr><td style="padding:8px 0;color:#64748b;">Phone:</td><td style="padding:8px 0;">${enquiry.phone || "—"}</td></tr>
    <tr><td style="padding:8px 0;color:#64748b;">Subject:</td><td style="padding:8px 0;font-weight:600;">${enquiry.subject}</td></tr>
    </table>
    <div style="background:#f8fafc;border-radius:8px;padding:16px;margin-top:16px;">
    <p style="margin:0;color:#334155;">${enquiry.message}</p>
    </div>
  `);
    await sendEmail(siteConfig.contactEmail, `New Enquiry: ${enquiry.subject}`, html);
}

export async function sendQuoteRequestNotification(quote: {
    customerName: string; customerEmail: string; venue: string;
    startDate: string; endDate: string; numberOfDays: number;
    items: { itemName: string; quantity: number; dayRate: number; lineTotal: number }[];
    subtotal: number; servicesTotal: number; vatAmount: number; total: number;
}) {
    const itemRows = quote.items
        .map((i) => `<tr><td style="padding:8px;border-bottom:1px solid #f1f5f9;">${i.itemName}</td><td style="padding:8px;border-bottom:1px solid #f1f5f9;text-align:center;">${i.quantity}</td><td style="padding:8px;border-bottom:1px solid #f1f5f9;text-align:right;">${formatCurrency(i.dayRate)}/day</td><td style="padding:8px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:600;">${formatCurrency(i.lineTotal)}</td></tr>`)
        .join("");

    const adminHtml = emailWrapper(`
    <h2 style="color:#123A2F;margin-top:0;">New Quote Request</h2>
    <p><strong>${quote.customerName}</strong> (${quote.customerEmail})</p>
    <p>Venue: ${quote.venue || "TBC"} | Dates: ${quote.startDate} – ${quote.endDate} (${quote.numberOfDays} days)</p>
    <table style="width:100%;border-collapse:collapse;margin-top:16px;">
    <thead><tr style="background:#f8fafc;"><th style="padding:8px;text-align:left;font-size:12px;text-transform:uppercase;color:#64748b;">Item</th><th style="padding:8px;text-align:center;font-size:12px;text-transform:uppercase;color:#64748b;">Qty</th><th style="padding:8px;text-align:right;font-size:12px;text-transform:uppercase;color:#64748b;">Rate</th><th style="padding:8px;text-align:right;font-size:12px;text-transform:uppercase;color:#64748b;">Total</th></tr></thead>
    <tbody>${itemRows}</tbody>
    </table>
    <div style="margin-top:16px;text-align:right;">
    <p style="margin:4px 0;color:#64748b;">Subtotal: ${formatCurrency(quote.subtotal)}</p>
    <p style="margin:4px 0;color:#64748b;">Services: ${formatCurrency(quote.servicesTotal)}</p>
    <p style="margin:4px 0;color:#64748b;">VAT: ${formatCurrency(quote.vatAmount)}</p>
    <p style="margin:4px 0;font-size:18px;font-weight:800;color:#123A2F;">Total: ${formatCurrency(quote.total)}</p>
    </div>
  `);

    const customerHtml = emailWrapper(`
    <h2 style="color:#123A2F;margin-top:0;">Quote Request Received</h2>
    <p>Hi ${quote.customerName},</p>
    <p>Thank you for your quote request! We've received your equipment hire enquiry and will be in touch within 24 hours with a detailed quote.</p>
    <p><strong>Event Dates:</strong> ${quote.startDate} – ${quote.endDate} (${quote.numberOfDays} days)</p>
    <p><strong>Estimated Total:</strong> ${formatCurrency(quote.total)} inc. VAT</p>
    <h3 style="color:#123A2F;">What happens next?</h3>
    <ol style="color:#475569;">
    <li>Our team reviews your requirements</li>
    <li>We confirm availability and send a detailed quote</li>
    <li>Once approved, pay a 25% deposit to secure your booking</li>
    <li>Equipment delivered to your venue</li>
    </ol>
    <p>Questions? Reply to this email or call <strong>${siteConfig.contactPhone}</strong>.</p>
  `);

    await sendEmail(siteConfig.contactEmail, `Quote Request from ${quote.customerName}`, adminHtml);
    await sendEmail(quote.customerEmail, "Your Quote Request – Blanc. Events", customerHtml);
}

export async function sendBookingConfirmation(booking: {
    customerName: string; customerEmail: string;
    startDate: string; endDate: string; total: number; amountPaid: number;
    items: { itemName: string; quantity: number; lineTotal: number }[];
}) {
    const itemRows = booking.items
        .map((i) => `<tr><td style="padding:8px;border-bottom:1px solid #f1f5f9;">${i.itemName}</td><td style="padding:8px;text-align:center;">${i.quantity}</td><td style="padding:8px;text-align:right;font-weight:600;">${formatCurrency(i.lineTotal)}</td></tr>`)
        .join("");

    const html = emailWrapper(`
    <h2 style="color:#123A2F;margin-top:0;">Booking Confirmed! 🎉</h2>
    <p>Hi ${booking.customerName},</p>
    <p>Your booking has been confirmed. Here are the details:</p>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0;">
    <p style="margin:0;color:#166534;font-weight:700;">✓ Payment of ${formatCurrency(booking.amountPaid)} received</p>
    </div>
    <p><strong>Event Dates:</strong> ${booking.startDate} – ${booking.endDate}</p>
    <table style="width:100%;border-collapse:collapse;margin-top:16px;">
    <thead><tr style="background:#f8fafc;"><th style="padding:8px;text-align:left;">Item</th><th style="padding:8px;text-align:center;">Qty</th><th style="padding:8px;text-align:right;">Total</th></tr></thead>
    <tbody>${itemRows}</tbody>
    </table>
    <p style="margin-top:16px;font-weight:800;color:#123A2F;font-size:18px;text-align:right;">Total: ${formatCurrency(booking.total)}</p>
    <p style="margin-top:24px;">If you have any questions, contact us at <strong>${siteConfig.contactEmail}</strong> or <strong>${siteConfig.contactPhone}</strong>.</p>
  `);

    await sendEmail(booking.customerEmail, "Booking Confirmed – Blanc. Events", html);
    await sendEmail(siteConfig.contactEmail, `Booking Confirmed: ${booking.customerName}`, html);
}

export async function sendPaymentLink(to: string, customerName: string, amount: number, paymentUrl: string) {
    const html = emailWrapper(`
    <h2 style="color:#123A2F;margin-top:0;">Payment Required</h2>
    <p>Hi ${customerName},</p>
    <p>Your equipment hire booking is ready for payment. Please click below to complete your payment of <strong>${formatCurrency(amount)}</strong>.</p>
    <div style="text-align:center;margin:32px 0;">
    <a href="${paymentUrl}" style="display:inline-block;background:#1F5C4B;color:white;padding:16px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Pay Now</a>
    </div>
    <p style="color:#64748b;font-size:13px;">This link will expire in 48 hours. If you have questions, contact us at ${siteConfig.contactPhone}.</p>
  `);
    await sendEmail(to, "Payment Link – Blanc. Events", html);
}
