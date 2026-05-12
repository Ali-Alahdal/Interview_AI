import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Zap, BookOpen, PlusCircle, Edit3, Trash2, Loader2, Mic, Clock, ShieldAlert, Mail, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { courseAPI } from "@/services/api";
import { useApp } from "@/contexts/AppContext";
import { useLocation } from "wouter";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COURSE_CATEGORIES } from "@/utils/categories";

export default function DashboardCreator() {
    const { user } = useApp();
    const [location, navigate] = useLocation();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isApproved, setIsApproved] = useState(true); // assume approved until proven otherwise

    // ── Course Modal ──────────────────────────────────────────────
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [courseForm, setCourseForm] = useState({
        title: "",
        description: "",
        isGeneral: false,
        specialty: "",
        youTubeVideoUrl: "",
        contentMaterial: "",
        questions: [] // Questions are now part of the course
    });
    const [newQuestionContent, setNewQuestionContent] = useState("");



    // ─────────────────────────────────────────────────────────────
    const fetchCourses = async () => {
        setLoading(true);
        try {
            const data = await courseAPI.getMyCourses();
            setCourses(data || []);
            setIsApproved(true);
        } catch (err) {
            // 403 = account not yet approved by admin
            if (err?.response?.status === 403) {
                setIsApproved(false);
            } else {
                toast.error("Eğitimler yüklenemedi");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCourses(); }, []);

    useEffect(() => {
        if (location === "/creator/courses") {
            if (!isCourseModalOpen) openCourseModal();
            // We can replace the URL so they don't get stuck in a loop if they close the modal
            navigate("/dashboard/creator", { replace: true });
        }
    }, [location]);

    // ── Course CRUD ───────────────────────────────────────────────
    const handleSaveCourse = async () => {
        try {
            const payload = {
                ...courseForm,
                creatorId: user?.id || ""
            };
            
            if (editingCourse) {
                // 1. Update basic course details
                const { creatorId, questions, ...updatePayload } = payload;
                await courseAPI.update(editingCourse.id, updatePayload);
                
                // 2. Synchronize questions
                const originalQuestions = editingCourse.questions || [];
                const currentQuestions = payload.questions || [];

                // a. Delete removed questions
                const currentQuestionIds = currentQuestions.map(q => q.id);
                const questionsToDelete = originalQuestions.filter(q => !currentQuestionIds.includes(q.id));
                for (const q of questionsToDelete) {
                     await courseAPI.deleteQuestion(q.id);
                }

                // b. Add new questions
                const newQuestions = currentQuestions.filter(q => q.isNew);
                if (newQuestions.length > 0) {
                     await courseAPI.addQuestions(editingCourse.id, newQuestions.map(q => q.content));
                }

                // c. Update existing questions if changed
                const existingQuestions = currentQuestions.filter(q => !q.isNew);
                for (const q of existingQuestions) {
                     const original = originalQuestions.find(oq => oq.id === q.id);
                     if (original && (original.content !== q.content || original.orderIndex !== q.orderIndex)) {
                          await courseAPI.updateQuestion(q.id, { content: q.content, orderIndex: q.orderIndex });
                     }
                }

                toast.success("Eğitim başarıyla güncellendi");
            } else {
                // CreateCourseDto expects questions as an array of strings
                const createPayload = {
                    ...payload,
                    questions: payload.questions.map(q => q.content)
                };
                await courseAPI.create(createPayload);
                toast.success("Eğitim başarıyla oluşturuldu");
            }
            setIsCourseModalOpen(false);
            fetchCourses();
        } catch {
            toast.error(editingCourse ? "Eğitim güncellenemedi" : "Eğitim oluşturulamadı");
        }
    };

    const handleDeleteCourse = async (courseId) => {
        if (!confirm("Bu eğitimi silmek istediğinize emin misiniz?")) return;
        try {
            await courseAPI.delete(courseId);
            toast.success("Eğitim başarıyla silindi");
            fetchCourses();
        } catch {
            toast.error("Eğitim silinemedi");
        }
    };

    const openCourseModal = (course = null) => {
        if (course) {
            setEditingCourse(course);
            setCourseForm({
                title: course.title || "",
                description: course.description || "",
                isGeneral: course.isGeneral || false,
                specialty: course.specialty || "",
                youTubeVideoUrl: course.youTubeVideoUrl || "",
                contentMaterial: course.contentMaterial || "",
                questions: course.questions || []
            });
        } else {
            setEditingCourse(null);
            setCourseForm({ 
                title: "", 
                description: "", 
                isGeneral: false, 
                specialty: "", 
                youTubeVideoUrl: "", 
                contentMaterial: "",
                questions: []
            });
        }
        setIsCourseModalOpen(true);
    };

    const handleAddQuestion = () => {
        if (!newQuestionContent.trim()) return;
        const newQ = {
            id: crypto.randomUUID(),
            content: newQuestionContent.trim(),
            orderIndex: courseForm.questions.length,
            isNew: true
        };
        setCourseForm(prev => ({
            ...prev,
            questions: [...prev.questions, newQ]
        }));
        setNewQuestionContent("");
    };

    const handleRemoveQuestion = (id) => {
        setCourseForm(prev => ({
            ...prev,
            questions: prev.questions.filter(q => q.id !== id)
        }));
    };

    // ─────────────────────────────────────────────────────────────
    return (
        <DashboardLayout title="Eğitmen Paneli">
            <div className="p-6 space-y-6 animate-fade-in-up">

                {/* ── Pending Approval Banner ──────────────────── */}
                {!isApproved && (
                    <div className="flex items-start gap-4 p-5 rounded-2xl bg-amber-50 border border-amber-200">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <Clock className="w-5 h-5 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-sm font-bold text-amber-800">Hesabınız Onay Bekliyor</h3>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-700 uppercase tracking-wider">Beklemede</span>
                            </div>
                            <p className="text-xs text-amber-700/80 leading-relaxed mb-3">
                                İçerik üretici hesabınız henüz bir yönetici tarafından onaylanmamış.
                                Onay alındıktan sonra eğitim oluşturabilir, düzenleyebilir ve analiz sayfasına erişebilirsiniz.
                            </p>
                            <div className="flex flex-wrap gap-2 text-xs">
                                <div className="flex items-center gap-1.5 text-amber-700 bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200">
                                    <ShieldAlert className="w-3.5 h-3.5" />
                                    Eğitim oluşturma — <span className="font-semibold">Kilitli</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                                    <Mail className="w-3.5 h-3.5" />
                                    Onay bildirimi e-posta ile gönderilecek
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground">Eğitmen Paneli</h2>
                            <p className="text-xs text-muted-foreground">Eğitimlerinizi yönetin ve öğrenci etkýleşimini takip edin</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => !isApproved ? toast.warning("Hesabınız onaylanmadan eğitim oluşturulamıyor. Lütfen yönetici onayını bekleyin.") : openCourseModal()}
                        className={`text-xs h-9 px-4 ${isApproved ? "btn-gradient" : "bg-secondary border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 cursor-not-allowed"}`}
                        title={!isApproved ? "Hesabınız henüz onaylanmadı" : undefined}
                    >
                        {isApproved
                            ? <><PlusCircle className="w-3.5 h-3.5 mr-2" />Yeni Eğitim</>
                            : <><Clock className="w-3.5 h-3.5 mr-2" />Onay Bekleniyor</>}
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    {[
                        {
                            label: "Yayınlanan Eğitimler",
                            value: loading ? "..." : courses.length,
                            icon: <BookOpen className="w-5 h-5" />,
                            color: "text-emerald-600",
                            bg: "bg-emerald-50 border border-emerald-100"
                        },
                        {
                            label: "Toplam Soru",
                            value: loading ? "..." : courses.reduce((sum, c) => sum + (c.questions?.length ?? c.questionsCount ?? 0), 0),
                            icon: <Mic className="w-5 h-5" />,
                            color: "text-indigo-600",
                            bg: "bg-indigo-50 border border-indigo-100"
                        },
                    ].map(stat => (
                        <div key={stat.label} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                            <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3 ${stat.color}`}>
                                {stat.icon}
                            </div>
                            <div className="text-2xl font-bold text-gray-900 mb-0.5">{stat.value}</div>
                            <div className="text-xs font-medium text-gray-500">{stat.label}</div>
                        </div>
                    ))}
                </div>


                {/* My Courses */}
                <div className="glass-card rounded-xl border border-border overflow-hidden">
                    <div className="px-5 py-4 border-b border-border flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-foreground">Eğitimlerim</h3>
                    </div>
                    <div className="divide-y divide-border">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                                <p>Eğitimler yükleniyor...</p>
                            </div>
                        ) : courses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <BookOpen className="w-12 h-12 mb-4 opacity-20" />
                                <p>Henüz hiç eğitim oluşturmadınız.</p>
                                <Button onClick={() => openCourseModal()} variant="outline" className="mt-4">
                                    İlk Eğitiminizi Oluşturun
                                </Button>
                            </div>
                        ) : (
                            courses.map((course) => (
                                <div key={course.id} className="flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                                            <BookOpen className="w-5 h-5 text-amber-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-sm font-bold text-foreground truncate">{course.title}</div>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${course.isGeneral ? "bg-blue-500/15 text-blue-400" : "bg-purple-500/15 text-purple-400"}`}>
                                                    {course.isGeneral ? "Genel" : "Özel"}
                                                </span>
                                                {course.specialty && (
                                                    <span className="text-xs text-muted-foreground">{course.specialty}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">

                                        <Button variant="ghost" size="icon" onClick={() => openCourseModal(course)} className="text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                                            <Edit3 className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteCourse(course.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* ── CREATE / EDIT COURSE MODAL ─────────────────────────── */}
            <Dialog open={isCourseModalOpen} onOpenChange={setIsCourseModalOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingCourse ? "Eğitimi Düzenle" : "Yeni Eğitim Oluştur"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Eğitim Başlığı</Label>
                            <Input id="title" value={courseForm.title} onChange={e => setCourseForm({ ...courseForm, title: e.target.value })} placeholder="Örn: İleri Düzey Sistem Tasarımı" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="specialty">Uzmanlık / Kategori</Label>
                            <Select value={courseForm.specialty} onValueChange={val => setCourseForm({ ...courseForm, specialty: val })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Bir kategori seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                    {COURSE_CATEGORIES.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="youtube">YouTube Video URL</Label>
                            <Input id="youtube" value={courseForm.youTubeVideoUrl} onChange={e => setCourseForm({ ...courseForm, youTubeVideoUrl: e.target.value })} placeholder="https://youtube.com/..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Açıklama</Label>
                            <Textarea id="description" value={courseForm.description} onChange={e => setCourseForm({ ...courseForm, description: e.target.value })} placeholder="Eğitim hakkında kısa bir açıklama" />
                        </div>
                        <div className="space-y-2 flex items-center gap-2 mt-2">
                            <input type="checkbox" id="isGeneral" checked={courseForm.isGeneral} onChange={e => setCourseForm({ ...courseForm, isGeneral: e.target.checked })} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer" />
                            <Label htmlFor="isGeneral" className="m-0 cursor-pointer">Genel Eğitim olarak işaretle</Label>
                        </div>

                        {/* Questions Section */}
                        <div className="mt-4 pt-4 border-t border-border space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-bold flex items-center gap-2">
                                    <Mic className="w-4 h-4 text-amber-400" />
                                    Değerlendirme Soruları
                                </Label>
                                <span className="text-xs text-muted-foreground">{courseForm.questions.length} soru</span>
                            </div>
                            
                            <div className="flex gap-2">
                                <Input 
                                    value={newQuestionContent} 
                                    onChange={e => setNewQuestionContent(e.target.value)}
                                    placeholder="Yapay zeka mülakatı için bir soru ekleyin..."
                                    onKeyDown={e => e.key === 'Enter' && handleAddQuestion()}
                                />
                                <Button size="icon" onClick={handleAddQuestion} className="flex-shrink-0">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {courseForm.questions.map((q, idx) => (
                                    <div key={q.id || idx} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 group">
                                        <span className="text-xs font-bold text-blue-500 mt-0.5">{idx + 1}</span>
                                        <p className="text-sm text-foreground flex-1">{q.content}</p>
                                        <button onClick={() => handleRemoveQuestion(q.id)} className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {courseForm.questions.length === 0 && (
                                    <p className="text-xs text-center text-muted-foreground py-2 italic">Henüz soru eklenmedi.</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCourseModalOpen(false)}>İptal</Button>
                        <Button onClick={handleSaveCourse} className="btn-gradient">
                            {editingCourse ? "Değişiklikleri Kaydet" : "Eğitim Oluştur"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
