"use client";

import YoutubeInput from "./components/YoutubeInput";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-2 lg:mb-4">
            Resumidor de Videos
          </h1>
          <p className="text-gray-600">
            Pega la URL de un video de YouTube para obtener un resumen
          </p>

          <small className="text-blue-950 text-sm mt-4 block text-center px-2 py-0.5 rounded-full  bg-blue-100 w-fit mx-auto">
            Hecho por{" "}
            <a
              href="https://github.com/Joshua0730-star"
              target="_blank"
              rel="noopener noreferrer"
            >
              Josue Marchena 💖
            </a>
          </small>
        </div>

        <div className="max-w-2xl mx-auto">
          <YoutubeInput />
        </div>
      </div>
    </div>
  );
}
