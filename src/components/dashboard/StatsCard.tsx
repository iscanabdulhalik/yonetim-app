"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Loading } from "@/components/ui/Loading";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  CreditCard,
  Receipt,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface StatsCardsProps {
  stats: {
    totalResidents: number;
    monthlyIncome: number;
    totalExpenses: number;
    overduePayments: number;
    paymentRate: number;
  };
  loading: boolean;
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Loading size="md" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Toplam Sakin",
      value: stats.totalResidents,
      icon: Users,
      color: "text-primary-600",
      bgColor: "bg-primary-50",
      change: "+2",
      changeType: "positive" as const,
    },
    {
      title: "Aylık Gelir",
      value: formatCurrency(stats.monthlyIncome),
      icon: CreditCard,
      color: "text-success-600",
      bgColor: "bg-success-50",
      change: `%${stats.paymentRate.toFixed(1)}`,
      changeType:
        stats.paymentRate >= 80 ? ("positive" as const) : ("negative" as const),
    },
    {
      title: "Toplam Gider",
      value: formatCurrency(stats.totalExpenses),
      icon: Receipt,
      color: "text-warning-600",
      bgColor: "bg-warning-50",
      change: "-5%",
      changeType: "positive" as const,
    },
    {
      title: "Geciken Ödemeler",
      value: stats.overduePayments,
      icon: AlertTriangle,
      color: "text-danger-600",
      bgColor: "bg-danger-50",
      change: "-2",
      changeType: "positive" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const TrendIcon =
          card.changeType === "positive" ? TrendingUp : TrendingDown;

        return (
          <Card key={index} className="hover:shadow-medium transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-600">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-secondary-900 mt-1">
                    {card.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}
                >
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>

              <div className="flex items-center mt-4">
                <div
                  className={`flex items-center space-x-1 ${
                    card.changeType === "positive"
                      ? "text-success-600"
                      : "text-danger-600"
                  }`}
                >
                  <TrendIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">{card.change}</span>
                </div>
                <span className="text-sm text-secondary-500 ml-2">
                  geçen aya göre
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
