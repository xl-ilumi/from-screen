"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import RestaurantForm from "@/components/admin/RestaurantForm";
import {
  getRestaurantById,
  type RestaurantWithAppearances,
} from "@/lib/admin-api";

export default function EditRestaurantPage() {
  const params = useParams();
  const id = params.id as string;
  const [restaurant, setRestaurant] =
    useState<RestaurantWithAppearances | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRestaurant() {
      const data = await getRestaurantById(id);
      setRestaurant(data);
      setIsLoading(false);
    }
    fetchRestaurant();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">식당을 찾을 수 없습니다</p>
        <Link
          href="/admin/restaurants"
          className="inline-block mt-4 text-indigo-500 hover:text-indigo-600"
        >
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-gray-900">식당 수정</h1>
          <p className="text-gray-500 mt-1">{restaurant.name}</p>
        </div>
      </div>

      {/* 폼 */}
      <RestaurantForm restaurant={restaurant} isEdit />
    </div>
  );
}
