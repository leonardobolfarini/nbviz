import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartBarData } from "@/src/lib/types";

interface ChartBarComponentData {
  dataListName: string;
  chartBarData: ChartBarData[];
}

export function ChartBarComponent({
  dataListName,
  chartBarData,
}: ChartBarComponentData) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{dataListName}</CardTitle>
      </CardHeader>
      {chartBarData && chartBarData.length > 0 ? (
        <CardContent className="h-[400px] w-full overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartBarData}
              margin={{ top: 20, right: 20, left: 0, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-35}
                textAnchor="end"
                height={120}
                interval={0}
                tickFormatter={(value) =>
                  value.length > 18 ? `${value.slice(0, 18)}…` : value
                }
              />
              <YAxis width={40} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      ) : (
        <h1>Nenhum dado disponível para exibição</h1>
      )}
    </Card>
  );
}
