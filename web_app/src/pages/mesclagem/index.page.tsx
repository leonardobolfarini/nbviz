import { MergeFiles } from "@/src/api/send-merge-files";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Database,
  MagnifyingGlass,
  UploadSimple,
  Warning,
} from "@phosphor-icons/react/dist/ssr";
import { useMutation } from "@tanstack/react-query";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { InputCard } from "./components/InputCard";
import { MainLayout } from "@/src/layouts/MainLayout";
import { toast } from "sonner";

const schema = z.object({
  title: z.string().min(1, { message: "É obrigatório digitar um título." }),
  scopusFile: z.any().optional(),
  wosFile: z.any().optional(),
  searchTerm: z.string().optional(),
  limit: z.coerce.number().int().positive().optional(),
  outputFormat: z.enum(["scopus", "wos", "openalex"]),
});
type FormData = z.infer<typeof schema>;

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  resolvedUrl,
}) => {
  const token = req.cookies["nbviz.token"];

  if (!token) {
    return {
      redirect: {
        destination: `/login?next=${encodeURIComponent(resolvedUrl)}`,
        permanent: false,
      },
    };
  }

  const response = await fetch(`${process.env.INTERNAL_API_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    res.setHeader(
      "Set-Cookie",
      "nbviz.token=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0",
    );

    return {
      redirect: {
        destination: `/login?next=${encodeURIComponent(resolvedUrl)}`,
        permanent: false,
      },
    };
  }

  return { props: {} };
};

export default function MergePage() {
  const [selected, setSelected] = useState({
    scopus: true,
    wos: true,
    openalex: false,
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { outputFormat: "scopus" },
  });

  const { mutateAsync } = useMutation({ mutationFn: MergeFiles });
  const scopus = watch("scopusFile");
  const wos = watch("wosFile");
  const count = Object.values(selected).filter(Boolean).length;

  const toggle = (key: keyof typeof selected) =>
    setSelected((old) => ({ ...old, [key]: !old[key] }));

  async function submit(data: FormData) {
    if (count < 2) return;

    const result = await mutateAsync({
      title: data.title,
      scopusFile: selected.scopus ? data.scopusFile?.[0] : undefined,
      wosFile: selected.wos ? data.wosFile?.[0] : undefined,
      searchTerm: selected.openalex ? data.searchTerm : undefined,
      limit: selected.openalex ? data.limit : undefined,
      outputFormat: data.outputFormat,
    });

    if (result == 500) {
      toast.error(
        "Não foi possível realizar a mesclagem, entre em contato com o suporte nbviz.suporte@gmail.com",
        { richColors: true },
      );

      return;
    }

    toast.success(
      'Mesclagem enviada para a fila. Esse processo pode levar alguns minutos. Acompanhe o progresso na página "Meu Perfil"',
      { richColors: true },
    );
  }

  return (
    <MainLayout>
      <Head>
        <title>NBVIZ | Mesclagem</title>
      </Head>
      <form
        onSubmit={handleSubmit(submit)}
        className="mx-auto max-w-7xl space-y-6"
      >
        <header>
          <div className="flex items-center gap-3">
            <Database size={30} className="text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-800">
              Mesclagem de Bases
            </h1>
          </div>
          <p className="mt-2 text-slate-500">
            Escolha pelo menos duas fontes para criar uma base unificada.
          </p>
        </header>
        <label className="block max-w-xl text-sm font-medium text-slate-700">
          Título da mesclagem
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="Ex.: Produção científica sobre mudanças climáticas"
            {...register("title")}
          />
          {errors.title && (
            <span className="mt-1 block text-sm text-red-600">
              {errors.title.message}
            </span>
          )}
        </label>
        {count < 2 && (
          <div className="flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4 text-orange-800">
            <Warning size={23} /> Escolha pelo menos duas fontes para realizar a
            mesclagem.
          </div>
        )}
        <div className="grid gap-5 lg:grid-cols-3">
          <InputCard
            title="Scopus"
            color="border-blue-500"
            isSelected={selected.scopus}
            setSelect={() => toggle("scopus")}
          >
            <>
              <label
                htmlFor="scopusFile"
                className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-blue-300 bg-blue-50/40 p-5 text-center"
              >
                <UploadSimple size={42} className="text-blue-600" />
                <span className="mt-3 font-medium text-slate-700">
                  Arraste seu arquivo CSV ou clique para selecionar
                </span>
                <span className="mt-1 text-sm text-slate-500">
                  Formato aceito: CSV
                </span>
              </label>
              <input
                id="scopusFile"
                type="file"
                accept=".csv"
                className="hidden"
                {...register("scopusFile")}
              />
              {scopus?.[0] && (
                <p className="mt-2 text-sm text-blue-700">{scopus[0].name}</p>
              )}
            </>
          </InputCard>
          <InputCard
            title="Web of Science"
            color="border-orange-500"
            isSelected={selected.wos}
            setSelect={() => toggle("wos")}
          >
            <>
              <label
                htmlFor="wosFile"
                className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-orange-300 bg-orange-50/40 p-5 text-center"
              >
                <UploadSimple size={42} className="text-orange-600" />
                <span className="mt-3 font-medium text-slate-700">
                  Arraste seu arquivo TXT ou clique para selecionar
                </span>
                <span className="mt-1 text-sm text-slate-500">
                  Formato aceito: TXT
                </span>
              </label>
              <input
                id="wosFile"
                type="file"
                accept=".txt"
                className="hidden"
                {...register("wosFile")}
              />
              {wos?.[0] && (
                <p className="mt-2 text-sm text-orange-700">{wos[0].name}</p>
              )}
            </>
          </InputCard>
          <InputCard
            title="OpenAlex"
            color="border-green-500"
            isSelected={selected.openalex}
            setSelect={() => toggle("openalex")}
          >
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Termo de busca
                <input
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  placeholder="Ex.: climate change"
                  {...register("searchTerm")}
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Limite de works (opcional)
                <input
                  type="number"
                  min="1"
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  placeholder="Ex.: 1000"
                  {...register("limit")}
                />
              </label>
              <p className="flex items-center gap-2 text-sm text-slate-500">
                <MagnifyingGlass size={17} /> Máximo permitido: 100.000 works
              </p>
            </div>
          </InputCard>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row">
          <div>
            <h2 className="font-semibold text-slate-800">
              Fontes selecionadas
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {Object.entries(selected)
                .filter(([, value]) => value)
                .map(([key]) =>
                  key === "openalex"
                    ? "OpenAlex"
                    : key === "wos"
                      ? "Web of Science"
                      : "Scopus",
                )
                .join(" + ")}
            </p>
          </div>
          <div className="flex w-full items-center flex-col gap-3 sm:w-auto sm:flex-row">
            <label className="text-sm text-slate-600">
              Formato de saída
              <select
                className="ml-2 rounded-md border border-slate-300 px-2 py-2"
                {...register("outputFormat")}
              >
                <option value="scopus">Scopus (CSV)</option>
                <option value="wos">Web of Science (TXT)</option>
                <option value="openalex">OpenAlex (CSV)</option>
              </select>
            </label>
            <button
              type="submit"
              disabled={isSubmitting || count < 2}
              className="flex items-center justify-center gap-2 rounded-lg bg-black px-8 py-4 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Processando..." : "Mesclar bases"}
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
        {errors.root && <p className="text-red-600">{errors.root.message}</p>}
      </form>
    </MainLayout>
  );
}
