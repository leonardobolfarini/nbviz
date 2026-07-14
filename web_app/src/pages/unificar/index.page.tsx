import Head from "next/head";
import { MainLayout } from "../layout";
import { ContainerHead, MainContainer } from "./styles";
import { Stack } from "@phosphor-icons/react/dist/ssr";

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
          <span>
            <Stack size={32} />
            <h1>Unificar Arquivos</h1>
          </span>
          <footer>Indique a base de dados dos arquivos e submetá-os </footer>
        </ContainerHead>

      </MainContainer>
    </MainLayout>
  )
}
