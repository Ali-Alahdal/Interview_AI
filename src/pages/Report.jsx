/**
 * Report Component — Öğrenme Yönetim Sistemi
 * Performans raporu ve yapay zeka geri bildirimi
 */
import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useApp } from "@/contexts/AppContext";
import { courseAttemptAPI } from "@/services/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
    ChevronDown, ChevronUp, RotateCcw, BookOpen, Loader2,
    Trophy, TrendingUp, AlertTriangle, Lightbulb, CheckCircle, Star
} from "lucide-react";

// ─── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score }) {
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const color = score >= 80 ? "#10B981" : score >= 60 ? "#F59E0B" : "#F43F5E";
    const label = score >= 80 ? "Mükemmel" : score >= 70 ? "İyi" : score >= 60 ? "Yeterli" : "Geliştirilmeli";

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-36 h-36">
                <svg className="w-36 h-36 -rotate-90" viewBox="0 0 128 128">
                    <circle cx="64" cy="64" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-secondary" />
                    <circle
                        cx="64" cy="64" r={radius} fill="none"
                        stroke={color} strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-foreground">{score}</span>
                    <span className="text-xs text-muted-foreground font-medium">/ 100</span>
                </div>
            </div>
            <div
                className="mt-3 px-4 py-1.5 rounded-full text-xs font-bold border"
                style={{ color, backgroundColor: `${color}15`, borderColor: `${color}30` }}
            >
                {label}
            </div>
        </div>
    );
}

// ─── Question Item ────────────────────────────────────────────────────────────
function QuestionItem({ item, index }) {
    const [expanded, setExpanded] = useState(false);
    const color = item.score >= 80 ? "text-emerald-400" : item.score >= 60 ? "text-amber-400" : "text-red-400";
    const bg = item.score >= 80 ? "bg-emerald-500/10 border-emerald-500/20" : item.score >= 60 ? "bg-amber-500/10 border-amber-500/20" : "bg-red-500/10 border-red-500/20";

    return (
        <div className="glass-card rounded-xl border border-border overflow-hidden hover:border-primary/20 transition-all duration-200">
            <button
                onClick={() => setExpanded(p => !p)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors text-left"
            >
                <div className="flex items-start gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5 border border-primary/20">
                        <span className="text-xs font-bold text-primary">{index + 1}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground line-clamp-1">{item.question}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    <div className={`text-sm font-bold px-3 py-1 rounded-lg border ${bg} ${color}`}>
                        {item.score}%
                    </div>
                    {expanded
                        ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    }
                </div>
            </button>
            {expanded && (
                <div className="px-5 py-4 border-t border-border bg-secondary/20">
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.generalFeedback}</p>
                </div>
            )}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Report() {
    const params = useParams();
    const [, navigate] = useLocation();
    const { reportData } = useApp();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const processReport = async () => {
            const currentAttemptId = params.attemptId || reportData?.attemptId;

            if (!currentAttemptId) {
                setData({
                    sessionId: "demo",
                    courseTitle: reportData?.courseTitle || "Mülakat Oturumu",
                    overallScore: 78,
                    completedAt: new Date().toISOString(),
                    strengths: ["Açık iletişim stili", "Güçlü teknik bilgi", "İyi örnek kullanımı"],
                    weaknesses: ["Yanıtlarda ölçülebilir sonuçlar eksikti", "Özlülük geliştirilebilir"],
                    suggestions: ["STAR yöntemini pratik yapın", "Etkiyi metriklerle ölçün", "Dolgu kelimelerini azaltın"],
                    questionBreakdown: [
                        { questionId: "q1", question: "Çözdüğünüz zorlu bir teknik problemi anlatın.", score: 82, generalFeedback: "Net yapı ve iyi örneklerle güçlü bir yanıt." },
                        { questionId: "q2", question: "Sistem tasarımına nasıl yaklaşırsınız?", score: 75, generalFeedback: "İyi kapsam ancak trade-off'larda derinlik eksikti." },
                        { questionId: "q3", question: "Bir ekibe liderlik ettiğiniz bir durumu anlatın.", score: 88, generalFeedback: "Net sonuçlarla mükemmel STAR yöntemi kullanımı." },
                    ],
                });
                setIsLoading(false);
                return;
            }

            try {
                const attempt = await courseAttemptAPI.getById(currentAttemptId);
                const allStrengths = [];
                const allWeaknesses = [];
                const allSuggestions = [];
                const breakdowns = [];

                if (attempt.questionAttempts) {
                    for (const qa of attempt.questionAttempts) {
                        if (qa.strengths) allStrengths.push(...qa.strengths);
                        if (qa.weaknesses) allWeaknesses.push(...qa.weaknesses);
                        if (qa.suggestions) allSuggestions.push(...qa.suggestions);
                        breakdowns.push({
                            questionId: qa.questionId,
                            question: qa.question?.content || qa.question?.text || "Soru " + (breakdowns.length + 1),
                            score: qa.score,
                            generalFeedback: qa.generalFeedback
                        });
                    }
                }

                setData({
                    sessionId: attempt.id,
                    courseTitle: attempt.course?.title || "Mülakat Oturumu",
                    overallScore: attempt.totalScore || 0,
                    completedAt: attempt.completedAt || new Date().toISOString(),
                    strengths: allStrengths,
                    weaknesses: allWeaknesses,
                    suggestions: allSuggestions,
                    questionBreakdown: breakdowns,
                });
            } catch (error) {
                console.error("[Rapor] İşleme hatası:", error);
            } finally {
                setIsLoading(false);
            }
        };
        processReport();
    }, [params.attemptId, reportData?.attemptId]);

    if (isLoading || !data) {
        return (
            <DashboardLayout title="Performans Raporu">
                <div className="flex flex-col justify-center items-center h-96 gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Rapor hazırlanıyor...</p>
                </div>
            </DashboardLayout>
        );
    }

    const formattedDate = new Date(data.completedAt).toLocaleDateString("tr-TR", {
        year: "numeric", month: "long", day: "numeric"
    });

    return (
        <DashboardLayout title="Performans Raporu">
            <div className="p-6 lg:p-8 space-y-6 animate-fade-in-up max-w-4xl">
                {/* ── Header ──────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Trophy className="w-5 h-5 text-amber-400" />
                            <h2 className="text-2xl font-bold heading-font text-foreground">Performans Raporu</h2>
                        </div>
                        <p className="text-sm text-muted-foreground">{data.courseTitle} · {formattedDate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigate("/courses")} className="text-xs h-9 border-border hover:border-primary/30 hover:text-primary">
                            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                            Tekrar Dene
                        </Button>
                        <Button size="sm" onClick={() => navigate("/courses")} className="btn-gradient text-xs h-9">
                            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                            Yeni Eğitim
                        </Button>
                    </div>
                </div>

                {/* ── Score Section ────────────────────────────── */}
                <div className="glass-card rounded-2xl border border-border p-8">
                    <div className="flex flex-col sm:flex-row items-center gap-8">
                        <div className="flex-shrink-0">
                            <ScoreRing score={data.overallScore} />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <h3 className="text-xl font-bold text-foreground mb-2">Genel Puanınız</h3>
                            <p className="text-muted-foreground leading-relaxed text-sm">
                                Bu mülakat oturumunda <span className="font-bold text-foreground">{data.overallScore}</span> / 100 puan aldınız.
                                Güçlü yönlerinizi ve geliştirilmesi gereken alanları aşağıda inceleyebilirsiniz.
                            </p>
                            <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
                                {data.overallScore >= 80 && (
                                    <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                                        <Star className="w-3 h-3 fill-current" /> Üst Düzey Performans
                                    </span>
                                )}
                                <span className="text-xs bg-secondary text-muted-foreground border border-border px-3 py-1 rounded-full font-semibold">
                                    {data.questionBreakdown.length} Soru Değerlendirildi
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Strengths & Weaknesses ───────────────────── */}
                <div className="grid sm:grid-cols-2 gap-5">
                    {/* Güçlü Yönler */}
                    <div className="glass-card rounded-2xl border border-emerald-500/20 p-6 bg-emerald-500/5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                            </div>
                            <h3 className="text-sm font-bold text-foreground">Güçlü Yönler</h3>
                        </div>
                        {data.strengths.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic">Yapay zeka analizi bekleniyor...</p>
                        ) : (
                            <ul className="space-y-2.5">
                                {data.strengths.map((s, i) => (
                                    <li key={i} className="flex items-start gap-2.5">
                                        <span className="text-emerald-400 font-bold mt-0.5 flex-shrink-0">✓</span>
                                        <span className="text-sm text-muted-foreground leading-relaxed">{s}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Geliştirilmesi Gereken Alanlar */}
                    <div className="glass-card rounded-2xl border border-amber-500/20 p-6 bg-amber-500/5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-amber-400" />
                            </div>
                            <h3 className="text-sm font-bold text-foreground">Geliştirilecek Alanlar</h3>
                        </div>
                        {data.weaknesses.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic">Yapay zeka analizi bekleniyor...</p>
                        ) : (
                            <ul className="space-y-2.5">
                                {data.weaknesses.map((w, i) => (
                                    <li key={i} className="flex items-start gap-2.5">
                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-muted-foreground leading-relaxed">{w}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* ── Suggestions ──────────────────────────────── */}
                <div className="glass-card rounded-2xl border border-blue-500/20 p-6 bg-primary/5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                            <Lightbulb className="w-4 h-4 text-primary" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground">Öneriler</h3>
                    </div>
                    {data.suggestions.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">Yapay zeka önerileri bekleniyor...</p>
                    ) : (
                        <ul className="space-y-2.5">
                            {data.suggestions.map((s, i) => (
                                <li key={i} className="flex items-start gap-2.5">
                                    <ChevronRight className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-muted-foreground leading-relaxed">{s}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* ── Question Breakdown ───────────────────────── */}
                <div className="glass-card rounded-2xl border border-border p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center border border-border">
                            <BookOpen className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground">Soru Soru Değerlendirme</h3>
                    </div>
                    {data.questionBreakdown.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">Henüz puanlanan cevap yok. Yapay zeka yanıtlarınızı hâlâ işliyor olabilir.</p>
                    ) : (
                        <div className="space-y-3">
                            {data.questionBreakdown.map((item, i) => (
                                <QuestionItem key={i} item={item} index={i} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
