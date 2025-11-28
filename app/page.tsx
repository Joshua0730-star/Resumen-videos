"use client";

import YoutubeInput from "./components/YoutubeInput";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Resumidor de Videos
          </h1>
          <p className="text-gray-600">
            Pega la URL de un video de YouTube para obtener un resumen
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <YoutubeInput />
        </div>
      </div>
    </div>
  );
}
