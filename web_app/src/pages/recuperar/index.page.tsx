import { AuthLayout } from "@/src/layouts/AuthLayout";

export default function Recuperar() {
  return (
    <AuthLayout>
      <form className="my-auto flex w-full max-w-xl flex-col gap-2 rounded-xl bg-white p-6 shadow-xl sm:p-8 md:col-start-2 md:justify-self-end md:px-12 md:pt-12 md:pb-8">
        <h1 className="font-bold text-black text-4xl">Recupere sua conta</h1>
        <p className="mb-4 text-slate-500">Enviaremos a recuperação para seu e-mail</p>
      </form>
    </AuthLayout>
  )
}
