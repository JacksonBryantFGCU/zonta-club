// zonta-server/src/services/emailService.ts
// Sends transactional emails via nodemailer using EMAIL_USER/EMAIL_PASS from .env.
// All functions are fire-and-forget safe — callers should .catch() and log.

import nodemailer from "nodemailer";

function createTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error("EMAIL_USER and EMAIL_PASS must be set to send emails.");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

const clubName = () => process.env.CLUB_NAME ?? "Zonta Club of Naples";
const clubEmail = () => process.env.CLUB_EMAIL ?? process.env.EMAIL_USER ?? "";
const fromAddress = () => `"${clubName()}" <${process.env.EMAIL_USER ?? ""}>`;

// ── sendOneTimeDonationReceipt ─────────────────────────────────────────────

export interface OneTimeDonationReceiptOptions {
  donorFirstName: string;
  donorLastName: string;
  donorEmail: string;
  amountCents: number;
  givingLevel: string;
  paymentId: string;
  receiptUrl?: string | null;
}

export async function sendOneTimeDonationReceipt(
  opts: OneTimeDonationReceiptOptions
): Promise<void> {
  const transporter = createTransporter();
  const amount = `$${(opts.amountCents / 100).toFixed(2)}`;
  const club = clubName();
  const replyTo = clubEmail();

  const receiptLine = opts.receiptUrl
    ? `<p>You can view your payment receipt here: <a href="${opts.receiptUrl}">${opts.receiptUrl}</a></p>`
    : "";

  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #222;">
      <div style="background: #8B1A1A; padding: 24px 32px;">
        <h1 style="color: #D4A843; margin: 0; font-size: 22px;">${club}</h1>
      </div>
      <div style="padding: 32px;">
        <h2 style="color: #8B1A1A; margin-top: 0;">Thank You for Your Donation!</h2>
        <p>Dear ${opts.donorFirstName},</p>
        <p>
          We are deeply grateful for your generous gift of <strong>${amount}</strong>
          to the ${club}. Your support makes a real difference in the lives of women
          and girls in our community.
        </p>
        <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
          <tr style="background: #f9f6f0;">
            <td style="padding: 10px 14px; font-weight: bold; border: 1px solid #e0d9cc;">Donor</td>
            <td style="padding: 10px 14px; border: 1px solid #e0d9cc;">${opts.donorFirstName} ${opts.donorLastName}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; font-weight: bold; border: 1px solid #e0d9cc;">Amount</td>
            <td style="padding: 10px 14px; border: 1px solid #e0d9cc;">${amount}</td>
          </tr>
          <tr style="background: #f9f6f0;">
            <td style="padding: 10px 14px; font-weight: bold; border: 1px solid #e0d9cc;">Gift Type</td>
            <td style="padding: 10px 14px; border: 1px solid #e0d9cc;">One-time donation</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; font-weight: bold; border: 1px solid #e0d9cc;">Payment Reference</td>
            <td style="padding: 10px 14px; font-family: monospace; border: 1px solid #e0d9cc;">${opts.paymentId}</td>
          </tr>
        </table>
        ${receiptLine}
        <p>
          Please retain this email for your records. No goods or services were provided
          in exchange for this contribution.
        </p>
        <p>
          With heartfelt gratitude,<br/>
          <strong>${club}</strong>
        </p>
        <hr style="border: none; border-top: 1px solid #e0d9cc; margin: 24px 0;"/>
        <p style="font-size: 12px; color: #888;">
          Questions? Contact us at <a href="mailto:${replyTo}">${replyTo}</a>.
        </p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: fromAddress(),
    replyTo,
    to: opts.donorEmail,
    subject: `Your ${club} donation — ${amount} received`,
    html,
    text: [
      `Dear ${opts.donorFirstName},`,
      ``,
      `Thank you for your generous gift of ${amount} to the ${club}.`,
      ``,
      `Donor: ${opts.donorFirstName} ${opts.donorLastName}`,
      `Amount: ${amount}`,
      `Gift Type: One-time donation`,
      `Payment Reference: ${opts.paymentId}`,
      opts.receiptUrl ? `Receipt: ${opts.receiptUrl}` : "",
      ``,
      `Please retain this email for your records. No goods or services were provided in exchange for this contribution.`,
      ``,
      `With heartfelt gratitude,`,
      `${club}`,
      ``,
      `Questions? Contact us at ${replyTo}`,
    ]
      .filter((l) => l !== undefined)
      .join("\n"),
  });
}

// ── sendRecurringDonationReceipt ───────────────────────────────────────────

export interface RecurringDonationReceiptOptions {
  donorFirstName: string;
  donorLastName: string;
  donorEmail: string;
  amountCents: number;
  givingLevel: string;
  subscriptionId: string;
}

export async function sendRecurringDonationReceipt(
  opts: RecurringDonationReceiptOptions
): Promise<void> {
  const transporter = createTransporter();
  const amount = `$${(opts.amountCents / 100).toFixed(2)}`;
  const club = clubName();
  const replyTo = clubEmail();

  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #222;">
      <div style="background: #8B1A1A; padding: 24px 32px;">
        <h1 style="color: #D4A843; margin: 0; font-size: 22px;">${club}</h1>
      </div>
      <div style="padding: 32px;">
        <h2 style="color: #8B1A1A; margin-top: 0;">Welcome to Monthly Giving!</h2>
        <p>Dear ${opts.donorFirstName},</p>
        <p>
          Thank you for becoming a sustaining donor to the ${club}. Your monthly
          gift of <strong>${amount}/month</strong> will make a lasting difference
          in the lives of women and girls in our community.
        </p>
        <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
          <tr style="background: #f9f6f0;">
            <td style="padding: 10px 14px; font-weight: bold; border: 1px solid #e0d9cc;">Donor</td>
            <td style="padding: 10px 14px; border: 1px solid #e0d9cc;">${opts.donorFirstName} ${opts.donorLastName}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; font-weight: bold; border: 1px solid #e0d9cc;">Monthly Amount</td>
            <td style="padding: 10px 14px; border: 1px solid #e0d9cc;">${amount}/month</td>
          </tr>
          <tr style="background: #f9f6f0;">
            <td style="padding: 10px 14px; font-weight: bold; border: 1px solid #e0d9cc;">Gift Type</td>
            <td style="padding: 10px 14px; border: 1px solid #e0d9cc;">Monthly recurring donation</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; font-weight: bold; border: 1px solid #e0d9cc;">Subscription Reference</td>
            <td style="padding: 10px 14px; font-family: monospace; border: 1px solid #e0d9cc;">${opts.subscriptionId}</td>
          </tr>
        </table>
        <p>
          Your card will be charged <strong>${amount}</strong> on the same day each month
          until you choose to cancel. To cancel, please contact us at
          <a href="mailto:${replyTo}">${replyTo}</a>.
        </p>
        <p>
          Please retain this email for your records. No goods or services were provided
          in exchange for this contribution.
        </p>
        <p>
          With heartfelt gratitude,<br/>
          <strong>${club}</strong>
        </p>
        <hr style="border: none; border-top: 1px solid #e0d9cc; margin: 24px 0;"/>
        <p style="font-size: 12px; color: #888;">
          Questions or to cancel? Contact us at <a href="mailto:${replyTo}">${replyTo}</a>.
        </p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: fromAddress(),
    replyTo,
    to: opts.donorEmail,
    subject: `Your ${club} monthly donation — ${amount}/month confirmed`,
    html,
    text: [
      `Dear ${opts.donorFirstName},`,
      ``,
      `Thank you for becoming a sustaining donor to the ${club}.`,
      ``,
      `Donor: ${opts.donorFirstName} ${opts.donorLastName}`,
      `Monthly Amount: ${amount}/month`,
      `Gift Type: Monthly recurring donation`,
      `Subscription Reference: ${opts.subscriptionId}`,
      ``,
      `Your card will be charged ${amount} on the same day each month until you choose to cancel.`,
      `To cancel, please contact us at ${replyTo}.`,
      ``,
      `Please retain this email for your records. No goods or services were provided in exchange for this contribution.`,
      ``,
      `With heartfelt gratitude,`,
      `${club}`,
      ``,
      `Questions or to cancel? Contact us at ${replyTo}`,
    ].join("\n"),
  });
}
