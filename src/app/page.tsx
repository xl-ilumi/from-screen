import NaverMap from "@/components/NaverMap";

export default function Home() {
  return (
    <main className="relative w-full h-screen">
      {/* 로고 오버레이 */}
      <div className="absolute top-4 left-4 z-50 bg-white/90 px-4 py-2 rounded-lg shadow-md backdrop-blur-sm">
        <h1 className="text-xl font-bold text-red-600">FromScreen</h1>
      </div>
      <NaverMap lat={37.3595704} lng={127.105399} zoom={10} />
    </main>
  );
}
