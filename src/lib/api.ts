// src/lib/api.ts
import { supabase } from "./supabase";

export type Place = {
  id: string;
  title: string;
  restaurant_name: string;
  category: string;
  source_name: string;
  lat: number;
  lng: number;
  source_type: "TV" | "YOUTUBE";
  distance?: number;
};

export async function getPlaces(): Promise<Place[]> {
  const { data, error } = await supabase.from("places_view").select("*");

  if (error) {
    console.error("데이터 로딩 실패:", error);
    return [];
  }

  return data as Place[];
}
