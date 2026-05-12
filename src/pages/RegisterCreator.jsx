/**
 * Register Component — InterviewAI Platform
 * Design: Modern Light SaaS
 * Layout: Split-screen (visual left, form right)
 * Clean form card with light blue accents
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Sparkles, CheckCircle2, Mic2 } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { authAPI } from "@/services/api";
const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663468863304/cXNLub62fCAhmR7XQctx9C/hero-auth-bg-d3L7ipakDk8XRXjNubUZBj.webp";
export default function RegisterCreator() {
  const [, navigate] = useLocation();
  const { login } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "creator",
      bio: "",
      portfolioUrl: "",
      youTubeUrl: "",
      linkedInUrl: "",
      experienceYears: ""
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Ad Soyad zorunludur"),
      email: Yup.string().email("Geçerli bir e-posta girin").required("E-posta zorunludur"),
      password: Yup.string().min(8, "Şifre en az 8 karakter olmalıdır").required("Şifre zorunludur"),
      confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], "Şifreler eşleşmiyor").required("Şifre onayı zorunludur"),
      bio: Yup.string().max(500, "Biyografi çok uzun"),
      portfolioUrl: Yup.string().url("Geçerli bir URL girin"),
      youTubeUrl: Yup.string().url("Geçerli bir URL girin"),
      linkedInUrl: Yup.string().url("Geçerli bir URL girin"),
      experienceYears: Yup.number().min(0, "Negatif olamaz").nullable()
    }),
    onSubmit: async (values) => {
      setIsLoading(true);

      try {
        // Map role string to int, assuming trainee=1, creator=2, admin=3 based on swagger

        const payload = {
          fullName: values.name,
          email: values.email,
          password: values.password,
          role: 2, // Creator role ID is 2
          bio: values.bio || null,
          portfolioUrl: values.portfolioUrl || null,
          youTubeUrl: values.youTubeUrl || null,
          linkedInUrl: values.linkedInUrl || null,
          experienceYears: values.experienceYears ? parseInt(values.experienceYears, 10) : null
        };

        const response = await authAPI.register(payload);

        // If the backend returns a token upon registration, save it
        if (response?.token) {
          localStorage.setItem('auth_token', response.token);
        }

        // Auto-login after registration (or you can just navigate to login if preferred)
        login({
          id: response?.id || `user_${Date.now()}`,
          name: values.name,
          email: values.email,
          role: values.role,
          joinedAt: new Date().toISOString(),
        });

        toast.success("Hesabınız başarıyla oluşturuldu! Aramıza hoş geldiniz.");
        navigate("/login");
      } catch (error) {
        toast.error(error.response?.data?.message || error.message || "Kayıt işlemi başarısız. Lütfen tekrar deneyin.");
      } finally {
        setIsLoading(false);
      }
    }
  });
  const features = [
    "AI-powered interview coaching",
    "Real-time speech-to-text transcription",
    "Detailed performance analytics",
    "Role-specific question banks",
  ];
  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-lg glass-card rounded-2xl p-8 shadow-2xl relative overflow-hidden animate-fade-in-up border-amber-500/20">
        
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex justify-center mb-8">
            <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-inner">
              <Sparkles className="w-7 h-7 text-amber-500" />
            </div>
          </div>

          <div className="text-center mb-8 space-y-2">
            <h2 className="text-3xl font-bold heading-font text-foreground">İçerik Üretici Kaydı</h2>
            <p className="text-muted-foreground text-sm">Harika eğitim içerikleri oluşturmaya başlayın</p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-foreground/80">Ad Soyad</Label>
              <Input id="name" placeholder="Ayşe Yılmaz" {...formik.getFieldProps("name")} className={`w-full px-4 py-3 bg-background/50 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-foreground transition-all ${formik.touched.name && formik.errors.name ? 'border-destructive/50 ring-destructive/20' : 'border-border'}`} />
              {formik.touched.name && formik.errors.name && <p className="text-xs text-destructive font-medium">{formik.errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground/80">E-posta Adresi</Label>
              <Input id="email" type="email" placeholder="ornek@email.com" {...formik.getFieldProps("email")} className={`w-full px-4 py-3 bg-background/50 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-foreground transition-all ${formik.touched.email && formik.errors.email ? 'border-destructive/50 ring-destructive/20' : 'border-border'}`} />
              {formik.touched.email && formik.errors.email && <p className="text-xs text-destructive font-medium">{formik.errors.email}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experienceYears" className="text-sm font-semibold text-foreground/80">Deneyim (Yıl)</Label>
                  <Input id="experienceYears" type="number" min="0" placeholder="Örn. 3" {...formik.getFieldProps("experienceYears")} className={`w-full px-4 py-3 bg-background/50 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-foreground transition-all ${formik.touched.experienceYears && formik.errors.experienceYears ? 'border-destructive/50 ring-destructive/20' : 'border-border'}`} />
                  {formik.touched.experienceYears && formik.errors.experienceYears && <p className="text-xs text-destructive font-medium">{formik.errors.experienceYears}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portfolioUrl" className="text-sm font-semibold text-foreground/80">Portfolyo URL</Label>
                  <Input id="portfolioUrl" placeholder="https://..." {...formik.getFieldProps("portfolioUrl")} className={`w-full px-4 py-3 bg-background/50 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-foreground transition-all ${formik.touched.portfolioUrl && formik.errors.portfolioUrl ? 'border-destructive/50 ring-destructive/20' : 'border-border'}`} />
                  {formik.touched.portfolioUrl && formik.errors.portfolioUrl && <p className="text-xs text-destructive font-medium">{formik.errors.portfolioUrl}</p>}
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="youTubeUrl" className="text-sm font-semibold text-foreground/80">YouTube URL</Label>
                  <Input id="youTubeUrl" placeholder="https://youtube.com/..." {...formik.getFieldProps("youTubeUrl")} className={`w-full px-4 py-3 bg-background/50 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-foreground transition-all ${formik.touched.youTubeUrl && formik.errors.youTubeUrl ? 'border-destructive/50 ring-destructive/20' : 'border-border'}`} />
                  {formik.touched.youTubeUrl && formik.errors.youTubeUrl && <p className="text-xs text-destructive font-medium">{formik.errors.youTubeUrl}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedInUrl" className="text-sm font-semibold text-foreground/80">LinkedIn URL</Label>
                  <Input id="linkedInUrl" placeholder="https://linkedin.com/in/..." {...formik.getFieldProps("linkedInUrl")} className={`w-full px-4 py-3 bg-background/50 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-foreground transition-all ${formik.touched.linkedInUrl && formik.errors.linkedInUrl ? 'border-destructive/50 ring-destructive/20' : 'border-border'}`} />
                  {formik.touched.linkedInUrl && formik.errors.linkedInUrl && <p className="text-xs text-destructive font-medium">{formik.errors.linkedInUrl}</p>}
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm font-semibold text-foreground/80">Hakkında (Bio)</Label>
              <textarea id="bio" placeholder="Bize biraz kendinizden bahsedin..." {...formik.getFieldProps("bio")} className={`w-full px-4 py-3 bg-background/50 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-foreground resize-none h-20 transition-all ${formik.touched.bio && formik.errors.bio ? 'border-destructive/50 ring-destructive/20' : 'border-border'}`}></textarea>
              {formik.touched.bio && formik.errors.bio && <p className="text-xs text-destructive font-medium">{formik.errors.bio}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-foreground/80">Şifre</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="En az 8 karakter" {...formik.getFieldProps("password")} className={`w-full px-4 py-3 bg-background/50 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-foreground pr-10 transition-all ${formik.touched.password && formik.errors.password ? 'border-destructive/50 ring-destructive/20' : 'border-border'}`} />
                <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && <p className="text-xs text-destructive font-medium">{formik.errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground/80">Şifreyi Onayla</Label>
              <div className="relative">
                <Input id="confirmPassword" type={showConfirm ? "text" : "password"} placeholder="Şifrenizi tekrar girin" {...formik.getFieldProps("confirmPassword")} className={`w-full px-4 py-3 bg-background/50 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-foreground pr-10 transition-all ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'border-destructive/50 ring-destructive/20' : 'border-border'}`} />
                <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground transition-colors">
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formik.touched.confirmPassword && formik.errors.confirmPassword && <p className="text-xs text-destructive font-medium">{formik.errors.confirmPassword}</p>}
            </div>

            {/* Submit */}
            <Button type="submit" disabled={isLoading} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-6 rounded-xl mt-4 shadow-lg shadow-amber-500/20 transition-transform hover:scale-[1.02]">
              {isLoading ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" />Hesap Oluşturuluyor...</>) : ("Devam Et")}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Zaten hesabınız var mı?{" "}
            <button onClick={() => navigate("/login")} className="text-amber-500 hover:text-amber-400 font-bold transition-colors">
              Giriş Yap
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
