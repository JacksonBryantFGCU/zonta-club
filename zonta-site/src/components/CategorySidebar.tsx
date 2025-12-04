// zontasite/src/components/CategorySidebar.tsx

interface Props {
  categories: string[];
  selected: string[];
  onChange: (values: string[]) => void;
}

export default function CategorySidebar({ categories, selected, onChange }: Props) {
  const toggle = (cat: string) => {
    if (selected.includes(cat)) {
      onChange(selected.filter((c) => c !== cat));
    } else {
      onChange([...selected, cat]);
    }
  };

  return (
    <div className="bg-zontaGold/10 border border-zontaGold rounded-xl p-6 shadow">
      <h2 className="text-xl font-semibold text-zontaDark mb-4">Categories</h2>

      <div className="space-y-3">
        {categories.map((cat) => (
          <label key={cat} className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(cat)}
              onChange={() => toggle(cat)}
              className="w-4 h-4 accent-zontaRed"
            />
            <span className="text-zontaDark">{cat}</span>
          </label>
        ))}
      </div>
    </div>
  );
}