// src/lib/utils/map-links.ts

export type MapApp = "naver" | "kakao" | "google";

interface MapLinkParams {
  lat: number;
  lng: number;
  name: string;
}

export const getMapAppLink = (
  app: MapApp,
  { lat, lng, name }: MapLinkParams,
): string => {
  const encodedName = encodeURIComponent(name);

  switch (app) {
    case "naver":
      // 네이버 지도 앱 길찾기 (출발지는 현재위치 기본값)
      return `nmap://route/public?dlat=${lat}&dlng=${lng}&dname=${encodedName}&appname=fromscreen`;

    case "kakao":
      // 카카오 지도 앱 길찾기
      return `kakaomap://route?ep=${lat},${lng}&by=PUBLICTRANSIT`;

    case "google":
      // 구글 지도 (웹/앱 공용)
      return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

    default:
      return "#";
  }
};

export const getMapWebFallback = (
  app: MapApp,
  { lat, lng, name }: MapLinkParams,
): string => {
  const encodedName = encodeURIComponent(name);

  switch (app) {
    case "naver":
      return `https://map.naver.com/v5/directions/-/-/destination,${lng},${lat},${encodedName},/walk`;
    case "kakao":
      return `https://map.kakao.com/link/to/${encodedName},${lat},${lng}`;
    case "google":
      return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    default:
      return "#";
  }
};

/**
 * 모바일 앱 실행을 시도하고 실패 시 웹으로 폴백하는 로직
 * (브라우저 제약상 완벽한 감지는 어려우나 일반적인 구현 방식 사용)
 */
export const openMapApp = (app: MapApp, params: MapLinkParams) => {
  const appLink = getMapAppLink(app, params);
  const webLink = getMapWebFallback(app, params);

  const start = Date.now();
  window.location.href = appLink;

  // 앱 실행에 실패하여 페이지에 남아있는 경우 (약 2초 후) 웹 링크로 이동
  setTimeout(() => {
    if (Date.now() - start < 2500) {
      window.location.href = webLink;
    }
  }, 2000);
};
