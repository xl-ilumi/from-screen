"use client";

import { SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import FilterModal from "@/components/FilterModal";
import NaverMap from "@/components/NaverMap";
import PlaceDetail from "@/components/PlaceDetail";
import { getPlaces, type Place } from "@/lib/api";

export default function Home() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // 모달 열림 상태 & 선택된 필터들
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<{
    sources: string[];
    categories: string[];
  }>({ sources: [], categories: [] });

  useEffect(() => {
    async function fetchData() {
      const data = await getPlaces();
      setPlaces(data);
    }
    fetchData();
  }, []);

  // DB 데이터에서 필터 옵션 자동 추출 (중복 제거)
  const availableFilters = useMemo(() => {
    return {
      sources: Array.from(new Set(places.map((p) => p.source_name))).filter(
        Boolean,
      ),
      categories: Array.from(new Set(places.map((p) => p.category))).filter(
        Boolean,
      ),
    };
  }, [places]);

  // 복합 필터링 로직
  const processedPlaces = useMemo(() => {
    let result = places;

    // 1. 방송 필터 적용
    if (selectedFilters.sources.length > 0) {
      result = result.filter((p) =>
        selectedFilters.sources.includes(p.source_name),
      );
    }
    // 2. 카테고리 필터 적용
    if (selectedFilters.categories.length > 0) {
      result = result.filter((p) =>
        selectedFilters.categories.includes(p.category),
      );
    }

    return result;
  }, [places, selectedFilters]);

  // 필터 변경 핸들러
  const handleFilterChange = (
    type: "sources" | "categories",
    value: string,
  ) => {
    setSelectedFilters((prev) => {
      const list = prev[type];
      // 이미 있으면 빼고, 없으면 넣기 (토글)
      const newList = list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value];
      return { ...prev, [type]: newList };
    });
  };

  // 활성화된 필터 개수 계산 (뱃지용)
  const activeFilterCount =
    selectedFilters.sources.length + selectedFilters.categories.length;

  return (
    <main className="relative w-full h-screen overflow-hidden bg-gray-100">
      {/* 상단바 */}
      <div className="absolute top-0 left-0 w-full z-50 flex flex-col gap-2 pt-4 pointer-events-none">
        {!selectedPlace && (
          <div className="px-4 flex justify-between items-start pointer-events-auto">
            <div className="bg-white/90 px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm border border-gray-200">
              <h1 className="text-lg font-bold">
                <span className="text-red-600">From</span>Screen
              </h1>
            </div>

            {/* 👇 필터 버튼 (모달 열기) */}
            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              className={`
                flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm border transition-colors
                ${activeFilterCount > 0 ? "bg-gray-900 text-white border-gray-900" : "bg-white/90 text-gray-700 border-gray-200"}
              `}
            >
              <SlidersHorizontal size={18} />
              <span className="font-bold text-sm">필터</span>
              {activeFilterCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* 메인 컨텐츠 */}
      <NaverMap
        places={processedPlaces}
        onPlaceClick={(place) => setSelectedPlace(place)}
        // onLocationFound={(lat, lng) => setMyLocation({ lat, lng })}
      />

      {/* 상세 정보창 */}
      {selectedPlace && (
        <PlaceDetail
          place={selectedPlace}
          onClose={() => setSelectedPlace(null)}
        />
      )}

      {/* 👇 필터 모달 컴포넌트 연결 */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        availableFilters={availableFilters}
        selectedFilters={selectedFilters}
        onFilterChange={handleFilterChange}
        onReset={() => setSelectedFilters({ sources: [], categories: [] })}
      />
    </main>
  );
}
