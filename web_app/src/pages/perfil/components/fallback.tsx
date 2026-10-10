import { LucideLoaderPinwheel } from "lucide-react";
import { MainLayout } from "../../layout";
import Head from "next/head";

export function PerfilFallback() {
  return (
    <MainLayout>
      <Head>
        <title>NBVIZ | Meu Perfil</title>
      </Head>
      <div className="flex justify-center items-center h-full">
        <LucideLoaderPinwheel size={42} className="animate-spin" />
      </div>
    </MainLayout>
  );
}
