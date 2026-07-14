import { FileText } from "@phosphor-icons/react/dist/ssr";

export function MultipleFilesInput() {
  return (
    <>
      <FileText size={24} />
      <span>
        <h2>Nenhum arquivo adicionado</h2>
        <p>Formatos aceitos: csv</p>
      </span>
    </>
  )
}
