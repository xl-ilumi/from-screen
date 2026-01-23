// src/components/FilterModal.tsx

import { Check, X } from "lucide-react";
import { useEffect } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  // DB에서 가져온 전체 옵션들
  availableFilters: {
    sources: string[]; // 예: ['흑백요리사', '쯔양']
    categories: string[]; // 예: ['이탈리안', '분식', '한식']
  };
  // 사용자가 선택한 필터들
  selectedFilters: {
    sources: string[];
    categories: string[];
  };
  // 선택 변경 시 실행될 함수
  onFilterChange: (type: "sources" | "categories", value: string) => void;
  onReset: () => void;
};

export default function FilterModal({
  isOpen,
  onClose,
  availableFilters,
  selectedFilters,
  onFilterChange,
  onReset,
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
      {/* biome-ignore lint/a11y/noStaticElementInteractions: 배경 클릭은 편의 기능이며, ESC 키 지원으로 접근성 대체 */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: ESC 키 지원으로 대체 */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* 모달 본문 (위로 올라오는 애니메이션) */}
      <div className="relative bg-white w-full max-w-md rounded-t-3xl p-6 shadow-2xl animate-slide-up flex flex-col max-h-[85vh]">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">필터</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* 스크롤 가능한 컨텐츠 영역 */}
        <div className="overflow-y-auto flex-1 space-y-8 pb-20 scrollbar-hide">
          {/* 섹션 1: 방송 프로그램 */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 mb-3">
              방송 프로그램
            </h3>
            <div className="flex flex-wrap gap-2">
              {availableFilters.sources.map((source) => {
                const isSelected = selectedFilters.sources.includes(source);
                return (
                  <button
                    key={source}
                    type="button"
                    onClick={() => onFilterChange("sources", source)}
                    className={`
                      px-4 py-2 rounded-full text-sm font-medium border transition-all
                      ${
                        isSelected
                          ? "bg-gray-900 text-white border-gray-900 shadow-md"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      }
                    `}
                  >
                    {isSelected && <Check size={14} className="inline mr-1" />}
                    {source}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 섹션 2: 음식 종류 */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 mb-3">
              음식 카테고리
            </h3>
            <div className="flex flex-wrap gap-2">
              {availableFilters.categories.map((cat) => {
                const isSelected = selectedFilters.categories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => onFilterChange("categories", cat)}
                    className={`
                      px-4 py-2 rounded-full text-sm font-medium border transition-all
                      ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600 shadow-md"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      }
                    `}
                  >
                    {isSelected && <Check size={14} className="inline mr-1" />}
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 하단 고정 버튼 (초기화 & 적용) */}
        <div className="absolute bottom-0 left-0 w-full p-4 bg-white border-t border-gray-100 flex gap-3">
          <button
            type="button"
            onClick={onReset}
            className="flex-1 py-3.5 rounded-xl text-gray-600 font-medium hover:bg-gray-100 transition-colors"
          >
            초기화
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-2 py-3.5 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 shadow-lg transition-transform active:scale-[0.98]"
          >
            필터 적용하기
          </button>
        </div>
      </div>
    </div>
  );
}
