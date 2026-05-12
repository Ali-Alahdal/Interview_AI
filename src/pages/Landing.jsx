import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Mic2, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

export default function Landing() {
    return (
        <div className="min-h-screen flex flex-col bg-background font-sans">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="container mx-auto px-6 flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                            <Mic2 className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-xl font-bold heading-font text-foreground">ÖYS Platformu</span>
                    </div>
                    <Link href="/login">
                        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-xl">
                            Giriş Yap
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className="flex-1 gradient-hero flex items-center justify-center px-6 py-20 lg:py-32">
                <div className="max-w-4xl mx-auto text-center space-y-10 animate-fade-in-up">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-primary-foreground/90 text-sm font-medium border-primary/30">
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Yapay Zeka Destekli Mülakat ve Eğitim Koçu</span>
                    </div>

                    {/* Main Heading */}
                    <div className="space-y-6">
                        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight heading-font">
                            Kariyerinize <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-emerald-300">Yapay Zeka</span> ile Yön Verin
                        </h1>
                        <p className="text-xl md:text-2xl text-blue-100/80 leading-relaxed max-w-3xl mx-auto font-light">
                            Gerçek mülakat senaryolarıyla pratik yapın, yapay zeka tabanlı anlık geri bildirim alın ve gelişiminizi adım adım takip edin.
                        </p>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                        <Link href="/register">
                            <Button className="bg-white text-primary hover:bg-gray-50 font-bold px-8 py-7 text-lg rounded-2xl w-full sm:w-auto shadow-xl shadow-black/10 transition-transform hover:scale-105">
                                Ücretsiz Başla <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 font-bold px-8 py-7 text-lg rounded-2xl w-full sm:w-auto transition-transform hover:scale-105 backdrop-blur-sm">
                                Zaten hesabım var
                            </Button>
                        </Link>
                    </div>

                    {/* Feature Highlights */}
                    <div className="pt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto">
                        {[
                            { title: "Anlık Geri Bildirim", desc: "Cevaplarınızı yapay zeka ile anında analiz edin." },
                            { title: "Gerçekçi Senaryolar", desc: "Sektör standartlarına uygun mülakat deneyimi." },
                            { title: "Detaylı Raporlama", desc: "Gelişim alanlarınızı nokta atışı tespit edin." }
                        ].map((feature, i) => (
                            <div key={i} className="glass-card p-6 rounded-2xl border-white/10">
                                <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-4" />
                                <h3 className="text-white font-bold text-lg mb-2 heading-font">{feature.title}</h3>
                                <p className="text-blue-100/70 text-sm">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="text-center py-8 bg-background border-t border-border text-muted-foreground text-sm">
                <p>© 2026 Öğrenme Yönetim Sistemi (ÖYS). Tüm hakları saklıdır.</p>
            </footer>
        </div>
    );
}
