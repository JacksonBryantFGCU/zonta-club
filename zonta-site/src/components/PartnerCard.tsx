// zonta-site/src/components/PartnerCard.tsx

interface PartnerCardProps {
  name: string;
  logoUrl: string;
  donateUrl: string;
}

export default function PartnerCard({ name, logoUrl, donateUrl }: PartnerCardProps) {
  return (
    <a
      href={donateUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-zontaCyan/20 hover:border-zontaBlue cursor-pointer block"
    >
      <div className="flex items-center justify-center h-32 mb-4">
        <img
          src={logoUrl}
          alt={`${name} logo`}
          className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
        />
      </div>
      <h3 className="text-center text-lg font-semibold text-zontaMahogany group-hover:text-zontaBlue transition-colors duration-300">
        {name}
      </h3>
    </a>
  );
}
