// src/lib/api.ts
import { supabase } from "./supabase";

export type BroadcastInfo = {
  source_name: string;
  source_type: "TV" | "YOUTUBE";
  icon_url: string;
  title: string;
};

export type MenuItem = {
  name: string;
  price: string;
  description?: string;
  image_url?: string;
};

export type OpeningHours = {
  [day: string]: string;
};

export type Place = {
  id: string;
  restaurant_name: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  broadcasts: BroadcastInfo[];
  distance?: number;
  // 상세 정보
  video_url?: string;
  vod_url?: string;
  thumbnail_url?: string;
  opening_hours?: string | OpeningHours;
  menu_info?: MenuItem[] | string;
};

export async function getPlaces(): Promise<Place[]> {
  const { data, error } = await supabase.from("places_view").select("*");

  if (error) {
    console.error("데이터 로딩 실패:", error);
    return [];
  }

  return data as Place[];
}
