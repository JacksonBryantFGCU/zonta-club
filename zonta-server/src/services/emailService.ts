// zonta-server/src/services/emailService.ts

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
  console.log("📨 sendReceiptEmail called for:", to, "| Order ID:", orderId);

  try {
    const { EMAIL_USER, EMAIL_PASS } = process.env;

    if (!EMAIL_USER || !EMAIL_PASS) {
      console.warn(" Missing EMAIL_USER or EMAIL_PASS. Skipping email send.");
      return;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });

    const fileName = path.basename(pdfPath);
    const hasFile = await fs.pathExists(pdfPath);
    console.log("📎 PDF attachment exists:", hasFile);

    const dateStr = order
      ? dayjs(order.createdAt).format("MMMM D, YYYY")
      : dayjs().format("MMMM D, YYYY");
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
                <td>${item.title}</td>
                <td style="text-align:center;">${item.quantity}</td>
                <td style="text-align:right;">$${item.price.toFixed(2)}</td>
                <td style="text-align:right;">$${(item.price * item.quantity).toFixed(2)}</td>
              </tr>`
          )
          .join("")
      : "";

    const htmlBody = `
      <html>
        <body style="font-family:Arial,sans-serif; background:#f8f8f8;">
          <table width="100%" style="max-width:600px; margin:40px auto; background:white;">
            <tr style="background:${BRAND_PRIMARY}; color:white; text-align:center;">
              <td style="padding:20px;">
                <h2>${CLUB_NAME}</h2>
                <p>Payment Receipt</p>
              </td>
            </tr>
            <tr><td style="padding:20px;">
              <p>Hello <strong>${order?.customerName || "Valued Customer"}</strong>,</p>
              <p>Thank you for your support! Below is your receipt.</p>
              <table width="100%" style="margin-top:10px; border-collapse:collapse;">
                <thead>
                  <tr style="background:${BRAND_PRIMARY}; color:white;">
                    <th>Item</th><th>Qty</th><th>Price</th><th>Total</th>
                  </tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
              </table>
              <p style="text-align:right; font-weight:bold;">Total: $${order?.total.toFixed(2)}</p>
              <p style="font-size:12px; color:#777;">Date: ${dateStr}</p>
            </td></tr>
            <tr style="background:${BRAND_SECONDARY}; text-align:center; color:#333;">
              <td style="padding:10px; font-size:12px;">
                ${CLUB_ADDRESS} • ${CLUB_EMAIL}<br>
                <a href="${WEBSITE_URL}" style="color:#333;">${WEBSITE_URL}</a>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const attachments = hasFile
      ? [{ filename: fileName, path: pdfPath, contentType: "application/pdf" }]
      : [];

    const mailOptions = {
      from: `"${CLUB_NAME}" <${EMAIL_USER}>`,
      to,
      subject: `Your ${CLUB_NAME} Receipt - Order #${orderId}`,
      html: htmlBody,
      attachments,
    };

    console.log("📤 Sending email...");
    await transporter.sendMail(mailOptions);
    console.log(" Email sent successfully to:", to);
  } catch (error) {
    console.error(" Error sending receipt email:", error);
  }
}
