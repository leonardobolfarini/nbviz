import { AuthLayout } from "@/src/layouts/AuthLayout";
import { zodResolver } from "@hookform/resolvers/zod";
import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const recoverSchema = z.object({
  email: z.string().email(),
});

type RecoverSchema = z.infer<typeof recoverSchema>;

export default function Recuperar() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<RecoverSchema>({
    resolver: zodResolver(recoverSchema),
  });

  async function handleRecover({ email }: RecoverSchema) {
    const response = await fetch("api/recover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      toast.error(
        "Não foi possível enviar, entre em contato com o suporte através do email. nbviz.suporte@gmail.com",
        { richColors: true },
      );
      return;
    }
  }

  return (
    <AuthLayout>
      {isSubmitSuccessful ? (
        <div className="my-auto flex w-full max-w-xl flex-col gap-2 rounded-xl bg-white p-6 shadow-xl sm:p-8 md:col-start-2 md:justify-self-end md:px-12 md:pt-12 md:pb-8">
          <h1 className="font-bold text-black text-4xl">Enviamos um email!</h1>
          <p className="mb-4 text-slate-500">
            Enviamos um link de recuperação para seu e-mail
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(handleRecover)}
          className="my-auto flex w-full max-w-xl flex-col gap-2 rounded-xl bg-white p-6 shadow-xl sm:p-8 md:col-start-2 md:justify-self-end md:px-12 md:pt-12 md:pb-8"
        >
          <h1 className="font-bold text-black text-4xl">Recupere sua conta</h1>
          <p className="mb-4 text-slate-500">
            Enviaremos a recuperação para seu e-mail
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
          <p className="min-h-4 text-sm leading-4 text-red-600">
            {errors.email?.message}
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 cursor-pointer rounded-lg bg-emerald-600 p-3 font-bold text-gray-100 transition-colors hover:bg-emerald-700 hover:text-white disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isSubmitting ? "Enviando email..." : "Enviar email de recuperação"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
