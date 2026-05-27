import {
  AppFunctionsCards,
  AppFunctionsContainer,
  DescriptionContainer,
  HomeContainer,
  HomeHeader,
  HowToUseContainer,
  HowToUseVariants,
  OurInfos,
  OurInfosContainer,
  UsedTechnologies,
  UsedTechnologiesContainer,
} from "./styles";
import { MainLayout } from "../layout";
import {
  Code,
  Database,
  GithubLogo,
  BookBookmark,
  Info,
  Rocket,
  FileText,
  LinkedinLogo,
} from "@phosphor-icons/react/dist/ssr";
import Head from "next/head";
import Image from "next/image";

export default function Home() {
  return (
    <MainLayout>
      <Head>
        <title>NBVIZ | Sobre</title>
        <meta
          name="description"
          content="Home page that gives an overview of the project."
        />
      </Head>
      <HomeContainer>
        <HomeHeader>
          <div>
            <Info size={28} color="#3b82f6" />
            <h1>Sobre o Software</h1>
          </div>
          <span>
            Ferramenta destinada para combinação de dados e análise
            bibliométrica de dados científicso oriundos das bases de dados Web
            of Science e Scopus
          </span>
        </HomeHeader>
        <DescriptionContainer>
          <h2>O que é?</h2>
          <p>
            A NB VIZ foi desenvolvida para facilitar a análise de dados
            bibliométricos provenientes das principais bases de dados
            científicas (Scopus e Web of Science). Com ela, você pode mesclar
            bases de dados, visualizar redes de colaboração entre pesquisadores
            e gerar análises estatísticas detalhadas sobre publicações
            científicas.
          </p>
        </DescriptionContainer>
        <AppFunctionsContainer>
          <header>
            <Rocket size={24} />
            <h2>Funcionalidades Principais</h2>
          </header>

          <AppFunctionsCards>
            <div>
              <Database size={32} color="#3b82f6" />
              <h3>Mesclagem de Bases</h3>
              <p>
                Combine arquivos do Scopus e Web of Science em uma única base
                unificada, com remoção automática de duplicatas
              </p>
            </div>
            <div>
              <Database size={32} color="#22c55e" />
              <h3>Rede de Coautoria</h3>
              <p>
                Visualize grafos interativos das colaborações entre
                pesquisadores e identifique padrões de cooperação
              </p>
            </div>
            <div>
              <Database size={32} color="#a855f7" />
              <h3>Análises Estatísticas</h3>
              <p>
                Gere gráficos de barras para distribuições e análises temporais
                de publicações
              </p>
            </div>
          </AppFunctionsCards>
        </AppFunctionsContainer>
        <HowToUseContainer>
          <h2>Como Usar</h2>

          <HowToUseVariants phase="first">
            <span>
              <p>1</p>
            </span>
            <div>
              <h3>Prepare seus dados</h3>
              <p>
                Exporte seus dados do Scopus ou Web of Science nos formatos TXT,
                CSV, XLSX ou XLS
              </p>
            </div>
          </HowToUseVariants>

          <HowToUseVariants phase="second">
            <span>
              <p>2</p>
            </span>
            <div>
              <h3>Escolha a funcionalidade</h3>
              <p>
                Navegue pelas abas e selecione a análise desejada: mesclagem de
                arquivos das bases (Scopus + Web of Science), rede coautoria ou
                estatísticas
              </p>
            </div>
          </HowToUseVariants>

          <HowToUseVariants phase="third">
            <span>
              <p>3</p>
            </span>
            <div>
              <h3>Faça upload e analise</h3>
              <p>
                Arraste seus arquivos ou clique para selecioná-los e visualize
                os resultados em tempo real
              </p>
            </div>
          </HowToUseVariants>
        </HowToUseContainer>
        <UsedTechnologiesContainer>
          <header>
            <Code size={24} weight="bold" />
            <h2>Desenvolvimento</h2>
          </header>
          <UsedTechnologies>
            <div>
              <GithubLogo size={20} />
              <span>
                <h3>Tecnologias Utilizadas</h3>
                <p>Next.js, React, TypeScript, Python, Flask</p>
              </span>
            </div>

            <div>
              <FileText size={20} />
              <span>
                <h3>Formatos Suportados</h3>
                <p>
                  TXT, CSV, XLSX, XLS - Compatível com exportações do Scopus e
                  Web of Science
                </p>
              </span>
            </div>

            <div>
              <BookBookmark size={20} />
              <span>
                <h3>Biblioteca Python</h3>
                <a
                  href="https://pypi.org/project/nbviz-scientometric-tools/"
                  target="_blank"
                >
                  Link para o PyPI
                </a>
              </span>
            </div>
          </UsedTechnologies>
        </UsedTechnologiesContainer>
        <OurInfosContainer>
          <h2>Equipe</h2>

          <div>
            <Image
              src="/TeamPhoto.jpeg"
              width={500}
              height={500}
              quality={100}
              alt="Team Photo"
              style={{
                display: "flex",
                justifySelf: "center",
                objectFit: "cover",
              }}
            />
            <OurInfos>
              <div>
                <h3>Leonardo Neves Bolfarini</h3>
                <p>Orientando responsável pelo desenvolvimento do projeto</p>

                <div>
                  <a href="https://github.com/leonardobolfarini">
                    <span>
                      <GithubLogo />
                      Github
                    </span>
                  </a>
                  <a href="https://www.linkedin.com/in/leonardo-bolfarini/">
                    <span>
                      <LinkedinLogo />
                      Linkedin
                    </span>
                  </a>
                </div>
              </div>

              <div>
                <h3>Rafael Gutierres Castanha</h3>
                <p>Supervisão acadêmica do projeto</p>

                <div>
                  <a href="https://github.com/rafaelcastanha">
                    <span>
                      <GithubLogo />
                      Github
                    </span>
                  </a>
                  <a href="https://www.linkedin.com/in/rcastanha/">
                    <span>
                      <LinkedinLogo />
                      Linkedin
                    </span>
                  </a>
                </div>
              </div>
            </OurInfos>
          </div>
        </OurInfosContainer>
      </HomeContainer>
    </MainLayout>
  );
}
