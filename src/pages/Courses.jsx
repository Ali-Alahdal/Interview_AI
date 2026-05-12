/**
 * Courses Component — Öğrenme Yönetim Sistemi
 * Tasarım: Modern Glassmorphic / Derin Uzay Zekası
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useApp } from "@/contexts/AppContext";
import { courseAPI } from "@/services/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Play, BookOpen, ChevronRight, Layers, Filter, Sparkles } from "lucide-react";
import { getYouTubeThumbnail } from "@/utils/helpers";
import { COURSE_CATEGORIES } from "@/utils/categories";

const CATEGORIES = ["Tümü", ...COURSE_CATEGORIES];

function CourseCard({ course, onSelect }) {
    const thumb = getYouTubeThumbnail(course.youTubeVideoUrl);
    return (
        <div
            className="glass-card rounded-2xl border border-border overflow-hidden group hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 cursor-pointer flex flex-col"
            onClick={() => onSelect(course)}
        >
            {/* Thumbnail */}
            <div className="relative h-44 overflow-hidden bg-secondary">
                <img
                    src={thumb || "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&q=80"}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Category badge */}
                <div className="absolute top-3 left-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white border border-white/15">
                        {course.category || course.specialty || "Genel"}
                    </span>
                </div>

                {/* General / Specialized badge */}
                <div className="absolute top-3 right-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border backdrop-blur-sm ${
                        course.isGeneral
                            ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                            : "bg-purple-500/20 text-purple-400 border-purple-500/30"
                    }`}>
                        {course.isGeneral ? "Genel" : "Özel"}
                    </span>
                </div>

                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/20">
                    <div className="w-14 h-14 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-xl shadow-primary/30 group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-6 h-6 text-white ml-0.5" />
                    </div>
                </div>

                {/* Completion bar */}
                {course.completionRate !== undefined && course.completionRate > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${course.completionRate}%` }} />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider mb-2 block">
                    {course.specialty || "Genel Hazırlık"}
                </span>

                <h3 className="text-sm font-bold text-gray-900 mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">
                    {course.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2 flex-1">
                    {course.description || "Açıklama bulunmuyor."}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg">
                        <Layers className="w-3 h-3 text-primary" />
                        {course.questionsCount || (course.questions?.length ?? 0)} Soru
                    </span>
                </div>
            </div>

            {/* Start Button */}
            <div className="px-5 pb-5">
                <Button
                    className="w-full btn-gradient text-xs font-bold h-9"
                    onClick={e => { e.stopPropagation(); onSelect(course); }}
                >
                    Eğitime Başla
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
            </div>
        </div>
    );
}

export default function Courses() {
    const [location, navigate] = useLocation();
    const { selectCourse } = useApp();

    const searchParams = new URLSearchParams(window.location.search);
    const initialCategory = searchParams.get("category") || "Tümü";

    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState(initialCategory);
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await courseAPI.getAll();
                setCourses(data || []);
            } catch (error) {
                console.error("Eğitimler yüklenemedi:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCourses();
    }, []);

    useEffect(() => {
        const sp = new URLSearchParams(window.location.search);
        const cat = sp.get("category");
        if (cat) setActiveCategory(cat);
    }, [window.location.search]);

    const filtered = courses.filter(c => {
        const title = c.title || "";
        const desc = c.description || "";
        const matchesSearch = title.toLowerCase().includes(search.toLowerCase()) ||
            desc.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = activeCategory === "Tümü" || (c.category || c.specialty) === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const handleSelect = (course) => {
        selectCourse(course);
        navigate(`/study/${course.id}`);
    };

    return (
        <DashboardLayout title="Eğitim Kütüphanesi">
            <div className="p-6 lg:p-8 space-y-8 animate-fade-in-up">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-5 h-5 text-amber-400" />
                            <h2 className="text-2xl font-bold heading-font text-foreground">Eğitim Kütüphanesi</h2>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {courses.length} eğitim tüm kategorilerde mevcut
                        </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-full">
                            <BookOpen className="w-3.5 h-3.5 text-primary" />{filtered.length} eğitim
                        </span>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Eğitim, konu veya beceri ara..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-10 h-11 bg-secondary/50 border-border focus:border-primary/50 focus:ring-primary/20 text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground glass-card px-4 py-2 rounded-xl">
                        <Filter className="w-4 h-4" />
                        <span className="text-sm font-medium">{filtered.length} sonuç</span>
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
                                activeCategory === cat
                                    ? "bg-gradient-to-r from-primary to-blue-600 text-white shadow-md shadow-primary/25"
                                    : "glass-card text-muted-foreground hover:text-foreground border border-border hover:border-primary/30"
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Course Grid */}
                {isLoading ? (
                    <div className="flex flex-col justify-center items-center py-24 gap-4">
                        <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                        <p className="text-sm text-muted-foreground">Eğitimler yükleniyor...</p>
                    </div>
                ) : filtered.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filtered.map(course => (
                            <CourseCard key={course.id} course={course} onSelect={handleSelect} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mb-5 border border-border">
                            <Search className="w-9 h-9 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-2">Eğitim bulunamadı</h3>
                        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                            Arama veya filtre kriterlerinizi ayarlayarak tekrar deneyin.
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setSearch(""); setActiveCategory("Tümü"); }}
                            className="mt-5 border-primary/30 text-primary hover:bg-primary/10"
                        >
                            Filtreleri Temizle
                        </Button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
