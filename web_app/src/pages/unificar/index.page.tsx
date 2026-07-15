import { Plus, Stack } from "@phosphor-icons/react/dist/ssr";
import Head from "next/head";
import { MainLayout } from "../layout";
import { MultipleFilesInput } from "./components/MultipleFilesInput";
import { ContainerHead, DatabaseChose, DatabaseSelection, FilesDisplay, FilesForm, FilesFormButton, FilesInputContainer, MainContainer } from "./styles";
import { ChangeEvent, useRef, useState } from "react";
import { FileDisplay } from "./components/FileDisplay";

export default function Unificar() {
  const [database, setDatabase] = useState<"wos" | "scopus">("scopus")
  const [files, setFiles] = useState<File[]>([])

  const hasFiles = files.length > 0

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files)
      setFiles(selectedFiles)
    }
  }


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
        <FilesForm>
          <DatabaseChose>
            <h2>Base dos Arquivos</h2>
            <div>
              <DatabaseSelection isSelected={database == "scopus"} onClick={() => {
                setDatabase("scopus")
              }}>Scopus</DatabaseSelection>
              <DatabaseSelection isSelected={database == "wos"} onClick={() => {
                setDatabase("wos")
              }}>Web of Science</DatabaseSelection>
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
          <FilesDisplay>
            <FileDisplay />
            <FileDisplay />
            <FileDisplay />
          </FilesDisplay>
          <FilesFormButton disabled={!hasFiles}>
            <Stack size={20} />
            Gerar Arquivos Unificados
          </FilesFormButton>
        </FilesForm>
      </MainContainer>
    </MainLayout>
  )
}
