import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { courseAttemptAPI } from "@/services/api";
import { Loader2, Calendar, BookOpen, ChevronRight, Award } from "lucide-react";
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
                console.error("Failed to fetch attempts:", error);
                toast.error("Failed to load your attempts.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAttempts();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric", month: "short", day: "numeric",
            hour: "2-digit", minute: "2-digit"
        });
    };

    const getScoreColor = (score) => {
        if (score >= 80) return "text-emerald-600 bg-emerald-100";
        if (score >= 60) return "text-amber-600 bg-amber-100";
        return "text-red-600 bg-red-100";
    };

    if (isLoading) {
        return (
            <DashboardLayout title="My Attempts">
                <div className="flex justify-center items-center h-96">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="My Attempts">
            <div className="p-6 space-y-6 animate-fade-in-up max-w-5xl mx-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Interview History</h2>
                        <p className="text-muted-foreground mt-1 text-sm">Review your past performance and AI evaluations.</p>
                    </div>
                </div>

                {attempts.length === 0 ? (
                    <div className="glass-card flex flex-col items-center justify-center p-12 text-center border border-border rounded-xl">
                        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                            <BookOpen className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-2">No Attempts Yet</h3>
                        <p className="text-muted-foreground mb-6 max-w-sm">
                            You haven't completed any course interviews yet. Go to "My Courses" to start your first session.
                        </p>
                        <button onClick={() => navigate("/courses")} className="btn-gradient px-6 py-2 rounded-lg">
                            Browse Courses
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {attempts.map((attempt) => (
                            <div key={attempt.id} 
                                 onClick={() => navigate(`/report/${attempt.id}`)}
                                 className="glass-card rounded-xl p-5 border border-border hover:border-blue-500/50 transition-all cursor-pointer group flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                        <BookOpen className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-base font-bold text-foreground truncate">
                                            {attempt.course?.title || "Unknown Course"}
                                        </h3>
                                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {formatDate(attempt.completedAt || attempt.startedAt)}
                                            </span>
                                            {attempt.course?.specialty && (
                                                <span className="px-2 py-0.5 rounded bg-secondary">
                                                    {attempt.course.specialty}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 w-full sm:w-auto">
                                    <div className="flex flex-col items-end flex-1 sm:flex-auto">
                                        <div className="flex items-center gap-1.5">
                                            <Award className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-xs font-medium text-muted-foreground">Overall Score</span>
                                        </div>
                                        <div className={`mt-1 font-bold text-lg px-2.5 py-0.5 rounded-lg ${getScoreColor(attempt.totalScore)}`}>
                                            {attempt.totalScore} / 100
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
