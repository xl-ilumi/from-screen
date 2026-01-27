// src/components/PlaceListModal.tsx

import { Check, ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import type { Place } from "@/lib/api";
import { formatDistance } from "@/lib/utils/distance";

type Props = {
  isOpen: boolean;
  places: Place[];
  onPlaceClick: (place: Place) => void;
  hasActiveFilter?: boolean;
  availableFilters: {
    sources: string[];
    categories: string[];
  };
  selectedFilters: {
    sources: string[];
    categories: string[];
  };
  onFilterChange: (type: "sources" | "categories", value: string) => void;
  onOpenFilterModal: () => void;
  onResetFilters: () => void;
  isSearching: boolean;
};

export default function PlaceListModal({
  isOpen,
  places,
  onPlaceClick,
  hasActiveFilter = false,
  availableFilters,
  selectedFilters,
  onFilterChange,
  onOpenFilterModal,
  onResetFilters,
  isSearching,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 검색 중일 때는 자동으로 바텀 시트 확장
  useEffect(() => {
    if (isSearching) {
      setIsExpanded(true);
    }
  }, [isSearching]);

  // 검색 결과가 있으면 자동으로 애니메이션 등을 고려할 수 있으나 우선 상태 유지
  useEffect(() => {
    if (places.length > 0) {
      // Logic for auto-expanding could go here if needed
    }
  }, [places]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 flex justify-center transition-all duration-300 ease-in-out ${
        isExpanded ? "h-[85vh]" : "h-[100px]"
      } pointer-events-none`}
    >
      {/* 모달 본문 (BottomSheet 스타일) */}
      <div className="relative bg-white w-full max-w-md rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden pointer-events-auto border-t border-gray-100">
        {/* 드래그 및 높이 조절 핸들 영역 (버튼으로 접근성 강화) */}
        <button
          type="button"
          className="w-full pt-3 pb-2 cursor-pointer touch-none hover:bg-gray-50 transition-colors shrink-0 flex flex-col items-center"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="w-12 h-1 bg-gray-200 rounded-full mb-2" />
          <div className="text-gray-400">
            {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </div>
        </button>

        {/* 바텀시트 헤더: 검색 상태에 따른 유동적 제목 */}
        <div className="px-6 pb-2 flex items-center shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-gray-900">
              {hasActiveFilter ? "검색 결과" : "내 주변 장소"}
            </h2>
            <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {places.length}
            </span>
          </div>
        </div>

        {/* 👇 통합 필터 칩 영역 (확장 상태에서만 노출) */}
        {isExpanded && (
          <div className="px-5 pb-3 shrink-0 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide items-center">
              {/* 상세 필터 버튼 */}
              <button
                type="button"
                onClick={onOpenFilterModal}
                className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm active:scale-90 transition-all text-gray-700 hover:bg-gray-50"
                title="상세 필터"
              >
                <SlidersHorizontal size={16} />
              </button>

              {/* 초기화 버튼 (필터가 하나라도 있을 때) */}
              {hasActiveFilter && (
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-full text-[11px] font-bold bg-red-50 text-red-600 border border-red-100 shadow-sm active:scale-95"
                >
                  초기화
                </button>
              )}

              {/* 1. 선택된 방송(Sources) 칩들 */}
              {selectedFilters.sources.map((source) => (
                <button
                  key={source}
                  type="button"
                  onClick={() => onFilterChange("sources", source)}
                  className="shrink-0 flex items-center gap-1 px-3.5 py-2 rounded-full text-xs font-bold bg-gray-900 text-white border border-gray-900 shadow-md active:scale-95 transition-all"
                >
                  <Check size={12} />
                  {source}
                </button>
              ))}

              {/* 2. 선택된 카테고리(Categories) 칩들 */}
              {selectedFilters.categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onFilterChange("categories", cat)}
                  className="shrink-0 flex items-center gap-1 px-3.5 py-2 rounded-full text-xs font-bold bg-blue-600 text-white border border-blue-600 shadow-md active:scale-95 transition-all"
                >
                  <Check size={12} />
                  {cat}
                </button>
              ))}

              {/* 3. 선택되지 않은 주요 카테고리 칩들 (제안용) */}
              {availableFilters.categories
                .filter((cat) => !selectedFilters.categories.includes(cat))
                .slice(0, 5)
                .map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => onFilterChange("categories", cat)}
                    className="shrink-0 flex items-center gap-1 px-3.5 py-2 rounded-full text-xs font-bold bg-white text-gray-700 border border-gray-200 shadow-sm hover:border-gray-300 active:scale-95 transition-all"
                  >
                    {cat}
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* 목록 영역 */}
        <div
          className={`overflow-y-auto flex-1 px-4 pb-6 scrollbar-hide space-y-3 ${!isExpanded ? "hidden" : "block"}`}
        >
          {places.length === 0 ? (
            <div className="text-center py-20 text-gray-500 text-sm">
              해당하는 장소가 없습니다.
            </div>
          ) : (
            places.map((place) => (
              <button
                key={place.id}
                type="button"
                onClick={() => {
                  onPlaceClick(place);
                  setIsExpanded(false);
                }}
                className="w-full bg-gray-50 p-4 rounded-2xl flex flex-col gap-1 text-left active:scale-[0.98] transition-all hover:bg-gray-100 border border-transparent hover:border-gray-200"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-gray-100 text-gray-500">
                    {place.category}
                  </span>
                  {place.distance !== undefined && (
                    <span className="text-[12px] font-semibold text-blue-600">
                      {formatDistance(place.distance)}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 text-base">
                  {place.restaurant_name}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      place.source_type === "TV"
                        ? "bg-red-50 text-red-600"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {place.source_name}
                  </span>
                  <span className="text-xs text-gray-500 truncate">
                    {place.title}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* 닫혔을 때 살짝 보이는 내용 (Peeking 용) */}
        {!isExpanded && places.length > 0 && (
          <div className="px-6 pb-4">
            <div className="text-[13px] text-gray-500 truncate bg-gray-50/50 p-2.5 rounded-xl border border-gray-100/50">
              {hasActiveFilter ? (
                <>
                  <span className="font-bold text-gray-900">
                    {places[0].restaurant_name}
                  </span>{" "}
                  외 {places.length - 1}곳의 검색 결과
                </>
              ) : (
                <>
                  가까운{" "}
                  <span className="font-bold text-gray-900">
                    {places[0].restaurant_name}
                  </span>{" "}
                  포함 주변 {places.length}곳
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
