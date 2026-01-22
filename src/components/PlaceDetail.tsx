import { Tv, X, Youtube } from "lucide-react";
import type { Place } from "@/lib/api";

type Props = {
  place: Place;
  onClose: () => void;
};

export default function PlaceDetail({ place, onClose }: Props) {
  return (
    <div className="absolute bottom-0 left-0 w-full z-50 p-4 animate-in slide-in-from-bottom duration-300">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 max-w-lg mx-auto">
        {/* 상단: 방송 정보 배지 */}
        <div className="bg-gray-50/50 px-6 py-4 flex justify-between items-center border-b border-gray-100/50">
          <div className="flex items-center gap-2">
            {place.source_type === "TV" ? (
              <span className="bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-red-100">
                <Tv size={14} /> {place.source_name || "TV 출연"}
              </span>
            ) : (
              <span className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-blue-100">
                <Youtube size={14} /> {place.channel_name || "유튜브 맛집"}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 메인: 식당 정보 */}
        <div className="p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {place.restaurant_name}
            </h2>
            <p className="text-sm text-gray-500 font-medium">{place.title}</p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              className="flex-2 bg-gray-900 text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-black transition-all active:scale-[0.98] shadow-lg shadow-gray-200"
            >
              방송 다시보기
            </button>
            <button
              type="button"
              className="flex-1 bg-white text-gray-700 py-3.5 rounded-2xl font-bold text-sm border border-gray-200 hover:bg-gray-50 transition-all active:scale-[0.98]"
            >
              길찾기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
