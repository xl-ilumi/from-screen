"use client";

import {
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  deleteRestaurant,
  getRestaurants,
  type Restaurant,
} from "@/lib/admin-api";

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchRestaurants = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getRestaurants();
      setRestaurants(data);
    } catch (error) {
      console.error("식당 목록 조회 실패:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  async function handleDelete(id: string) {
    try {
      await deleteRestaurant(id);
      setRestaurants((prev) => prev.filter((r) => r.id !== id));
      setDeleteId(null);
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제에 실패했습니다.");
    }
  }

  const filteredRestaurants = restaurants.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.address?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">식당 관리</h1>
          <p className="text-gray-500 mt-1">
            총 {restaurants.length}개의 식당이 등록되어 있습니다
          </p>
        </div>
        <Link
          href="/admin/restaurants/new"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500 text-white font-medium rounded-xl hover:bg-indigo-600 transition-all"
        >
          <Plus className="w-5 h-5" />
          식당 등록
        </Link>
      </div>

      {/* 검색 */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="식당명, 카테고리, 주소로 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
        />
      </div>

      {/* 테이블 */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {filteredRestaurants.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left text-sm font-medium text-gray-600 px-6 py-4">
                    식당명
                  </th>
                  <th className="text-left text-sm font-medium text-gray-600 px-6 py-4 hidden md:table-cell">
                    카테고리
                  </th>
                  <th className="text-left text-sm font-medium text-gray-600 px-6 py-4 hidden lg:table-cell">
                    주소
                  </th>
                  <th className="text-right text-sm font-medium text-gray-600 px-6 py-4">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRestaurants.map((restaurant) => (
                  <tr
                    key={restaurant.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                          <UtensilsCrossed className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {restaurant.name}
                          </p>
                          <p className="text-sm text-gray-500 md:hidden">
                            {restaurant.category || "-"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="px-2 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg">
                        {restaurant.category || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2 text-gray-500">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span className="text-sm truncate max-w-[200px]">
                          {restaurant.address || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/restaurants/${restaurant.id}/edit`}
                          className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteId(restaurant.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchQuery ? "검색 결과가 없습니다" : "등록된 식당이 없습니다"}
            </p>
            {!searchQuery && (
              <Link
                href="/admin/restaurants/new"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
              >
                <Plus className="w-4 h-4" />첫 번째 식당 등록하기
              </Link>
            )}
          </div>
        )}
      </div>

      {/* 삭제 확인 모달 */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              식당 삭제
            </h3>
            <p className="text-gray-600 mb-6">
              정말로 이 식당을 삭제하시겠습니까? 연결된 출연 정보도 함께
              삭제됩니다.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteId)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
