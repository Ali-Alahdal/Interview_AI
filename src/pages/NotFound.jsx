import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Brain, Home } from "lucide-react";
export default function NotFound() {
    const [, navigate] = useLocation();
    return (<div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-blue-500/8 blur-3xl orb-float pointer-events-none"/>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-cyan-500/8 blur-3xl orb-float pointer-events-none" style={{ animationDelay: "3s" }}/>

      <div className="text-center animate-fade-in-up max-w-md">
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-xl shadow-blue-500/30">
            <Brain className="w-7 h-7 text-white"/>
          </div>
        </div>
        <div className="text-8xl font-bold gradient-text mb-4 leading-none">404</div>
        <h1 className="text-2xl font-bold text-foreground mb-3">Sayfa bulunamadı</h1>
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          Aradığınız sayfa mevcut değil veya taşınmış.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => navigate("/login")} className="btn-gradient font-semibold">
            <Home className="w-4 h-4 mr-2"/>
            Ana Sayfaya Dön
          </Button>
        </div>
      </div>
    </div>);
}
