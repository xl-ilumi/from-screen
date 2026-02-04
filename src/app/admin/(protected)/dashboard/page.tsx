"use client";

import {
  ArrowRight,
  Film,
  Plus,
  TrendingUp,
  Tv,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  type DashboardStats,
  getDashboardStats,
  type Restaurant,
} from "@/lib/admin-api";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("통계 조회 실패:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      label: "등록된 식당",
      value: stats?.totalRestaurants || 0,
      icon: UtensilsCrossed,
      bgColor: "bg-rose-50",
      iconColor: "text-rose-500",
      href: "/admin/restaurants",
    },
    {
      label: "방송 프로그램",
      value: stats?.totalSources || 0,
      icon: Tv,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-500",
      href: "/admin/sources",
    },
    {
      label: "출연 정보",
      value: stats?.totalAppearances || 0,
      icon: Film,
      bgColor: "bg-amber-50",
      iconColor: "text-amber-500",
      href: "/admin/restaurants",
    },
  ];

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
          <p className="text-gray-500 mt-1">맛집 정보를 한눈에 확인하세요</p>
        </div>
        <Link
          href="/admin/restaurants/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white font-medium rounded-xl hover:bg-indigo-600 transition-all"
        >
          <Plus className="w-5 h-5" />
          식당 등록
        </Link>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group relative overflow-hidden bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  {card.label}
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {card.value.toLocaleString()}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${card.bgColor}`}>
                <card.icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4 text-gray-400 group-hover:text-indigo-500 transition-colors">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">상세 보기</span>
            </div>
          </Link>
        ))}
      </div>

      {/* 최근 등록된 식당 */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            최근 등록된 식당
          </h2>
          <Link
            href="/admin/restaurants"
            className="flex items-center gap-1 text-indigo-500 hover:text-indigo-600 text-sm font-medium transition-colors"
          >
            전체 보기
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {stats?.recentRestaurants && stats.recentRestaurants.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {stats.recentRestaurants.map((restaurant: Restaurant) => (
              <Link
                key={restaurant.id}
                href={`/admin/restaurants/${restaurant.id}/edit`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <UtensilsCrossed className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {restaurant.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {restaurant.category || "카테고리 없음"} •{" "}
                      {restaurant.address || "주소 없음"}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">등록된 식당이 없습니다</p>
            <Link
              href="/admin/restaurants/new"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
            >
              <Plus className="w-4 h-4" />첫 번째 식당 등록하기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
