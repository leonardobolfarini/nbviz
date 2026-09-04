import { MergeFiles } from "@/src/api/send-merge-files";
import { FileInput } from "@/src/components/FileInput";
import { LoadingIcon } from "@/src/styles/global";
import { zodResolver } from "@hookform/resolvers/zod";
import { Database } from "@phosphor-icons/react/dist/ssr";
import { useMutation } from "@tanstack/react-query";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../../components/Button";
import { MainLayout } from "../layout";
import { GeneratedFile } from "./components/GeneratedFile";
import {
  ButtonContainer,
  FilesContainer,
  FilesToSend,
  FilesToSendContainer,
  FilesToSendContent,
  FilesToSendHeader,
  GeneratedFilesContainer,
} from "./styles";

const formFilesSchema = z.object({
  scopusFile: z
    .any()
    .refine(
      (files) =>
        files instanceof FileList &&
        files.length > 0 &&
        files[0].name.endsWith(".csv"),
      {
        message: "Selecione um arquivo .csv para Scopus.",
      },
    )
    .transform((files) => files[0]),

  wosFile: z
    .any()
    .refine(
      (files) =>
        files instanceof FileList &&
        files.length > 0 &&
        files[0].name.endsWith(".txt"),
      {
        message: "Selecione um arquivo .txt para WoS.",
      },
    )
    .transform((files) => files[0]),

  outputFormat: z.enum(["scopus", "wos"])

})


export type FormFilesProps = z.infer<typeof formFilesSchema>;

interface DownloadUrlsTypes {
  removedUrl: string | null
  worksUrl: string | null
  fileName: string | null
}

export default function SendDownloadView() {
  const [downloadUrls, setDownloadUrls] = useState<DownloadUrlsTypes | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting: isProcessing },
  } = useForm<FormFilesProps>({
    resolver: zodResolver(formFilesSchema),
    defaultValues: {
      outputFormat: 'scopus'
    }
  });

  const { mutateAsync: MergeFilesFn } = useMutation({
    mutationFn: MergeFiles,
  });

  const scopusFileValue = watch("scopusFile");
  const wosFileValue = watch("wosFile");
  const outputFormat = watch("outputFormat")

  useEffect(() => {
    if (downloadUrls) {
      const generatedContainer = document.getElementById("generated");
      generatedContainer?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [downloadUrls]);

  async function handleMergeFiles(files: FormFilesProps) {
    try {
      const { downloadRemovedUrl, downloadWorksUrl, fileName } = await MergeFilesFn({
        scopusFile: files.scopusFile,
        wosFile: files.wosFile,
        outputFormat
      });

      setDownloadUrls({
        worksUrl: downloadWorksUrl,
        removedUrl: downloadRemovedUrl,
        fileName,
      });

      const generatedContainer = document.getElementById("generated");
      generatedContainer?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <MainLayout>
      <Head>
        <title>NBVIZ | Mesclagem</title>
        <meta
          name="description"
          content="Page where users can upload and merge database files."
        />
      </Head>
      <FilesContainer>
        <FilesToSendHeader>
          <header>
            <Database size={24} />
            <h1>Mesclagem de Bases de Dados</h1>
          </header>
          <footer>
            Faça upload dos arquivos do Scopus e Web of Science para gerar uma
            base unificada
          </footer>
        </FilesToSendHeader>
        <FilesToSend as="form" onSubmit={handleSubmit(handleMergeFiles)}>
          <div>
            <input type="radio" onClick={() => {
              setValue('outputFormat', 'scopus')
            }} name="outputFormat" />
            <input type="radio" onClick={() => {
              setValue('outputFormat', 'wos')
            }} name="outputFormat"  />
          </div>
          <FilesToSendContainer>
            <FilesToSendContent>
              <div>
                <span>1</span>
                <p>Arquivo Scopus</p>
              </div>
              <FileInput
                idhtml="scopusFile"
                database="Scopus"
                accept=".csv"
                value={scopusFileValue}
                {...register("scopusFile")}
              />
              <span>
                {errors.scopusFile ? String(errors.scopusFile.message) : ""}
              </span>
            </FilesToSendContent>

            <FilesToSendContent>
              <div>
                <span>2</span>
                <p>Arquivo Web of Science</p>
              </div>
              <FileInput
                idhtml="wosFile"
                database="Web of Science"
                accept=".txt"
                value={wosFileValue}
                {...register("wosFile")}
              />
              <span>
                {errors.wosFile ? String(errors.wosFile.message) : ""}
              </span>
            </FilesToSendContent>
          </FilesToSendContainer>
          <ButtonContainer>
            <Button colorButton="black" type="submit" disabled={isProcessing}>
              {isProcessing ? (
                <LoadingIcon />
              ) : (
                <Database weight="bold" height={20} width={20} />
              )}
              Mesclar Bases de Dados
            </Button>
          </ButtonContainer>
          <h1>{errors.outputFormat?.message}</h1>

        </FilesToSend>
        {downloadUrls !== null && (
          <GeneratedFilesContainer id="generated">
            <h3>Arquivos Gerados</h3>
            <div>
              <GeneratedFile
                fileType="csv"
                downloadUrl={downloadUrls.worksUrl!}
                fileName={downloadUrls.fileName!}
              />
              <GeneratedFile
                fileType="txt"
                downloadUrl={downloadUrls.removedUrl!}
                fileName={`removed_${downloadUrls.fileName!}`}
              />
            </div>
          </GeneratedFilesContainer>
        )}
      </FilesContainer>
    </MainLayout>
  );
}
