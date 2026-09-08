import { Check, Database } from "@phosphor-icons/react/dist/ssr";

interface InputCardProps {
  title: string;
  color: string;
  isSelected: boolean;
  setSelect: () => void;
  children: React.ReactNode;
}

export function InputCard({
  children,
  color,
  isSelected,
  setSelect,
  title,
}: InputCardProps) {
  return (
    <div
      className={`rounded-xl border-2 bg-white p-5 transition ${isSelected ? color : "border-slate-200"}`}
    >
      <button
        type="button"
        onClick={() => setSelect()}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="flex items-center gap-3 text-lg font-semibold text-slate-800">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <Database size={26} weight="duotone" />
          </span>
          {title}
        </span>
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full border ${isSelected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 text-transparent"}`}
        >
          <Check size={17} weight="bold" />
        </span>
      </button>
      {isSelected && <div className="mt-5">{children}</div>}
    </div>
  );
}
