import { Tv, X, Youtube } from "lucide-react";
import type { Place } from "@/lib/api";

type Props = {
  place: Place;
  onClose: () => void;
};

export default function PlaceDetail({ place, onClose }: Props) {
  return (
    <div className="absolute bottom-0 left-0 w-full z-50 p-4 animate-slide-up">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        {/* 상단: 방송 정보 배지 */}
        <div className="bg-gray-50 px-5 py-3 flex justify-between items-center border-b border-gray-100">
          <div className="flex items-center gap-2">
            {place.source_type === "TV" ? (
              <span className="bg-red-100 text-red-600 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                <Tv size={12} /> 흑백요리사
              </span>
            ) : (
              <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                <Youtube size={12} /> 쯔양
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* 메인: 식당 정보 */}
        <div className="p-5">
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {place.restaurant_name}
          </h2>
          <p className="text-sm text-gray-600 mb-4 line-clamp-1">
            {place.title}
          </p>

          <div className="flex gap-2 mt-4">
            <button
              type="button"
              className="flex-1 bg-black text-white py-3 rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors"
            >
              방송 보기
            </button>
            <button
              type="button"
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors"
            >
              길찾기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
