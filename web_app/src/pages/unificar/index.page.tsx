import { UnifyFiles } from "@/src/api/send-unify-files";
import { formatBytes } from "@/src/utils/formatBytes";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Stack } from "@phosphor-icons/react/dist/ssr";
import { useMutation } from "@tanstack/react-query";
import Head from "next/head";
import { ChangeEvent, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MainLayout } from "../layout";
import { GeneratedFile } from "../mesclagem/components/GeneratedFile";
import { FileDisplay } from "./components/FileDisplay";
import { MultipleFilesInput } from "./components/MultipleFilesInput";
import { ContainerHead, DatabaseChose, DatabaseSelection, FilesDisplay, FilesForm, FilesFormButton, FilesInputContainer, GeneratedFileContainer, MainContainer } from "./styles";

const formSchema = z.object({
  database: z.enum(['wos', 'scopus']),

  files: z
  .array(z.custom<File>((val) => val instanceof File, { message: "Item inválido." }))
  .min(2, "Selecione pelo menos dois arquivos.")
})

type FormSchema = z.infer<typeof formSchema>

interface UnifiedFileState {
  url: string;
  fileName: string;
}

export default function Unificar() {
  const [unifiedFile, setUnifiedFile] = useState<UnifiedFileState | null>(null)
  const { handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      database: 'scopus',
      files: []
    }
  })

  const { mutateAsync: unifyFilesFn } = useMutation({
    mutationFn: UnifyFiles
  })

  const database = watch('database')
  const files = watch('files') || []
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleButtonClick() {
    fileInputRef.current?.click()
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files);

      const filteredFiles = selectedFiles.filter(file =>
        database === "scopus" ? file.name.endsWith(".csv") : file.name.endsWith(".txt")
      );

      const updatedFiles = [...files, ...filteredFiles];

      setValue("files", updatedFiles, { shouldValidate: true });
    }
  }

  function handleDeleteFile(indexToRemove: number) {
    const updatedFiles = files.filter((_, index) => index !== indexToRemove);
    setValue("files", updatedFiles, { shouldValidate: true });
  }


  async function handleUnify (data: FormSchema) {
    try {
      const { downloadUrl, fileName } = await unifyFilesFn({
        database: data.database,
        files: data.files
      })

      const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}${downloadUrl}`

      setUnifiedFile({ url: fullUrl, fileName })

      const generatedContainer = document.getElementById("generated")
      generatedContainer?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <MainLayout>
      <Head>
        <title>NBVIZ | Unificar</title>
        <meta
          name="description"
          content="Page where users can unify files from same database."
        />
      </Head>
      <MainContainer>
        <ContainerHead>
          <header>
            <Stack size={24} />
            <h1>Unificar Arquivos</h1>
          </header>
          <footer>Indique a base de todos os arquivos, adicione quantos arquivos quiser e gere um único arquivo unificado (fusão de arquivos da mesma base)</footer>
        </ContainerHead>
        <FilesForm onSubmit={handleSubmit(handleUnify)}>
          <DatabaseChose>
            <h2>Base dos Arquivos</h2>
            <div>
              <DatabaseSelection
                isSelected={database == "scopus"}
                onClick={() => {
                  setValue('database', 'scopus')
                  setValue('files', [])
              }}>
                Scopus
              </DatabaseSelection>
              <DatabaseSelection
                isSelected={database == "wos"}
                onClick={() => {
                  setValue('database', 'wos')
                  setValue('files', [])
              }}>
                Web of Science
              </DatabaseSelection>
            </div>
          </DatabaseChose>
          <FilesInputContainer>
            <input
              type="file"
              multiple
              accept={database == "scopus" ? '.csv' : '.txt'}
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <MultipleFilesInput files={files} database={database} />
            <label onClick={handleButtonClick}>
              <Plus size={16} />
              Adicionar Arquivos
            </label>
          </FilesInputContainer>
          {errors.files && <p style={{ color: "red" }}>{errors.files.message}</p>}
          {files &&
            <FilesDisplay>
              {files.map((file, index) => {
                return (
                  <FileDisplay
                    key={`${file.name}-${index}`}
                    fileName={file.name}
                    fileSize={formatBytes(file.size)}
                    onDelete={() => handleDeleteFile(index)}
                  />
                )
              })}
            </FilesDisplay>
          }
          <FilesFormButton disabled={isSubmitting || files.length < 2}>
            <Stack size={20} />
            Gerar Arquivos Unificados
          </FilesFormButton>
        </FilesForm>
        {unifiedFile && (
          <GeneratedFileContainer>
            <h2>Arquivo Gerado</h2>

            <GeneratedFile
              downloadUrl={unifiedFile.url}
              fileName={unifiedFile.fileName}
              fileType={database == 'scopus' ? 'csv' : 'txt'}
            />
          </GeneratedFileContainer>
        )}
      </MainContainer>
    </MainLayout>
  )
}
