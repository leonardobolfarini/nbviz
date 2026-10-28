import { api } from "../lib/axios";

interface MergeFilesProps {
  scopusFile?: File;
  wosFile?: File;
  searchTerm?: string;
  limit?: number;
  outputFormat: "scopus" | "wos" | "openalex";
  title: string;
}

export async function MergeFiles({
  scopusFile,
  wosFile,
  outputFormat,
  limit,
  searchTerm,
  title,
}: MergeFilesProps) {
  const formData = new FormData();
  if (scopusFile) formData.append("scopusFile", scopusFile);
  if (wosFile) formData.append("wosFile", wosFile);
  if (searchTerm) formData.append("searchTerm", searchTerm);
  if (limit) formData.append("limit", String(limit));
  formData.append("outputFormat", outputFormat);
  formData.append("title", title);

  const response = await fetch("/api/process", {
    method: "POST",
    body: formData,
  });

  if (response.status != 202) {
    return 500;
  }

  return response.status;
}
