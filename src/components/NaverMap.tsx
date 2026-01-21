"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type Props = {
  lat?: number;
  lng?: number;
  zoom?: number;
};

export default function NaverMap({
  lat = 37.3595704,
  lng = 127.105399,
  zoom = 10,
}: Props) {
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded) return;
    if (!mapDivRef.current) return;
    if (!window.naver?.maps) return;
    if (mapRef.current) return; // 중복 생성 방지

    const center = new window.naver.maps.LatLng(lat, lng);

    mapRef.current = new window.naver.maps.Map(mapDivRef.current, {
      center,
      zoom,
    });

    // 마커 예시(선택)
    new window.naver.maps.Marker({
      position: center,
      map: mapRef.current,
    });
  }, [loaded, lat, lng, zoom]);

  const key = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${key}`}
        onLoad={() => setLoaded(true)}
      />
      <div ref={mapDivRef} style={{ width: "100%", height: "100%" }} />
    </>
  );
}
