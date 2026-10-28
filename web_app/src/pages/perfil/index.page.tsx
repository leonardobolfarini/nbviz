import {
  CaretDown,
  CheckCircle,
  ClockCountdown,
  DownloadSimple,
  File,
  SpinnerGap,
  UserCircle,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { DeleteAccountDialog } from "./components/dialog";
import { PerfilFallback } from "./components/fallback";
import { MainLayout } from "@/src/layouts/MainLayout";
import { VennSection } from "@/src/components/VennSection";

const statusStyle = {
  pending: {
    label: "Na fila",
    className: "bg-slate-100 text-slate-700",
    icon: ClockCountdown,
  },
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

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDate(date: string | null) {
  if (!date) return "Aguardando conclusão";
  return dateFormatter.format(new Date(date));
}

function formatExpiration(expiresAt: string | null) {
  if (!expiresAt) return "Expiração será definida ao concluir";
  const expiresAtDate = new Date(expiresAt);
  const prefix = expiresAtDate.getTime() > Date.now() ? "Expira em" : "Expirada em";

  return `${prefix} ${formatDate(expiresAt)}`;
}

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

export default function ProfilePage() {
  const { user } = useAuth();
  const [openAnalysis, setOpenAnalysis] = useState<string | null>(null);

  if (!user) {
    return <PerfilFallback />;
  }

  const { analyses } = user;

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
          <DeleteAccountDialog />
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
            {[...analyses]
              .sort(
                (firstAnalysis, secondAnalysis) =>
                  new Date(secondAnalysis.created_at ?? 0).getTime() -
                  new Date(firstAnalysis.created_at ?? 0).getTime(),
              )
              .map((a) => {
              const status = statusStyle[a.status];
              const StatusIcon = status.icon;
              const isOpen = openAnalysis === a.id;
              const files = [
                a.download_url && {
                  label: "Mesclagem",
                  url: a.download_url,
                },
                a.removed_url && {
                  label: "Registros removidos",
                  url: a.removed_url,
                },
              ].filter(
                (
                  file,
                ): file is {
                  label: string;
                  url: string;
                } => Boolean(file),
              );
              const canDownload = files.length > 0;

              return (
                <article key={a.id} className="px-6 py-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-semibold text-slate-800">
                          {a.title}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                        >
                          <StatusIcon
                            size={14}
                            className={
                              a.status === "processing" ? "animate-spin" : ""
                            }
                          />
                          {status.label}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {a.used_bases.join(" · ")}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
                        <span>Criada em {formatDate(a.created_at)}</span>
                        <span className="inline-flex items-center gap-1">
                          <ClockCountdown size={16} />{" "}
                          {formatExpiration(a.expires_at)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!canDownload}
                      onClick={() => setOpenAnalysis(isOpen ? null : a.id)}
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

                  {isOpen && (
                    <div className="mt-5 space-y-5 border-t border-slate-100 pt-5">
                      <div className="grid gap-3 md:grid-cols-2">
                        {files.map((file) => (
                          <div
                            key={file.url}
                            className="rounded-lg bg-slate-50 p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <File
                                size={22}
                                className="shrink-0 text-blue-600"
                              />
                              <span className="rounded bg-white px-2 py-1 text-xs font-medium text-slate-500">
                                {file.label}
                              </span>
                            </div>
                            <p className="mt-4 truncate text-sm font-semibold text-slate-700">
                              {file.url.split("/").pop()}
                            </p>
                            <a
                              href={`/api/proxy${file.url}`}
                              download
                              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900"
                            >
                              <DownloadSimple size={17} /> Baixar
                            </a>
                          </div>
                        ))}
                      </div>

                      {a.venn && a.venn.length > 0 && (
                        <VennSection rows={a.venn} />
                      )}
                    </div>
                  )}
                </article>
              );
              })}

            {analyses.length === 0 && (
              <p className="px-6 py-10 text-center text-sm text-slate-500">
                Você ainda não tem nenhuma mesclagem.
              </p>
            )}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
