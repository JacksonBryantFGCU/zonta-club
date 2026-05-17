import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { usePublicSettings } from "../queries/publicSettingsQueries";
import HeroImage from "../assets/hero_women_empowerment.jpg";

// ── Square Web Payments SDK types (minimal) ────────────────────────────────

interface SquareTokenError {
  field?: string;
  message: string;
  type: string;
}

interface SquareTokenResult {
  status: "OK" | "Cancel" | "Error" | "Invalid" | "Unknown" | "AbortError";
  token?: string;
  errors?: SquareTokenError[];
}

interface SquareCard {
  attach(selector: string): Promise<void>;
  tokenize(): Promise<SquareTokenResult>;
  destroy(): Promise<void>;
}

interface SquarePayments {
  card(): Promise<SquareCard>;
}

declare global {
  interface Window {
    Square?: {
      payments(appId: string, locationId: string): SquarePayments;
    };
  }
}

// ── Types ──────────────────────────────────────────────────────────────────

type GiftType = "one-time" | "monthly";
type LevelId = "bronze" | "silver" | "gold" | "platinum" | "other";
type TributeType = "none" | "in-honor-of" | "in-memory-of";
type PaymentMethod = "online" | "check";

interface GivingLevel {
  id: Exclude<LevelId, "other">;
  label: string;
  amount: number;
  description: string;
}

interface DonationForm {
  giftType: GiftType;
  selectedLevel: LevelId | null;
  customAmount: string;
  firstName: string;
  lastName: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  showTribute: boolean;
  tributeType: TributeType;
  honoreeName: string;
  notificationName: string;
  notificationEmail: string;
  notificationAddress: string;
  tributeMessage: string;
  paymentMethod: PaymentMethod;
  monthlyAuthorized: boolean;
}

interface OneTimeResult {
  giftType: "one-time";
  paymentId: string;
  amountCents: number;
  receiptUrl: string | null;
}

interface MonthlyResult {
  giftType: "monthly";
  subscriptionId: string;
  status: string;
  amountCents: number;
  givingLevel: string;
}

type DonationResult = OneTimeResult | MonthlyResult;

// ── Static data ────────────────────────────────────────────────────────────

const GIVING_LEVELS: GivingLevel[] = [
  {
    id: "bronze",
    label: "Bronze Friend",
    amount: 50,
    description: "Provides educational materials for a local outreach program.",
  },
  {
    id: "silver",
    label: "Silver Advocate",
    amount: 100,
    description:
      "Supports advocacy efforts to end violence against women and girls.",
  },
  {
    id: "gold",
    label: "Gold Sponsor",
    amount: 250,
    description:
      "Helps fund scholarships for young women pursuing higher education.",
  },
  {
    id: "platinum",
    label: "Platinum Champion",
    amount: 500,
    description:
      "Provides major support for leadership programs and community initiatives.",
  },
];

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC",
];

// Maps giving level IDs to display amounts for dev logging (never used in payment logic)
const LEVEL_CENTS_PREVIEW: Record<string, number> = {
  bronze: 5000,
  silver: 10000,
  gold: 25000,
  platinum: 50000,
};

const INITIAL_FORM: DonationForm = {
  giftType: "one-time",
  selectedLevel: null,
  customAmount: "",
  firstName: "",
  lastName: "",
  streetAddress: "",
  city: "",
  state: "",
  zip: "",
  phone: "",
  email: "",
  showTribute: false,
  tributeType: "none",
  honoreeName: "",
  notificationName: "",
  notificationEmail: "",
  notificationAddress: "",
  tributeMessage: "",
  paymentMethod: "online",
  monthlyAuthorized: false,
};

// ── Validation ─────────────────────────────────────────────────────────────

function validate(form: DonationForm): Record<string, string> {
  const errs: Record<string, string> = {};

  if (!form.selectedLevel) {
    errs.amount = "Please select a giving level.";
  } else if (form.selectedLevel === "other") {
    const amt = parseFloat(form.customAmount);
    if (!form.customAmount || isNaN(amt) || amt < 1) {
      errs.amount = "Please enter a valid amount of at least $1.";
    }
  }

  if (!form.firstName.trim()) errs.firstName = "First name is required.";
  if (!form.lastName.trim()) errs.lastName = "Last name is required.";

  if (!form.email.trim()) {
    errs.email = "Email address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errs.email = "Please enter a valid email address.";
  }

  if (!form.phone.trim()) errs.phone = "Phone number is required.";
  if (!form.streetAddress.trim()) errs.streetAddress = "Street address is required.";
  if (!form.city.trim()) errs.city = "City is required.";
  if (!form.state) errs.state = "State is required.";
  if (!form.zip.trim()) errs.zip = "ZIP code is required.";

  if (
    form.showTribute &&
    form.tributeType !== "none" &&
    !form.honoreeName.trim()
  ) {
    errs.honoreeName = "Please enter the honoree's name.";
  }

  if (
    form.giftType === "monthly" &&
    form.paymentMethod === "online" &&
    !form.monthlyAuthorized
  ) {
    errs.monthlyAuthorized = "Authorization is required for monthly giving.";
  }

  return errs;
}

// ── Shared CSS ─────────────────────────────────────────────────────────────

const inputCls =
  "w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 " +
  "focus:outline-none focus:ring-2 focus:ring-zontaGold/40 focus:border-zontaMahogany " +
  "transition placeholder:text-gray-400";

const labelCls = "block text-sm font-medium text-gray-700 mb-1";
const fieldErrorCls = "mt-1 text-xs text-red-600 font-medium";
const cardHeadingCls =
  "text-sm font-semibold text-zontaMahogany uppercase tracking-wide mb-4 pb-2 border-b border-gray-100";

// ── Component ──────────────────────────────────────────────────────────────

export default function Donate() {
  const { data: settings } = usePublicSettings();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [form, setFormState] = useState<DonationForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showThankYou, setShowThankYou] = useState(false);
  const [checkSubmitted, setCheckSubmitted] = useState(false);
  const [squareLoaded, setSquareLoaded] = useState(false);
  const [cardReady, setCardReady] = useState(false);
  const [squareError, setSquareError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [donationResult, setDonationResult] = useState<DonationResult | null>(null);

  // Refs for DOM navigation
  const formRef = useRef<HTMLFormElement>(null);
  const cardRef = useRef<SquareCard | null>(null);
  const successRef = useRef<HTMLDivElement>(null);   // thank-you banner
  const formTopRef = useRef<HTMLDivElement>(null);   // top of form section (for error scrolling)

  // Handle ?success=true redirect (Square redirect parity)
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setShowThankYou(true);
      searchParams.delete("success");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Scroll to thank-you banner after success or check confirmation
  useEffect(() => {
    if (!showThankYou && !checkSubmitted) return;
    const tid = setTimeout(() => {
      successRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
    return () => clearTimeout(tid);
  }, [showThankYou, checkSubmitted]);

  // Load Square Web Payments SDK script once on mount
  useEffect(() => {
    const appId = import.meta.env.VITE_SQUARE_APPLICATION_ID;
    const locationId = import.meta.env.VITE_SQUARE_LOCATION_ID;
    if (!appId || !locationId) {
      setSquareError(
        "Online payment is not yet configured. Please mail a check to give today."
      );
      return;
    }

    // SDK already initialized (e.g., navigated away and back)
    if (window.Square) {
      setSquareLoaded(true);
      return;
    }

    const env = import.meta.env.VITE_SQUARE_ENVIRONMENT ?? "sandbox";
    const src =
      env === "production"
        ? "https://web.squarecdn.com/v1/square.js"
        : "https://sandbox.web.squarecdn.com/v1/square.js";

    if (import.meta.env.DEV) {
      console.log("[Donate] Loading Square SDK from:", src);
    }

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${src}"]`
    );
    if (existing) {
      existing.addEventListener("load", () => setSquareLoaded(true));
      existing.addEventListener("error", () =>
        setSquareError(
          "Failed to load the payment form. Please refresh or mail a check."
        )
      );
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.onload = () => setSquareLoaded(true);
    script.onerror = () =>
      setSquareError(
        "Failed to load the payment form. Please refresh or mail a check."
      );
    document.head.appendChild(script);
  }, []);

  // Initialize Square card widget when SDK is loaded and online payment is selected
  useEffect(() => {
    if (!squareLoaded || form.paymentMethod !== "online") return;

    const appId = import.meta.env.VITE_SQUARE_APPLICATION_ID;
    const locationId = import.meta.env.VITE_SQUARE_LOCATION_ID;
    if (!window.Square || !appId || !locationId) return;

    let card: SquareCard | null = null;
    let cancelled = false;

    async function initCard() {
      try {
        if (import.meta.env.DEV) {
          console.log("[Donate] Initializing Square card widget");
        }
        const payments = window.Square!.payments(appId as string, locationId as string);
        card = await payments.card();
        if (cancelled) {
          await card.destroy();
          return;
        }
        await card.attach("#square-card-container");
        cardRef.current = card;
        setCardReady(true);
        setSquareError(null);
        if (import.meta.env.DEV) {
          console.log("[Donate] Square card widget attached successfully");
        }
      } catch (err: unknown) {
        if (!cancelled) {
          if (import.meta.env.DEV) {
            console.error("[Donate] Square card init error:", err instanceof Error ? err.message : err);
          }
          setSquareError(
            "Failed to initialize the payment form. Please refresh or mail a check."
          );
        }
      }
    }

    void initCard();

    return () => {
      cancelled = true;
      setCardReady(false);
      if (card) {
        void card.destroy();
        cardRef.current = null;
      }
    };
  }, [squareLoaded, form.paymentMethod]);

  function setField<K extends keyof DonationForm>(key: K, value: DonationForm[K]) {
    setFormState((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const k = String(key);
      if (!(k in prev)) return prev;
      const next = { ...prev };
      delete next[k];
      return next;
    });
  }

  function handleLevelSelect(id: LevelId) {
    setFormState((prev) => ({
      ...prev,
      selectedLevel: id,
      customAmount: id !== "other" ? "" : prev.customAmount,
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.amount;
      return next;
    });
  }

  function handleCustomAmountChange(val: string) {
    setFormState((prev) => ({ ...prev, selectedLevel: "other", customAmount: val }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.amount;
      return next;
    });
  }

  // Scroll to the form-top error banner; called when squareError is set during submit
  function scrollToFormTop() {
    setTimeout(() => {
      formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (import.meta.env.DEV) {
      console.log("[Donate] Submit started", {
        giftType: form.giftType,
        paymentMethod: form.paymentMethod,
        givingLevel: form.selectedLevel,
        cardRefExists: cardRef.current !== null,
        cardReady,
        squareLoaded,
      });
    }

    // ── Mail a check ──────────────────────────────────────────────────────────
    if (form.paymentMethod === "check") {
      const errs = validate(form);
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      setErrors({});
      setCheckSubmitted(true);
      // Scroll handled by useEffect([checkSubmitted])
      return;
    }

    // ── Both online paths share: validate → card check → tokenize ────────────
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      if (import.meta.env.DEV) {
        console.log("[Donate] Validation failed:", Object.keys(errs));
      }
      return;
    }
    setErrors({});
    setSquareError(null);

    if (!cardRef.current) {
      const msg = squareLoaded
        ? "Payment form is not ready yet. Please wait a moment and try again."
        : "Payment form is still loading. Please wait and try again.";
      if (import.meta.env.DEV) {
        console.warn("[Donate] cardRef.current is null — card not initialized", {
          squareLoaded,
          cardReady,
        });
      }
      setSquareError(msg);
      scrollToFormTop();
      return;
    }

    setSubmitting(true);

    try {
      // 1. Tokenize the card
      if (import.meta.env.DEV) {
        console.log("[Donate] Calling card.tokenize()");
      }

      const tokenResult = await cardRef.current.tokenize();

      if (import.meta.env.DEV) {
        console.log("[Donate] Tokenize status:", tokenResult.status);
        // SECURITY: never log tokenResult.token
        if (tokenResult.errors?.length) {
          console.log("[Donate] Tokenize error fields:", tokenResult.errors.map((err) => ({
            type: err.type,
            field: err.field ?? "(none)",
          })));
        }
      }

      if (tokenResult.status !== "OK" || !tokenResult.token) {
        const msg =
          tokenResult.errors?.[0]?.message ??
          "Card tokenization failed. Please check your card details and try again.";
        setSquareError(msg);
        scrollToFormTop();
        return;
      }

      // 2. Build shared donor/tribute objects
      const customAmountCents =
        form.selectedLevel === "other"
          ? Math.round(parseFloat(form.customAmount) * 100)
          : undefined;

      if (import.meta.env.DEV) {
        const previewCents =
          customAmountCents ??
          LEVEL_CENTS_PREVIEW[form.selectedLevel ?? ""] ??
          0;
        console.log("[Donate] Resolved amount cents (preview):", previewCents);
      }

      const donorPayload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        streetAddress: form.streetAddress.trim(),
        city: form.city.trim(),
        state: form.state,
        zip: form.zip.trim(),
      };

      const tributePayload = form.showTribute
        ? {
            show: form.showTribute,
            type: form.tributeType,
            ...(form.honoreeName.trim() && { honoreeName: form.honoreeName.trim() }),
            ...(form.notificationName.trim() && { notificationName: form.notificationName.trim() }),
            ...(form.notificationEmail.trim() && { notificationEmail: form.notificationEmail.trim() }),
            ...(form.notificationAddress.trim() && { notificationAddress: form.notificationAddress.trim() }),
            ...(form.tributeMessage.trim() && { message: form.tributeMessage.trim() }),
          }
        : undefined;

      const backendUrl = (import.meta.env.VITE_BACKEND_URL ?? "").replace(/\/$/, "");

      // ── Monthly giving online ─────────────────────────────────────────────
      if (form.giftType === "monthly") {
        const body = {
          sourceId: tokenResult.token, // SECURITY: do not log
          giftType: "monthly" as const,
          givingLevel: form.selectedLevel as LevelId,
          ...(customAmountCents !== undefined && { customAmountCents }),
          donor: donorPayload,
          ...(tributePayload && { tribute: tributePayload }),
          paymentMethod: "online" as const,
          monthlyAuthorized: true as const,
        };

        const url = `${backendUrl}/api/checkout/square/donation/recurring`;
        if (import.meta.env.DEV) {
          console.log("[Donate] POST to:", url);
        }

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (import.meta.env.DEV) {
          console.log("[Donate] Backend response status:", res.status);
        }

        const json = (await res.json()) as {
          success?: boolean;
          subscriptionId?: string;
          status?: string;
          amountCents?: number;
          givingLevel?: string;
          error?: string;
        };

        if (!res.ok) {
          const errMsg =
            json.error ?? "Unable to set up your monthly donation. Please try again or mail a check.";
          if (import.meta.env.DEV) {
            console.error("[Donate] Recurring backend error:", errMsg);
          }
          setSquareError(errMsg);
          scrollToFormTop();
          return;
        }

        if (import.meta.env.DEV) {
          console.log("[Donate] Subscription created, subscriptionId:", json.subscriptionId);
        }

        setDonationResult({
          giftType: "monthly",
          subscriptionId: json.subscriptionId ?? "",
          status: json.status ?? "ACTIVE",
          amountCents: json.amountCents ?? 0,
          givingLevel: json.givingLevel ?? form.selectedLevel ?? "",
        });
        setShowThankYou(true);
        return;
      }

      // ── One-time online ───────────────────────────────────────────────────
      const body = {
        sourceId: tokenResult.token, // SECURITY: do not log this field
        giftType: "one-time" as const,
        givingLevel: form.selectedLevel as LevelId,
        ...(customAmountCents !== undefined && { customAmountCents }),
        donor: donorPayload,
        ...(tributePayload && { tribute: tributePayload }),
        paymentMethod: "online" as const,
      };

      const url = `${backendUrl}/api/checkout/square/donation`;

      if (import.meta.env.DEV) {
        console.log("[Donate] POST to:", url);
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (import.meta.env.DEV) {
        console.log("[Donate] Backend response status:", res.status);
      }

      const json = (await res.json()) as {
        success?: boolean;
        paymentId?: string;
        amountCents?: number;
        receiptUrl?: string | null;
        error?: string;
      };

      if (!res.ok) {
        const errMsg =
          json.error ?? "Payment failed. Please try again or mail a check.";
        if (import.meta.env.DEV) {
          console.error("[Donate] Backend error:", errMsg);
        }
        setSquareError(errMsg);
        scrollToFormTop();
        return;
      }

      if (import.meta.env.DEV) {
        console.log("[Donate] Payment success, amountCents:", json.amountCents);
      }
      setDonationResult({
        giftType: "one-time",
        paymentId: json.paymentId ?? "",
        amountCents: json.amountCents ?? 0,
        receiptUrl: json.receiptUrl ?? null,
      });
      setShowThankYou(true);
      // Scroll is handled by the useEffect([showThankYou, checkSubmitted]) effect above.
      // Do NOT call window.scrollTo() here — the thank-you banner is in the form section,
      // not at the absolute top of the page. scrollTo(top:0) would show the hero image.
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (import.meta.env.DEV) {
        console.error("[Donate] Network/unexpected error:", msg);
      }
      setSquareError(
        "A network error occurred. Please check your connection and try again."
      );
      scrollToFormTop();
    } finally {
      setSubmitting(false);
    }
  }

  // Feature flag guard
  if (settings && !settings.features.donationsEnabled) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-zontaMahogany mb-3">
            Donations Currently Unavailable
          </h2>
          <p className="text-gray-600 mb-6">
            Our donation options are currently offline. Please check back later
            or contact us for support.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-zontaGold text-white rounded-lg hover:bg-zontaMahogany transition-colors font-medium"
          >
            Return to Home
          </button>
        </div>
      </section>
    );
  }

  const perMonth = form.giftType === "monthly";

  return (
    <main className="flex flex-col">
      {/* ═══════════════════════════════════ HERO ═══════════════════════════════════ */}
      <section className="relative min-h-[60vh] flex flex-col justify-center items-center text-center text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HeroImage})` }}
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 max-w-3xl px-6 py-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 drop-shadow-md leading-tight">
            Support the Zonta Club of Naples
          </h1>
          <p className="text-lg sm:text-xl font-semibold mb-5 text-zontaGold drop-shadow-sm">
            Empowering Women and Girls in Our Community
          </p>
          <p className="text-base sm:text-lg leading-relaxed text-white/90 max-w-2xl mx-auto">
            Your generosity helps the Zonta Club of Naples improve the lives of
            women and girls through scholarships, advocacy, and community service.
            Every gift—large or small—creates lasting change.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════ MISSION STATEMENT ═══════════════════════════ */}
      <section className="py-14 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <blockquote className="border-l-4 border-zontaGold pl-6">
            <p className="text-gray-700 text-base sm:text-lg leading-relaxed italic">
              The Zonta Club of Naples envisions a world in which women's rights
              are recognized as human rights and everyone is able to achieve her
              full potential. In such a world, women have access to all resources
              and are represented in decision-making positions on an equal basis
              with men. In such a world, no woman lives in fear of violence.
            </p>
          </blockquote>
        </div>
      </section>

      {/* ════════════════════════════════ DONATION FORM ═════════════════════════════ */}
      <section className="bg-gray-50 py-12 px-4 sm:px-6">
        {/*
          formTopRef marks the top of the form section.
          All error scroll calls land here so the user always sees the error banner.
        */}
        <div ref={formTopRef} className="max-w-2xl mx-auto space-y-6">

          {/* ── Top-level error banner ──────────────────────────────────────────── */}
          {squareError && (
            <div
              role="alert"
              className="rounded-2xl bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-700 font-medium leading-relaxed"
            >
              {squareError}
            </div>
          )}

          {/* ── Thank-you banner ────────────────────────────────────────────────── */}
          {/*
            successRef marks this wrapper. The scroll effect targets it after
            setShowThankYou(true) or setCheckSubmitted(true) so the user lands here,
            not at the hero section.
          */}
          <div ref={successRef}>
            {(showThankYou || checkSubmitted) && (
              <div className="bg-white rounded-2xl border border-zontaGold/40 shadow-sm p-8 text-center">
                <h2 className="text-2xl font-bold text-zontaMahogany mb-3">
                  {donationResult?.giftType === "monthly"
                    ? "Welcome to Monthly Giving!"
                    : "Thank You for Your Generosity!"}
                </h2>
                {donationResult && donationResult.giftType === "monthly" && (
                  <>
                    <p className="text-lg font-semibold text-zontaGold mb-2">
                      ${(donationResult.amountCents / 100).toFixed(2)} / month starting today
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      Your monthly donation has been set up. You will be charged automatically each month
                      until you cancel.
                    </p>
                    {donationResult.subscriptionId && (
                      <p className="text-xs text-gray-400 mb-3">
                        Reference: <span className="font-mono">{donationResult.subscriptionId}</span>
                      </p>
                    )}
                  </>
                )}
                {donationResult && donationResult.giftType === "one-time" && (
                  <>
                    <p className="text-lg font-semibold text-zontaGold mb-3">
                      ${(donationResult.amountCents / 100).toFixed(2)} received
                      {donationResult.receiptUrl && (
                        <>
                          {" — "}
                          <a
                            href={donationResult.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-zontaMahogany transition-colors"
                          >
                            View receipt
                          </a>
                        </>
                      )}
                    </p>
                  </>
                )}
                <p className="text-gray-700 leading-relaxed mb-3">
                  Your support empowers women and girls to achieve their dreams and
                  strengthens our community for generations to come.
                </p>
                <p className="text-gray-700 leading-relaxed mb-3">
                  With heartfelt gratitude, thank you for standing with the Zonta
                  Club of Naples in building a better world for women and girls.
                </p>
                <p className="text-gray-700 font-semibold">
                  Together, we are creating opportunities, inspiring leadership,
                  and changing lives.
                </p>
              </div>
            )}
          </div>

          <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-6">

            {/* ── Validation error summary ──────────────────────────────────────── */}
            {Object.keys(errors).length > 0 && (
              <div
                role="alert"
                className="rounded-2xl bg-amber-50 border border-amber-200 px-5 py-4 text-sm text-amber-800 font-medium"
              >
                Please fill in all required fields before continuing.
              </div>
            )}

            {/* ── 1. Gift Type ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className={cardHeadingCls}>Gift Type</h2>
              <div className="inline-flex rounded-xl overflow-hidden border border-gray-200 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setField("giftType", "one-time");
                    setField("monthlyAuthorized", false);
                    setSquareError(null);
                  }}
                  className={`flex-1 sm:flex-none px-6 py-3 text-sm font-semibold transition-colors ${
                    form.giftType === "one-time"
                      ? "bg-zontaMahogany text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  One-Time Gift
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setField("giftType", "monthly");
                    setSquareError(null);
                  }}
                  className={`flex-1 sm:flex-none px-6 py-3 text-sm font-semibold transition-colors ${
                    form.giftType === "monthly"
                      ? "bg-zontaMahogany text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Monthly Giving
                </button>
              </div>
              {form.giftType === "monthly" && (
                <p className="mt-3 text-sm text-zontaCyan font-medium">
                  Set up a recurring monthly gift and make a sustained impact
                  all year long.
                </p>
              )}
            </div>

            {/* ── 2. Giving Levels ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className={cardHeadingCls}>Select Your Giving Level</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                {GIVING_LEVELS.map((level) => {
                  const selected = form.selectedLevel === level.id;
                  return (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => handleLevelSelect(level.id)}
                      className={`text-left p-4 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-zontaGold/40 ${
                        selected
                          ? "border-zontaMahogany bg-zontaMahogany/5 shadow-sm"
                          : "border-gray-200 bg-white hover:border-zontaGold/60 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-semibold text-sm ${
                              selected ? "text-zontaMahogany" : "text-gray-800"
                            }`}
                          >
                            {level.label}
                          </p>
                          <p
                            className={`text-xs mt-1 leading-relaxed ${
                              selected ? "text-zontaMahogany/70" : "text-gray-500"
                            }`}
                          >
                            {level.description}
                          </p>
                        </div>
                        <span
                          className={`font-bold text-lg flex-shrink-0 ${
                            selected ? "text-zontaMahogany" : "text-zontaGold"
                          }`}
                        >
                          ${level.amount}
                          {perMonth && (
                            <span className="text-xs font-medium">/mo</span>
                          )}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Other / custom amount */}
              <button
                type="button"
                onClick={() => handleLevelSelect("other")}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-zontaGold/40 ${
                  form.selectedLevel === "other"
                    ? "border-zontaMahogany bg-zontaMahogany/5 text-zontaMahogany"
                    : "border-dashed border-gray-300 text-gray-500 hover:border-zontaGold/60 hover:text-gray-700"
                }`}
              >
                Other Amount{perMonth ? " / month" : ""}
              </button>

              {form.selectedLevel === "other" && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-gray-500 font-medium text-sm">$</span>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={form.customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    placeholder="Enter amount"
                    aria-label="Custom donation amount"
                    className={inputCls + " max-w-[180px]"}
                  />
                  {perMonth && (
                    <span className="text-gray-500 text-sm">/ month</span>
                  )}
                </div>
              )}

              {errors.amount && (
                <p className={fieldErrorCls + " mt-2"}>{errors.amount}</p>
              )}
            </div>

            {/* ── 3. Donor Information ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className={cardHeadingCls}>Your Information</h2>
              <div className="space-y-4">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls} htmlFor="firstName">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      autoComplete="given-name"
                      required
                      value={form.firstName}
                      onChange={(e) => setField("firstName", e.target.value)}
                      className={
                        inputCls + (errors.firstName ? " border-red-400" : "")
                      }
                    />
                    {errors.firstName && (
                      <p className={fieldErrorCls}>{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="lastName">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      autoComplete="family-name"
                      required
                      value={form.lastName}
                      onChange={(e) => setField("lastName", e.target.value)}
                      className={
                        inputCls + (errors.lastName ? " border-red-400" : "")
                      }
                    />
                    {errors.lastName && (
                      <p className={fieldErrorCls}>{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className={labelCls} htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    className={
                      inputCls + (errors.email ? " border-red-400" : "")
                    }
                  />
                  {errors.email && (
                    <p className={fieldErrorCls}>{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className={labelCls} htmlFor="phone">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    className={inputCls + (errors.phone ? " border-red-400" : "")}
                  />
                  {errors.phone && (
                    <p className={fieldErrorCls}>{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className={labelCls} htmlFor="streetAddress">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="streetAddress"
                    type="text"
                    autoComplete="street-address"
                    value={form.streetAddress}
                    onChange={(e) => setField("streetAddress", e.target.value)}
                    className={inputCls + (errors.streetAddress ? " border-red-400" : "")}
                  />
                  {errors.streetAddress && (
                    <p className={fieldErrorCls}>{errors.streetAddress}</p>
                  )}
                </div>

                <div className="grid grid-cols-6 gap-3">
                  <div className="col-span-6 sm:col-span-3">
                    <label className={labelCls} htmlFor="city">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="city"
                      type="text"
                      autoComplete="address-level2"
                      value={form.city}
                      onChange={(e) => setField("city", e.target.value)}
                      className={inputCls + (errors.city ? " border-red-400" : "")}
                    />
                    {errors.city && (
                      <p className={fieldErrorCls}>{errors.city}</p>
                    )}
                  </div>
                  <div className="col-span-3 sm:col-span-2">
                    <label className={labelCls} htmlFor="state">
                      State <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="state"
                      autoComplete="address-level1"
                      value={form.state}
                      onChange={(e) => setField("state", e.target.value)}
                      className={inputCls + (errors.state ? " border-red-400" : "")}
                    >
                      <option value="">—</option>
                      {US_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {errors.state && (
                      <p className={fieldErrorCls}>{errors.state}</p>
                    )}
                  </div>
                  <div className="col-span-3 sm:col-span-1">
                    <label className={labelCls} htmlFor="zip">
                      ZIP <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="zip"
                      type="text"
                      autoComplete="postal-code"
                      inputMode="numeric"
                      maxLength={10}
                      value={form.zip}
                      onChange={(e) => setField("zip", e.target.value)}
                      className={inputCls + (errors.zip ? " border-red-400" : "")}
                    />
                    {errors.zip && (
                      <p className={fieldErrorCls}>{errors.zip}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── 4. Tribute Gift ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-zontaMahogany uppercase tracking-wide">
                  Tribute Gift
                </h2>
                <button
                  type="button"
                  onClick={() => setField("showTribute", !form.showTribute)}
                  className="text-sm font-medium text-zontaMahogany hover:text-zontaOrange transition-colors"
                >
                  {form.showTribute ? "Remove" : "Add Tribute"}
                </button>
              </div>

              {!form.showTribute ? (
                <p className="text-sm text-gray-500 leading-relaxed">
                  Make your donation in honor or memory of someone special. We
                  will gladly send an acknowledgment to the person or family you
                  designate.
                </p>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Make your donation in honor or memory of someone special. We
                    will gladly send an acknowledgment to the person or family
                    you designate.
                  </p>

                  <div>
                    <label className={labelCls}>Tribute Type</label>
                    <div className="flex flex-wrap gap-5">
                      {(
                        [
                          ["none", "None"],
                          ["in-honor-of", "In Honor Of"],
                          ["in-memory-of", "In Memory Of"],
                        ] as [TributeType, string][]
                      ).map(([val, label]) => (
                        <label
                          key={val}
                          className="flex items-center gap-2 text-sm cursor-pointer text-gray-700"
                        >
                          <input
                            type="radio"
                            name="tributeType"
                            value={val}
                            checked={form.tributeType === val}
                            onChange={() => setField("tributeType", val)}
                            className="accent-zontaMahogany"
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {form.tributeType !== "none" && (
                    <>
                      <div>
                        <label className={labelCls} htmlFor="honoreeName">
                          {form.tributeType === "in-honor-of"
                            ? "Honoree's Name"
                            : "In Memory of"}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="honoreeName"
                          type="text"
                          value={form.honoreeName}
                          onChange={(e) =>
                            setField("honoreeName", e.target.value)
                          }
                          className={
                            inputCls +
                            (errors.honoreeName ? " border-red-400" : "")
                          }
                        />
                        {errors.honoreeName && (
                          <p className={fieldErrorCls}>{errors.honoreeName}</p>
                        )}
                      </div>

                      <div>
                        <label className={labelCls} htmlFor="notificationName">
                          Notification Recipient Name{" "}
                          <span className="text-gray-400 text-xs font-normal">
                            (optional)
                          </span>
                        </label>
                        <input
                          id="notificationName"
                          type="text"
                          value={form.notificationName}
                          onChange={(e) =>
                            setField("notificationName", e.target.value)
                          }
                          className={inputCls}
                        />
                      </div>

                      <div>
                        <label className={labelCls} htmlFor="notificationEmail">
                          Notification Recipient Email{" "}
                          <span className="text-gray-400 text-xs font-normal">
                            (optional)
                          </span>
                        </label>
                        <input
                          id="notificationEmail"
                          type="email"
                          value={form.notificationEmail}
                          onChange={(e) =>
                            setField("notificationEmail", e.target.value)
                          }
                          className={inputCls}
                        />
                      </div>

                      <div>
                        <label
                          className={labelCls}
                          htmlFor="notificationAddress"
                        >
                          Notification Recipient Address{" "}
                          <span className="text-gray-400 text-xs font-normal">
                            (optional)
                          </span>
                        </label>
                        <input
                          id="notificationAddress"
                          type="text"
                          value={form.notificationAddress}
                          onChange={(e) =>
                            setField("notificationAddress", e.target.value)
                          }
                          className={inputCls}
                        />
                      </div>

                      <div>
                        <label className={labelCls} htmlFor="tributeMessage">
                          Message{" "}
                          <span className="text-gray-400 text-xs font-normal">
                            (optional)
                          </span>
                        </label>
                        <textarea
                          id="tributeMessage"
                          rows={3}
                          value={form.tributeMessage}
                          onChange={(e) =>
                            setField("tributeMessage", e.target.value)
                          }
                          placeholder="Optional message to include with the acknowledgment..."
                          className={inputCls + " resize-none"}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* ── 5. Payment Method ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className={cardHeadingCls}>Payment Method</h2>

              <div className="inline-flex rounded-xl overflow-hidden border border-gray-200 w-full sm:w-auto mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setField("paymentMethod", "online");
                    setSquareError(null);
                  }}
                  className={`flex-1 sm:flex-none px-6 py-3 text-sm font-semibold transition-colors ${
                    form.paymentMethod === "online"
                      ? "bg-zontaMahogany text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Donate Online
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setField("paymentMethod", "check");
                    setSquareError(null);
                  }}
                  className={`flex-1 sm:flex-none px-6 py-3 text-sm font-semibold transition-colors ${
                    form.paymentMethod === "check"
                      ? "bg-zontaMahogany text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Mail a Check
                </button>
              </div>

              {form.paymentMethod === "online" && (
                <>
                  {/* Loading indicator shown while Square card widget initializes */}
                  {!cardReady && !squareError && (
                    <p className="text-sm text-gray-400 text-center py-3 mb-2">
                      Loading secure payment form…
                    </p>
                  )}

                  {/* Square card widget mount point */}
                  <div
                    id="square-card-container"
                    className="rounded-xl border border-gray-200 bg-white p-3 mb-4 min-h-[56px]"
                    aria-label="Card payment entry"
                  />

                  {/* Square error also shown inline near the card for context */}
                  {squareError && (
                    <p className="mb-4 text-xs text-red-600 font-medium">
                      See error above.
                    </p>
                  )}

                  {/* Monthly recurring authorization */}
                  {form.giftType === "monthly" && (
                    <div
                      className={`p-4 rounded-lg border ${
                        errors.monthlyAuthorized
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.monthlyAuthorized}
                          onChange={(e) =>
                            setField("monthlyAuthorized", e.target.checked)
                          }
                          className="mt-0.5 accent-zontaMahogany flex-shrink-0"
                        />
                        <span className="text-sm text-gray-700 leading-relaxed">
                          I authorize Zonta Club of Naples to charge my card
                          monthly for this recurring donation until I cancel.
                        </span>
                      </label>
                      {errors.monthlyAuthorized && (
                        <p className={fieldErrorCls + " ml-6 mt-1"}>
                          {errors.monthlyAuthorized}
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}

              {form.paymentMethod === "check" && (
                <div className="rounded-xl bg-zontaGold/10 border border-zontaGold/30 p-6 space-y-5">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Checks Payable To
                    </p>
                    <p className="text-base font-bold text-zontaMahogany">
                      Zonta Foundation of Naples
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Mail Your Donation To
                    </p>
                    <address className="not-italic text-gray-700 text-sm leading-relaxed">
                      Zonta Club of Naples
                      <br />
                      P.O. Box 10911
                      <br />
                      Naples, FL 34101-0911
                    </address>
                  </div>
                </div>
              )}
            </div>

            {/* ── Tax Disclaimer ── */}
            <p className="text-xs text-gray-400 text-center leading-relaxed px-2">
              The Zonta Club of Naples is a nonprofit organization. Your
              contribution may be tax-deductible to the extent allowed by law.
              Please consult your tax advisor.
            </p>

            {/* ── Submit ── */}
            {form.paymentMethod === "online" ? (
              <button
                type="submit"
                disabled={submitting}
                aria-busy={submitting}
                className={`w-full py-4 text-sm font-semibold rounded-xl shadow-sm transition-colors ${
                  submitting
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-zontaMahogany text-white hover:bg-zontaMahogany/90 active:bg-zontaMahogany/80"
                }`}
              >
                {submitting ? "Processing…" : "Donate Now"}
              </button>
            ) : (
              <button
                type="submit"
                className="w-full py-4 bg-zontaMahogany text-white text-sm font-semibold rounded-xl hover:bg-zontaMahogany/90 active:bg-zontaMahogany/80 transition-colors shadow-sm"
              >
                {checkSubmitted ? "Submission Received" : "Confirm My Donation"}
              </button>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}
