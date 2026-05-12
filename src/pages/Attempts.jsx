import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { courseAttemptAPI } from "@/services/api";
import { Loader2, Calendar, BookOpen, ChevronRight, Award, Trophy } from "lucide-react";
import { toast } from "sonner";

export default function Attempts() {
    const [, navigate] = useLocation();
    const [attempts, setAttempts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAttempts = async () => {
            try {
                const data = await courseAttemptAPI.getMyAttempts();
                setAttempts(data || []);
            } catch (error) {
                console.error("Denemeler yüklenemedi:", error);
                toast.error("Denemeleriniz yüklenemedi.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAttempts();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("tr-TR", {
            year: "numeric", month: "short", day: "numeric",
            hour: "2-digit", minute: "2-digit"
        });
    };

    const getScoreConfig = (score) => {
        if (score >= 80) return { text: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/20", label: "Mükemmel" };
        if (score >= 60) return { text: "text-amber-400", bg: "bg-amber-500/15 border-amber-500/20", label: "Yeterli" };
        return { text: "text-red-400", bg: "bg-red-500/15 border-red-500/20", label: "Geliştirilmeli" };
    };

    if (isLoading) {
        return (
            <DashboardLayout title="Denemelerim">
                <div className="flex flex-col justify-center items-center h-96 gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Denemeler yükleniyor...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Denemelerim">
            <div className="p-6 lg:p-8 space-y-6 animate-fade-in-up max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold heading-font text-foreground">Mülakat Geçmişi</h2>
                        <p className="text-muted-foreground text-sm">Geçmiş performansınızı ve yapay zeka değerlendirmelerini inceleyin.</p>
                    </div>
                </div>

                {attempts.length === 0 ? (
                    <div className="glass-card flex flex-col items-center justify-center p-16 text-center border border-border rounded-2xl">
                        <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mb-5 border border-border">
                            <BookOpen className="w-9 h-9 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-2">Henüz Deneme Yok</h3>
                        <p className="text-muted-foreground mb-6 max-w-sm text-sm leading-relaxed">
                            Henüz hiçbir eğitim mülakatını tamamlamadınız. İlk oturumunuzu başlatmak için Eğitimler bölümüne gidin.
                        </p>
                        <button
                            onClick={() => navigate("/courses")}
                            className="btn-gradient px-7 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-primary/20"
                        >
                            Eğitimlere Göz At
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {attempts.map((attempt) => {
                            const scoreConfig = getScoreConfig(attempt.totalScore);
                            return (
                                <div
                                    key={attempt.id}
                                    onClick={() => navigate(`/report/${attempt.id}`)}
                                    className="glass-card rounded-2xl p-5 border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 cursor-pointer group flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
                                >
                                    <div className="flex items-start gap-4 flex-1 min-w-0">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/10 group-hover:bg-primary/20 transition-colors">
                                            <BookOpen className="w-5 h-5 text-primary" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-base font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                                {attempt.course?.title || "Bilinmeyen Eğitim"}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1.5 bg-secondary px-2 py-1 rounded-md">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {formatDate(attempt.completedAt || attempt.startedAt)}
                                                </span>
                                                {attempt.course?.specialty && (
                                                    <span className="px-2.5 py-1 rounded-md bg-secondary border border-border font-medium">
                                                        {attempt.course.specialty}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                        <div className="flex flex-col items-end flex-1 sm:flex-auto">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                                                <Award className="w-3.5 h-3.5" />
                                                <span>Genel Puan</span>
                                            </div>
                                            <div className={`font-black text-xl px-3 py-1 rounded-xl border ${scoreConfig.bg} ${scoreConfig.text}`}>
                                                {attempt.totalScore} <span className="text-xs font-medium opacity-70">/ 100</span>
                                            </div>
                                        </div>
                                        <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-200">
                                            <ChevronRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
