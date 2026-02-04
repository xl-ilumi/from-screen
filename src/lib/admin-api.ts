// src/lib/admin-api.ts
import { supabase } from "./supabase";

// ==================== Types ====================

export type Restaurant = {
  id: string;
  name: string;
  category: string | null;
  address: string | null;
  location: { lat: number; lng: number } | null;
  image_url: string | null;
  menu_info: unknown;
  opening_hours: unknown;
  created_at: string;
};

export type Source = {
  id: string;
  name: string;
  type: "TV" | "YOUTUBE";
  icon_url: string | null;
  created_at: string;
};

export type Appearance = {
  id: string;
  restaurant_id: string;
  source_id: string;
  title: string | null;
  video_url: string | null;
  vod_url: string | null;
  thumbnail_url: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type RestaurantWithAppearances = Restaurant & {
  appearances: (Appearance & { source: Source })[];
};

// PostGIS Point 파싱 헬퍼
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseLocation(location: any): { lat: number; lng: number } | null {
  if (!location) return null;

  // GeoJSON 형식: { type: "Point", coordinates: [lng, lat] }
  if (location.coordinates && Array.isArray(location.coordinates)) {
    return {
      lat: location.coordinates[1],
      lng: location.coordinates[0],
    };
  }

  // WKT/텍스트 형식: "POINT(lng lat)" 또는 이미 객체
  if (typeof location === "string") {
    const match = location.match(/POINT\(([^ ]+) ([^)]+)\)/);
    if (match) {
      return {
        lat: parseFloat(match[2]),
        lng: parseFloat(match[1]),
      };
    }
  }

  // 이미 lat/lng 객체인 경우
  if (typeof location.lat === "number" && typeof location.lng === "number") {
    return { lat: location.lat, lng: location.lng };
  }

  return null;
}

export async function getRestaurants(): Promise<Restaurant[]> {
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("식당 목록 조회 실패:", error);
    throw new Error(error.message);
  }

  // PostGIS Point를 lat/lng 객체로 변환
  return (data || []).map((r) => ({
    ...r,
    location: parseLocation(r.location),
  }));
}

export async function getRestaurantById(
  id: string,
): Promise<RestaurantWithAppearances | null> {
  const { data, error } = await supabase
    .from("restaurants")
    .select(
      `
      *,
      appearances (
        *,
        source:sources (*)
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("식당 조회 실패:", error);
    return null;
  }

  return {
    ...data,
    location: parseLocation(data.location),
  } as RestaurantWithAppearances;
}

export type CreateRestaurantInput = {
  name: string;
  category?: string;
  address?: string;
  lat?: number;
  lng?: number;
  image_url?: string;
  menu_info?: unknown;
  opening_hours?: unknown;
};

export async function createRestaurant(
  input: CreateRestaurantInput,
): Promise<Restaurant> {
  const { lat, lng, ...rest } = input;

  // PostGIS Point 형식으로 변환
  const insertData: Record<string, unknown> = { ...rest };
  if (lat !== undefined && lng !== undefined) {
    insertData.location = `POINT(${lng} ${lat})`;
  }

  const { data, error } = await supabase
    .from("restaurants")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error("식당 등록 실패:", error);
    throw new Error(error.message);
  }

  return {
    ...data,
    location: lat && lng ? { lat, lng } : null,
  };
}

export async function updateRestaurant(
  id: string,
  input: Partial<CreateRestaurantInput>,
): Promise<Restaurant> {
  const { lat, lng, ...rest } = input;

  const updateData: Record<string, unknown> = { ...rest };
  if (lat !== undefined && lng !== undefined) {
    updateData.location = `POINT(${lng} ${lat})`;
  }

  const { data, error } = await supabase
    .from("restaurants")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("식당 수정 실패:", error);
    throw new Error(error.message);
  }

  return {
    ...data,
    location: parseLocation(data.location),
  };
}

export async function deleteRestaurant(id: string): Promise<void> {
  const { error } = await supabase.from("restaurants").delete().eq("id", id);

  if (error) {
    console.error("식당 삭제 실패:", error);
    throw new Error(error.message);
  }
}

// ==================== Sources ====================

export async function getSources(): Promise<Source[]> {
  const { data, error } = await supabase
    .from("sources")
    .select("*")
    .order("name");

  if (error) {
    console.error("소스 목록 조회 실패:", error);
    throw new Error(error.message);
  }

  return data || [];
}

export type CreateSourceInput = {
  name: string;
  type: "TV" | "YOUTUBE";
  icon_url?: string;
};

export async function createSource(input: CreateSourceInput): Promise<Source> {
  const { data, error } = await supabase
    .from("sources")
    .insert(input)
    .select()
    .single();

  if (error) {
    console.error("소스 등록 실패:", error);
    throw new Error(error.message);
  }

  return data;
}

// ==================== Appearances ====================

export type CreateAppearanceInput = {
  restaurant_id: string;
  source_id: string;
  title?: string;
  video_url?: string;
  vod_url?: string;
  thumbnail_url?: string;
  metadata?: Record<string, unknown>;
};

export async function createAppearance(
  input: CreateAppearanceInput,
): Promise<Appearance> {
  const { data, error } = await supabase
    .from("appearances")
    .insert(input)
    .select()
    .single();

  if (error) {
    console.error("출연 정보 등록 실패:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function deleteAppearance(id: string): Promise<void> {
  const { error } = await supabase.from("appearances").delete().eq("id", id);

  if (error) {
    console.error("출연 정보 삭제 실패:", error);
    throw new Error(error.message);
  }
}

// ==================== Dashboard Stats ====================

export type DashboardStats = {
  totalRestaurants: number;
  totalSources: number;
  totalAppearances: number;
  recentRestaurants: Restaurant[];
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const [restaurants, sources, appearances] = await Promise.all([
    supabase.from("restaurants").select("*", { count: "exact", head: false }),
    supabase.from("sources").select("*", { count: "exact", head: true }),
    supabase.from("appearances").select("*", { count: "exact", head: true }),
  ]);

  const recentRestaurants = (restaurants.data || []).slice(0, 5).map((r) => ({
    ...r,
    location: parseLocation(r.location),
  }));

  return {
    totalRestaurants: restaurants.count || 0,
    totalSources: sources.count || 0,
    totalAppearances: appearances.count || 0,
    recentRestaurants,
  };
}
