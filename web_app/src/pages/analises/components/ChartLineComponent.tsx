import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartBarData } from "@/src/lib/types";

interface ChartLineComponentProps {
  dataListName: string;
  chartBarData: ChartBarData[];
}

export function ChartLineComponent({
  dataListName,
  chartBarData,
}: ChartLineComponentProps) {
  const chartLineData = [...chartBarData].sort(
    (a, b) => Number(a.name) - Number(b.name),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dataListName}</CardTitle>
      </CardHeader>
      {chartBarData && chartBarData.length > 0 ? (
        <CardContent className="h-[400px] w-full overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartLineData}
              margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
            >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 5 }}
            />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      ) : (
        <h1>Nenhum dado disponível para exibição</h1>
      )}
    </Card>
  );
}
