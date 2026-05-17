# Payment Setup — Zonta Club of Naples

> **Note on historical records:** Stripe was previously used for membership
> payment processing. It has been removed from the codebase. Old membership
> application records in Sanity may still contain `stripeSessionId` and
> `paymentIntentId` values — these fields are preserved in the schema for
> historical reference and should not be deleted.

## Square Payments

### Environment overview

The backend uses the Square Payments API to process online donations.
Two environments exist:

| Environment | Backend env var | Frontend env var | Money moves? |
|---|---|---|---|
| Sandbox | `SQUARE_ENVIRONMENT=sandbox` | `VITE_SQUARE_ENVIRONMENT=sandbox` | No |
| Production | `SQUARE_ENVIRONMENT=production` | `VITE_SQUARE_ENVIRONMENT=production` | Yes |

**Sandbox payments do not move real money.**
Production payments require production Square credentials tied to the Zonta Club's Square account.

---

### Required environment variables

**Backend (`zonta-server/.env`):**
```
SQUARE_ACCESS_TOKEN=...     # Sandbox or production access token from Square Developer Console
SQUARE_LOCATION_ID=...      # Location ID from Square Developer Console
SQUARE_ENVIRONMENT=sandbox  # "sandbox" or "production"

# Donor receipt emails
EMAIL_USER=...              # Gmail address used to send receipts (e.g. info@zontaofnaples.org)
EMAIL_PASS=...              # Gmail App Password (not your account password — generate at myaccount.google.com/apppasswords)
CLUB_NAME=Zonta Club of Naples
CLUB_EMAIL=info@zontaofnaples.org
```

**Frontend (`zonta-site/.env.development` / `.env.production`):**
```
VITE_SQUARE_APPLICATION_ID=...      # Application ID from Square Developer Console
VITE_SQUARE_LOCATION_ID=...         # Same location ID as backend
VITE_SQUARE_ENVIRONMENT=sandbox     # "sandbox" or "production"
```

The Square access token (`SQUARE_ACCESS_TOKEN`) must **never** appear in frontend code
or be committed to the repository.

---

### How to verify a sandbox payment

1. Submit a test donation on the frontend using a Square test card:
   - Card number: `4111 1111 1111 1111`
   - Expiry: any future date
   - CVV: any 3 digits
   - ZIP: any 5 digits

2. After submission, the frontend shows the thank-you banner with a payment amount.
   If Square returns a receipt URL for the sandbox payment, a "View receipt" link appears.

3. **Square Developer Console → Sandbox Seller Dashboard:**
   - Go to https://developer.squareup.com
   - Select your application → Sandbox
   - Click "Open Sandbox Seller Dashboard"
   - Navigate to Payments
   - Confirm the payment ID matches the ID shown in the Zonta admin panel
   - Confirm the amount matches
   - Confirm the status is COMPLETED

4. **Square API Explorer / API Logs:**
   - Developer Console → API Logs
   - Find the `CreatePayment` call
   - Confirm the `location_id`, `amount_money.amount`, and `status` match expectations

5. **Zonta Admin Panel:**
   - Log in at `/admin`
   - Navigate to Donations
   - Confirm the donation record appears with:
     - Correct donor name and email
     - Correct amount and giving level
     - Status: COMPLETED
     - Environment: sandbox
     - Receipt link (if returned by Square)

6. **Sanity Studio (optional):**
   - Open the Sanity Studio for the project
   - Navigate to "Online Donations"
   - Confirm the `onlineDonation` document was created with the correct fields

---

### Receipt URLs

Square returns a receipt URL for COMPLETED payments.

**Sandbox:** Receipt URLs may be absent, or the URL may return 404 even when
the payment status is COMPLETED. This is expected. The public donation page
hides the receipt link entirely in sandbox mode and instead shows the payment
ID with a note to verify in the Square Developer Console. The admin panel
marks sandbox receipt links with `View*` and a tooltip warning.

**Production:** Receipt URLs are reliable. The public page shows a "View
receipt" link only when a URL is present.

**Pre-launch checklist:** Before switching to production, make a real
low-dollar test transaction and confirm the receipt URL opens correctly in a
browser before removing the sandbox caveat messaging.

---

### Payment processor account

All payments are processed under the Square account associated with
`SQUARE_ACCESS_TOKEN`. For production:

- Use the production access token from the Zonta Club's Square account.
- The location ID must match a location configured in that Square account.
- Funds are deposited to the bank account linked to that Square location.

To switch from sandbox to production, update all three Square environment variables
in both backend and frontend environments and redeploy.

---

### Recurring donations

Monthly recurring donations are implemented end-to-end using the Square
Subscriptions API. Before enabling, a Square Catalog subscription plan and
plan variation must be created.

#### Required env var

```
SQUARE_DONATION_PLAN_VARIATION_ID=...  # From Square Catalog (see setup below)
```

If this var is missing, `POST /api/checkout/square/donation/recurring` returns
503 with the message "Monthly donations are not configured yet."

#### Creating the subscription plan (automated)

```sh
cd zonta-server
npm run square:create-donation-plan
```

This runs `scripts/createSquareDonationPlan.ts`, which:
1. Creates a "Zonta Monthly Donation" SUBSCRIPTION_PLAN in Square Catalog.
2. Creates a "Monthly Donation" SUBSCRIPTION_PLAN_VARIATION with STATIC
   pricing at $1.00/month (the actual monthly amount is sent via
   `priceOverrideMoney` at subscription creation time).
3. Prints the plan variation ID.

Copy the printed ID into `zonta-server/.env` and restart the backend.

**Important:** Sandbox and production are separate Square environments.
Run the script once for sandbox (default) and once for production
(with `SQUARE_ENVIRONMENT=production`). Each produces a different ID.

#### Manual setup (if the script fails)

1. Open Square Developer Console.
2. Go to Catalog → Items → Subscriptions.
3. Create a new Subscription Plan named "Zonta Monthly Donation".
4. Add a variation named "Monthly Donation" with:
   - Cadence: Monthly
   - Pricing: Static, $1.00/month
5. Save. Copy the Plan Variation ID from the variation detail page.
6. Add to `zonta-server/.env` as `SQUARE_DONATION_PLAN_VARIATION_ID`.

#### How recurring billing works

1. The donor fills out the form, selects Monthly Giving, checks the
   authorization checkbox, and enters card details.
2. The frontend tokenizes the card via Square Web Payments SDK (nonce is
   never logged or stored).
3. The backend creates or finds a Square Customer by donor email.
4. The card is saved on file to the Square Customer.
5. A subscription is created with `priceOverrideMoney` set to the donor's
   chosen amount per month.
6. Square auto-charges the saved card on the same day each month.
7. A Sanity record with `giftType: "monthly"` is created for the admin panel.

#### Sandbox test steps

1. Run the script in sandbox mode to get a plan variation ID.
2. Add `SQUARE_DONATION_PLAN_VARIATION_ID=<sandbox-id>` to `.env`.
3. Restart the backend.
4. Submit a monthly donation on the frontend:
   - Select Monthly Giving + Donate Online.
   - Check the monthly authorization checkbox.
   - Enter a Square test card (4111 1111 1111 1111).
   - Submit.
5. Confirm the success message shows "Welcome to Monthly Giving!" with the
   monthly amount and subscription ID.
6. In Square Developer Console → Sandbox → Subscriptions: confirm the
   subscription appears with status ACTIVE.
7. In the admin panel (Donations): confirm a record appears with Type = Monthly.

#### Production checklist

- Use the production plan variation ID (run script with production creds).
- Confirm a real low-dollar test subscription before launch.
- Monitor Square Dashboard for subscription statuses and any failed charges.

---

### Security notes

- The `SQUARE_ACCESS_TOKEN` is a server-side secret. It must never appear in
  frontend code, browser console output, or client-side environment variables.
- The Square Web Payments SDK nonce (`sourceId`) is single-use and is never logged
  on the server.
- Card numbers, CVVs, and expiry dates are tokenized entirely by the Square
  Web Payments SDK iframe and never touch the Zonta backend.
