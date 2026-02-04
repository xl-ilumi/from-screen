"use client";

import {
  Clock,
  Image as ImageIcon,
  MapPin,
  Plus,
  Save,
  Trash2,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  type Appearance,
  type CreateAppearanceInput,
  type CreateRestaurantInput,
  createAppearance,
  createRestaurant,
  deleteAppearance,
  getSources,
  type Restaurant,
  type Source,
  updateRestaurant,
} from "@/lib/admin-api";

type MenuItem = {
  id: string;
  name: string;
  price: string;
  description?: string;
};

type Props = {
  restaurant?: Restaurant & {
    appearances?: (Appearance & { source: Source })[];
  };
  isEdit?: boolean;
};

export default function RestaurantForm({ restaurant, isEdit = false }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [sources, setSources] = useState<Source[]>([]);

  // 기본 정보
  const [name, setName] = useState(restaurant?.name || "");
  const [category, setCategory] = useState(restaurant?.category || "");
  const [address, setAddress] = useState(restaurant?.address || "");
  const [lat, setLat] = useState(restaurant?.location?.lat?.toString() || "");
  const [lng, setLng] = useState(restaurant?.location?.lng?.toString() || "");
  const [imageUrl, setImageUrl] = useState(restaurant?.image_url || "");

  // 영업시간
  const [openingHours, setOpeningHours] = useState<Record<string, string>>(
    (restaurant?.opening_hours as unknown as Record<string, string>) || {},
  );

  // 메뉴 정보
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const items = Array.isArray(restaurant?.menu_info)
      ? restaurant.menu_info
      : [];
    return (items as Omit<MenuItem, "id">[]).map((item, idx) => ({
      ...item,
      id: `existing-${idx}-${Date.now()}`,
    }));
  });

  // 출연 정보 (신규 추가용)
  const [newAppearance, setNewAppearance] = useState<{
    source_id: string;
    title: string;
    video_url: string;
    vod_url: string;
    thumbnail_url: string;
  }>({
    source_id: "",
    title: "",
    video_url: "",
    vod_url: "",
    thumbnail_url: "",
  });

  useEffect(() => {
    async function fetchSources() {
      const data = await getSources();
      setSources(data);
    }
    fetchSources();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      alert("식당명을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      const input: CreateRestaurantInput = {
        name: name.trim(),
        category: category.trim() || undefined,
        address: address.trim() || undefined,
        lat: lat ? Number.parseFloat(lat) : undefined,
        lng: lng ? Number.parseFloat(lng) : undefined,
        image_url: imageUrl.trim() || undefined,
        opening_hours:
          Object.keys(openingHours).length > 0 ? openingHours : undefined,
        menu_info: menuItems.length > 0 ? menuItems : undefined,
      };

      if (isEdit && restaurant) {
        await updateRestaurant(restaurant.id, input);
      } else {
        await createRestaurant(input);
      }

      router.push("/admin/restaurants");
    } catch (error) {
      console.error("저장 실패:", error);
      alert("저장에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddAppearance() {
    if (!restaurant?.id || !newAppearance.source_id) {
      alert("방송을 선택해주세요.");
      return;
    }

    try {
      const input: CreateAppearanceInput = {
        restaurant_id: restaurant.id,
        source_id: newAppearance.source_id,
        title: newAppearance.title || undefined,
        video_url: newAppearance.video_url || undefined,
        vod_url: newAppearance.vod_url || undefined,
        thumbnail_url: newAppearance.thumbnail_url || undefined,
      };
      await createAppearance(input);
      router.refresh();
      setNewAppearance({
        source_id: "",
        title: "",
        video_url: "",
        vod_url: "",
        thumbnail_url: "",
      });
    } catch (error) {
      console.error("출연 정보 추가 실패:", error);
      alert("출연 정보 추가에 실패했습니다.");
    }
  }

  async function handleDeleteAppearance(id: string) {
    if (!confirm("출연 정보를 삭제하시겠습니까?")) return;
    try {
      await deleteAppearance(id);
      router.refresh();
    } catch (error) {
      console.error("출연 정보 삭제 실패:", error);
      alert("삭제에 실패했습니다.");
    }
  }

  function addMenuItem() {
    setMenuItems([
      ...menuItems,
      { id: crypto.randomUUID(), name: "", price: "" },
    ]);
  }

  function updateMenuItem(index: number, field: keyof MenuItem, value: string) {
    const updated = [...menuItems];
    updated[index] = { ...updated[index], [field]: value };
    setMenuItems(updated);
  }

  function removeMenuItem(index: number) {
    setMenuItems(menuItems.filter((_, i) => i !== index));
  }

  const days = ["월", "화", "수", "목", "금", "토", "일"];

  const inputClass =
    "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500";
  const labelClass = "block text-sm font-medium text-gray-600 mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 기본 정보 */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <UtensilsCrossed className="w-5 h-5 text-indigo-500" />
          기본 정보
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 식당명 */}
          <div>
            <label htmlFor="restaurant-name" className={labelClass}>
              식당명 <span className="text-red-500">*</span>
            </label>
            <input
              id="restaurant-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 맛있는 식당"
              className={inputClass}
              required
            />
          </div>

          {/* 카테고리 */}
          <div>
            <label htmlFor="restaurant-category" className={labelClass}>
              카테고리
            </label>
            <input
              id="restaurant-category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="예: 한식, 일식, 중식"
              className={inputClass}
            />
          </div>

          {/* 이미지 URL */}
          <div className="md:col-span-2">
            <label htmlFor="restaurant-image-url" className={labelClass}>
              <ImageIcon className="w-4 h-4 inline mr-1" />
              대표 이미지 URL
            </label>
            <input
              id="restaurant-image-url"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* 위치 정보 */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-indigo-500" />
          위치 정보
        </h2>

        <div className="space-y-4">
          {/* 주소 */}
          <div>
            <label htmlFor="restaurant-address" className={labelClass}>
              주소
            </label>
            <input
              id="restaurant-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="예: 서울시 강남구 ..."
              className={inputClass}
            />
          </div>

          {/* 좌표 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="restaurant-lat" className={labelClass}>
                위도 (lat)
              </label>
              <input
                id="restaurant-lat"
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="37.5665"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="restaurant-lng" className={labelClass}>
                경도 (lng)
              </label>
              <input
                id="restaurant-lng"
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="126.9780"
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 영업시간 */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-500" />
          영업시간
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {days.map((day) => (
            <div key={day}>
              <label htmlFor={`opening-hours-${day}`} className={labelClass}>
                {day}요일
              </label>
              <input
                id={`opening-hours-${day}`}
                type="text"
                value={openingHours[day] || ""}
                onChange={(e) =>
                  setOpeningHours({ ...openingHours, [day]: e.target.value })
                }
                placeholder="11:00 - 22:00"
                className={inputClass}
              />
            </div>
          ))}
        </div>
      </section>

      {/* 메뉴 정보 */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-indigo-500" />
            메뉴 정보
          </h2>
          <button
            type="button"
            onClick={addMenuItem}
            className="flex items-center gap-1 text-indigo-500 hover:text-indigo-600 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            메뉴 추가
          </button>
        </div>

        <div className="space-y-4">
          {menuItems.map((item, index) => (
            <div
              key={item.id}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl"
            >
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateMenuItem(index, "name", e.target.value)}
                placeholder="메뉴명"
                className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
              <input
                type="text"
                value={item.price}
                onChange={(e) => updateMenuItem(index, "price", e.target.value)}
                placeholder="가격 (예: 15,000원)"
                className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={item.description || ""}
                  onChange={(e) =>
                    updateMenuItem(index, "description", e.target.value)
                  }
                  placeholder="설명 (선택)"
                  className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
                <button
                  type="button"
                  onClick={() => removeMenuItem(index)}
                  className="p-3 text-red-500 hover:bg-red-50 rounded-xl"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          {menuItems.length === 0 && (
            <p className="text-gray-400 text-center py-8">
              등록된 메뉴가 없습니다
            </p>
          )}
        </div>
      </section>

      {/* 출연 정보 (수정 모드에서만) */}
      {isEdit && restaurant && (
        <section className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            출연 정보
          </h2>

          {/* 기존 출연 정보 */}
          {restaurant.appearances && restaurant.appearances.length > 0 && (
            <div className="space-y-3 mb-6">
              {restaurant.appearances.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {app.source?.name || "알 수 없음"}
                    </p>
                    <p className="text-sm text-gray-500">{app.title || "-"}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteAppearance(app.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 새 출연 정보 추가 */}
          <div className="p-4 bg-gray-50 rounded-xl space-y-4">
            <p className="text-sm font-medium text-gray-600">
              새 출연 정보 추가
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <select
                value={newAppearance.source_id}
                onChange={(e) =>
                  setNewAppearance({
                    ...newAppearance,
                    source_id: e.target.value,
                  })
                }
                className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                <option value="">방송 선택</option>
                {sources.map((source) => (
                  <option key={source.id} value={source.id}>
                    [{source.type}] {source.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={newAppearance.title}
                onChange={(e) =>
                  setNewAppearance({ ...newAppearance, title: e.target.value })
                }
                placeholder="에피소드 제목"
                className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
              <input
                type="url"
                value={newAppearance.video_url}
                onChange={(e) =>
                  setNewAppearance({
                    ...newAppearance,
                    video_url: e.target.value,
                  })
                }
                placeholder="영상 URL"
                className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
              <input
                type="url"
                value={newAppearance.vod_url}
                onChange={(e) =>
                  setNewAppearance({
                    ...newAppearance,
                    vod_url: e.target.value,
                  })
                }
                placeholder="VOD URL"
                className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
            <button
              type="button"
              onClick={handleAddAppearance}
              className="w-full py-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              출연 정보 추가
            </button>
          </div>
        </section>
      )}

      {/* 액션 버튼 */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 sm:flex-none px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
        >
          <X className="w-5 h-5" />
          취소
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-6 py-3 bg-indigo-500 text-white font-medium rounded-xl hover:bg-indigo-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              {isEdit ? "저장" : "등록"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
