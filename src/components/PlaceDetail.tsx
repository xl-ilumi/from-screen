import { ExternalLink, Tv, X, Youtube } from "lucide-react";
import { useState } from "react";
import type { Place } from "@/lib/api";
import { openMapApp } from "@/lib/utils/map-links";

type Props = {
  place: Place;
  onClose: () => void;
};

export default function PlaceDetail({ place, onClose }: Props) {
  const [showMapMenu, setShowMapMenu] = useState(false);

  const handleRoute = (app: "naver" | "kakao" | "google") => {
    openMapApp(app, {
      lat: place.lat,
      lng: place.lng,
      name: place.restaurant_name,
    });
    setShowMapMenu(false);
  };

  return (
    <div className="absolute bottom-[100px] left-0 w-full z-50 p-4 animate-in slide-in-from-bottom duration-300">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 max-w-lg mx-auto relative">
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

          <div className="flex gap-3 relative">
            <button
              type="button"
              className="flex-2 bg-gray-900 text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-black transition-all active:scale-[0.98] shadow-lg shadow-gray-200"
            >
              방송 다시보기
            </button>
            <button
              type="button"
              onClick={() => setShowMapMenu(!showMapMenu)}
              className={`flex-1 py-3.5 rounded-2xl font-bold text-sm border transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                showMapMenu
                  ? "bg-blue-600 text-white border-blue-600 shadow-md"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {showMapMenu ? "닫기" : "길찾기"}
              <ExternalLink size={16} />
            </button>

            {/* 👇 지도 앱 선택 팝업 메뉴 */}
            {showMapMenu && (
              <div className="absolute bottom-full right-0 mb-3 w-48 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden animate-in fade-in zoom-in slide-in-from-bottom-2 duration-200 z-[60]">
                <div className="p-2 flex flex-col gap-1">
                  <p className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    지도 앱 선택
                  </p>
                  <button
                    onClick={() => handleRoute("naver")}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-green-50 transition-colors text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center text-white font-black text-xs">
                      N
                    </div>
                    <span className="text-sm font-bold text-gray-700 group-hover:text-green-700">
                      네이버 지도
                    </span>
                  </button>
                  <button
                    onClick={() => handleRoute("kakao")}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-yellow-50 transition-colors text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center text-gray-900 font-black text-xs">
                      K
                    </div>
                    <span className="text-sm font-bold text-gray-700 group-hover:text-yellow-700">
                      카카오 맵
                    </span>
                  </button>
                  <button
                    onClick={() => handleRoute("google")}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 transition-colors text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-black text-xs">
                      G
                    </div>
                    <span className="text-sm font-bold text-gray-700 group-hover:text-blue-700">
                      Google 지도
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
