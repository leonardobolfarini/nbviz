"use client";
import { GetGraphFormat } from "@/src/api/get-graph-format";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  ArrowsOut,
  Download,
  Hash,
  Users,
} from "@phosphor-icons/react/dist/ssr";
import { SigmaRender } from "./components/SigmaRender";
import { MainLayout } from "../layout";
import Head from "next/head";
import { exportToPajek } from "@/src/utils/exportFile";
import { GraphEdgesFormat, GraphNodesFormat } from "../types";
import { SelectionType } from "./components/SelectionType";
const getGraphFormatFile = z.object({
  graphType: z.enum(["coauthorship", "keywords"], {
    required_error: "Selecione o tipo de grafo",
  }),
  graphFile: z
    .any()
    .refine(
      (files) =>
        files instanceof FileList &&
        files.length > 0 &&
        (files[0].name.endsWith(".csv") || files[0].name.endsWith(".txt")),
      {
        message: "Selecione um arquivo",
      },
    )
    .transform((files) => files[0]),
});
type GetGraphFormatFile = z.infer<typeof getGraphFormatFile>;
export default function Graph() {
  const [nodes, setNodes] = useState<GraphNodesFormat[] | null>(null);
  const [edges, setEdges] = useState<GraphEdgesFormat[] | null>(null);
  const [isFullSize, setIsFullSize] = useState<boolean>(false);
  const { mutateAsync: GetGraphFormatFn } = useMutation({
    mutationFn: GetGraphFormat,
  });
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting: isProcessing, isValid },
  } = useForm<GetGraphFormatFile>({
    resolver: zodResolver(getGraphFormatFile),
    defaultValues: {
      graphType: "coauthorship",
    },
  });
  const graphFileValue = watch("graphFile");
  const graphType = watch("graphType");
  useEffect(() => {
    if (nodes && edges) {
      const graphContainer = document.getElementById("graphContainer");
      graphContainer?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [nodes, edges]);
  async function handleSendGraphFileToFormat({
    graphFile,
    graphType,
  }: GetGraphFormatFile) {
    const response = await GetGraphFormatFn({
      graphFile,
      graphType,
    });
    setNodes(response.nodes);
    setEdges(response.edges);
  }
  return (
    <MainLayout>
      <Head>
        <title>NBVIZ | Redes</title>
        <meta
          name="description"
          content="Page where you can analyze co-authorship and keywords networks."
        />
      </Head>
      <div className="mx-auto max-w-7xl space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <form
          className="space-y-6"
          onSubmit={handleSubmit(handleSendGraphFileToFormat)}
        >
          <div className="flex flex-col gap-1">
            <header className="flex items-center gap-3">
              <Users size={28} className="text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-800">
                Análise de Redes
              </h1>
            </header>
            <p className="text-sm text-slate-500">
              Visualize grafos de coautoria ou palavras-chave a partir dos seus
              dados
            </p>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-3">
              <SelectionType
                isActive={graphType === "coauthorship"}
                icon={Users}
                onClick={() => setValue("graphType", "coauthorship")}
              >
                Coautoria
              </SelectionType>
              <SelectionType
                isActive={graphType === "keywords"}
                icon={Hash}
                onClick={() => setValue("graphType", "keywords")}
              >
                Palavras-chave
              </SelectionType>
            </div>
            {errors.graphType && (
              <span className="text-sm text-red-600">
                {errors.graphType.message}
              </span>
            )}
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-blue-300 bg-blue-50/40 p-8 text-center">
              <span className="font-medium text-slate-700">
                Clique para selecionar um arquivo CSV ou TXT
              </span>
              <span className="mt-1 text-sm text-slate-500">
                Arquivo para criar a rede
              </span>
              <input
                className="hidden"
                type="file"
                accept=".csv,.txt"
                {...register("graphFile")}
              />
            </label>
            <span className="text-sm text-red-600">
              {errors.graphFile ? String(errors.graphFile.message) : ""}
            </span>
          </div>

          <button
            className="mx-auto flex w-full items-center justify-center gap-2 rounded-lg bg-black px-6 py-4 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            type="submit"
            disabled={isProcessing || !isValid}
          >
            {isProcessing ? (
              "Processando..."
            ) : (
              <>
                {graphType == "coauthorship" ? (
                  <>
                    <Users weight="bold" height={20} width={20} />
                    <p>Gerar Grafo de Coautoria</p>
                  </>
                ) : (
                  <>
                    <Hash weight="bold" height={20} width={20} />
                    <p>Gerar Grafo de Palvras-chave</p>
                  </>
                )}
              </>
            )}
          </button>
        </form>
        <div className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-slate-100 p-3 sm:p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <header>
              {graphType == "coauthorship" ? (
                <>
                  <h3>Grafo de Coautoria</h3>
                  <span>Rede de colaborações entre pesquisadores</span>
                </>
              ) : (
                <>
                  <h3>Grafo de Palvras-chave</h3>
                  <span>Rede de co-ocorrencia de palvras-chave</span>
                </>
              )}
            </header>
            {edges && nodes && (
              <span>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-white"
                  onClick={() =>
                    exportToPajek({ edges, nodes }, "rede_colaboracao")
                  }
                >
                  <Download size={20} />
                  Exportar Grafo (.net)
                </button>
              </span>
            )}
          </div>
          <div className="relative min-h-[420px] rounded-lg border border-slate-200 bg-white">
            {!edges || !nodes ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 p-8 text-center">
                {graphType == "coauthorship" ? (
                  <Users size={50} className="text-slate-400" />
                ) : (
                  <Hash size={50} className="text-slate-400" />
                )}
                <h2>Grafo será exibido aqui</h2>
                <span>Faça upload de um arquivo para gerar a visualização</span>
              </div>
            ) : (
              <div id="graphContainer" className="relative">
                <button
                  type="button"
                  className="absolute right-0 top-0 z-10 rounded-md p-3 text-slate-600 hover:bg-slate-100"
                  onClick={() => {
                    setIsFullSize((ret) => !ret);
                  }}
                >
                  <ArrowsOut size={24} />
                </button>
                <SigmaRender
                  graphEdges={edges}
                  graphNodes={nodes}
                  isFullSize={isFullSize}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
