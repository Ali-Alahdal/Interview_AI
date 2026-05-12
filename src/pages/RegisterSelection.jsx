import { useLocation } from "wouter";
import { Mic2, Users, Sparkles, ArrowLeft } from "lucide-react";

export default function RegisterSelection() {
    const [, navigate] = useLocation();

    return (
        <div className="min-h-screen gradient-hero flex flex-col items-center justify-center p-6 font-sans">
            <div className="relative z-10 w-full max-w-4xl animate-fade-in-up">
                {/* Logo */}
                <div className="flex flex-col items-center gap-4 mb-12">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl">
                        <Mic2 className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-2xl font-bold heading-font text-white">ÖYS Platformu</span>
                </div>

                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 heading-font">Hesabınızı Oluşturun</h1>
                    <p className="text-blue-100/80 text-lg">ÖYS'yi nasıl kullanmak istersiniz?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mx-auto">
                    {/* Trainee Card */}
                    <button
                        onClick={() => navigate("/register/trainee")}
                        className="glass-card flex flex-col items-center p-10 rounded-3xl hover:border-emerald-400/50 hover:bg-white/15 transition-all duration-300 group text-center"
                    >
                        <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500/30 transition-all duration-300 border border-emerald-500/30">
                            <Users className="w-10 h-10 text-emerald-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3 heading-font">Öğrenciyim</h2>
                        <p className="text-blue-100/70 text-base leading-relaxed">
                            Eğitimlere katılmak, mülakat pratikleri yapmak ve yeteneklerimi geliştirmek istiyorum.
                        </p>
                    </button>

                    {/* Creator Card */}
                    <button
                        onClick={() => navigate("/register/creator")}
                        className="glass-card flex flex-col items-center p-10 rounded-3xl hover:border-amber-400/50 hover:bg-white/15 transition-all duration-300 group text-center"
                    >
                        <div className="w-20 h-20 rounded-3xl bg-amber-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-amber-500/30 transition-all duration-300 border border-amber-500/30">
                            <Sparkles className="w-10 h-10 text-amber-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3 heading-font">İçerik Üreticiyim</h2>
                        <p className="text-blue-100/70 text-base leading-relaxed">
                            Kendi kurslarımı oluşturmak, öğrencileri yönetmek ve mülakat soruları hazırlamak istiyorum.
                        </p>
                    </button>
                </div>
                
                <div className="mt-16 flex justify-center">
                    <button 
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 text-sm text-blue-100/60 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Ana Sayfaya Dön
                    </button>
                </div>
            </div>
        </div>
    );
}
