import { Check, Database } from "@phosphor-icons/react/dist/ssr";

interface InputCardProps {
  title: string;
  color: string;
  isSelected: boolean;
  setSelect: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export function InputCard({
  children,
  disabled = false,
  color,
  isSelected,
  setSelect,
  title,
}: InputCardProps) {
  return (
    <div
      className={`rounded-xl border-2 p-5 transition ${disabled ? "border-slate-200 bg-slate-100" : `bg-white ${isSelected ? color : "border-slate-200"}`}`}
    >
      <button
        type="button"
        onClick={() => setSelect()}
        disabled={disabled}
        className="flex w-full items-center justify-between text-left disabled:cursor-not-allowed disabled:opacity-50"
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
      {disabled && (
        <p className="mt-4 text-sm text-slate-500">
          Cadastre sua chave do OpenAlex no{" "}
          <a
            href="/perfil"
            className="font-medium text-blue-700 underline hover:text-blue-900"
          >
            seu perfil
          </a>{" "}
          para habilitar esta fonte.
        </p>
      )}
      {isSelected && !disabled && <div className="mt-5">{children}</div>}
    </div>
  );
}
