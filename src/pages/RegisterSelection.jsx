import { useLocation } from "wouter";
import { Zap, Users, Sparkles, ArrowRight, ArrowLeft } from "lucide-react";

export default function RegisterSelection() {
    const [, navigate] = useLocation();

    return (
        <div className="min-h-screen bg-[#F4F6FB] flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-2xl">
                {/* Logo */}
                <div className="flex flex-col items-center mb-12">
                    <div className="w-11 h-11 rounded-2xl bg-[#4F46E5] flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-4">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-500 text-sm font-medium">ÖYS Platform</span>
                </div>

                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Hesabınızı Oluşturun</h1>
                    <p className="text-gray-500">Platformu nasıl kullanmak istersiniz?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Trainee */}
                    <button
                        onClick={() => navigate("/register/trainee")}
                        className="group flex flex-col p-8 rounded-2xl bg-white border border-gray-200 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-200 text-left"
                    >
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-5 group-hover:bg-emerald-100 transition-colors">
                            <Users className="w-6 h-6 text-emerald-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">Öğrenciyim</h2>
                        <p className="text-gray-500 text-sm leading-relaxed mb-5">
                            Eğitimlere katılmak, mülakat pratikleri yapmak ve yeteneklerimi geliştirmek istiyorum.
                        </p>
                        <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold group-hover:gap-3 transition-all mt-auto">
                            <span>Başla</span>
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </button>

                    {/* Creator */}
                    <button
                        onClick={() => navigate("/register/creator")}
                        className="group flex flex-col p-8 rounded-2xl bg-white border border-gray-200 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-200 text-left"
                    >
                        <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-5 group-hover:bg-amber-100 transition-colors">
                            <Sparkles className="w-6 h-6 text-amber-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">İçerik Üreticiyim</h2>
                        <p className="text-gray-500 text-sm leading-relaxed mb-5">
                            Kendi kurslarımı oluşturmak, öğrencileri yönetmek ve mülakat soruları hazırlamak istiyorum.
                        </p>
                        <div className="flex items-center gap-2 text-amber-600 text-sm font-semibold group-hover:gap-3 transition-all mt-auto">
                            <span>Başla</span>
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </button>
                </div>

                <div className="flex justify-center mt-8">
                    <button
                        onClick={() => navigate("/login")}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Giriş sayfasına dön
                    </button>
                </div>
            </div>
        </div>
    );
}
