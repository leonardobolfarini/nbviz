import {
  Database,
  Info,
  Stack,
  TrendUp,
  Users,
} from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/router";
const items = [
  { href: "/", label: "Sobre", icon: Info },
  { href: "/mesclagem", label: "Mesclagem", icon: Database },
  { href: "/unificar", label: "Unificar", icon: Stack },
  { href: "/redes", label: "Redes", icon: Users },
  { href: "/analises", label: "Análises", icon: TrendUp },
];
export function NavBar() {
  const { pathname } = useRouter();
  return (
    <nav
      className="flex gap-3 md:flex-col md:gap-4"
      aria-label="Navegação principal"
    >
      {items.map(({ href, label, icon: Icon }) => (
        <a
          key={href}
          href={href}
          className={`flex min-h-14 flex-1 items-center gap-3 px-5 py-4 text-sm transition-colors md:flex-none ${pathname === href ? "bg-blue-50 font-semibold text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
        >
          <Icon size={20} />
          <span className="hidden md:inline">{label}</span>
        </a>
      ))}
    </nav>
  );
}
