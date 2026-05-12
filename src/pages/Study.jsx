/**
 * Study Component — Öğrenme Yönetim Sistemi
 * Tasarım: Modern Glassmorphic / Derin Uzay Zekası
 */
import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useApp } from "@/contexts/AppContext";
import { courseAPI } from "@/services/api";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";

import {
    Play, ChevronLeft, Layers, BookOpen, Mic,
    ChevronRight, CheckCircle2, AlertCircle, HelpCircle
} from "lucide-react";

function getYouTubeEmbedUrl(url) {
    if (!url) return null;
    if (url.includes("youtube.com/embed/")) return url;
    const shortMatch = url.match(/youtu\.be\/([\w-]{11})/);
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
    const watchMatch = url.match(/[?&]v=([\w-]{11})/);
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
    return null;
}

export default function Study() {
    const params = useParams();
    const [, navigate] = useLocation();
    const { selectedCourse, selectCourse } = useApp();

    const [videoLoaded, setVideoLoaded] = useState(false);
    const [course, setCourse] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const fetchedCourse = await courseAPI.getById(params.courseId);
                setCourse(fetchedCourse);
                selectCourse(fetchedCourse);
                setQuestions(fetchedCourse.questions || []);
            } catch (error) {
                console.error("Ders verileri yüklenemedi:", error);
                toast.error("Ders bilgileri yüklenemedi.");
            } finally {
                setIsLoading(false);
            }
        };
        if (params.courseId) fetchData();
    }, [params.courseId, selectCourse]);

    if (isLoading) {
        return (
            <DashboardLayout title="Ders">
                <div className="flex flex-col justify-center items-center h-96 gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Ders yükleniyor...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (!course) {
        return (
            <DashboardLayout title="Ders">
                <div className="flex flex-col items-center justify-center h-96 gap-4">
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground font-medium">Eğitim bulunamadı.</p>
                    <Button variant="outline" onClick={() => navigate("/courses")} className="border-primary/30 text-primary hover:bg-primary/10">
                        Eğitimlere Dön
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    const handleStartInterview = () => {
        if (questions.length > 0) {
            navigate(`/interview/${params.courseId}`);
        } else {
            toast.error("Bu eğitim için henüz soru eklenmemiş.");
        }
    };



    return (
        <DashboardLayout title={course.title}>
            <div className="p-6 lg:p-8 animate-fade-in-up">
                {/* Breadcrumb */}
                <button
                    onClick={() => navigate("/courses")}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6 group"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    Eğitim Kütüphanesine Dön
                </button>

                <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* ── Main Content ────────────────────────────── */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Video Player */}
                        <div className="rounded-2xl overflow-hidden bg-black border border-border aspect-video relative shadow-2xl shadow-black/30">
                            {!videoLoaded && (
                                <div
                                    className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer group"
                                    style={{
                                        backgroundImage: `url(https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&q=80)`,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                    }}
                                    onClick={() => setVideoLoaded(true)}
                                >
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                                    <div className="relative z-10 flex flex-col items-center gap-4">
                                        <div className="w-20 h-20 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-2xl shadow-primary/40 group-hover:scale-110 transition-transform duration-300">
                                            <Play className="w-9 h-9 text-white ml-1" />
                                        </div>
                                        <span className="text-white text-sm font-semibold bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                                            Videoyu İzle
                                        </span>
                                    </div>
                                </div>
                            )}
                            {videoLoaded && (
                                <iframe
                                    src={getYouTubeEmbedUrl(course.youTubeVideoUrl || course.videoUrl) || "https://www.youtube.com/embed/dQw4w9WgXcQ"}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    title={course.title}
                                />
                            )}
                        </div>

                        {/* Questions List */}
                        <div>
                            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                                <HelpCircle className="w-4 h-4 text-primary" />
                                Mülakat Soruları
                                <span className="ml-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">{questions.length}</span>
                            </h3>
                            <div className="space-y-3">
                                {questions.length === 0 ? (
                                    <div className="glass-card rounded-2xl border border-border p-10 text-center">
                                        <HelpCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                                        <p className="text-sm text-muted-foreground">Bu eğitim için henüz soru eklenmemiş.</p>
                                    </div>
                                ) : questions.map((q, i) => (
                                    <div key={q.id} className="glass-card rounded-xl border border-border p-5 hover:border-primary/30 transition-all duration-200">
                                        <div className="flex items-start gap-4">
                                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 border border-primary/20">
                                                <span className="text-xs font-bold text-primary">{i + 1}</span>
                                            </div>
                                            <p className="text-sm text-foreground leading-relaxed font-medium">{q.content || q.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>


                    {/* ── Sidebar ──────────────────────────────────── */}
                    <div className="space-y-5">
                        {/* Course Info Card */}
                        <div className="glass-card rounded-2xl border border-border p-6 space-y-5">
                            <div>
                                <h3 className="text-base font-bold text-foreground mb-1">{course.title}</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">{course.description}</p>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { icon: <BookOpen className="w-3.5 h-3.5" />, label: "Kategori", value: course.specialty || course.category || "Genel" },
                                    { icon: <Layers className="w-3.5 h-3.5" />, label: "Soru Sayısı", value: questions.length },
                                ].map(item => (
                                    <div key={item.label} className="flex items-center justify-between text-xs py-2 border-b border-border last:border-0">
                                        <span className="flex items-center gap-2 text-muted-foreground">
                                            <span className="text-primary/60">{item.icon}</span>
                                            {item.label}
                                        </span>
                                        <span className="font-semibold text-foreground">
                                            {item.value}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Progress */}
                            {course.completionRate !== undefined && course.completionRate > 0 && (
                                <div className="pt-1">
                                    <div className="flex items-center justify-between text-xs mb-2">
                                        <span className="text-muted-foreground font-medium">İlerlemeniz</span>
                                        <span className="text-primary font-bold">{course.completionRate}%</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-700"
                                            style={{ width: `${course.completionRate}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Start Interview CTA */}
                        <div className="glass-card rounded-2xl border border-primary/30 p-6 bg-gradient-to-br from-primary/10 via-blue-500/5 to-cyan-500/10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/20">
                                    <Mic className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-foreground">Pratik yapmaya hazır mısınız?</div>
                                    <div className="text-xs text-muted-foreground">{questions.length} soru sizi bekliyor</div>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
                                Yapay zeka destekli mock mülakat başlatın. Cevaplarınız kaydedilecek, metne dönüştürülecek ve gerçek zamanlı olarak değerlendirilecektir.
                            </p>
                            <div className="space-y-2 mb-5">
                                {[
                                    "Ses kaydı etkinleştirildi",
                                    "Gerçek zamanlı transkripsiyon",
                                    "Yapay zeka değerlendirmesi ve puanlaması",
                                ].map(item => (
                                    <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                                        {item}
                                    </div>
                                ))}
                            </div>
                            <Button
                                onClick={handleStartInterview}
                                className="w-full btn-gradient font-bold text-sm h-11 shadow-lg shadow-primary/25"
                                disabled={questions.length === 0}
                            >
                                <Mic className="w-4 h-4 mr-2" />
                                Mülakatı Başlat
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                            {questions.length === 0 && (
                                <p className="text-xs text-center text-muted-foreground mt-2">Bu eğitime henüz soru eklenmemiş</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
