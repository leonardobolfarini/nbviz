import { zodResolver } from "@hookform/resolvers/zod";
import {
  EnvelopeSimple,
  Eye,
  EyeSlash,
  LockSimple,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const registerSchema = z
  .object({
    email: z.string().email("Informe um e-mail válido."),
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "As senhas não coincidem.",
    path: ["passwordConfirmation"],
  });

type RegisterSchema = z.infer<typeof registerSchema>;

export default function Register() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterSchema>({ resolver: zodResolver(registerSchema) });

  async function handleRegister({ email, password }: RegisterSchema) {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (response.status === 409) {
      setError("email", {
        type: "manual",
        message: "Já existe uma conta com este e-mail.",
      });
      return;
    }

    if (!response.ok) {
      setError("root", {
        type: "manual",
        message: "Não foi possível criar sua conta. Tente novamente.",
      });
      return;
    }

    await router.push("/login?registered=1");
  }

  return (
    <div
      className="grid h-screen max-h-screen grid-cols-1 bg-cover bg-center bg-no-repeat p-6 md:grid-cols-2 md:p-12"
      style={{ backgroundImage: "url('/login_background.png')" }}
    >
      <form
        onSubmit={handleSubmit(handleRegister)}
        className="col-start-1 my-auto flex w-full max-w-xl flex-col gap-2 rounded-xl bg-white p-8 shadow-xl md:col-start-2 md:justify-self-end md:p-12"
      >
        <h1 className="text-4xl font-bold text-black">Crie sua conta</h1>
        <p className="mb-6 text-slate-500">
          Crie uma conta para salvar suas mesclagens.
        </p>

        <label htmlFor="email" className="text-md font-semibold text-black">
          E-mail
        </label>
        <div className="flex items-center gap-3 rounded border border-gray-400 bg-gray-100 p-2 focus-within:border-gray-600">
          <EnvelopeSimple size={20} />
          <input
            id="email"
            type="email"
            placeholder="Seu e-mail"
            className="w-full bg-transparent text-gray-600 outline-0"
            {...register("email")}
          />
        </div>
        <p className="min-h-5 text-sm text-red-600">{errors.email?.message}</p>

        <label htmlFor="password" className="text-md font-semibold text-black">
          Senha
        </label>
        <div className="flex items-center gap-3 rounded border border-gray-400 bg-gray-100 p-2 focus-within:border-gray-600">
          <LockSimple size={24} />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Crie uma senha"
            className="w-full bg-transparent text-gray-600 outline-0"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="cursor-pointer text-slate-600 hover:text-slate-900"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? <EyeSlash size={24} /> : <Eye size={24} />}
          </button>
        </div>
        <p className="min-h-5 text-sm text-red-600">
          {errors.password?.message}
        </p>

        <label
          htmlFor="passwordConfirmation"
          className="text-md font-semibold text-black"
        >
          Confirme sua senha
        </label>
        <div className="flex items-center gap-3 rounded border border-gray-400 bg-gray-100 p-2 focus-within:border-gray-600">
          <LockSimple size={24} />
          <input
            id="passwordConfirmation"
            type={showPasswordConfirmation ? "text" : "password"}
            placeholder="Repita sua senha"
            className="w-full bg-transparent text-gray-600 outline-0"
            {...register("passwordConfirmation")}
          />
          <button
            type="button"
            onClick={() => setShowPasswordConfirmation((value) => !value)}
            className="cursor-pointer text-slate-600 hover:text-slate-900"
            aria-label={
              showPasswordConfirmation ? "Ocultar senha" : "Mostrar senha"
            }
          >
            {showPasswordConfirmation ? (
              <EyeSlash size={24} />
            ) : (
              <Eye size={24} />
            )}
          </button>
        </div>
        <p className="min-h-5 text-sm text-red-600">
          {errors.passwordConfirmation?.message}
        </p>

        {errors.root && (
          <p className="text-sm text-red-600">{errors.root.message}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 cursor-pointer rounded-lg bg-emerald-600 p-3 font-bold text-gray-100 transition-colors hover:bg-emerald-700 hover:text-white disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isSubmitting ? "Criando conta..." : "Criar conta"}
        </button>

        <p className="mt-3 text-center text-sm text-gray-500">
          Já tem uma conta?{" "}
          <Link
            href="/login"
            className="font-bold text-emerald-600 underline transition-colors hover:text-emerald-500"
          >
            Entrar
          </Link>
        </p>
      </form>
    </div>
  );
}
