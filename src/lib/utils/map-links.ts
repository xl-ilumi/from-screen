// src/lib/utils/map-links.ts

export type MapApp = "naver" | "kakao" | "google" | "tmap";

interface MapLinkParams {
  lat: number;
  lng: number;
  name: string;
  address: string;
  startLat?: number;
  startLng?: number;
}

const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const isIOS = () => /iPhone|iPad|iPod/i.test(navigator.userAgent);
const isAndroid = () => /Android/i.test(navigator.userAgent);

export const getMapAppLink = (
  app: MapApp,
  { lat, lng, name, address, startLat, startLng }: MapLinkParams,
): string => {
  const labelWithAddress = `${name} (${address})`;
  const encodedLabelWithAddress = encodeURIComponent(labelWithAddress);
  const encodedNameOnly = encodeURIComponent(name);

  const startParam =
    startLat && startLng ? { lat: startLat, lng: startLng } : null;

  switch (app) {
    case "naver":
      // 네이버 지도 앱: dname에 주소를 포함하면 인식이 안 되는 경우가 있어 이름만 전달
      return `nmap://route/public?dlat=${lat}&dlng=${lng}&dname=${encodedNameOnly}&appname=fromscreen${
        startParam
          ? `&slat=${startParam.lat}&slng=${startParam.lng}&sname=${encodeURIComponent("내 위치")}`
          : ""
      }`;
    case "kakao":
      // 카카오맵: sp=lat,lng (출발지), ep=lat,lng (도착지)
      return `kakaomap://route?ep=${lat},${lng}${
        startParam ? `&sp=${startParam.lat},${startParam.lng}` : ""
      }&by=PUBLICTRANSIT`;
    case "tmap":
      return `tmap://route?dname=${encodedLabelWithAddress}&dlat=${lat}&dlng=${lng}${
        startParam ? `&slat=${startParam.lat}&slng=${startParam.lng}` : ""
      }`;
    case "google":
      return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}${
        startParam ? `&origin=${startParam.lat},${startParam.lng}` : ""
      }&query=${encodedLabelWithAddress}`;
    default:
      return "#";
  }
};

export const getMapWebFallback = (
  app: MapApp,
  { lat, lng, name, address, startLat, startLng }: MapLinkParams,
): string => {
  const labelWithAddress = `${name} (${address})`;
  const encodedLabelWithAddress = encodeURIComponent(labelWithAddress);
  const encodedNameOnly = encodeURIComponent(name);
  const startParam =
    startLat && startLng ? { lat: startLat, lng: startLng } : null;

  switch (app) {
    case "naver": {
      // 네이버 웹: https://map.naver.com/v5/directions/출발지/도착지/-/모드
      // 좌표 형식: lng,lat,name
      const start = startParam
        ? `${startParam.lng},${startParam.lat},${encodeURIComponent("내 위치")}`
        : "-";
      const end = `${lng},${lat},${encodedLabelWithAddress}`;
      return `https://map.naver.com/v5/directions/${start}/${end}/-/walk`;
    }
    case "kakao":
      return `https://map.kakao.com/link/to/${encodedNameOnly},${lat},${lng}${
        startParam
          ? `/from/${encodeURIComponent("내 위치")},${startParam.lat},${startParam.lng}`
          : ""
      }`;
    case "tmap": {
      if (isIOS()) return "https://apps.apple.com/kr/app/t-map/id431589174";
      if (isAndroid())
        return "https://play.google.com/store/apps/details?id=com.skt.tmap.ku";

      const tMapStart = startParam
        ? `${startParam.lng},${startParam.lat},${encodeURIComponent("내 위치")}`
        : "-";
      const tMapEnd = `${lng},${lat},${encodedLabelWithAddress}`;
      return `https://map.naver.com/v5/directions/${tMapStart}/${tMapEnd}/-/walk`;
    }
    case "google":
      return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}${
        startParam ? `&origin=${startParam.lat},${startParam.lng}` : ""
      }&query=${encodedLabelWithAddress}`;
    default:
      return "#";
  }
};

/**
 * 모바일 앱 실행을 시도하고 실패 시 웹 또는 스토어로 폴백
 */
export const openMapApp = (app: MapApp, params: MapLinkParams) => {
  const appLink = getMapAppLink(app, params);
  const webLink = getMapWebFallback(app, params);

  // 데스크톱 환경이거나 구글 지도의 경우 바로 새 탭에서 웹 버전 열기
  if (!isMobile() || app === "google") {
    if (app === "tmap" && !isMobile()) {
      alert(
        "티맵은 모바일 앱에서만 지원됩니다. 네이버 지도로 연결해 드릴게요!",
      );
      window.open(getMapWebFallback("naver", params), "_blank");
      return;
    }
    window.open(webLink, "_blank");
    return;
  }

  // 모바일 환경: 앱 호출 시도
  const start = Date.now();
  window.location.href = appLink;

  // 앱 실행 여부 감지 시도 및 폴백 처리
  setTimeout(() => {
    // 2.5초 내에 페이지에 머물러 있다면 앱 실행 실패로 간주
    if (Date.now() - start < 2500) {
      if (app === "tmap") {
        if (
          confirm(
            "티맵 앱이 설치되어 있지 않은 것 같습니다. 스토어로 이동할까요?",
          )
        ) {
          window.open(webLink, "_blank");
        }
      } else {
        // 일반 지도 앱은 새 탭에서 웹 버전 열기
        window.open(webLink, "_blank");
      }
    }
  }, 2000);
};
