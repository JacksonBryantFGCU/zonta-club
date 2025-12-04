// zontasite/src/components/SortDropdown.tsx

export type SortOption = "name" | "price-asc" | "price-desc";

interface Props {
  value: SortOption;
  onChange: (s: SortOption) => void;
}

export default function SortDropdown({ value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SortOption)}
      className="border border-zontaGold rounded-lg px-4 py-2 bg-white text-zontaDark shadow-sm"
      aria-label="Sort products"
    >
      <option value="name">Sort By: Name (A–Z)</option>
      <option value="price-asc">Price: Low → High</option>
      <option value="price-desc">Price: High → Low</option>
    </select>
  );
}