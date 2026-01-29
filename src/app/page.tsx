"use client";

import { MapPin, Search, Tv, Utensils } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import FilterModal from "@/components/FilterModal";
import NaverMap from "@/components/NaverMap";
import PlaceDetail from "@/components/PlaceDetail";
import PlaceListModal from "@/components/PlaceListModal";
import { getPlaces, type Place } from "@/lib/api";
import { calculateDistance } from "@/lib/utils/distance";

export default function Home() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // 모달 열림 상태 & 선택된 필터들
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<{
    sources: string[];
    categories: string[];
  }>({ sources: [], categories: [] });
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      const data = await getPlaces();
      setPlaces(data);
    }
    fetchData();
  }, []);

  // 외부 클릭 시 검색 제안 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  // 복합 필터링 및 정렬 로직
  const processedPlaces = useMemo(() => {
    let result = [...places];

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

    // 3. 거리 계산 및 정렬
    if (userLocation) {
      result = result
        .map((p) => ({
          ...p,
          distance: calculateDistance(
            userLocation.lat,
            userLocation.lng,
            p.lat,
            p.lng,
          ),
        }))
        .sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    // 4. 검색어 필터링
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.restaurant_name.toLowerCase().includes(query) ||
          p.source_name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.title.toLowerCase().includes(query),
      );
    }

    return result;
  }, [places, selectedFilters, userLocation, searchQuery]);

  // 연관 검색어 제안 추출
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    const suggestions: {
      type: "place" | "source" | "category";
      text: string;
      subText?: string;
      data?: Place;
    }[] = [];

    // 1. 방송명 매칭 (핵심 연관성)
    const sources = Array.from(new Set(places.map((p) => p.source_name)));
    const matchedSources = sources.filter((s) =>
      s.toLowerCase().includes(query),
    );

    for (const source of matchedSources) {
      // 방송 자체 추가
      suggestions.push({
        type: "source",
        text: source,
        subText: "방송 프로그램",
      });

      // 이 방송에 출연한 식당들도 최대 3개까지 제안에 포함
      const relatedPlaces = places
        .filter((p) => p.source_name === source)
        .slice(0, 3);
      for (const p of relatedPlaces) {
        suggestions.push({
          type: "place",
          text: p.restaurant_name,
          subText: `${source} 출연`,
          data: p,
        });
      }
    }

    // 2. 식당명 직접 매칭 (방송명 연관 검색에서 이미 추가된 것은 제외)
    const addedPlaceIds = new Set(
      suggestions.filter((s) => s.type === "place").map((s) => s.data?.id),
    );

    const directMatchedPlaces = places
      .filter(
        (p) =>
          p.restaurant_name.toLowerCase().includes(query) &&
          !addedPlaceIds.has(p.id),
      )
      .slice(0, 5);

    for (const p of directMatchedPlaces) {
      suggestions.push({
        type: "place",
        text: p.restaurant_name,
        subText: p.category,
        data: p,
      });
    }

    // 3. 카테고리 매칭
    const categories = Array.from(new Set(places.map((p) => p.category)));
    const matchedCategories = categories
      .filter(
        (c) =>
          c.toLowerCase().includes(query) &&
          !suggestions.some((s) => s.type === "category" && s.text === c),
      )
      .slice(0, 2);

    for (const c of matchedCategories) {
      suggestions.push({ type: "category", text: c, subText: "음식 카테고리" });
    }

    return suggestions.slice(0, 8); // 최대 8개까지만 노출
  }, [places, searchQuery]);

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

  // 활성화된 필터 개수 계산 (뱃지용) - 통합 UI에서는 사용 안 함

  // 검색어 입력 시 필터 자동 해제 로직
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setSelectedFilters({ sources: [], categories: [] });
    }
  }, [searchQuery]);

  return (
    <main className="relative h-screen mx-auto overflow-hidden bg-gray-100">
      {/* 상단바 */}
      <header className="absolute top-0 left-0 w-full z-50 pt-4 pointer-events-none">
        {!selectedPlace && (
          <div className="px-4 flex justify-center gap-3 pointer-events-auto">
            {/* 👇 검색창 */}
            <div className="w-full max-w-md relative" ref={searchContainerRef}>
              <div className="flex items-center gap-2 bg-white/90 px-3 py-2 rounded-xl shadow-lg backdrop-blur-sm border border-gray-200 pointer-events-auto">
                {/* 로고 */}
                <h1 className="shrink-0">
                  <Image src="/logo.png" alt="Logo" width={36} height={36} />
                </h1>

                {/* 인풋 */}
                <input
                  type="text"
                  placeholder="식당명, 방송명, 메뉴 검색"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  className="flex-1 bg-transparent py-2 focus:outline-none font-medium text-sm placeholder:text-gray-400"
                />

                {/* 검색 아이콘 */}
                <Search className="shrink-0 text-gray-400" size={20} />
              </div>

              {/* 👇 연관 검색어 드롭다운 */}
              {isSearchFocused && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-200 z-60">
                  <div className="py-2">
                    {searchSuggestions.map((suggestion, idx) => (
                      <button
                        key={`${suggestion.type}-${suggestion.text}-${idx}`}
                        type="button"
                        onClick={() => {
                          setSearchQuery(suggestion.text);
                          setIsSearchFocused(false);
                          if (suggestion.type === "place" && suggestion.data) {
                            setSelectedPlace(suggestion.data);
                          }
                        }}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left group"
                      >
                        <div className="p-2 rounded-lg bg-gray-100 text-gray-400 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                          {suggestion.type === "place" && <MapPin size={16} />}
                          {suggestion.type === "source" && <Tv size={16} />}
                          {suggestion.type === "category" && (
                            <Utensils size={16} />
                          )}
                        </div>
                        <div className="flex flex-col flex-1 overflow-hidden">
                          <span className="text-sm font-bold text-gray-900 truncate">
                            {suggestion.text}
                          </span>
                          {suggestion.subText && (
                            <span className="text-[10px] text-gray-400 font-medium truncate">
                              {suggestion.subText}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 메인 컨텐츠: 지도는 항상 유지 */}
      <NaverMap
        places={processedPlaces}
        onPlaceClick={(place) => setSelectedPlace(place)}
        onLocationFound={(lat, lng) => setUserLocation({ lat, lng })}
        centerPlace={selectedPlace}
      />

      {/* 상세 정보창 */}
      {selectedPlace && (
        <PlaceDetail
          place={selectedPlace}
          onClose={() => setSelectedPlace(null)}
          userLocation={userLocation}
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

      {/* 👇 장소 목록 모달 (통합 바텀 시트) 연결 */}
      <PlaceListModal
        isOpen={true}
        places={processedPlaces}
        onPlaceClick={(place) => setSelectedPlace(place)}
        hasActiveFilter={
          searchQuery.trim().length > 0 ||
          selectedFilters.sources.length > 0 ||
          selectedFilters.categories.length > 0
        }
        availableFilters={availableFilters}
        selectedFilters={selectedFilters}
        onFilterChange={handleFilterChange}
        onOpenFilterModal={() => setIsFilterOpen(true)}
        onResetFilters={() =>
          setSelectedFilters({ sources: [], categories: [] })
        }
        isSearching={searchQuery.trim().length > 0}
      />
    </main>
  );
}
