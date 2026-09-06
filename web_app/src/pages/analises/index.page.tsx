import { GetChartBarFormat } from "@/src/api/get-chart-bar-format";
import { exportToCSV } from "@/src/utils/exportFile";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChartBar,
  ChartLine,
  Download,
  PaperPlaneRight,
} from "@phosphor-icons/react/dist/ssr";
import { useMutation } from "@tanstack/react-query";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MainLayout } from "../layout";
import {
  AuthorsCountInterface,
  KeywordsCountInterface,
  SourcesCountInterface,
  YearsCountInterface,
} from "@/src/lib/types";
import { ChartBarComponent } from "./components/ChartBarComponent";
import { ChartLineComponent } from "./components/ChartLineComponent";
const schema = z.object({
  chartBarFile: z
    .any()
    .refine(
      (files) => files instanceof FileList && files.length > 0,
      "Selecione um arquivo CSV ou TXT.",
    )
    .transform((files) => files[0]),
});
type FormData = z.infer<typeof schema>;
function DownloadButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-4 flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
    >
      <Download size={18} /> Baixar dados completos
    </button>
  );
}
export default function Charts() {
  const [authors, setAuthors] = useState<AuthorsCountInterface | null>(null);
  const [keywords, setKeywords] = useState<KeywordsCountInterface | null>(null);
  const [sources, setSources] = useState<SourcesCountInterface | null>(null);
  const [years, setYears] = useState<YearsCountInterface | null>(null);
  const { mutateAsync } = useMutation({ mutationFn: GetChartBarFormat });
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const chartFile = watch("chartBarFile");
  useEffect(() => {
    if (authors || keywords || sources || years)
      document
        .getElementById("chartContainer")
        ?.scrollIntoView({ behavior: "smooth" });
  }, [authors, keywords, sources, years]);
  async function submit({ chartBarFile }: FormData) {
    const data = await mutateAsync({ chartBarFile });
    setAuthors(data.authors);
    setKeywords(data.keywords);
    setSources(data.sources);
    setYears(data.years);
  }
  const chartCards = [
    [
      "10 palavras-chave com maior ocorrência",
      keywords?.keywords || [],
      "allkeywords",
      "keyword",
    ],
    [
      "10 autores mais produtivos",
      authors?.authors || [],
      "full_authors",
      "author",
    ],
    [
      "10 fontes mais produtivas",
      sources?.sources || [],
      "full_sources",
      "source",
    ],
  ] as const;

  const hasResults = Boolean(authors || keywords || sources || years);
  return (
    <MainLayout>
      <Head>
        <title>NBVIZ | Análises</title>
      </Head>
      <div className="mx-auto max-w-7xl space-y-6">
        <form
          onSubmit={handleSubmit(submit)}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <ChartBar size={30} className="text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Análises estatísticas
              </h1>
              <p className="text-sm text-slate-500">
                Envie uma base para gerar gráficos de distribuição e evolução
                temporal.
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <label className="flex flex-1 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-blue-300 bg-blue-50/40 px-5 py-4 text-sm font-medium text-slate-700">
              {chartFile?.[0]
                ? chartFile[0].name
                : "Clique para selecionar CSV ou TXT"}
              <input
                className="hidden"
                type="file"
                accept=".csv,.txt"
                {...register("chartBarFile")}
              />
            </label>
            <button
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 rounded-lg bg-black px-6 py-4 font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {isSubmitting ? "Processando..." : "Analisar"}
              <PaperPlaneRight size={20} />
            </button>
          </div>
          {errors.chartBarFile && (
            <p className="mt-2 text-sm text-red-600">
              {String(errors.chartBarFile.message)}
            </p>
          )}
        </form>
        {hasResults ? (
          <>
        <section className="rounded-xl border border-slate-200 bg-slate-100 p-4 sm:p-6">
          <div className="mb-5">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-800">
              <ChartBar className="text-blue-600" /> Gráficos de distribuição
            </h2>
            <p className="text-sm text-slate-500">
              Análise quantitativa por categorias
            </p>
          </div>
          <div id="chartContainer" className="grid gap-4">
            {chartCards.map(([title, data, filename, field]) => (
              <div
                key={title}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <ChartBarComponent
                  dataListName={title}
                  chartBarData={[...data]
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10)
                    .map((item) => ({ name: item.label, count: item.count }))}
                />
                {data.length > 0 && (
                  <DownloadButton
                    onClick={() => exportToCSV(data, filename, field)}
                  />
                )}
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-xl border border-slate-200 bg-slate-100 p-4 sm:p-6">
          <div className="mb-5">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-800">
              <ChartLine className="text-purple-600" /> Evolução temporal
            </h2>
            <p className="text-sm text-slate-500">
              Tendências e padrões ao longo do tempo
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            {years ? (
              <>
                <ChartLineComponent
                  dataListName="Últimos 10 anos"
                  chartBarData={[...years.years]
                    .sort((a, b) => Number(a.label) - Number(b.label))
                    .slice(-10)
                    .map((item) => ({
                      name: String(item.label),
                      count: item.count,
                    }))}
                />
                <DownloadButton
                  onClick={() => exportToCSV(years.years, "full_years", "year")}
                />
              </>
            ) : (
              <div className="flex h-80 flex-col items-center justify-center gap-3 text-center text-slate-400">
                <ChartLine size={54} />
                <h3 className="text-lg font-medium">
                  Gráfico de linha temporal
                </h3>
                <p className="text-sm">
                  Os dados de evolução temporal aparecerão aqui.
                </p>
              </div>
            )}
          </div>
        </section>
          </>
        ) : (
          <section className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <ChartBar size={56} className="text-blue-200" />
            <h2 className="mt-4 text-xl font-semibold text-slate-700">
              Seus gráficos aparecerão aqui
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Selecione uma base bibliográfica acima e clique em “Analisar”
              para gerar as distribuições e a evolução temporal.
            </p>
          </section>
        )}
      </div>
    </MainLayout>
  );
}
