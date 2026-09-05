import { IconProps } from "@phosphor-icons/react";
interface SelectionTypeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  icon: React.ComponentType<IconProps>;
  isActive: boolean;
}
export function SelectionType({
  children,
  icon: Icon,
  isActive = false,
  ...rest
}: SelectionTypeProps) {
  return (
    <button
      type="button"
      className={`flex items-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition ${isActive ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}
      {...rest}
    >
      <Icon size={20} weight="bold" />
      <p>{children}</p>
    </button>
  );
}
