// src/lib/api.ts
import { supabase } from "./supabase";

export type Place = {
  id: string;
  title: string;
  restaurant_name: string;
  lat: number;
  lng: number;
  source_type: "TV" | "YOUTUBE";
};

export async function getPlaces(): Promise<Place[]> {
  // 뷰(places_view)에서 이미 다 조립된 데이터를 가져옵니다.
  const { data, error } = await supabase.from("places_view").select("*"); // "모든 걸 다 줘!"

  if (error) {
    console.error("데이터 로딩 실패:", error);
    return [];
  }

  // 이제 복잡한 변환 과정 없이 바로 내보내면 됩니다!
  return data as Place[];
}
