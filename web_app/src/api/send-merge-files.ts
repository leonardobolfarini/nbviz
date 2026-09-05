import { api } from "../lib/axios";

interface MergeFilesProps {
  scopusFile?: File;
  wosFile?: File;
  searchTerm?: string;
  limit?: number;
  outputFormat: "scopus" | "wos";
}

export async function MergeFiles({
  scopusFile,
  wosFile,
  outputFormat,
}: MergeFilesProps) {
  const formData = new FormData();
  if (scopusFile) formData.append("scopusFile", scopusFile);
  if (wosFile) formData.append("wosFile", wosFile);
  if (searchTerm) formData.append("searchTerm", searchTerm);
  if (limit) formData.append("limit", String(limit));
  formData.append("outputFormat", outputFormat);

  try {
    const response = await api.post("/process", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (!response.data?.download_works_url) {
      throw new Error("A resposta do servidor está vazia ou inválida.");
    }

    return {
      downloadWorksUrl: response.data.download_works_url,
      downloadRemovedUrl: response.data.download_removed_url,
      fileName: response.data?.file_name,
    };
  } catch (error: any) {
    if (error.response) {
      const message =
        error.response.data?.message || "Erro no processamento do servidor.";
      throw new Error(message);
    } else if (error.request) {
      throw new Error("Falha na comunicação com o servidor.");
    } else {
      throw new Error(
        error.message || "Erro desconhecido ao enviar os arquivos.",
      );
    }
  }
}
