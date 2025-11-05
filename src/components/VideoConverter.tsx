import { useState, useRef, useCallback, useEffect } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import {
  Upload,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

export const VideoConverter = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [convertedFile, setConvertedFile] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const [fileName, setFileName] = useState("");

  const ffmpegRef = useRef(new FFmpeg());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if browser supports SharedArrayBuffer
    const supported =
      typeof SharedArrayBuffer !== "undefined" && crossOriginIsolated;

    if (!supported) {
      console.warn(
        "SharedArrayBuffer not available. FFmpeg may not work properly."
      );
    }
  }, []);

  const loadFFmpeg = useCallback(async () => {
    const ffmpeg = ffmpegRef.current;
    if (ffmpeg.loaded) {
      console.log("FFmpeg já carregado");
      return;
    }

    setIsLoading(true);
    console.log("Iniciando carregamento do FFmpeg...");

    try {
      // Try multiple CDN sources
      const cdnOptions = [
        "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm",
        "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm",
      ];

      let loaded = false;
      let lastError = null;

      for (const baseURL of cdnOptions) {
        try {
          console.log("Tentando carregar de:", baseURL);

          await ffmpeg.load({
            coreURL: await toBlobURL(
              `${baseURL}/ffmpeg-core.js`,
              "text/javascript"
            ),
            wasmURL: await toBlobURL(
              `${baseURL}/ffmpeg-core.wasm`,
              "application/wasm"
            ),
          });

          console.log("FFmpeg carregado com sucesso de:", baseURL);
          loaded = true;
          break;
        } catch (err) {
          console.warn("Falha ao carregar de", baseURL, ":", err);
          lastError = err;
        }
      }

      if (!loaded) {
        throw lastError || new Error("Não foi possível carregar o FFmpeg");
      }

      ffmpeg.on("progress", ({ progress: p }) => {
        console.log("Progresso:", p);
        setProgress(Math.round(p * 100));
      });

      ffmpeg.on("log", ({ message }) => {
        console.log("FFmpeg log:", message);
      });
    } catch (error) {
      console.error("Erro ao carregar FFmpeg:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";

      if (
        errorMessage.includes("SharedArrayBuffer") ||
        errorMessage.includes("cross-origin")
      ) {
        toast({
          title: "Unsupported browser",
          description:
            "Your browser or environment does not support video conversion. Try Chrome/Edge or download the app.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error loading converter",
          description: "Failed to load converter. Please reload the page.",
          variant: "destructive",
        });
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const convertVideo = useCallback(
    async (file: File) => {
      console.log(
        "Iniciando conversão:",
        file.name,
        "Tipo:",
        file.type,
        "Tamanho:",
        file.size
      );

      if (!file.type.includes("webm")) {
        toast({
          title: "Invalid file type",
          description: "Please upload a .webm video file.",
          variant: "destructive",
        });
        return;
      }

      try {
        console.log("Carregando FFmpeg...");
        await loadFFmpeg();
        const ffmpeg = ffmpegRef.current;
        console.log("FFmpeg carregado, iniciando conversão...");

        setIsConverting(true);
        setProgress(0);
        setFileName(file.name);

        const inputName = "input.webm";
        const outputName = "output.mp4";

        console.log("Escrevendo arquivo de entrada...");
        await ffmpeg.writeFile(inputName, await fetchFile(file));
        console.log("Arquivo escrito, iniciando conversão...");

        await ffmpeg.exec([
          "-i",
          inputName,
          "-c:v",
          "libx264",
          "-preset",
          "medium",
          "-crf",
          "23",
          "-c:a",
          "aac",
          "-b:a",
          "128k",
          outputName,
        ]);

        console.log("Conversão completa, lendo arquivo de saída...");
        const data = await ffmpeg.readFile(outputName);
        console.log("Arquivo lido, criando blob...");
        const blob = new Blob([data as BlobPart], { type: "video/mp4" });
        const url = URL.createObjectURL(blob);

        const outputFileName = file.name.replace(/\.webm$/i, ".mp4");
        setConvertedFile({ url, name: outputFileName });

        console.log("Sucesso!");
        toast({
          title: "Conversion complete!",
          description: "Your video is ready for download.",
        });
      } catch (error) {
        console.error("Conversion failed:", error);
        toast({
          title: "Conversion failed",
          description:
            "An error occurred during conversion. Try again or use a smaller video.",
          variant: "destructive",
        });
      } finally {
        setIsConverting(false);
        setProgress(0);
      }
    },
    [loadFFmpeg, toast]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        convertVideo(file);
      }
    },
    [convertVideo]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        convertVideo(file);
      }
    },
    [convertVideo]
  );

  const handleDownload = useCallback(() => {
    if (!convertedFile) return;

    const a = document.createElement("a");
    a.href = convertedFile.url;
    a.download = convertedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [convertedFile]);

  const handleReset = useCallback(() => {
    if (convertedFile?.url) {
      URL.revokeObjectURL(convertedFile.url);
    }
    setConvertedFile(null);
    setFileName("");
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [convertedFile]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {!isConverting && !convertedFile && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative overflow-hidden rounded-2xl border-2 border-dashed p-12 text-center transition-all
            ${
              isDragging
                ? "border-primary bg-primary/5 scale-[1.02]"
                : "border-border bg-card hover:border-primary/50 hover:bg-card/80"
            }
          `}
          style={{
            boxShadow: isDragging ? "var(--shadow-glow)" : "var(--shadow-soft)",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".webm,video/webm"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-4">
            <div
              className={`
              rounded-full p-6 transition-all
              ${isDragging ? "bg-primary/20" : "bg-secondary"}
            `}
            >
              <Upload
                className={`h-12 w-12 transition-colors ${
                  isDragging ? "text-primary" : "text-muted-foreground"
                }`}
              />
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                {isDragging ? "Drop your video here" : "Upload webm video"}
              </h3>
              <p className="text-muted-foreground mb-4">
                Drag and drop or click to select
              </p>

              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="rounded-full px-8"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading converter...
                  </>
                ) : (
                  "Select File"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {isConverting && (
        <div
          className="rounded-2xl border bg-card p-8"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          <div className="flex flex-col items-center gap-6">
            <div className="rounded-full bg-primary/20 p-6">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>

            <div className="w-full space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">Converting {fileName}</p>
                <span className="text-sm text-muted-foreground">
                  {progress}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <p className="text-sm text-muted-foreground">
              This may take a few moments depending on file size
            </p>
          </div>
        </div>
      )}

      {convertedFile && (
        <div
          className="rounded-2xl border bg-card p-8"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          <div className="flex flex-col items-center gap-6">
            <div className="rounded-full bg-primary/20 p-6">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>

            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">
                Conversion complete!
              </h3>
              <p className="text-muted-foreground">{convertedFile.name}</p>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <Button
                onClick={handleDownload}
                className="flex-1 sm:flex-none rounded-full px-8"
              >
                <Download className="mr-2 h-4 w-4" />
                Download MP4
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="flex-1 sm:flex-none rounded-full"
              >
                Convert another
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
