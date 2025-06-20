"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils";
import {
  CreditCard,
  Megaphone,
  MessageSquare,
  Receipt,
  User,
} from "lucide-react";

const activities = [
  {
    id: 1,
    type: "payment",
    message: "Ahmet Yılmaz aidat ödemesi yaptı",
    time: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    icon: CreditCard,
    color: "text-success-600",
    bgColor: "bg-success-50",
  },
  {
    id: 2,
    type: "announcement",
    message: 'Yeni duyuru yayınlandı: "Asansör Bakımı"',
    time: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    icon: Megaphone,
    color: "text-primary-600",
    bgColor: "bg-primary-50",
  },
  {
    id: 3,
    type: "complaint",
    message: 'Yeni şikayet: "Gürültü Sorunu"',
    time: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    icon: MessageSquare,
    color: "text-warning-600",
    bgColor: "bg-warning-50",
  },
  {
    id: 4,
    type: "expense",
    message: 'Yeni gider eklendi: "Temizlik Malzemesi"',
    time: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    icon: Receipt,
    color: "text-danger-600",
    bgColor: "bg-danger-50",
  },
  {
    id: 5,
    type: "user",
    message: 'Yeni sakin kaydı: "Fatma Kaya"',
    time: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    icon: User,
    color: "text-secondary-600",
    bgColor: "bg-secondary-50",
  },
];

export function RecentActivities() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Son Aktiviteler</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon;

            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div
                  className={`w-10 h-10 ${activity.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}
                >
                  <Icon className={`h-5 w-5 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-secondary-900">
                    {activity.message}
                  </p>
                  <p className="text-xs text-secondary-500 mt-1">
                    {formatDateTime(activity.time)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-secondary-200">
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Tüm aktiviteleri görüntüle →
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
