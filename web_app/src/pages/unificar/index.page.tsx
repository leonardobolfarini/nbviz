import Head from "next/head";
import { MainLayout } from "../layout";
import { ContainerHead, DatabaseChose, DatabaseSelection, FilesForm, FilesInputContainer, MainContainer } from "./styles";
import { FileText, Plus, Stack } from "@phosphor-icons/react/dist/ssr";
import { MultipleFilesInput } from "./components/MultipleFilesInput";

export default function Unificar() {
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
              <DatabaseSelection isSelected>Scopus</DatabaseSelection>
              <DatabaseSelection>Web of Science</DatabaseSelection>
            </div>
          </DatabaseChose>
          <FilesInputContainer>
            <MultipleFilesInput />
            <button>
              <Plus size={32} />
              Adicionar Arquivos
            </button>
          </FilesInputContainer>
          <button>
            <Stack size={32} />
            Gerar Arquivos Unificados
          </button>
        </FilesForm>
      </MainContainer>
    </MainLayout>
  )
}
