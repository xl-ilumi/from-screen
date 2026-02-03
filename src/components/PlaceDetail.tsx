import {
  Check as CheckIcon,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  ExternalLink,
  Info,
  Play,
  Tv,
  Utensils,
  X,
  Youtube,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { MenuItem, OpeningHours, Place } from "@/lib/api";
import { openMapApp } from "@/lib/utils/map-links";

type Props = {
  place: Place;
  onClose: () => void;
  userLocation: { lat: number; lng: number } | null;
};

export default function PlaceDetail({ place, onClose, userLocation }: Props) {
  const [activeTab, setActiveTab] = useState<"info" | "video">("info");
  const [showMapMenu, setShowMapMenu] = useState(false);
  const [showAllHours, setShowAllHours] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    if (!place.address) return;
    navigator.clipboard.writeText(place.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRoute = (app: "naver" | "kakao" | "google" | "tmap") => {
    openMapApp(app, {
      lat: place.lat,
      lng: place.lng,
      name: place.restaurant_name,
      address: place.address,
      startLat: userLocation?.lat,
      startLng: userLocation?.lng,
    });
    setShowMapMenu(false);
  };

  // 유튜브 ID 추출
  const youtubeId = useMemo(() => {
    if (!place.video_url) return null;
    const match = place.video_url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:.*v\/|.*u\/\w\/|embed\/|watch\?.*v=))([^"&?/\s]{11})/,
    );
    return match ? match[1] : null;
  }, [place.video_url]);

  return (
    <div className="absolute bottom-[100px] left-0 w-full z-50 p-4 animate-in slide-in-from-bottom duration-300 pointer-events-none">
      <div className="bg-white rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] border border-gray-100 max-w-lg mx-auto relative pointer-events-auto overflow-hidden flex flex-col max-h-[70vh]">
        {/* 상단: 헤더 및 배지 */}
        <div className="bg-white px-6 pt-6 pb-4 flex justify-between items-start shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {place.broadcasts.map((broadcast, idx) => (
                <span
                  key={`${broadcast.source_name}-${idx}`}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border ${
                    broadcast.source_type === "TV"
                      ? "bg-blue-50 text-blue-600 border-blue-100"
                      : "bg-red-50 text-red-600 border-red-100"
                  }`}
                >
                  {broadcast.source_type === "TV" ? (
                    <Tv size={12} />
                  ) : (
                    <Youtube size={12} />
                  )}
                  {broadcast.source_name}
                </span>
              ))}
              <span className="bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full text-[10px] font-bold">
                {place.category}
              </span>
            </div>
            <h2 className="text-2xl font-black text-gray-900 leading-tight">
              {place.restaurant_name}
            </h2>
            <p className="text-sm text-gray-500 font-medium mt-1 line-clamp-1">
              {place.broadcasts[0]?.title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* 탭 메뉴 */}
        <div className="flex px-6 border-b border-gray-100 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("info")}
            className={`flex-1 py-3 text-sm font-bold transition-all relative ${
              activeTab === "info" ? "text-blue-600" : "text-gray-400"
            }`}
          >
            장소 정보
            {activeTab === "info" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-full" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("video")}
            className={`flex-1 py-3 text-sm font-bold transition-all relative ${
              activeTab === "video" ? "text-blue-600" : "text-gray-400"
            }`}
          >
            방송/영상
            {activeTab === "video" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-full" />
            )}
          </button>
        </div>

        {/* 컨텐츠 영역 (스크롤 가능) */}
        <div className="overflow-y-auto custom-scrollbar flex-1 bg-white">
          {activeTab === "info" ? (
            <div className="p-6 space-y-6">
              {/* 주소 섹션 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                  <Info size={16} className="text-blue-500" /> 기본 정보
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-[13px] text-gray-600 leading-relaxed font-medium">
                      {place.address}
                    </p>
                    <button
                      type="button"
                      onClick={handleCopyAddress}
                      className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold transition-all ${
                        copied
                          ? "bg-green-500 text-white"
                          : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {copied ? <CheckIcon size={12} /> : <Copy size={12} />}
                      {copied ? "복사됨" : "복사"}
                    </button>
                  </div>
                </div>
                {/* 영업 시간 섹션 (아코디언 형태) */}
                {place.opening_hours && (
                  <div className="bg-blue-50/30 rounded-2xl border border-blue-100/50 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setShowAllHours(!showAllHours)}
                      className="w-full flex items-start gap-3 px-4 py-4 hover:bg-blue-50/50 transition-colors text-left"
                    >
                      <Clock
                        size={16}
                        className="text-blue-500 mt-1 shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-tight">
                            영업 시간
                          </span>
                          {showAllHours ? (
                            <ChevronUp size={16} className="text-blue-400" />
                          ) : (
                            <ChevronDown size={16} className="text-blue-400" />
                          )}
                        </div>
                        <p className="text-[13px] text-blue-900 font-bold">
                          {typeof place.opening_hours === "string"
                            ? place.opening_hours
                            : place.opening_hours[
                                new Intl.DateTimeFormat("ko-KR", {
                                  weekday: "short",
                                }).format(new Date())
                              ] || "정보 확인 필요"}
                        </p>
                        {!showAllHours && (
                          <span className="text-[10px] text-blue-400 font-medium mt-1 inline-block">
                            전체 요일 보기
                          </span>
                        )}
                      </div>
                    </button>

                    {showAllHours &&
                      typeof place.opening_hours === "object" && (
                        <div className="px-4 pb-4 space-y-2 border-t border-blue-100/30 pt-3 animate-in fade-in slide-in-from-top-1 duration-200">
                          {["월", "화", "수", "목", "금", "토", "일"].map(
                            (day) => (
                              <div
                                key={day}
                                className="flex justify-between items-center text-xs"
                              >
                                <span
                                  className={`font-bold ${new Intl.DateTimeFormat("ko-KR", { weekday: "short" }).format(new Date()) === day ? "text-blue-600" : "text-gray-500"}`}
                                >
                                  {day}요일
                                </span>
                                <span
                                  className={`font-medium ${new Intl.DateTimeFormat("ko-KR", { weekday: "short" }).format(new Date()) === day ? "text-blue-700 font-bold" : "text-gray-600"}`}
                                >
                                  {(place.opening_hours as OpeningHours)[day] ||
                                    "정보 없음"}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      )}
                  </div>
                )}
              </section>

              {/* 메뉴 섹션 (사진 포함 가로 리스트 또는 세로 리스트) */}
              {place.menu_info && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                    <Utensils size={16} className="text-orange-500" /> 대표 메뉴
                  </div>
                  <div className="space-y-3">
                    {Array.isArray(place.menu_info)
                      ? place.menu_info.map((menu: MenuItem, idx: number) => (
                          <div
                            key={`${menu.name}-${idx}`}
                            className="flex items-center gap-4 p-3 bg-white rounded-2xl border border-gray-100 hover:border-blue-100 transition-all hover:bg-blue-50/10 group"
                          >
                            {menu.image_url && (
                              <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-50 shadow-sm">
                                <Image
                                  src={menu.image_url}
                                  alt={menu.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  fill
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-[14px] font-bold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                                {menu.name}
                              </h4>
                              {menu.description && (
                                <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                                  {menu.description}
                                </p>
                              )}
                              <p className="text-[14px] font-black text-gray-900 mt-1">
                                {menu.price}
                              </p>
                            </div>
                          </div>
                        ))
                      : // 레거시 텍스트 대응
                        place.menu_info
                          .toString()
                          .split("\n")
                          .map((menu: string) => {
                            const [name, price] = menu.split(":");
                            return (
                              <div
                                key={`legacy-${name?.trim()}-${price?.trim()}`}
                                className="flex justify-between items-center p-4 bg-white rounded-2xl border border-gray-100"
                              >
                                <span className="text-sm font-bold text-gray-800">
                                  {name}
                                </span>
                                <span className="text-sm font-black text-gray-900">
                                  {price?.trim()}
                                </span>
                              </div>
                            );
                          })}
                  </div>
                </section>
              )}
            </div>
          ) : (
            <div className="p-6">
              {youtubeId ? (
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-3xl overflow-hidden bg-gray-900 shadow-xl border border-gray-100">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white shrink-0">
                      <Play size={18} fill="white" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-red-900 mb-0.5">
                        방송 하이라이트
                      </h4>
                      <p className="text-[11px] text-red-600 font-medium font-inter">
                        YouTube에서 해당 영상을 시청할 수 있습니다.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* 방송 프로그램 정보 카드 - 모든 방송 표시 */}
                  {place.broadcasts.map((broadcast, idx) => (
                    <div
                      key={`${broadcast.source_name}-${idx}`}
                      className="relative rounded-3xl overflow-hidden bg-gray-900 aspect-16/10 shadow-xl group"
                    >
                      {broadcast.icon_url ? (
                        <Image
                          src={broadcast.icon_url}
                          alt={broadcast.source_name}
                          className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                          fill
                        />
                      ) : (
                        <div className="w-full h-full bg-linear-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                          <Tv size={48} className="text-gray-700" />
                        </div>
                      )}
                      <div className="absolute inset-0 p-6 flex flex-col justify-end bg-linear-to-t from-black/90 via-black/40 to-transparent">
                        <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-2">
                          {broadcast.source_type === "TV"
                            ? "Television Show"
                            : "YouTube"}
                        </span>
                        <h3 className="text-white text-xl font-black leading-tight">
                          {broadcast.source_name}
                        </h3>
                        <p className="text-white/70 text-sm font-bold mt-1">
                          {broadcast.title}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* 관련 링크 버튼들 */}
                  <div className="space-y-3">
                    <a
                      href={`https://search.naver.com/search.naver?query=${encodeURIComponent(`${place.broadcasts[0]?.source_name} ${place.broadcasts[0]?.title} ${place.restaurant_name}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-white text-gray-700 rounded-2xl font-bold text-sm border border-gray-200 transition-all hover:bg-gray-50 active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-black text-xs">
                          N
                        </div>
                        <span>네이버에서 방송 정보 찾기</span>
                      </div>
                      <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 하단: 길찾기 버튼 (플로팅) */}
        <div className="p-6 bg-white border-t border-gray-100 shrink-0">
          <div className="flex gap-3 relative">
            <button
              type="button"
              className="flex-2 bg-gray-900 text-white py-4 rounded-2xl font-bold text-sm hover:bg-black transition-all active:scale-[0.98] shadow-lg shadow-gray-200"
            >
              예약하러 가기
            </button>
            <button
              type="button"
              onClick={() => setShowMapMenu(!showMapMenu)}
              className={`flex-1 py-4 rounded-2xl font-bold text-sm border transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                showMapMenu
                  ? "bg-blue-600 text-white border-blue-600 shadow-md"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {showMapMenu ? "닫기" : "길찾기"}
              <ExternalLink size={16} />
            </button>

            {/* 지도 앱 선택 메뉴 (위로 팝업) */}
            {showMapMenu && (
              <div className="absolute bottom-full right-0 mb-4 w-48 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden animate-in fade-in zoom-in slide-in-from-bottom-2 duration-200 z-60">
                <div className="p-2 flex flex-col gap-1">
                  <p className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    지도 앱 선택
                  </p>
                  <button
                    type="button"
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
                    type="button"
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
                    type="button"
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
                  <button
                    type="button"
                    onClick={() => handleRoute("tmap")}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-orange-50 transition-colors text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-black text-xs">
                      T
                    </div>
                    <span className="text-sm font-bold text-gray-700 group-hover:text-orange-700">
                      티맵 (T-map)
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
