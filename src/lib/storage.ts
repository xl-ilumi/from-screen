import { supabase } from "./supabase";

const BUCKET_NAME = "source-pins";

/**
 * 이미지를 Supabase Storage에 업로드
 */
export async function uploadImage(
  file: File,
  folder: string = "icons",
): Promise<string> {
  // 고유한 파일명 생성
  const fileExt = file.name.split(".").pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("업로드 에러:", error);
    throw new Error("이미지 업로드에 실패했습니다.");
  }

  // Public URL 반환
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

  return publicUrl;
}

/**
 * 이미지 삭제
 */
export async function deleteImage(url: string): Promise<void> {
  // URL에서 파일 경로 추출
  const path = url.split(`${BUCKET_NAME}/`)[1];
  if (!path) return;

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

  if (error) {
    console.error("삭제 에러:", error);
  }
}
