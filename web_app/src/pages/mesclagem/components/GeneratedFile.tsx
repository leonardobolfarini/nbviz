import { Download, FileCsv, FileTxt } from "@phosphor-icons/react/dist/ssr";
interface GeneratedFileProps {
  fileType: "csv" | "txt";
  downloadUrl: string;
  fileName: string;
}
export function GeneratedFile({
  fileType,
  downloadUrl,
  fileName,
}: GeneratedFileProps) {
  const Icon = fileType === "csv" ? FileCsv : FileTxt;
  const href = downloadUrl.startsWith("http")
    ? downloadUrl
    : `${process.env.NEXT_PUBLIC_API_URL}${downloadUrl}`;
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-300 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Icon
          size={28}
          className={fileType === "csv" ? "text-green-500" : "text-blue-500"}
        />
        <div>
          <p className="font-bold text-slate-800">{fileName}</p>
          <span className="text-sm text-slate-500">
            Base unificada de registros
          </span>
        </div>
      </div>
      <a
        className="flex items-center justify-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100"
        href={href}
        download={fileName}
      >
        <Download size={20} /> Download
      </a>
    </div>
  );
}
