type FieldProps = {
  label: string;
  name: string;
  placeholder: string;
  type: "text" | "password";
  value: string;
  hint: string;
  error: string;
  onChange: (value: string) => void;
};

export function Field({
  label,
  name,
  placeholder,
  type,
  value,
  hint,
  error,
  onChange,
}: FieldProps) {
  return (
    <label className="grid">
      <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">{label}</span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        className="mt-1 mb-0.5 rounded-2xl border-2 border-stone-200 bg-[#f4efe7] px-3 py-2 outline-none transition-all focus:border-[#8db580] focus:ring-4 focus:ring-[#8db580]/20 dark:border-[#313626] dark:bg-[#23271b] dark:text-stone-100 dark:placeholder:text-stone-500"
      />
      {error ? (
        <p className="text-[0.9rem] text-rose-500">{error}</p>
      ) : (
        <p className="text-[0.9rem] text-stone-600 dark:text-stone-400">{hint}</p>
      )}
    </label>
  );
}
