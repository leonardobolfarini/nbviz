import { FileText } from "@phosphor-icons/react/dist/ssr";
import { MainMultipleFilesInputContainer } from "./styles";

interface MultipleFilesInputProps {
  files: File[];
  database: "scopus" | "wos"
}

export function MultipleFilesInput({ files, database }: MultipleFilesInputProps) {
  const hasFiles = files.length > 0
  const fileType = database == 'scopus' ? 'csv' : 'txt'

  return (
    <MainMultipleFilesInputContainer>
      <div>
        <FileText size={24} />
      </div>
      <span>
        {hasFiles ? <h2>{files.length} arquivo(s) adicionado(s)</h2> : <h2>Nenhum arquivo adicionado</h2>}
        <p>Formatos aceitos: {fileType}</p>
      </span>
    </MainMultipleFilesInputContainer>
  )
}
