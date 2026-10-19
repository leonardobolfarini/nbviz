import { AuthLayout } from "@/src/layouts/AuthLayout";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeSlash, LockSimple } from "@phosphor-icons/react/dist/ssr";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const alterPssSchema = z
  .object({
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "As senhas não coincidem.",
    path: ["passwordConfirmation"],
  });

type AlterPssSchema = z.infer<typeof alterPssSchema>;

export default function RedefinirSenha() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AlterPssSchema>({
    resolver: zodResolver(alterPssSchema),
  });

  async function handleRecover({ password }: AlterPssSchema) {
    const response = await fetch("api/change_password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    if (!response.ok) {
      toast.error(
        "Não foi possível trocar a senha, entre em contato com o suporte através do email. nbviz.suporte@gmail.com",
        { richColors: true },
      );
      return;
    }

    toast.success("Senha alterada com sucesso!", { richColors: true });
    router.push("/login");
  }

  return (
    <AuthLayout>
      <form
        onSubmit={handleSubmit(handleRecover)}
        className="my-auto flex w-full max-w-xl flex-col gap-2 rounded-xl bg-white p-6 shadow-xl sm:p-8 md:col-start-2 md:justify-self-end md:px-12 md:pt-12 md:pb-8"
      >
        <h1 className="font-bold text-black text-4xl">Redefina sua senha</h1>
        <p className="mb-4 text-slate-500">Digite sua nova senha</p>
        <label htmlFor="password" className="text-md font-semibold text-black">
          Nova Senha
        </label>
        <div className="flex items-center gap-3 rounded border border-gray-400 bg-gray-100 p-2 focus-within:border-gray-600">
          <LockSimple size={24} />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Crie uma nova senha"
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
        <p className="min-h-4 text-sm leading-4 text-red-600">
          {errors.password?.message}
        </p>

        <label
          htmlFor="passwordConfirmation"
          className="text-md font-semibold text-black"
        >
          Confirme sua nova senha
        </label>
        <div className="flex items-center gap-3 rounded border border-gray-400 bg-gray-100 p-2 focus-within:border-gray-600">
          <LockSimple size={24} />
          <input
            id="passwordConfirmation"
            type={showPasswordConfirmation ? "text" : "password"}
            placeholder="Repita sua nova senha"
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
        <p className="min-h-4 text-sm leading-4 text-red-600">
          {errors.passwordConfirmation?.message}
        </p>

        {errors.root && (
          <p className="text-sm text-red-600">{errors.root.message}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 cursor-pointer rounded-lg bg-emerald-600 p-3 font-bold text-gray-100 transition-colors hover:bg-emerald-700 hover:text-white disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isSubmitting ? "Alterando senha..." : "Redefinir senha"}
        </button>
      </form>
    </AuthLayout>
  );
}
