// src/components/PlaceListModal.tsx

import { X } from "lucide-react";
import { useEffect } from "react";
import type { Place } from "@/lib/api";
import { formatDistance } from "@/lib/utils/distance";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  places: Place[];
  onPlaceClick: (place: Place) => void;
};

export default function PlaceListModal({
  isOpen,
  onClose,
  places,
  onPlaceClick,
}: Props) {
  // ESC 키를 누르면 모달이 닫히도록 함
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-end justify-center">
      {/* 검은 배경 (클릭 시 닫힘) */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: ESC 키 지원으로 접근성 대체 */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: ESC 키 지원으로 대체 */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        style={{ cursor: "pointer" }}
      />

      {/* 모달 본문 (위로 올라오는 애니메이션) */}
      <div className="relative bg-white w-full max-w-md rounded-t-3xl p-6 shadow-2xl transition-transform animate-slide-up flex flex-col max-h-[85vh]">
        {/* 드래그 핸들 모양의 바 */}
        <div className="mx-auto w-12 h-1.5 bg-gray-200 rounded-full mb-6 shrink-0" />

        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h2 className="text-xl font-bold text-gray-900">장소 목록</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* 목록 영역 */}
        <div className="overflow-y-auto flex-1 space-y-3 pb-6 scrollbar-hide">
          {places.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              해당하는 장소가 없습니다.
            </div>
          ) : (
            places.map((place) => (
              <button
                key={place.id}
                type="button"
                onClick={() => {
                  onPlaceClick(place);
                  onClose();
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
      </div>
    </div>
  );
}
