import { FileText, Trash } from "@phosphor-icons/react/dist/ssr";
import { FileDisplayContainer, FileDisplayHeader } from "./styles";

interface FileDisplayProps {
  fileName: string
  fileSize: string
  onDelete: () => void
}

export function FileDisplay({
  fileName, fileSize, onDelete
}: FileDisplayProps) {
  return (
    <FileDisplayContainer>
      <FileDisplayHeader>
        <span>
          <FileText size={20} />
        </span>
        <div>
          <h2>{fileName}</h2>
          <p>{fileSize}</p>
        </div>
      </FileDisplayHeader>
      <Trash size={16} onClick={onDelete} style={{ cursor: 'pointer' }} />
    </FileDisplayContainer>
  )
}
