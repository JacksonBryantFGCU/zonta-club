import path from "path";

import dayjs from "dayjs";
import fs from "fs-extra";
import puppeteer from "puppeteer";

interface ReceiptItem {
  title: string;
  quantity: number;
  price: number;
}

export interface ReceiptOrder {
  _id: string;
  customerName: string;
  customerEmail: string;
  createdAt: string | Date;
  total: number;
  items: ReceiptItem[];
}

const BRAND_PRIMARY = "#b91c1c";
const BRAND_SECONDARY = "#f4b400";
const CLUB_NAME = process.env.CLUB_NAME || "Zonta Club of Naples";
const CLUB_ADDRESS = process.env.CLUB_ADDRESS || "123 Main St • Naples, FL 34102";
const CLUB_EMAIL = process.env.CLUB_EMAIL || "zonta@naples.org";
const WEBSITE_URL = process.env.CLUB_URL || "https://zonta-naples.org";

export async function generateReceipt(order: ReceiptOrder): Promise<string> {
  const dateStr = dayjs(order.createdAt).format("YYYY-MM-DD");
  const fileName = `receipt-${dateStr}.pdf`;
  const filePath = path.join("receipts", fileName);
  await fs.ensureDir("receipts");

  const itemsHtml = order.items
    .map(
      (item) => `
        <tr>
          <td>${item.title}</td>
          <td>${item.quantity}</td>
          <td>$${item.price.toFixed(2)}</td>
          <td>$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`
    )
    .join("");

  const html = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
          h1, h2, h3 { color: ${BRAND_PRIMARY}; text-align: center; margin: 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border-bottom: 1px solid #ddd; padding: 8px; text-align: right; }
          th:first-child, td:first-child { text-align: left; }
          th { background: ${BRAND_PRIMARY}; color: white; }
          .footer { margin-top: 40px; font-size: 12px; text-align: center; color: #666; }
          .divider { border-top: 2px solid ${BRAND_SECONDARY}; margin: 20px 0; }
        </style>
      </head>
      <body>
        <h1>${CLUB_NAME}</h1>
        <p style="text-align:center;">${CLUB_ADDRESS}<br>${CLUB_EMAIL}<br><a href="${WEBSITE_URL}">${WEBSITE_URL}</a></p>
        <div class="divider"></div>
        <h2>Payment Receipt</h2>
        <p style="text-align:center;">Date: ${dayjs(order.createdAt).format("MMMM D, YYYY")}</p>
        <h3>Customer Details</h3>
        <p style="text-align:center;">${order.customerName} &lt;${order.customerEmail}&gt;</p>
        <h3>Order Summary</h3>
        <table>
          <thead>
            <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <h2 style="text-align:right;">Total: $${order.total.toFixed(2)}</h2>
        <p style="margin-top:30px; text-align:center;">
          Thank you for supporting the Zonta Club of Naples!<br>
          Your contribution helps empower women and improve our community.
        </p>
        <div class="footer">
          ${CLUB_NAME} • ${CLUB_ADDRESS} • ${CLUB_EMAIL}
        </div>
      </body>
    </html>
  `;

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  await page.pdf({
    path: filePath,
    format: "A4",
    margin: { top: "30px", bottom: "30px", left: "30px", right: "30px" },
  });
  await browser.close();

  return filePath;
}