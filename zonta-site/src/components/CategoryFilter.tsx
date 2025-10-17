interface CategoryFilterProps {
  categories: string[];
  selected: string | null;
  onSelect: (category: string | null) => void;
}

export default function CategoryFilter({
  categories,
  selected,
  onSelect,
}: CategoryFilterProps) {
  return (
    <select
      aria-label="Filter by category"
      value={selected || ""}
      onChange={(e) => onSelect(e.target.value || null)}
      className="border border-zontaGold rounded-lg py-2 px-4 text-zontaDark focus:outline-none focus:ring-2 focus:ring-zontaGold"
    >
      <option value="">All Categories</option>
      {categories.map((cat) => (
        <option key={cat} value={cat}>
          {cat}
        </option>
      ))}
    </select>
  );
}