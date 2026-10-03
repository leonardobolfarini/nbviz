import {
  CaretDown,
  CheckCircle,
  ClockCountdown,
  DownloadSimple,
  File,
  SpinnerGap,
  Trash,
  UserCircle,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
import Head from "next/head";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { MainLayout } from "../layout";

type AnalysisStatus = "finished" | "processing" | "error";

type Analysis = {
  id: string;
  title: string;
  sources: string;
  createdAt: string;
  expiresIn: string;
  status: AnalysisStatus;
  files?: {
    name: string;
    size: string;
    type: "Mesclagem" | "Removidos" | "Venn";
  }[];
};

const analyses: Analysis[] = [
  {
    id: "analise-1",
    title: "Mesclagem Scopus + Web of Science",
    sources: "Scopus · Web of Science",
    createdAt: "26 set. 2026, 14:32",
    expiresIn: "2h 18min",
    status: "finished",
    files: [
      { name: "all_in_one_8f3c.csv", size: "1,8 MB", type: "Mesclagem" },
      { name: "removed_8f3c.csv", size: "324 KB", type: "Removidos" },
      { name: "venn_8f3c.json", size: "3 KB", type: "Venn" },
    ],
  },
  {
    id: "analise-2",
    title: "Produção científica sobre IA na educação",
    sources: "Scopus · OpenAlex",
    createdAt: "26 set. 2026, 14:48",
    expiresIn: "—",
    status: "processing",
  },
  {
    id: "analise-3",
    title: "Redes de colaboração em saúde pública",
    sources: "Web of Science · OpenAlex",
    createdAt: "26 set. 2026, 12:03",
    expiresIn: "Expirada em breve",
    status: "error",
  },
];

const statusStyle = {
  finished: {
    label: "Concluída",
    className: "bg-emerald-50 text-emerald-700",
    icon: CheckCircle,
  },
  processing: {
    label: "Processando",
    className: "bg-blue-50 text-blue-700",
    icon: SpinnerGap,
  },
  error: {
    label: "Não concluída",
    className: "bg-rose-50 text-rose-700",
    icon: WarningCircle,
  },
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [openAnalysis, setOpenAnalysis] = useState<string | null>(null);

  return (
    <MainLayout>
      <Head>
        <title>NBVIZ | Meu perfil</title>
      </Head>

      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <div className="flex items-center gap-3">
            <UserCircle size={31} className="text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-800">Meu perfil</h1>
          </div>
          <p className="mt-2 text-slate-500">
            Acompanhe suas mesclagens enquanto os arquivos estiverem
            disponíveis.
          </p>
        </header>

        <section className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <UserCircle size={31} weight="fill" />
            </div>
            <div>
              <p className="text-sm text-slate-500">E-mail da conta</p>
              <p className="font-semibold text-slate-800">
                {user?.email ?? "usuario@exemplo.com"}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-50"
          >
            <Trash size={18} /> Excluir conta
          </button>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Suas mesclagens
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Arquivos ficam disponíveis por até três horas após a criação.
              </p>
            </div>
            <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
              {analyses.length} recentes
            </span>
          </div>

          <div className="divide-y divide-slate-200">
            {analyses.map((analysis) => {
              const status = statusStyle[analysis.status];
              const StatusIcon = status.icon;
              const isOpen = openAnalysis === analysis.id;
              const canDownload = analysis.status === "finished";

              return (
                <article key={analysis.id} className="px-6 py-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-semibold text-slate-800">
                          {analysis.title}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                        >
                          <StatusIcon
                            size={14}
                            className={
                              analysis.status === "processing"
                                ? "animate-spin"
                                : ""
                            }
                          />
                          {status.label}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {analysis.sources}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
                        <span>Criada em {analysis.createdAt}</span>
                        <span className="inline-flex items-center gap-1">
                          <ClockCountdown size={16} /> {analysis.expiresIn}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!canDownload}
                      onClick={() =>
                        setOpenAnalysis(isOpen ? null : analysis.id)
                      }
                      className="inline-flex w-fit items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                    >
                      {canDownload ? "Ver arquivos" : "Aguardando resultado"}
                      <CaretDown
                        size={17}
                        className={
                          isOpen
                            ? "rotate-180 transition-transform"
                            : "transition-transform"
                        }
                      />
                    </button>
                  </div>

                  {isOpen && analysis.files && (
                    <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5 md:grid-cols-3">
                      {analysis.files.map((file) => (
                        <div
                          key={file.name}
                          className="rounded-lg bg-slate-50 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <File
                              size={22}
                              className="shrink-0 text-blue-600"
                            />
                            <span className="rounded bg-white px-2 py-1 text-xs font-medium text-slate-500">
                              {file.type}
                            </span>
                          </div>
                          <p className="mt-4 truncate text-sm font-semibold text-slate-700">
                            {file.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {file.size}
                          </p>
                          <button
                            type="button"
                            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900"
                          >
                            <DownloadSimple size={17} /> Baixar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
