"use client";

import NaverMap from "@/components/NaverMap"; // Map 컴포넌트
import { getPlaces, Place } from "@/lib/api"; // API 함수
import { useEffect, useState } from "react";

export default function Home() {
  const [places, setPlaces] = useState<Place[]>([]);

  // 화면이 켜지자마자 DB에서 데이터 가져오기
  useEffect(() => {
    async function fetchData() {
      const data = await getPlaces();
      console.log("가져온 데이터:", data);
      setPlaces(data);
    }
    fetchData();
  }, []);

  return (
    <main className="relative w-full h-screen">
      {/* 로고 & 타이틀 */}
      <div className="absolute top-4 left-4 z-50 bg-white/90 px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm border border-gray-200">
        <h1 className="text-lg font-bold">
          <span className="text-red-600">From</span>Screen
        </h1>
        <p className="text-xs text-gray-500">방송 속 맛집을 찾아서</p>
      </div>

      {/* 지도에 데이터(places) 전달 */}
      <NaverMap places={places} />
    </main>
  );
}
