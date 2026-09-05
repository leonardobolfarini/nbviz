export interface GetChartBarFormatProps {
  chartBarFile: File;
}

export interface ChartBarData {
  name: string;
  count: number;
}

export interface ChartCountInterface {
  label: string;
  count: number;
}

export interface AuthorsCountInterface {
  authors: ChartCountInterface[];
}

export interface KeywordsCountInterface {
  keywords: ChartCountInterface[];
}

export interface SourcesCountInterface {
  sources: ChartCountInterface[];
}

export interface YearsCountInterface {
  years: ChartCountInterface[];
}
