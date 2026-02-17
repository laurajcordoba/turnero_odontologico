"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Settings,
  LogOut,
  Heart,
  MessageCircle,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/turnos", label: "Turnos", icon: Calendar },
  { href: "/admin/implantes", label: "Solicitudes Implantes", icon: MessageCircle },
  { href: "/admin/horarios", label: "Horarios", icon: Clock },
  { href: "/admin/tipos-turno", label: "Tipos de turno", icon: Settings },
  { href: "/admin/obras-sociales", label: "Obras sociales", icon: Heart },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Turnero</h2>
        <p className="text-xs text-gray-500">Panel de administracion</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 w-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Cerrar sesion
        </button>
      </div>
    </aside>
  );
}
