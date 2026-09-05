import {
  ArrowRight,
  BookBookmark,
  ChartBar,
  Database,
  Info,
  Network,
  Stack,
} from "@phosphor-icons/react/dist/ssr";
import Head from "next/head";
import Link from "next/link";
import { MainLayout } from "../layout";
const features = [
  [
    "Mesclagem de Bases",
    "Combine Scopus, Web of Science e OpenAlex em uma base unificada, removendo duplicatas.",
    "/mesclagem",
    Database,
    "blue",
  ],
  [
    "Fusão de Arquivos",
    "Una vários arquivos exportados da mesma base quando houver limites de registros por exportação.",
    "/unificar",
    Stack,
    "orange",
  ],
  [
    "Análises Estatísticas",
    "Gere gráficos de barras e linhas para observar distribuições e tendências das publicações.",
    "/analises",
    ChartBar,
    "green",
  ],
  [
    "Redes de Coautoria",
    "Visualize conexões entre pesquisadores e identifique padrões de colaboração científica.",
    "/redes",
    Network,
    "purple",
  ],
] as const;
const colors = {
  blue: "border-blue-100 bg-blue-50 text-blue-600",
  orange: "border-orange-100 bg-orange-50 text-orange-600",
  green: "border-green-100 bg-green-50 text-green-600",
  purple: "border-purple-100 bg-purple-50 text-purple-600",
};
const accents = {
  blue: "bg-blue-500",
  orange: "bg-orange-500",
  green: "bg-green-500",
  purple: "bg-purple-500",
};
export default function Home() {
  return (
    <MainLayout>
      <Head>
        <title>NBVIZ | Sobre</title>
        <meta name="description" content="Visão geral do NBVIZ" />
      </Head>
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="grid gap-8 rounded-xl border border-slate-200 bg-white p-8 shadow-sm lg:grid-cols-[240px_1fr] lg:items-center lg:px-14">
          <div className="flex justify-center">
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-8 text-blue-600">
              <BookBookmark size={130} weight="duotone" />
            </div>
          </div>
          <div>
            <div className="mb-2 flex items-center gap-2 text-blue-600">
              <Info size={24} />
              <span className="text-sm font-semibold uppercase tracking-wide">
                Sobre o software
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-800">
              NBVIZ
            </h1>
            <p className="mt-2 text-xl font-semibold text-blue-600">
              Ferramenta para combinação e análise bibliométrica
            </p>
            <h2 className="mt-7 text-xl font-semibold text-slate-800">
              O que é?
            </h2>
            <p className="mt-2 max-w-3xl leading-7 text-slate-600">
              O NBVIZ é uma solução integrada para combinar bases de dados
              bibliográficos e gerar análises estatísticas e redes de coautoria,
              apoiando pesquisas científicas com rigor e eficiência.
            </p>
          </div>
        </section>
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-slate-800">
            Funcionalidades principais
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {features.map(([title, text, href, Icon, color]) => (
              <Link
                key={title}
                href={href}
                className="group flex min-h-64 flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div
                  className={`mb-5 flex h-16 w-16 items-center justify-center rounded-full border ${colors[color]}`}
                >
                  <Icon size={34} weight="duotone" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">
                  {title}
                </h3>
                <div className={`my-3 h-0.5 w-16 ${accents[color]}`} />
                <p className="text-sm leading-6 text-slate-600">{text}</p>
                <ArrowRight
                  className="mt-auto self-end text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600"
                  size={24}
                />
              </Link>
            ))}
          </div>
        </section>
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-slate-800">
            Como usar
          </h2>
          <div className="grid gap-4 lg:grid-cols-4">
            {(
              [
                [
                  "1",
                  "Mesclagem de bases diferentes",
                  "Selecione Scopus, Web of Science e/ou OpenAlex. Escolha pelo menos duas fontes.",
                  "blue",
                ],
                [
                  "2",
                  "Fusão da mesma base",
                  "Escolha uma base e adicione quantos arquivos quiser para contornar limites de exportação.",
                  "orange",
                ],
                [
                  "3",
                  "Redes de coautoria",
                  "Envie uma base, configure a rede e explore as conexões entre pesquisadores.",
                  "purple",
                ],
                [
                  "4",
                  "Análises estatísticas",
                  "Visualize gráficos de barras e linhas para analisar suas publicações.",
                  "green",
                ],
              ] as const
            ).map(([number, title, text, color]) => (
              <div
                key={number}
                className={`rounded-xl border p-5 ${colors[color]}`}
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-current bg-white text-lg font-bold">
                    {number}
                  </span>
                  <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
