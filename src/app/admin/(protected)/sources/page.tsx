"use client";

import { Plus, Search, Trash2, Tv, Youtube } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  type CreateSourceInput,
  createSource,
  getSources,
  type Source,
} from "@/lib/admin-api";
import { supabase } from "@/lib/supabase";

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSource, setNewSource] = useState<CreateSourceInput>({
    name: "",
    type: "TV",
    icon_url: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSources = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getSources();
      setSources(data);
    } catch (error) {
      console.error("소스 목록 조회 실패:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newSource.name.trim()) {
      alert("방송명을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createSource({
        ...newSource,
        name: newSource.name.trim(),
        icon_url: newSource.icon_url?.trim() || undefined,
      });
      setSources((prev) => [created, ...prev]);
      setNewSource({ name: "", type: "TV", icon_url: "" });
      setIsModalOpen(false);
    } catch (error) {
      console.error("등록 실패:", error);
      alert("등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("이 방송을 삭제하시겠습니까?")) return;

    try {
      const { error } = await supabase.from("sources").delete().eq("id", id);
      if (error) throw error;
      setSources((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제에 실패했습니다. 연결된 출연 정보가 있을 수 있습니다.");
    }
  }

  const filteredSources = sources.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.type.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">방송 관리</h1>
          <p className="text-gray-500 mt-1">
            총 {sources.length}개의 방송이 등록되어 있습니다
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500 text-white font-medium rounded-xl hover:bg-indigo-600 transition-all"
        >
          <Plus className="w-5 h-5" />
          방송 등록
        </button>
      </div>

      {/* 검색 */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="방송명으로 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
        />
      </div>

      {/* 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSources.map((source) => (
          <div
            key={source.id}
            className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-xl ${
                    source.type === "TV"
                      ? "bg-blue-50 text-blue-500"
                      : "bg-red-50 text-red-500"
                  }`}
                >
                  {source.type === "TV" ? (
                    <Tv className="w-6 h-6" />
                  ) : (
                    <Youtube className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{source.name}</p>
                  <p className="text-sm text-gray-500">{source.type}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(source.id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {filteredSources.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <Tv className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchQuery ? "검색 결과가 없습니다" : "등록된 방송이 없습니다"}
            </p>
          </div>
        )}
      </div>

      {/* 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              방송 등록
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="source-name"
                  className="block text-sm font-medium text-gray-600 mb-2"
                >
                  방송명 <span className="text-red-500">*</span>
                </label>
                <input
                  id="source-name"
                  type="text"
                  value={newSource.name}
                  onChange={(e) =>
                    setNewSource({ ...newSource, name: e.target.value })
                  }
                  placeholder="예: 백종원의 골목식당"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="source-type"
                  className="block text-sm font-medium text-gray-600 mb-2"
                >
                  유형
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setNewSource({ ...newSource, type: "TV" })}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
                      newSource.type === "TV"
                        ? "bg-blue-50 border-blue-300 text-blue-600"
                        : "bg-gray-50 border-gray-200 text-gray-500"
                    }`}
                  >
                    <Tv className="w-5 h-5" />
                    TV
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setNewSource({ ...newSource, type: "YOUTUBE" })
                    }
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
                      newSource.type === "YOUTUBE"
                        ? "bg-red-50 border-red-300 text-red-600"
                        : "bg-gray-50 border-gray-200 text-gray-500"
                    }`}
                  >
                    <Youtube className="w-5 h-5" />
                    YouTube
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="source-icon-url"
                  className="block text-sm font-medium text-gray-600 mb-2"
                >
                  아이콘 URL
                </label>
                <input
                  id="source-icon-url"
                  type="url"
                  value={newSource.icon_url || ""}
                  onChange={(e) =>
                    setNewSource({ ...newSource, icon_url: e.target.value })
                  }
                  placeholder="https://..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-indigo-500 text-white font-medium rounded-xl hover:bg-indigo-600 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? "등록 중..." : "등록"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
