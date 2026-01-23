"use client";

import { Locate } from "lucide-react";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Place } from "@/lib/api";

type Props = {
  places?: Place[];
  onPlaceClick?: (place: Place) => void;
};

const MAP_STYLE_ID = "57c399f8-b89a-4355-9da0-52debacba0f8";

export default function NaverMap({ places = [], onPlaceClick }: Props) {
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);
  const userMarkerRef = useRef<naver.maps.Marker | null>(null);
  const markerListRef = useRef<naver.maps.Marker[]>([]);

  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const handleCurrentLocation = useCallback(
    (targetMap?: naver.maps.Map, lat?: number, lng?: number) => {
      console.log("📍 handleCurrentLocation 호출됨", { lat, lng });
      const map = targetMap || mapRef.current;
      if (!map || !window.naver) {
        console.log("❌ 지도 또는 naver 객체가 준비되지 않음", {
          map: !!map,
          naver: !!window.naver,
        });
        return;
      }

      const updatePosition = (latitude: number, longitude: number) => {
        const myLocation = new window.naver.maps.LatLng(latitude, longitude);

        // (1) 지도 이동
        console.log(
          "📍 지도를 위치로 이동합니다 (setCenter/zoom):",
          latitude,
          longitude,
        );
        map.setCenter(myLocation);
        map.setZoom(16);

        // (2) 기존에 찍힌 내 위치 마커가 있으면 지우기 (중복 방지)
        if (userMarkerRef.current) {
          userMarkerRef.current.setMap(null);
        }

        // (3) 내 위치 마커 새로 찍기 (파란색 + 애니메이션 효과)
        userMarkerRef.current = new window.naver.maps.Marker({
          position: myLocation,
          map: map,
          zIndex: 100, // 다른 마커보다 위에 보이게
          icon: {
            content: `
              <div style="position: relative;">
                <div style="
                  width: 20px; height: 20px; background: #3B82F6; 
                  border: 3px solid white; border-radius: 50%; 
                  box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
                "></div>
                <div style="
                  position: absolute; top: -5px; left: -5px;
                  width: 30px; height: 30px; border-radius: 50%;
                  background: rgba(59, 130, 246, 0.4);
                  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                "></div>
              </div>
              <style>
                @keyframes ping {
                  75%, 100% { transform: scale(1.5); opacity: 0; }
                }
              </style>
            `,
            anchor: new window.naver.maps.Point(10, 10),
          },
        });
      };

      // 만약 이미 좌표가 있으면 바로 업데이트
      if (lat !== undefined && lng !== undefined) {
        updatePosition(lat, lng);
        return;
      }

      // 없으면 현재 위치 요청
      if (navigator.geolocation) {
        console.log("📍 위치 정보 요청 중...");
        setIsLoadingLocation(true);

        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log("✅ 위치 정보 획득 성공", position.coords);
            updatePosition(position.coords.latitude, position.coords.longitude);
            setIsLoadingLocation(false);
          },
          (error) => {
            console.error("GPS Error:", error);
            setIsLoadingLocation(false);
          },
          { enableHighAccuracy: true, timeout: 5000 },
        );
      } else {
        alert("GPS를 지원하지 않는 브라우저입니다.");
      }
    },
    [],
  );

  // 1. 지도 초기화 (최초 1회 실행)
  useEffect(() => {
    if (!isLoaded || !mapDivRef.current || !window.naver || mapRef.current)
      return;

    const initializeMap = (lat: number, lng: number) => {
      const container = mapDivRef.current;
      if (!container || mapRef.current) return;

      const center = new window.naver.maps.LatLng(lat, lng);
      const mapInstance = new window.naver.maps.Map(container, {
        center,
        zoom: 16,
        gl: true,
        customStyleId: MAP_STYLE_ID,
      });
      mapRef.current = mapInstance;

      console.log("✅ 지도 초기화 완료:", lat, lng);
      handleCurrentLocation(mapInstance, lat, lng);
    };

    // 위치 정보를 먼저 가져오고 지도를 만듭니다. (점프 방지)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          initializeMap(position.coords.latitude, position.coords.longitude);
        },
        () => {
          // 실패 시 서울시청으로 시작
          initializeMap(37.5665, 126.978);
        },
        { enableHighAccuracy: true, timeout: 3000 },
      );
    } else {
      initializeMap(37.5665, 126.978);
    }
  }, [isLoaded, handleCurrentLocation]);

  // 2. 마커 찍기 (places 데이터가 들어오거나 바뀔 때 실행)
  useEffect(() => {
    const map = mapRef.current;
    if (!isLoaded || !map || !window.naver || places.length === 0) return;

    markerListRef.current.forEach((marker) => {
      marker.setMap(null);
    });
    markerListRef.current = [];

    if (places.length === 0) return;

    places.forEach((place) => {
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(place.lat, place.lng),
        map: map,
        title: place.restaurant_name,
        icon: {
          content: `
            <div style="
              width: 32px; height: 32px; 
              background: ${place.source_type === "TV" ? "#EF4444" : "#3B82F6"}; 
              border: 3px solid white; border-radius: 50%; 
              box-shadow: 0 4px 12px rgba(0,0,0,0.2); 
              cursor: pointer;
              display: flex; align-items: center; justify-content: center;
              transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            " onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                ${place.source_type === "TV" ? '<path d="M2 8V2h20v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8Z"/><path d="m2 8 10 7 10-7"/><path d="m2 2 10 7L22 2"/>' : '<path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>'}
              </svg>
            </div>
          `,
          anchor: new window.naver.maps.Point(16, 16),
        },
      });

      // 마커 클릭 시 이벤트 발생
      window.naver.maps.Event.addListener(marker, "click", () => {
        if (onPlaceClick) {
          onPlaceClick(place);
          // 클릭 시 해당 위치로 지도 이동 (부드럽게)
          map.panTo(new window.naver.maps.LatLng(place.lat, place.lng));
        }
      });

      // 3. 생성된 마커를 목록에 저장 (나중에 지우기 위해)
      markerListRef.current.push(marker);
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
      <div className="relative w-full h-full">
        <div ref={mapDivRef} className="w-full h-full" />

        <button
          type="button"
          onClick={() => handleCurrentLocation()}
          className="absolute bottom-6 right-4 z-40 bg-white p-3 rounded-full shadow-lg border border-gray-100 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-all active:scale-95"
          aria-label="내 위치로 이동"
        >
          {/* 로딩 중이면 뱅글뱅글, 아니면 조준점 아이콘 */}
          {isLoadingLocation ? (
            <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
          ) : (
            <Locate size={24} />
          )}
        </button>
      </div>
    </>
  );
}
