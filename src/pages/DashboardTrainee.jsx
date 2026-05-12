import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useApp } from "@/contexts/AppContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Play, BookOpen, Star, Clock, Code2, Database, Briefcase, ChevronRight, Loader2 } from "lucide-react";
import { courseAPI } from "@/services/api";
import { COURSE_CATEGORIES } from "@/utils/categories";
import { getYouTubeThumbnail } from "@/utils/helpers";
import { toast } from "sonner";

// Icons for popular categories
const CATEGORY_ICONS = {
    "Software Engineering": <Code2 className="w-6 h-6" />,
    "Data Science": <Database className="w-6 h-6" />,
    "Product Management": <Briefcase className="w-6 h-6" />,
};

export default function DashboardTrainee() {
    const [, navigate] = useLocation();
    const { user } = useApp();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await courseAPI.getAll();
                setCourses(data || []);
            } catch (error) {
                console.error("Eğitimler yüklenemedi", error);
                toast.error("Mevcut eğitimler yüklenemedi");
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    // Pick top 4 categories to display
    const popularCategories = COURSE_CATEGORIES.slice(0, 4);

    return (
        <DashboardLayout title="Ana Panel">
            <div className="p-6 lg:p-8 space-y-10 animate-fade-in-up">

                {/* Explore Categories */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold heading-font text-foreground">Kategorileri Keşfet</h3>
                        <Button onClick={() => navigate("/courses")} variant="ghost" className="text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 transition-colors">Tümünü Gör <ChevronRight className="w-4 h-4 ml-1"/></Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                        {popularCategories.map((cat, idx) => (
                            <div key={idx} onClick={() => navigate(`/courses?category=${encodeURIComponent(cat)}`)} className="glass-card rounded-2xl p-6 hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-500/30 transition-all duration-300 cursor-pointer group">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 shadow-sm border border-blue-500/20">
                                    {CATEGORY_ICONS[cat] || <BookOpen className="w-6 h-6" />}
                                </div>
                                <h4 className="font-bold text-foreground text-sm lg:text-base">{cat}</h4>
                                <p className="text-xs text-muted-foreground mt-1 font-medium">
                                    {courses.filter(c => c.specialty === cat).length} eğitim
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Available Courses Feed */}
                <div>
                    <h3 className="text-xl font-bold heading-font text-foreground mb-6">Önerilen Eğitimler</h3>
                    
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="text-center py-16 glass-card rounded-2xl border-dashed">
                            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h4 className="text-lg font-bold text-foreground">Henüz eğitim bulunmamaktadır</h4>
                            <p className="text-sm text-muted-foreground mt-1">Yeni içerikler için daha sonra tekrar kontrol edin!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {courses.slice(0, 6).map(course => (
                                <div key={course.id} className="glass-card rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group flex flex-col border border-border hover:border-primary/20">
                                    <div className="h-48 bg-gradient-to-br from-secondary to-background relative overflow-hidden">
                                        {getYouTubeThumbnail(course.youTubeVideoUrl) ? (
                                            <img src={getYouTubeThumbnail(course.youTubeVideoUrl)} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" />
                                        ) : (
                                            <div className="absolute inset-0 bg-primary/5 mix-blend-multiply" />
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-background/40 backdrop-blur-sm transition-all duration-300">
                                            <Button onClick={() => navigate(`/study/${course.id}`)} className="bg-background text-foreground hover:bg-secondary shadow-lg">
                                                Eğitimi İncele
                                            </Button>
                                        </div>
                                        <div className="absolute top-4 left-4 flex gap-2">
                                            <span className={`text-xs px-3 py-1 rounded-full font-bold shadow-sm backdrop-blur-md ${course.isGeneral ? "bg-blue-500/20 text-blue-500 border border-blue-500/20" : "bg-purple-500/20 text-purple-500 border border-purple-500/20"}`}>
                                                {course.isGeneral ? "Genel" : "Özel"}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="p-6 flex-1 flex flex-col bg-sidebar/30">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-1 rounded-md">
                                                {course.specialty || "Genel Hazırlık"}
                                            </span>
                                            <div className="flex items-center text-amber-500 text-xs font-bold bg-amber-500/10 px-2 py-1 rounded-md">
                                                <Star className="w-3.5 h-3.5 fill-current mr-1" />
                                                4.8
                                            </div>
                                        </div>
                                        
                                        <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">{course.title}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">
                                            {course.description || "Açıklama bulunmuyor."}
                                        </p>
                                        
                                        <div className="flex items-center justify-between pt-4 border-t border-border">
                                            <div className="flex items-center text-xs font-medium text-muted-foreground bg-secondary px-2.5 py-1.5 rounded-lg">
                                                <Clock className="w-3.5 h-3.5 mr-1.5" />
                                                ~2.5 saat
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => navigate(`/study/${course.id}`)} className="text-primary hover:text-primary hover:bg-primary/10 font-bold group/btn">
                                                İncele <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </DashboardLayout>
    );
}
