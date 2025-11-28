"use client";

import {
  Mic,
  FileText,
  Copy,
  Loader2,
  PlayCircle,
  Eye,
  Code,
  Check,
  Sparkles,
  Loader,
  Bot,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface TranscriptionResult {
  content: string;
  lang: string;
  availableLangs?: string[];
}

export default function YoutubeInput() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcription, setTranscription] =
    useState<TranscriptionResult | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      setError("Por favor ingresa una URL de YouTube");
      return;
    }

    setLoading(true);
    setError(null);
    setTranscription(null);

    try {
      const response = await fetch(
        `/api/process-video?url=${encodeURIComponent(url)}&lang=es`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al procesar el video");
      }

      setTranscription(data);
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al procesar el video");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!transcription?.content) return;
    navigator.clipboard.writeText(transcription.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const generateSummary = async () => {
    if (!transcription?.content) return;

    setIsGeneratingSummary(true);
    setSummary(null);
    setSummaryError(null);

    try {
      const response = await fetch("/api/generate-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: transcription.content,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al generar el resumen");
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (err: any) {
      setSummaryError(err.message || "Ocurrió un error al generar el resumen");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="flex items-center justify-center mb-2">
        <PlayCircle className="w-8 h-8 mr-2  text-blue-600" />
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Resumidor de Videos
        </h1>
      </div>
      <p className="text-center text-gray-600 mb-8">
        Transcribe y resume videos de YouTube en segundos
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <label
            htmlFor="youtube-url"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            URL del video de YouTube
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="youtube-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  Transcribir
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}

      {transcription && (
        <div className="mt-8 bg-gray-50 rounded-xl p-6 shadow-inner">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
              <FileText className="text-blue-600" />
              Transcripción
            </h2>
            <div className="flex flex-wrap gap-2 action-buttons">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {transcription.lang.toUpperCase()}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowRaw(!showRaw)}
                  className="p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-gray-100 transition-colors relative group"
                  title={showRaw ? "Ver texto formateado" : "Ver JSON"}
                >
                  {showRaw ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <Code className="w-5 h-5" />
                  )}
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {showRaw ? "Ver texto" : "Ver JSON"}
                  </span>
                </button>
                <button
                  onClick={copyToClipboard}
                  className="p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-gray-100 transition-colors relative group"
                  title="Copiar al portapapeles"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {copied ? "¡Copiado!" : "Copiar texto"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="relative">
            <div
              ref={scrollContainerRef}
              className="scroll-container text-neutral-600 bg-white p-6 rounded-lg border border-gray-200 shadow-sm max-h-96 overflow-y-auto fade-scroll"
            >
              {showRaw ? (
                <pre className="text-sm bg-gray-50 p-4 rounded">
                  {JSON.stringify(transcription, null, 2)}
                </pre>
              ) : (
                <div className="prose max-w-none text-gray-700 space-y-4">
                  {transcription.content.split("\n").map((paragraph, index) => (
                    <p key={index} className="leading-relaxed">
                      {paragraph || <br />}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {transcription && !showRaw && (
        <div className="mt-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 shadow-inner border border-blue-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
              <Sparkles className="text-purple-600" />
              Resumen Ejecutivo
            </h2>
            <button
              onClick={generateSummary}
              disabled={isGeneratingSummary}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isGeneratingSummary ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generar Resumen
                </>
              )}
            </button>
          </div>

          {summaryError && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg">
              <p className="font-medium">Error</p>
              <p>{summaryError}</p>
            </div>
          )}

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            {summary ? (
              <div
                className="prose max-w-none text-gray-700"
                dangerouslySetInnerHTML={{
                  __html: summary.replace(/\n/g, "<br />"),
                }}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>
                  Haz clic en "Generar Resumen" para obtener un análisis
                  ejecutivo del video.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
