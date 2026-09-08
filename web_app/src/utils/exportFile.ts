export const exportToCSV = (
  data: { count: number; label: string }[],
  fileName: string,
  keyName: string,
) => {
  if (!data || data.length === 0) return;

  const csvRows = [
    "sep=;",
    `${keyName};Quantidade`,
    ...data.map((item) => `"${item.label}";${item.count}`),
  ];

  const csvContent = csvRows.join("\n");

  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
