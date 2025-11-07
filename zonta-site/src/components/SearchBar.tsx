// zonta-site/src/components/SearchBar.tsx

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <input
      type="text"
      placeholder="Search products..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full md:w-72 border border-zontaGold rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-zontaGold"
    />
  );
}