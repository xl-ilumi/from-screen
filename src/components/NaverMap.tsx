"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import type { Place } from "@/lib/api"; // Step 1에서 만든 타입 불러오기

type Props = {
  places?: Place[]; // 외부에서 주입받을 맛집 데이터 리스트
  onPlaceClick?: (place: Place) => void;
};

const MAP_STYLE_ID = "57c399f8-b89a-4355-9da0-52debacba0f8";

export default function NaverMap({ places = [], onPlaceClick }: Props) {
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. 지도 초기화 (최초 1회 실행)
  useEffect(() => {
    if (!isLoaded || !mapDivRef.current || !window.naver || mapRef.current)
      return;

    // 서울 시청 중심으로 지도 생성
    const center = new window.naver.maps.LatLng(37.5665, 126.978);
    mapRef.current = new window.naver.maps.Map(mapDivRef.current, {
      center,
      zoom: 11, // 서울 전체가 보이게 줌 조정
      gl: true,
      customStyleId: MAP_STYLE_ID,
    });
  }, [isLoaded]);

  // 2. 마커 찍기 (places 데이터가 들어오거나 바뀔 때 실행)
  useEffect(() => {
    const map = mapRef.current;
    if (!isLoaded || !map || !window.naver || places.length === 0) return;

    // 기존 마커가 있다면 지우는 로직이 필요하지만, 지금은 일단 찍기만 합니다.
    places.forEach((place) => {
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(place.lat, place.lng),
        map: map,
        title: place.restaurant_name,
        icon: {
          content: `
            <div style="width: 24px; height: 24px; background: ${place.source_type === "TV" ? "#EF4444" : "#3B82F6"}; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3); cursor: pointer;"></div>
          `,
          anchor: new window.naver.maps.Point(12, 12),
        },
      });

      // 🌟 마커 클릭 시 이벤트 발생
      window.naver.maps.Event.addListener(marker, "click", () => {
        if (onPlaceClick) {
          onPlaceClick(place);
          // 클릭 시 해당 위치로 지도 이동 (부드럽게)
          map.panTo(new window.naver.maps.LatLng(place.lat, place.lng));
        }
      });
    });

    console.log(`📍 마커 ${places.length}개 생성 완료!`);
  }, [places, isLoaded, onPlaceClick]);

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}&submodules=gl`}
        onLoad={() => setIsLoaded(true)}
      />
      <div ref={mapDivRef} style={{ width: "100vw", height: "100vh" }} />
    </>
  );
}
