import path from "path";

import dayjs from "dayjs";
import fs from "fs-extra";
import nodemailer from "nodemailer";

import type { ReceiptOrder } from "@utils/generateReceipt";

export async function sendReceiptEmail(
  to: string,
  pdfPath: string,
  orderId: string,
  order?: ReceiptOrder
): Promise<void> {
  try {
    const { EMAIL_USER, EMAIL_PASS } = process.env;

    if (!EMAIL_USER || !EMAIL_PASS) {
      console.warn("⚠️ Email credentials missing. Skipping email send.");
      return;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    const fileName = path.basename(pdfPath);
    const dateStr = order ? dayjs(order.createdAt).format("MMMM D, YYYY") : "";
    const BRAND_PRIMARY = "#b91c1c";
    const BRAND_SECONDARY = "#f4b400";
    const CLUB_NAME = process.env.CLUB_NAME || "Zonta Club of Naples";
    const CLUB_ADDRESS = process.env.CLUB_ADDRESS || "123 Main St • Naples, FL 34102";
    const CLUB_EMAIL = process.env.CLUB_EMAIL || "zonta@naples.org";
    const WEBSITE_URL = process.env.CLUB_URL || "https://zonta-naples.org";

    const itemsHtml = order
      ? order.items
          .map(
            (item) => `
          <tr>
            <td style="padding:8px; border-bottom:1px solid #eee;">${item.title}</td>
            <td style="text-align:center; padding:8px; border-bottom:1px solid #eee;">${item.quantity}</td>
            <td style="text-align:right; padding:8px; border-bottom:1px solid #eee;">$${item.price.toFixed(2)}</td>
            <td style="text-align:right; padding:8px; border-bottom:1px solid #eee;">$${(
              item.price * item.quantity
            ).toFixed(2)}</td>
          </tr>`
          )
          .join("")
      : "";

    const htmlBody = order
      ? `
      <html>
        <body style="font-family:Arial, sans-serif; background:#f8f8f8; margin:0; padding:0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:40px auto; background:white; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
            <tr style="background:${BRAND_PRIMARY}; color:white;">
              <td style="padding:20px; text-align:center;">
                <h1 style="margin:0; font-size:22px;">${CLUB_NAME}</h1>
                <p style="margin:4px 0 0;">Payment Receipt</p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px;">
                <p style="font-size:15px; margin:0;">Hello <strong>${order.customerName}</strong>,</p>
                <p style="margin-top:6px; color:#444;">Thank you for your support! Below is your receipt for your recent order.</p>

                <h3 style="margin-top:20px; color:${BRAND_PRIMARY}; text-align:center;">Order Summary</h3>
                <table width="100%" style="margin-top:10px; border-collapse:collapse;">
                  <thead>
                    <tr style="background:${BRAND_PRIMARY}; color:white;">
                      <th style="padding:8px; text-align:left;">Item</th>
                      <th style="padding:8px; text-align:center;">Qty</th>
                      <th style="padding:8px; text-align:right;">Price</th>
                      <th style="padding:8px; text-align:right;">Total</th>
                    </tr>
                  </thead>
                  <tbody>${itemsHtml}</tbody>
                </table>

                <p style="text-align:right; font-weight:bold; margin-top:15px; font-size:16px;">
                  Total: $${order.total.toFixed(2)}
                </p>

                <p style="font-size:13px; color:#555;">Date: ${dateStr}</p>
                <p style="font-size:13px; color:#555;">Email: ${order.customerEmail}</p>

                <p style="margin-top:25px; color:#333; text-align:center; font-size:14px;">
                  Thank you for supporting the Zonta Club of Naples!<br>
                  Your contribution helps empower women and improve our community.
                </p>
              </td>
            </tr>
            <tr style="background:${BRAND_SECONDARY}; text-align:center; color:#333;">
              <td style="padding:10px; font-size:12px;">
                ${CLUB_ADDRESS} • ${CLUB_EMAIL}<br>
                <a href="${WEBSITE_URL}" style="color:#333; text-decoration:none;">${WEBSITE_URL}</a>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `
      : "<p>Thank you for your order!</p>";

    const attachments = [];

    if (pdfPath && (await fs.pathExists(pdfPath))) {
      attachments.push({
        filename: fileName,
        path: pdfPath,
        contentType: "application/pdf",
      });
    }

    const mailOptions = {
      from: `"${CLUB_NAME}" <${EMAIL_USER}>`,
      to,
      subject: `Your ${CLUB_NAME} Receipt - Order #${orderId}`,
      html: htmlBody,
      attachments,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Receipt email sent successfully to ${to}`);
  } catch (error) {
    console.error("❌ Error sending receipt email:", error);
  }
}