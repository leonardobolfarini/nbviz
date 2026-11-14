import { MainLayout } from "@/src/layouts/MainLayout";
import { BookBookmark } from "@phosphor-icons/react/dist/ssr";
import Head from "next/head";
import type { GetServerSideProps } from "next";
import Link from "next/link";
import { useAuth } from "@/src/contexts/AuthContext";
import { FormEvent, useState } from "react";

type Database = "scopus" | "wos";
export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  resolvedUrl,
}) => {
  const token = req.cookies["nbviz.token"];
  if (token) {
    const response = await fetch(`${process.env.INTERNAL_API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) return { props: {} };
    res.setHeader(
      "Set-Cookie",
      "nbviz.token=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0",
    );
  }
  return {
    redirect: {
      destination: `/login?next=${encodeURIComponent(resolvedUrl)}`,
      permanent: false,
    },
  };
};

export default function Tesauro() {
  const { refreshUser } = useAuth();
  const [database, setDatabase] = useState<Database>("scopus");
  const [file, setFile] = useState<File | null>(null);
  const [thesaurus, setThesaurus] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || !thesaurus || loading) return;
    setLoading(true);
    setError("");
    setSubmitted(false);
    const data = new FormData();
    data.append("file", file);
    data.append("thesaurusFile", thesaurus);
    data.append("databaseType", database);
    try {
      const response = await fetch("/api/proxy/standardize_authors", {
        method: "POST",
        body: data,
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(
          body?.message || "Não foi possível padronizar os autores.",
        );
      }
      await refreshUser();
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível conectar ao servidor.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <MainLayout>
      <Head>
        <title>NBVIZ | Tesauro de autores</title>
      </Head>
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <div className="flex items-center gap-3">
            <BookBookmark size={30} className="text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-800">
              Tesauro de autores
            </h1>
          </div>
          <p className="mt-2 text-slate-500">
            Padronize as variações de nomes dos autores no seu arquivo
            bibliográfico.
          </p>
        </header>
        <form
          onSubmit={submit}
          className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <fieldset
            disabled={loading}
            className="space-y-6 disabled:opacity-60"
          >
            <div>
              <p className="mb-3 text-sm font-semibold text-slate-700">
                Selecione a base do arquivo
              </p>
              <div className="flex flex-wrap gap-3">
                {(
                  [
                    ["scopus", "Scopus"],
                    ["wos", "Web of Science"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={database === value}
                    onClick={() => {
                      setDatabase(value);
                      setFile(null);
                      setSubmitted(false);
                      setError("");
                    }}
                    className={`rounded-lg border-2 px-5 py-3 font-semibold ${database === value ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2 rounded-xl border border-slate-200 p-5">
                <span className="block font-semibold text-slate-800">
                  Arquivo bibliográfico
                </span>
                <span className="block text-sm text-slate-500">
                  Selecione um arquivo{" "}
                  {database === "scopus"
                    ? "CSV da Scopus"
                    : "TXT da Web of Science"}
                  .
                </span>
                <input
                  key={database}
                  type="file"
                  accept={database === "scopus" ? ".csv" : ".txt"}
                  required
                  onChange={(e) => {
                    setFile(e.target.files?.[0] ?? null);
                    setSubmitted(false);
                    setError("");
                  }}
                  className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-semibold file:text-blue-700"
                />
              </label>
              <label className="space-y-2 rounded-xl border border-slate-200 p-5">
                <span className="block font-semibold text-slate-800">
                  Arquivo de tesauro
                </span>
                <span className="block text-sm text-slate-500">
                  Selecione um arquivo TXT com as substituições.
                </span>
                <input
                  type="file"
                  accept=".txt,text/plain"
                  required
                  onChange={(e) => {
                    setThesaurus(e.target.files?.[0] ?? null);
                    setSubmitted(false);
                    setError("");
                  }}
                  className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-semibold file:text-blue-700"
                />
              </label>
            </div>
            <div className="rounded-lg bg-blue-50 p-4 text-sm text-slate-700">
              <p className="font-semibold text-blue-800">Formato do tesauro</p>
              <p className="mt-1">
                Em cada linha, informe o nome a manter, seguido de{" "}
                <code>|</code> e da lista de variações separadas por ponto e
                vírgula:
              </p>
              <pre className="mt-3 overflow-x-auto rounded-md bg-white p-3 text-xs">
                {
                  "Nome a manter | Nomes substituídos\nSilva, J. | [Silva, João; Silva, Joao]"
                }
              </pre>
              <p className="mt-2">
                A comparação considera maiúsculas, minúsculas e pontuação. Salve
                o arquivo em UTF-8.
              </p>
              <a
                className="mt-2 inline-block font-semibold text-blue-700 underline"
                href={`data:text/plain;charset=utf-8,${encodeURIComponent("Nome a manter | Nomes substituídos\nBolfarini, N. L. | [Neves, B. L; Bolfarini, Neves Leonardo; Bolfarini, Leonardo]\nSantos, M. | [Santos, Maria; Santos, M. A.]\n")}`}
                download="tesauro-exemplo.txt"
              >
                Baixar tesauro de exemplo
              </a>
            </div>
            <button
              type="submit"
              disabled={!file || !thesaurus}
              className="w-full rounded-lg bg-black px-6 py-4 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {loading ? "Processando..." : "Aplicar tesauro"}
            </button>
          </fieldset>
          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </p>
          )}
        </form>
        {submitted && (
          <section
            role="status"
            className="rounded-xl border border-slate-200 bg-slate-100 p-5"
          >
            <h2 className="font-semibold text-slate-800">
              Tesauro enviado para a fila
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Acompanhe o processamento e baixe o resultado em{" "}
              <Link
                href="/perfil"
                className="font-semibold text-blue-700 underline"
              >
                Meu perfil
              </Link>
              .
            </p>
          </section>
        )}
      </div>
    </MainLayout>
  );
}
