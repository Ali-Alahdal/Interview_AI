/**
 * Loading Component — InterviewAI Platform
 * Design: Modern Dark SaaS / Deep Space Intelligence
 * Features: Animated processing stages, progress simulation, auto-redirect to Report
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useApp } from "@/contexts/AppContext";
import { Brain, CheckCircle2, Loader2 } from "lucide-react";
const PROCESSING_STAGES = [
    { label: "Ses kayıtları analiz ediliyor", duration: 1200 },
    { label: "Konuşma metne dönüştürülüyor", duration: 1000 },
    { label: "Yanıt kalitesi değerlendiriliyor", duration: 1400 },
    { label: "Rubrik kriterlerine göre puanlanıyor", duration: 1100 },
    { label: "Güçlü ve geliştirilecek alanlar belirleniyor", duration: 1300 },
    { label: "Kişiselleştirilmiş geri bildirim oluşturuluyor", duration: 1000 },
    { label: "Performans raporunuz derleniyor", duration: 800 },
];
export default function Loading() {
    const [, navigate] = useLocation();
    const { reportData } = useApp();
    const [currentStage, setCurrentStage] = useState(0);
    const [completedStages, setCompletedStages] = useState([]);
    const [progress, setProgress] = useState(0);
    useEffect(() => {
        let stageIndex = 0;
        let totalElapsed = 0;
        const totalDuration = PROCESSING_STAGES.reduce((a, s) => a + s.duration, 0);
        const runStage = () => {
            if (stageIndex >= PROCESSING_STAGES.length) {
                setProgress(100);
                setTimeout(() => {
                    const nextRoute = reportData?.attemptId ? `/report/${reportData.attemptId}` : "/attempts";
                    navigate(nextRoute);
                }, 600);
                return;
            }
            setCurrentStage(stageIndex);
            const stageDuration = PROCESSING_STAGES[stageIndex].duration;
            // Animate progress for this stage
            const startProgress = (totalElapsed / totalDuration) * 100;
            const endProgress = ((totalElapsed + stageDuration) / totalDuration) * 100;
            const steps = 20;
            const stepInterval = stageDuration / steps;
            let step = 0;
            const progressInterval = setInterval(() => {
                step++;
                const p = startProgress + ((endProgress - startProgress) * step) / steps;
                setProgress(Math.min(p, 99));
                if (step >= steps)
                    clearInterval(progressInterval);
            }, stepInterval);
            setTimeout(() => {
                setCompletedStages(prev => [...prev, stageIndex]);
                totalElapsed += stageDuration;
                stageIndex++;
                runStage();
            }, stageDuration);
        };
        runStage();
    }, [navigate]);
    return (<div className="min-h-screen bg-background flex items-center justify-center p-6">
      {/* Background orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/8 blur-3xl orb-float pointer-events-none"/>
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-cyan-500/8 blur-3xl orb-float pointer-events-none" style={{ animationDelay: "3s" }}/>

      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo & Title */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-xl shadow-blue-500/30">
              <Brain className="w-10 h-10 text-white"/>
            </div>
            {/* Spinning ring */}
            <div className="absolute -inset-2 rounded-3xl border-2 border-blue-500/30 animate-spin-slow"/>
            <div className="absolute -inset-4 rounded-[2rem] border border-cyan-500/15 animate-spin-slow" style={{ animationDirection: "reverse", animationDuration: "12s" }}/>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Mülakatınız Analiz Ediliyor</h1>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Yapay zekamız yanıtlarınızı dikkatlice inceliyor ve kapsamlı bir performans raporu oluşturuyor.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>İşleniyor</span>
            <span className="font-medium text-primary">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300" style={{ width: `${progress}%` }}/>
          </div>
        </div>

        {/* Processing Stages */}
        <div className="glass-card rounded-2xl border border-border p-5 space-y-3">
          {PROCESSING_STAGES.map((stage, i) => {
            const isCompleted = completedStages.includes(i);
            const isCurrent = i === currentStage && !isCompleted;
            const isPending = i > currentStage;
            return (<div key={i} className={`flex items-center gap-3 transition-all duration-300 ${isPending ? "opacity-30" : "opacity-100"}`}>
                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                  {isCompleted ? (<CheckCircle2 className="w-4 h-4 text-emerald-400"/>) : isCurrent ? (<Loader2 className="w-4 h-4 text-blue-600 animate-spin"/>) : (<div className="w-3 h-3 rounded-full border border-border"/>)}
                </div>
                <span className={`text-sm ${isCompleted ? "text-muted-foreground line-through" :
                    isCurrent ? "text-foreground font-medium" :
                        "text-muted-foreground"}`}>
                  {stage.label}
                </span>
              </div>);
        })}
        </div>

        {/* Loading dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <div className="w-2 h-2 rounded-full bg-blue-600 loading-dot"/>
          <div className="w-2 h-2 rounded-full bg-cyan-400 loading-dot"/>
          <div className="w-2 h-2 rounded-full bg-blue-600 loading-dot"/>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-3">
          Bu genellikle yaklaşık 10 saniye sürmektedir
        </p>
      </div>
    </div>);
}
