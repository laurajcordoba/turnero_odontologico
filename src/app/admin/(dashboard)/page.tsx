import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, CheckCircle, XCircle } from "lucide-react";

async function getStats() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [todayCount, weekCount, monthCount, cancelledCount] = await Promise.all([
    prisma.appointment.count({
      where: {
        startTime: { gte: startOfDay, lt: endOfDay },
        status: "CONFIRMED",
      },
    }),
    prisma.appointment.count({
      where: {
        startTime: { gte: startOfWeek },
        status: "CONFIRMED",
      },
    }),
    prisma.appointment.count({
      where: {
        startTime: { gte: startOfMonth },
        status: { not: "CANCELLED" },
      },
    }),
    prisma.appointment.count({
      where: {
        startTime: { gte: startOfMonth },
        status: "CANCELLED",
      },
    }),
  ]);

  return { todayCount, weekCount, monthCount, cancelledCount };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    {
      label: "Turnos hoy",
      value: stats.todayCount,
      icon: Calendar,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Esta semana",
      value: stats.weekCount,
      icon: Clock,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Este mes",
      value: stats.monthCount,
      icon: CheckCircle,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Cancelados (mes)",
      value: stats.cancelledCount,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardContent className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${card.bg}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
