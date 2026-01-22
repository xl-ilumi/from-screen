"use client";

import { useEffect, useState } from "react";
import NaverMap from "@/components/NaverMap";
import PlaceDetail from "@/components/PlaceDetail";
import { getPlaces, type Place } from "@/lib/api";

export default function Home() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null); // 선택된 장소

  useEffect(() => {
    async function fetchData() {
      const data = await getPlaces();
      setPlaces(data);
    }
    fetchData();
  }, []);

  return (
    <main className="relative w-full h-screen overflow-hidden">
      {/* 로고: 선택된 장소가 없을 때만 보임 */}
      {!selectedPlace && (
        <div className="absolute top-4 left-4 z-50 bg-white/90 px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm border border-gray-200 transition-opacity">
          <h1 className="text-lg font-bold">
            <span className="text-red-600">From</span>Screen
          </h1>
          <p className="text-xs text-gray-500">방송 속 맛집을 찾아서</p>
        </div>
      )}

      {/* 지도: 클릭 시 selectedPlace 업데이트 */}
      <NaverMap
        places={places}
        onPlaceClick={(place) => setSelectedPlace(place)}
      />

      {/* 상세 정보창: selectedPlace가 있으면 보임 */}
      {selectedPlace && (
        <PlaceDetail
          place={selectedPlace}
          onClose={() => setSelectedPlace(null)}
        />
      )}
    </main>
  );
}
