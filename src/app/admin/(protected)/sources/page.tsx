"use client";

import {
  ImagePlus,
  Pencil,
  Plus,
  Search,
  Trash2,
  Tv,
  Upload,
  X,
  Youtube,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  type CreateSourceInput,
  createSource,
  getSources,
  type Source,
  updateSource,
} from "@/lib/admin-api";
import { uploadImage } from "@/lib/storage";
import { supabase } from "@/lib/supabase";

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [formData, setFormData] = useState<CreateSourceInput>({
    name: "",
    type: "TV",
    icon_url: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  function openCreateModal() {
    setEditingSource(null);
    setFormData({ name: "", type: "TV", icon_url: "" });
    setPreviewUrl(null);
    setIsModalOpen(true);
  }

  function openEditModal(source: Source) {
    setEditingSource(source);
    setFormData({
      name: source.name,
      type: source.type,
      icon_url: source.icon_url || "",
    });
    setPreviewUrl(source.icon_url);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingSource(null);
    setFormData({ name: "", type: "TV", icon_url: "" });
    setPreviewUrl(null);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("이미지는 2MB 이하만 업로드 가능합니다.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }

    setIsUploading(true);
    try {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      const url = await uploadImage(file, "icons");
      setFormData({ ...formData, icon_url: url });
    } catch (error) {
      console.error("업로드 실패:", error);
      alert("이미지 업로드에 실패했습니다.");
      setPreviewUrl(editingSource?.icon_url || null);
    } finally {
      setIsUploading(false);
    }
  }

  function removeImage() {
    setPreviewUrl(null);
    setFormData({ ...formData, icon_url: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("채널명을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const input = {
        ...formData,
        name: formData.name.trim(),
        icon_url: formData.icon_url?.trim() || undefined,
      };

      if (editingSource) {
        // 수정
        const updated = await updateSource(editingSource.id, input);
        setSources((prev) =>
          prev.map((s) => (s.id === updated.id ? updated : s)),
        );
      } else {
        // 생성
        const created = await createSource(input);
        setSources((prev) => [created, ...prev]);
      }

      handleCloseModal();
    } catch (error) {
      console.error("저장 실패:", error);
      alert("저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("이 채널을 삭제하시겠습니까?")) return;

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
          <h1 className="text-2xl font-bold text-gray-900">채널 관리</h1>
          <p className="text-gray-500 mt-1">
            총 {sources.length}개의 채널이 등록되어 있습니다
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500 text-white font-medium rounded-xl hover:bg-indigo-600 transition-all"
        >
          <Plus className="w-5 h-5" />
          채널 등록
        </button>
      </div>

      {/* 검색 */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="채널명으로 검색..."
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
                {source.icon_url ? (
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100">
                    <Image
                      src={source.icon_url}
                      alt={source.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
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
                )}
                <div>
                  <p className="font-semibold text-gray-900">{source.name}</p>
                  <p className="text-sm text-gray-500">{source.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => openEditModal(source)}
                  className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(source.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredSources.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <Tv className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchQuery ? "검색 결과가 없습니다" : "등록된 채널이 없습니다"}
            </p>
          </div>
        )}
      </div>

      {/* 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              {editingSource ? "채널 수정" : "채널 등록"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 아이콘 이미지 업로드 */}
              <div>
                <label
                  htmlFor="icon-upload"
                  className="block text-sm font-medium text-gray-600 mb-2"
                >
                  <ImagePlus className="w-4 h-4 inline mr-1" />핀 아이콘
                </label>
                <div className="flex items-center gap-4">
                  {previewUrl || formData.icon_url ? (
                    <div className="relative">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                        <Image
                          src={previewUrl || formData.icon_url || ""}
                          alt="Preview"
                          width={80}
                          height={80}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors"
                    >
                      {isUploading ? (
                        <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          <span className="text-xs mt-1">업로드</span>
                        </>
                      )}
                    </button>
                  )}
                  <input
                    id="icon-upload"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-400">
                    2MB 이하의 이미지
                    <br />
                    (PNG, JPG, GIF)
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="source-name"
                  className="block text-sm font-medium text-gray-600 mb-2"
                >
                  채널명 <span className="text-red-500">*</span>
                </label>
                <input
                  id="source-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
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
                    onClick={() => setFormData({ ...formData, type: "TV" })}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
                      formData.type === "TV"
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
                      setFormData({ ...formData, type: "YOUTUBE" })
                    }
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
                      formData.type === "YOUTUBE"
                        ? "bg-red-50 border-red-300 text-red-600"
                        : "bg-gray-50 border-gray-200 text-gray-500"
                    }`}
                  >
                    <Youtube className="w-5 h-5" />
                    YouTube
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="flex-1 px-4 py-3 bg-indigo-500 text-white font-medium rounded-xl hover:bg-indigo-600 disabled:opacity-50 transition-all"
                >
                  {isSubmitting
                    ? "저장 중..."
                    : editingSource
                      ? "수정"
                      : "등록"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
