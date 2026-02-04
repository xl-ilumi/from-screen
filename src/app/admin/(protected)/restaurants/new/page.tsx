"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import RestaurantForm from "@/components/admin/RestaurantForm";

export default function NewRestaurantPage() {
  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/restaurants"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">식당 등록</h1>
          <p className="text-gray-500 mt-1">새로운 식당 정보를 등록하세요</p>
        </div>
      </div>

      {/* 폼 */}
      <RestaurantForm />
    </div>
  );
}
