"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Oca", odenen: 85, toplam: 100 },
  { month: "Şub", odenen: 92, toplam: 100 },
  { month: "Mar", odenen: 78, toplam: 100 },
  { month: "Nis", odenen: 95, toplam: 100 },
  { month: "May", odenen: 88, toplam: 100 },
  { month: "Haz", odenen: 97, toplam: 100 },
];

export function PaymentChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ödeme Oranları</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-secondary-200"
              />
              <XAxis
                dataKey="month"
                className="text-secondary-600"
                tick={{ fontSize: 12 }}
              />
              <YAxis className="text-secondary-600" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
              />
              <Line
                type="monotone"
                dataKey="odenen"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
