import { UnifyFiles } from "@/src/api/send-unify-files";
import { formatBytes } from "@/src/utils/formatBytes";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info, Plus, Stack, Trash } from "@phosphor-icons/react/dist/ssr";
import { useMutation } from "@tanstack/react-query";
import Head from "next/head";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MainLayout } from "../layout";
import { GeneratedFile } from "../mesclagem/components/GeneratedFile";
const formSchema = z.object({
  database: z.enum(["wos", "scopus"]),
  files: z
    .array(z.custom<File>())
    .min(2, "Selecione pelo menos dois arquivos."),
});
type FormSchema = z.infer<typeof formSchema>;
export default function Unificar() {
  const [unifiedFile, setUnifiedFile] = useState<{
    url: string;
    fileName: string;
  } | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: { database: "scopus", files: [] },
  });
  const { mutateAsync } = useMutation({ mutationFn: UnifyFiles });
  const database = watch("database");
  const files = watch("files") || [];
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);
  function change(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files)
      setValue(
        "files",
        [
          ...files,
          ...Array.from(e.target.files).filter((f) =>
            database === "scopus"
              ? f.name.endsWith(".csv")
              : f.name.endsWith(".txt"),
          ),
        ],
        { shouldValidate: true },
      );
  }
  async function submit(data: FormSchema) {
    const result = await mutateAsync({
      database: data.database,
      files: data.files,
    });
    setUnifiedFile({
      url: result.downloadUrl,
      fileName: result.fileName,
    });
    setTimeout(
      () =>
        document
          .getElementById("generated")
          ?.scrollIntoView({ behavior: "smooth" }),
      0,
    );
  }
  return (
    <MainLayout>
      <Head>
        <title>NBVIZ | Unificar</title>
      </Head>
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <div className="flex items-center gap-3">
            <Stack size={30} className="text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-800">
              Fusão de arquivos
            </h1>
          </div>
          <p className="mt-2 text-slate-500">
            Una quantos arquivos quiser da mesma base em um único arquivo.
          </p>
        </header>
        <form
          onSubmit={handleSubmit(submit)}
          className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div>
            <h2 className="mb-3 text-sm font-semibold text-slate-700">
              Selecione a base dos arquivos
            </h2>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setValue("database", "scopus");
                  setValue("files", []);
                }}
                className={`rounded-lg border-2 px-5 py-3 font-semibold ${database === "scopus" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600"}`}
              >
                Scopus
              </button>
              <button
                type="button"
                onClick={() => {
                  setValue("database", "wos");
                  setValue("files", []);
                }}
                className={`rounded-lg border-2 px-5 py-3 font-semibold ${database === "wos" ? "border-orange-500 bg-orange-50 text-orange-700" : "border-slate-200 text-slate-600"}`}
              >
                Web of Science
              </button>
            </div>
          </div>
          <div className="rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/40 p-8 text-center">
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={database === "scopus" ? ".csv" : ".txt"}
              onChange={change}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mx-auto flex items-center gap-2 rounded-lg bg-slate-800 px-5 py-3 font-semibold text-white hover:bg-slate-700"
            >
              <Plus size={20} /> Adicionar arquivos
            </button>
            <p className="mt-3 text-sm text-slate-600">
              Você pode adicionar quantos arquivos quiser da base selecionada.
            </p>
            <p className="text-xs text-slate-500">
              Formato aceito: {database === "scopus" ? "CSV" : "TXT"}
            </p>
          </div>
          {errors.files && (
            <p className="text-sm text-red-600">{errors.files.message}</p>
          )}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">
                Arquivos selecionados
              </h2>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                {files.length} arquivo(s)
              </span>
            </div>
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
              >
                <div>
                  <p className="font-medium text-slate-800">{file.name}</p>
                  <p className="text-sm text-slate-500">
                    {formatBytes(file.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setValue(
                      "files",
                      files.filter((_, i) => i !== index),
                      { shouldValidate: true },
                    )
                  }
                  className="flex items-center gap-1 rounded-md border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash size={17} /> Remover
                </button>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center gap-3">
            <button
              type="submit"
              disabled={!hasMounted || isSubmitting || files.length < 2}
              className="flex w-full items-center justify-center gap-3 rounded-lg bg-black px-6 py-4 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-1/2"
            >
              <Stack size={20} />
              {isSubmitting ? "Processando..." : "Mesclar arquivos"}
            </button>
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <Info size={17} /> É necessário selecionar pelo menos dois
              arquivos.
            </p>
          </div>
        </form>
        {unifiedFile && (
          <section
            id="generated"
            className="space-y-4 rounded-xl border border-slate-200 bg-slate-100 p-5"
          >
            <h2 className="text-xl font-semibold text-slate-800">
              Arquivo gerado
            </h2>
            <GeneratedFile
              downloadUrl={unifiedFile.url}
              fileName={unifiedFile.fileName}
              fileType={database === "scopus" ? "csv" : "txt"}
            />
          </section>
        )}
      </div>
    </MainLayout>
  );
}
