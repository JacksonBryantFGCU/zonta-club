import { useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchDonations } from "../queries/donationQueries";
import { CartContext } from "../context/CartContext";
import { usePublicSettings } from "../queries/publicSettingsQueries";
import { useNavigate } from "react-router-dom";
import HeroImage from "../assets/hero_women_empowerment.jpg";

export default function Donate() {
  const { addItem, totalItems } = useContext(CartContext)!;
  const { data: settings } = usePublicSettings();
  const navigate = useNavigate();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [error, setError] = useState("");

  // Fetch donation data
  const {
    data: donations = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["donations"],
    queryFn: fetchDonations,
    staleTime: 1000 * 60 * 5,
  });

  const donation = donations[0]; // single donation option

  // Feature disabled check
  if (settings && !settings.features.donationsEnabled) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-zontaGold rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-zontaRed mb-3">
            Donations Currently Unavailable
          </h2>
          <p className="text-gray-600 mb-6">
            Our donation options are currently offline. Please check back later
            or contact us for support.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-zontaGold text-white rounded-lg hover:bg-zontaRed transition-colors font-medium"
          >
            Return to Home
          </button>
        </div>
      </section>
    );
  }

  if (isLoading)
    return <div className="text-center py-20 text-zontaDark">Loading donation options...</div>;
  if (isError)
    return <div className="text-center py-20 text-red-600">Failed to load donations.</div>;

  // Handle add to cart
  const handleAddToCart = () => {
    if (!donation) return;

    let amount: number;
    if (customAmount) {
      amount = parseFloat(customAmount);
      if (isNaN(amount) || amount < donation.minAmount) {
        setError(`Minimum donation is $${donation.minAmount}`);
        return;
      }
    } else if (selectedAmount) {
      amount = selectedAmount;
    } else {
      setError("Please select a donation amount");
      return;
    }

    addItem({
      _id: `donation-${donation._id}-${Date.now()}`,
      title: `Donation: ${donation.title}`,
      price: amount,
      imageUrl: donation.imageUrl,
    });

    setSelectedAmount(null);
    setCustomAmount("");
    setError("");
  };

  return (
    <main className="flex flex-col">
      {/* ===== Hero Section ===== */}
      <section className="relative min-h-[70vh] flex flex-col justify-center items-center text-center text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HeroImage})` }}
        ></div>
        <div className="absolute inset-0 bg-zontaGold/75 mix-blend-multiply"></div>

        <div className="relative z-10 max-w-3xl px-6">
          <h1 className="text-5xl font-bold mb-4 drop-shadow-md">
            Support Our Mission
          </h1>
          <p className="text-lg sm:text-xl font-medium leading-relaxed drop-shadow-sm">
            Your donation helps fund scholarships, advocacy initiatives, and
            service projects that empower women locally and globally.
          </p>
          <button
            onClick={() => navigate("/cart")}
            className="mt-8 inline-flex items-center gap-2 bg-white text-zontaRed px-6 py-3 rounded-lg shadow-lg font-semibold hover:bg-zontaGold hover:text-white transition"
          >
            View Cart
            {totalItems > 0 && (
              <span className="bg-zontaRed text-white font-bold px-2 py-0.5 rounded-md text-sm">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </section>

      {/* ===== Impact Section ===== */}
      <section className="py-20 px-6 bg-white text-center text-zontaDark">
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-zontaRed mb-6">
            Every Dollar Makes a Difference
          </h2>
          <p className="text-lg leading-relaxed text-zontaDark/90">
            Your contribution helps us provide scholarships to women pursuing
            higher education, support survivors of domestic violence, and
            advocate for gender equality both locally and internationally.
          </p>
        </div>

        {/* Optional 3-column impact icons */}
        <div className="grid gap-10 md:grid-cols-3 max-w-5xl mx-auto text-left md:text-center">
          <div>
            <h3 className="text-xl font-semibold text-zontaGold mb-2">Scholarships</h3>
            <p>Empowering women to pursue education and leadership opportunities.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-zontaGold mb-2">Advocacy</h3>
            <p>Promoting equality and standing up for women’s rights worldwide.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-zontaGold mb-2">Service</h3>
            <p>Partnering with local organizations to uplift our community together.</p>
          </div>
        </div>
      </section>

      {/* ===== Donation Form Section ===== */}
      <section className="bg-gradient-to-br from-[#fff6eb] to-[#ffe5d3] py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-zontaRed mb-6">Make a Donation</h2>
          <p className="text-zontaDark/80 mb-10 text-lg leading-relaxed">
            Choose a donation amount below or enter a custom amount.
          </p>

          {/* Donation Options */}
          {donation && (
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {donation.presetAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    setSelectedAmount(amount);
                    setCustomAmount("");
                    setError("");
                  }}
                  className={`px-6 py-3 text-lg rounded-lg font-semibold transition-all ${
                    selectedAmount === amount
                      ? "bg-zontaGold text-white shadow-md"
                      : "bg-white text-zontaDark border-2 border-gray-300 hover:border-zontaGold"
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>
          )}

          {/* Custom Amount */}
          {donation?.allowCustomAmount && (
            <div className="flex justify-center items-center gap-3 mb-8">
              <span className="text-2xl font-bold text-zontaDark">$</span>
              <input
                type="number"
                min={donation.minAmount}
                step="0.01"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                  setError("");
                }}
                placeholder={`Custom (min $${donation.minAmount})`}
                className="w-40 px-4 py-2 border-2 border-gray-300 rounded-lg text-lg focus:outline-none focus:border-zontaGold"
              />
            </div>
          )}

          {/* Error Message */}
          {error && <p className="text-red-600 text-sm mb-3 font-medium">{error}</p>}

          {/* Submit Button */}
          <button
            onClick={handleAddToCart}
            disabled={!selectedAmount && !customAmount}
            className="px-10 py-4 bg-zontaRed text-white text-lg font-semibold rounded-xl shadow-lg hover:bg-zontaDark transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Add Donation to Cart
          </button>

          <p className="mt-10 text-zontaDark/70 max-w-2xl mx-auto leading-relaxed">
            Every contribution, no matter the size, directly supports women’s
            empowerment programs, advocacy campaigns, and education grants in
            our community and beyond. Thank you for helping us make a lasting impact.
          </p>
        </div>
      </section>
    </main>
  );
}