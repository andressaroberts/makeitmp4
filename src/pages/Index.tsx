import { VideoConverter } from "@/components/VideoConverter";
import { Video } from "lucide-react";
import { Instagram } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <header className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-primary to-accent p-2.5">
            <Video className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            MakeItMP4
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Convert WebM to MP4
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Convert your webm videos instantly, right in your browser.
          </p>
        </div>

        <VideoConverter />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="font-semibold">100% private</h3>
            <p className="text-sm text-muted-foreground">
              Everything happens in your browser. Your videos never leave your
              device.
            </p>
          </div>

          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="font-semibold">Lightning fast</h3>
            <p className="text-sm text-muted-foreground">
              Powered by FFmpeg WebAssembly for optimal performance.
            </p>
          </div>

          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <span className="text-2xl">✨</span>
            </div>
            <h3 className="font-semibold">No quality loss</h3>
            <p className="text-sm text-muted-foreground">
              High-quality conversion preserving your original video quality.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export const Footer = () => {
  return (
    <footer className="container mx-auto px-4 py-8 mt-16 text-center text-sm text-muted-foreground border-t border-border">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <p className="text-center italic">
          No rights reserved — feel free to use and share 💫
        </p>
      </div>

      <div className="mt-4 flex justify-center">
        <a
          href="https://instagram.com/labducky"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <Instagram className="h-5 w-5" />
          <span>@labducky</span>
        </a>
      </div>
    </footer>
  );
};

export default Index;
