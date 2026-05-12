/**
 * Interview Component — Öğrenme Yönetim Sistemi
 * Özellikler: Ses kaydı, Konuşma-metin dönüşümü, Soru navigasyonu, Geri sayım zamanlayıcısı
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { useApp } from "@/contexts/AppContext";
import { courseAPI, courseAttemptAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import {
    Mic, Square, ChevronRight, ChevronLeft, Clock, AlertCircle,
    Edit3, CheckCircle2, Brain, Volume2, Loader2, Send, X
} from "lucide-react";
import { toast } from "sonner";

// ─── Waveform Visualizer ──────────────────────────────────────────────────────
function WaveformVisualizer({ isActive }) {
    const bars = 24;
    return (
        <div className="flex items-center justify-center gap-0.5 h-12">
            {Array.from({ length: bars }).map((_, i) => (
                <div
                    key={i}
                    className={`w-1.5 rounded-full transition-all ${
                        isActive ? "bg-primary waveform-bar" : "bg-muted-foreground/20"
                    }`}
                    style={{
                        height: isActive ? undefined : "4px",
                        animationDelay: isActive ? `${(i * 0.05) % 0.8}s` : undefined,
                        animationDuration: isActive ? `${0.6 + (i % 5) * 0.1}s` : undefined,
                    }}
                />
            ))}
        </div>
    );
}

// ─── Countdown Timer ──────────────────────────────────────────────────────────
function CountdownTimer({ seconds, onExpire }) {
    const [remaining, setRemaining] = useState(seconds);
    useEffect(() => { setRemaining(seconds); }, [seconds]);
    useEffect(() => {
        if (remaining <= 0) { onExpire(); return; }
        const id = setInterval(() => setRemaining(p => p - 1), 1000);
        return () => clearInterval(id);
    }, [remaining, onExpire]);

    const pct = (remaining / seconds) * 100;
    const color = remaining > 60 ? "text-emerald-400" : remaining > 30 ? "text-amber-400" : "text-red-500";
    const ringColor = remaining > 60 ? "stroke-emerald-400" : remaining > 30 ? "stroke-amber-400" : "stroke-red-500";
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;

    return (
        <div className="flex items-center gap-3">
            <div className="relative w-11 h-11">
                <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-secondary" />
                    <circle cx="18" cy="18" r="15" fill="none" strokeWidth="2.5" strokeDasharray={`${pct * 0.942} 94.2`} strokeLinecap="round" className={`${ringColor} transition-all duration-1000`} />
                </svg>
                <div className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${color}`}>
                    {mins > 0 ? `${mins}d` : `${secs}s`}
                </div>
            </div>
            <div className="text-xs text-muted-foreground font-medium">
                {mins}:{String(secs).padStart(2, "0")} kaldı
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Interview() {
    const params = useParams();
    const [, navigate] = useLocation();
    const { user, setReportData } = useApp();
    const courseId = params.courseId;

    const [course, setCourse] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [isEvaluating, setIsEvaluating] = useState(false);
    const attemptIdRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [startError, setStartError] = useState(false);

    const [currentIdx, setCurrentIdx] = useState(0);
    const [recordingState, setRecordingState] = useState("idle");
    const [transcript, setTranscript] = useState("");
    const [editedText, setEditedText] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [submitted, setSubmitted] = useState(new Set());
    const [timerKey, setTimerKey] = useState(0);

    const mediaRecorderRef = useRef(null);
    const recognitionRef = useRef(null);
    const audioChunksRef = useRef([]);
    const streamRef = useRef(null);

    const currentQuestion = questions[currentIdx];

    // Fetch data
    useEffect(() => {
        const initInterview = async () => {
            try {
                setIsLoading(true);
                setStartError(false);
                const fetchedCourse = await courseAPI.getById(courseId);
                setCourse(fetchedCourse);
                setQuestions(fetchedCourse.questions || []);
                if (!fetchedCourse.questions || fetchedCourse.questions.length === 0) {
                    toast.error("Bu eğitim için soru bulunamadı.");
                    setStartError(true);
                    return;
                }
                const attemptData = await courseAttemptAPI.start({ courseId });
                attemptIdRef.current = attemptData.id;
            } catch (error) {
                console.error("[Mülakat] Başlatma hatası:", error);
                toast.error("Mülakat soruları yüklenemedi veya oturum başlatılamadı.");
                setStartError(true);
            } finally {
                setIsLoading(false);
            }
        };
        if (courseId) initInterview();
    }, [courseId]);

    useEffect(() => {
        setTranscript("");
        setEditedText("");
        setIsEditing(false);
        setRecordingState("idle");
        setTimerKey(k => k + 1);
    }, [currentIdx]);

    useEffect(() => { return () => { stopRecording(); }; }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        }
        if (recognitionRef.current) recognitionRef.current.stop();
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
    }, []);

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            audioChunksRef.current = [];
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
            mediaRecorder.start(100);
            const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognitionAPI) {
                const recognition = new SpeechRecognitionAPI();
                recognitionRef.current = recognition;
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = "tr-TR";
                let finalTranscript = "";
                recognition.onresult = (event) => {
                    let interim = "";
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const result = event.results[i];
                        if (result.isFinal) finalTranscript += result[0].transcript + " ";
                        else interim += result[0].transcript;
                    }
                    setTranscript(finalTranscript + interim);
                    setEditedText(finalTranscript + interim);
                };
                recognition.onerror = (e) => {
                    if (e.error !== "no-speech") toast.error("Konuşma tanıma hatası: " + e.error);
                };
                recognition.start();
            } else {
                toast.info("Bu tarayıcı konuşma tanımayı desteklemiyor. Cevabınızı manuel olarak yazabilirsiniz.");
            }
            setRecordingState("recording");
        } catch (err) {
            toast.error("Mikrofon erişimi reddedildi. Bu özelliği kullanmak için mikrofon erişimine izin verin.");
        }
    }, []);

    const handleStopRecording = useCallback(() => {
        setRecordingState("processing");
        stopRecording();
        setTimeout(() => { setRecordingState("done"); setIsEditing(true); }, 800);
    }, [stopRecording]);

    const handleTimerExpire = useCallback(() => {
        if (recordingState === "recording") {
            handleStopRecording();
            toast.warning("Süre doldu! Kayıt otomatik olarak durduruldu.");
        }
    }, [recordingState, handleStopRecording]);

    const handleSubmitAnswer = async () => {
        if (!currentQuestion) return;
        const finalAnswer = (editedText.trim() || transcript.trim()) || " ";
        setAnswers(prev => ({ ...prev, [currentQuestion.id]: finalAnswer }));
        setSubmitted(prev => { const next = new Set(prev); next.add(currentQuestion.id); return next; });
        toast.success("Cevap kaydedildi!");
        if (currentIdx < questions.length - 1) {
            setTimeout(() => setCurrentIdx(i => i + 1), 400);
        }
    };

    const handleFinishInterview = async () => {
        setIsEvaluating(true);
        try {
            if (!attemptIdRef.current) { toast.error("Oturum hatası: deneme başlatılmadı."); return; }
            for (const question of questions) {
                const answer = answers[question.id];
                if (answer) {
                    try {
                        await courseAttemptAPI.submitAnswer(attemptIdRef.current, { questionId: question.id, answer });
                    } catch (e) {
                        console.error(`Cevap gönderilemedi: ${question.id}`, e);
                    }
                }
            }
            await courseAttemptAPI.complete(attemptIdRef.current);
            setReportData({ attemptId: attemptIdRef.current });
            navigate("/loading");
        } catch (error) {
            console.error("[Mülakat] Değerlendirme hatası:", error);
            toast.error("Değerlendirme raporu oluşturulamadı.");
        } finally {
            setIsEvaluating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Mülakat hazırlanıyor...</p>
            </div>
        );
    }

    if (!course || questions.length === 0 || !currentQuestion) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-5 glass-card rounded-2xl border border-border p-10 max-w-sm mx-4">
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto">
                        <AlertCircle className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground font-medium">Eğitim veya sorular bulunamadı.</p>
                    <Button variant="outline" onClick={() => navigate("/courses")} className="border-primary/30 text-primary hover:bg-primary/10">
                        Eğitimlere Dön
                    </Button>
                </div>
            </div>
        );
    }

    const progress = ((currentIdx + 1) / questions.length) * 100;
    const isCurrentSubmitted = submitted.has(currentQuestion.id);
    const allSubmitted = questions.every(q => submitted.has(q.id));

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* ── Header ─────────────────────────────────────── */}
            <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/30">
                        <Brain className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <span className="text-sm font-bold text-foreground">Mock Mülakat</span>
                        <span className="text-xs text-muted-foreground ml-2">— {course.title}</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs font-medium text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
                        Soru {currentIdx + 1} / {questions.length}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/courses")}
                        className="text-xs border-border text-muted-foreground hover:text-foreground h-8 gap-1"
                    >
                        <X className="w-3.5 h-3.5" />
                        Çıkış
                    </Button>
                </div>
            </header>

            {/* ── Progress Bar ────────────────────────────────── */}
            <div className="h-1 bg-secondary">
                <div className="h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
            </div>

            {/* ── Main Layout ─────────────────────────────────── */}
            <div className="flex-1 flex flex-col lg:flex-row max-w-6xl mx-auto w-full p-6 gap-6">
                {/* Question + Recording Panel */}
                <div className="flex-1 space-y-5">
                    {/* Question Card */}
                    <div className="glass-card rounded-2xl border border-border p-6 lg:p-8 animate-fade-in-up">
                        <div className="flex items-start justify-between gap-4 mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20">
                                    <span className="text-xs font-bold text-primary">{currentIdx + 1}</span>
                                </div>
                                {currentQuestion.category && (
                                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-secondary text-muted-foreground border border-border">
                                        {currentQuestion.category}
                                    </span>
                                )}
                            </div>
                            <CountdownTimer key={`${timerKey}-${currentIdx}`} seconds={currentQuestion.timeLimit || 120} onExpire={handleTimerExpire} />
                        </div>
                        <p className="text-base font-semibold text-foreground leading-relaxed">
                            {currentQuestion.text || currentQuestion.content}
                        </p>
                    </div>

                    {/* Recording Controls */}
                    <div className="glass-card rounded-2xl border border-border p-6">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <Volume2 className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-semibold text-foreground">Sesli Yanıt</span>
                            </div>
                            {recordingState === "recording" && (
                                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full">
                                    <div className="w-2 h-2 rounded-full bg-rose-500 recording-pulse" />
                                    <span className="text-xs text-red-400 font-bold">Kayıt Yapılıyor</span>
                                </div>
                            )}
                        </div>

                        <div className="mb-6">
                            <WaveformVisualizer isActive={recordingState === "recording"} />
                        </div>

                        <div className="flex items-center justify-center gap-3">
                            {recordingState === "idle" && (
                                <button
                                    onClick={startRecording}
                                    className="flex items-center gap-2.5 px-7 py-3 rounded-xl btn-gradient font-bold text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-105"
                                >
                                    <Mic className="w-4 h-4" />
                                    Kaydı Başlat
                                </button>
                            )}
                            {recordingState === "recording" && (
                                <button
                                    onClick={handleStopRecording}
                                    className="flex items-center gap-2.5 px-7 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-lg shadow-rose-500/25 transition-all recording-pulse"
                                >
                                    <Square className="w-4 h-4" />
                                    Kaydı Durdur
                                </button>
                            )}
                            {recordingState === "processing" && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-sm">Ses işleniyor...</span>
                                </div>
                            )}
                            {recordingState === "done" && !isCurrentSubmitted && (
                                <button
                                    onClick={startRecording}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary text-sm transition-all"
                                >
                                    <Mic className="w-3.5 h-3.5" />
                                    Tekrar Kaydet
                                </button>
                            )}
                        </div>

                        {recordingState === "idle" && (
                            <p className="text-center text-xs text-muted-foreground mt-4">
                                Kaydı başlatmak için tıklayın. Konuşmanız otomatik olarak metne dönüştürülecektir.
                            </p>
                        )}
                    </div>

                    {/* Transcription Editor */}
                    {(recordingState === "done" || transcript) && (
                        <div className="glass-card rounded-2xl border border-border p-6 animate-fade-in-up">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Edit3 className="w-4 h-4 text-primary" />
                                    <span className="text-sm font-bold text-foreground">Yanıtınız</span>
                                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">düzenlenebilir</span>
                                </div>
                                {isCurrentSubmitted && (
                                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Gönderildi
                                    </div>
                                )}
                            </div>
                            <textarea
                                value={editedText}
                                onChange={e => setEditedText(e.target.value)}
                                disabled={isCurrentSubmitted}
                                placeholder="Transkript burada görünecek. Göndermeden önce düzenleyebilirsiniz..."
                                className="w-full h-36 bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            />
                            <div className="flex items-center justify-between mt-3">
                                <span className="text-xs text-muted-foreground">{editedText.length} karakter</span>
                                {!isCurrentSubmitted && (
                                    <Button
                                        onClick={handleSubmitAnswer}
                                        disabled={!editedText.trim() && !transcript}
                                        className="btn-gradient text-xs h-9 px-5 font-bold"
                                    >
                                        <Send className="w-3.5 h-3.5 mr-1.5" />
                                        Cevabı Gönder
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Right Sidebar ─────────────────────────────── */}
                <div className="lg:w-68 xl:w-72 space-y-4 flex-shrink-0">
                    <div className="glass-card rounded-2xl border border-border p-5">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Sorular</h3>
                        <div className="space-y-2">
                            {questions.map((q, i) => (
                                <button
                                    key={q.id}
                                    onClick={() => { if (recordingState === "recording") handleStopRecording(); setCurrentIdx(i); }}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                                        i === currentIdx
                                            ? "bg-primary/15 border border-primary/30 text-primary"
                                            : submitted.has(q.id)
                                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                            : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent"
                                    }`}
                                >
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                                        i === currentIdx ? "bg-primary text-white"
                                        : submitted.has(q.id) ? "bg-emerald-500 text-white"
                                        : "bg-secondary text-muted-foreground"
                                    }`}>
                                        {submitted.has(q.id) ? "✓" : i + 1}
                                    </div>
                                    <span className="truncate">{q.category || "Genel"}</span>
                                    <span className="ml-auto flex items-center gap-0.5 text-muted-foreground flex-shrink-0">
                                        <Clock className="w-2.5 h-2.5" />
                                        {Math.floor((q.timeLimit || 120) / 60)}d
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Progress */}
                        <div className="mt-4 pt-4 border-t border-border">
                            <div className="flex items-center justify-between text-xs mb-2">
                                <span className="text-muted-foreground font-medium">İlerleme</span>
                                <span className="font-bold text-foreground">{submitted.size}/{questions.length} yanıtlandı</span>
                            </div>
                            <div className="h-2 rounded-full bg-secondary overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700"
                                    style={{ width: `${(submitted.size / questions.length) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setCurrentIdx(i => Math.max(0, i - 1))} disabled={currentIdx === 0} className="flex-1 border-border text-muted-foreground hover:text-foreground h-10 text-xs">
                            <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                            Önceki
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setCurrentIdx(i => Math.min(questions.length - 1, i + 1))} disabled={currentIdx === questions.length - 1} className="flex-1 border-border text-muted-foreground hover:text-foreground h-10 text-xs">
                            Sonraki
                            <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                    </div>

                    {/* Finish Button */}
                    {(allSubmitted || submitted.size >= Math.ceil(questions.length * 0.6)) && (
                        <Button
                            onClick={handleFinishInterview}
                            disabled={isEvaluating}
                            className="w-full btn-gradient font-bold text-sm h-12 shadow-lg shadow-primary/25 animate-fade-in-up"
                        >
                            {isEvaluating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Değerlendiriliyor...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Bitir ve Raporu Gör
                                </>
                            )}
                        </Button>
                    )}

                    {!allSubmitted && submitted.size < Math.ceil(questions.length * 0.6) && (
                        <p className="text-xs text-center text-muted-foreground bg-secondary/50 rounded-xl px-4 py-3 border border-border">
                            Bitirmek için en az {Math.ceil(questions.length * 0.6)} soru cevaplamanız gerekmektedir
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
