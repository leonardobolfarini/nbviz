import { api } from "@/src/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  EnvelopeSimple,
  Eye,
  LockSimple,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import router from "next/router";
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

    if (response.status === 404) {
      setError("root", {
        type: "manual",
        message: "E-mail ou senha incorretos.",
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
    await router.push("/");
  }

  return (
    <div
      className="max-h-screen h-screen bg-cover bg-center bg-no-repeat grid grid-cols-2 p-12"
      style={{ backgroundImage: "url('/login_background.png')" }}
    >
      <form
        onSubmit={handleSubmit(handleLogin)}
        className="col-2 rounded-xl p-16 flex flex-col gap-2 bg-white"
      >
        <h1 className="font-bold text-black text-4xl">Acesse sua conta</h1>
        <p className="text-slate-500 mb-6">Entre para continuar no NBVIZ</p>

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
          className="w-fit self-end mb-5 text-blue-700 underline cursor-pointer hover:text-blue-500 transition-colors"
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
