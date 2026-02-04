"use client";

import {
  LayoutDashboard,
  LogOut,
  Menu,
  Tv,
  UtensilsCrossed,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type Props = {
  onSignOut: () => void;
};

const navItems = [
  {
    href: "/admin/dashboard",
    label: "대시보드",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/restaurants",
    label: "식당 관리",
    icon: UtensilsCrossed,
  },
  {
    href: "/admin/sources",
    label: "방송 관리",
    icon: Tv,
  },
];

export default function AdminSidebar({ onSignOut }: Props) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* 모바일 햄버거 버튼 */}
      <button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white shadow-md rounded-xl text-gray-700"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* 오버레이 */}
      {isMobileOpen && (
        <button
          type="button"
          className="lg:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() => setIsMobileOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setIsMobileOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* 사이드바 */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* 헤더 */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          <Link
            href="/admin/dashboard"
            className="text-xl font-bold text-gray-900"
          >
            From Screen
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* 로그아웃 버튼 */}
        <div className="p-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">로그아웃</span>
          </button>
        </div>
      </aside>
    </>
  );
}
