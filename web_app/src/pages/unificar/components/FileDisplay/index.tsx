import { FileText, Trash } from "@phosphor-icons/react/dist/ssr";
import { FileDisplayContainer, FileDisplayHeader } from "./styles";

export function FileDisplay() {
  return (
    <FileDisplayContainer>
      <FileDisplayHeader>
        <span>
          <FileText size={20} />
        </span>
        <div>
          <h2>teste.csv</h2>
          <p>125.8 KB</p>
        </div>
      </FileDisplayHeader>
      <Trash size={16} />
    </FileDisplayContainer>
  )
}
