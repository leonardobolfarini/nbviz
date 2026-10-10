import { api } from "@/src/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  EnvelopeSimple,
  Eye,
  LockSimple,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "../../contexts/AuthContext";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: "É necessário digitar a senha." }),
});

type LoginSchema = z.infer<typeof loginSchema>;

export default function Login() {
  const { refreshUser } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  function showPassword() {
    const input = document.getElementById(
      "password",
    ) as HTMLInputElement | null;

    if (!input) {
      throw new Error("Input not found");
    }

    if (input.type === "password") {
      input.type = "text";
    } else {
      input.type = "password";
    }
  }

  async function handleLogin({ email, password }: LoginSchema) {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (response.status === 401) {
      setError("root", {
        type: "manual",
        message: "Credências inválidas.",
      });

      return;
    }

    if (!response.ok) {
      setError("root", {
        type: "manual",
        message: "Ocorreu um erro ao realizar o login.",
      });

      return;
    }

    await refreshUser();

    const next = router.query.next;
    const destination =
      typeof next === "string" && next.startsWith("/") && !next.startsWith("//")
        ? next
        : "/";

    await router.replace(destination);
  }

  return (
    <div
      className="grid min-h-dvh grid-cols-1 bg-cover bg-center bg-no-repeat p-4 sm:p-6 md:grid-cols-2 md:p-8"
      style={{ backgroundImage: "url('/login_background.png')" }}
    >
      <form
        onSubmit={handleSubmit(handleLogin)}
        className="my-auto flex w-full max-w-xl flex-col gap-2 rounded-xl bg-white p-6 shadow-xl sm:p-8 md:col-start-2 md:justify-self-end md:px-12 md:pt-12 md:pb-8"
      >
        <h1 className="font-bold text-black text-4xl">Acesse sua conta</h1>
        <p className="mb-4 text-slate-500">Entre para continuar no NBVIZ</p>

        <label htmlFor="email" className="font-semibold text-md text-black">
          E-mail
        </label>
        <div className="flex flex-row gap-3 border rounded p-2 items-center border-gray-400 bg-gray-100 focus-within:border-gray-600">
          <EnvelopeSimple size={20} />
          <input
            id="email"
            type="email"
            placeholder="Seu e-mail"
            className="w-full outline-0 text-gray-600"
            {...register("email")}
          />
        </div>
        <p className="text-red-600">{errors.email?.message}</p>

        <label htmlFor="password" className="font-semibold text-md text-black">
          Senha
        </label>

        <div className="flex flex-row gap-3 border rounded p-2 items-center border-gray-400 bg-gray-100 focus-within:border-gray-600">
          <LockSimple size={24} />
          <input
            id="password"
            type="password"
            placeholder="Sua senha"
            className="w-full outline-0 text-gray-600"
            {...register("password")}
          />
          <Eye
            size={32}
            className="cursor-pointer"
            onClick={() => showPassword()}
          />
        </div>
        <p className="text-red-600">{errors.password?.message}</p>

        <Link
          href="recover"
          className="mb-3 w-fit self-end cursor-pointer text-blue-700 underline transition-colors hover:text-blue-500"
        >
          Esqueceu a senha?
        </Link>

        {errors.root && (
          <p className="text-red-600 text-sm">{errors.root.message}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="p-3 rounded-lg cursor-pointer font-bold bg-emerald-600 text-gray-100 hover:text-white hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Entrar
        </button>
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-gray-300" />

          <span className="text-sm text-gray-500 whitespace-nowrap">
            Ainda não tem uma conta?
          </span>

          <div className="h-px flex-1 bg-gray-300" />
        </div>
        <Link
          href="/cadastro"
          className="text-emerald-600 text-center font-bold underline hover:text-emerald-500 transition-colors"
        >
          Criar conta
        </Link>
      </form>
    </div>
  );
}
