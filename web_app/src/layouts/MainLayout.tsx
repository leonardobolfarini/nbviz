import Image from "next/image";
import { NavBar } from "../components/Navbar";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/router";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();

    await router.replace("/");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Image
            src="/nbviz_logo.png"
            width={150}
            height={48}
            className="h-10 w-auto object-contain"
            alt="NBVIZ"
            priority
          />
        </div>
        <div className="hidden text-sm text-blue-500 md:block">
          {isLoading ? null : isAuthenticated ? (
            <button
              type="button"
              onClick={() => handleLogout()}
              className="cursor-pointer hover:underline hover:text-blue-700"
            >
              Sair
            </button>
          ) : (
            <Link
              href="/login"
              className="cursor-pointer hover:underline hover:text-blue-700"
            >
              Entrar
            </Link>
          )}
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px]">
        <aside className="hidden min-h-[calc(100vh-4rem)] w-60 shrink-0 border-r border-slate-200 bg-white px-3 py-6 md:block">
          <NavBar />
        </aside>

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
          {children}
        </main>
      </div>

      <div className="border-t border-slate-200 bg-white px-3 py-3 md:hidden">
        <NavBar />
      </div>
    </div>
  );
}
