/**
 * Unified Login Component — InterviewAI Platform
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";
import { Eye, EyeOff, Loader2, Mic2 } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { authAPI, userAPI } from "@/services/api";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663468863304/cXNLub62fCAhmR7XQctx9C/hero-auth-bg-d3L7ipakDk8XRXjNubUZBj.webp";

export default function Login() {
  const [, navigate] = useLocation();
  const { login } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Lütfen geçerli bir e-posta adresi girin").required("E-posta adresi zorunludur"),
      password: Yup.string().required("Şifre zorunludur"),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);

      try {
        const response = await authAPI.login({
          email: values.email,
          password: values.password
        });

        if (response?.token) {
          localStorage.setItem('auth_token', response.token);
        }

        let roleId = "3"; // default to trainee
        let userEmail = values.email;
        let userId = "";

        if (response?.token) {
          try {
            const decoded = jwtDecode(response.token);
            let roleClaim = decoded.role || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
            if (Array.isArray(roleClaim)) {
                // Prioritize super admin or admin if multiple roles are present
                roleClaim = roleClaim.find(r => String(r).toLowerCase().includes("super")) || roleClaim[0];
            }
            if (roleClaim) roleId = String(roleClaim);
            userEmail = decoded.email || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || values.email;
            userId = decoded.sub || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || "";
          } catch (e) {
            console.error("Failed to decode token", e);
          }
        }

        let profile = { email: userEmail, id: userId };
        try {
          const fetchedProfile = await userAPI.getProfile();
          profile = { ...profile, ...fetchedProfile };
        } catch (e) {
          console.warn("Could not fetch full profile.");
        }

        let roleValue = parseInt(roleId, 10);
        if (isNaN(roleValue)) {
            const lowerRole = roleId.toLowerCase();
            if (lowerRole === "super_admin" || lowerRole === "superadmin" || lowerRole === "super admin") roleValue = 0;
            else if (lowerRole === "admin") roleValue = 1;
            else if (lowerRole === "creator") roleValue = 2;
            else roleValue = 3;
        }
        
        const finalProfile = { ...profile, role: roleValue };
        login(finalProfile);

        toast.success("Tekrar hoş geldiniz!");

        // Redirect based on Role ID
        if (roleValue === 0 || roleValue === 1) {
          navigate("/dashboard/admin");
        } else if (roleValue === 2) {
          navigate("/dashboard/creator");
        } else {
          navigate("/dashboard/trainee");
        }

      } catch (error) {
        toast.error(error.response?.data?.message || "Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.");
      } finally {
        setIsLoading(false);
      }
    }
  });

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md glass-card rounded-2xl p-8 shadow-2xl relative overflow-hidden animate-fade-in-up">
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex justify-center mb-8">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
              <Mic2 className="w-7 h-7 text-primary" />
            </div>
          </div>

          <div className="text-center mb-8 space-y-2">
            <h2 className="text-3xl font-bold heading-font text-foreground">Hoş Geldiniz</h2>
            <p className="text-muted-foreground text-sm">Hesabınıza giriş yapın</p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground/80">E-posta Adresi</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="ornek@email.com" 
                {...formik.getFieldProps("email")} 
                className={`w-full px-4 py-3 bg-background/50 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-foreground transition-all ${formik.touched.email && formik.errors.email ? 'border-destructive/50 ring-destructive/20' : 'border-border'}`} 
              />
              {formik.touched.email && formik.errors.email && <p className="text-xs text-destructive font-medium">{formik.errors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold text-foreground/80">Şifre</Label>
                <button type="button" className="text-xs text-primary hover:text-primary/80 transition-colors font-semibold">Şifremi unuttum</button>
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Şifrenizi girin" 
                  {...formik.getFieldProps("password")} 
                  className={`w-full px-4 py-3 bg-background/50 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-foreground pr-10 transition-all ${formik.touched.password && formik.errors.password ? 'border-destructive/50 ring-destructive/20' : 'border-border'}`} 
                />
                <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && <p className="text-xs text-destructive font-medium">{formik.errors.password}</p>}
            </div>

            {/* Submit Button */}
            <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 rounded-xl mt-4 shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02]">
              {isLoading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Giriş Yapılıyor...</> : <>Giriş Yap</>}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Henüz hesabınız yok mu?{" "}
            <button onClick={() => navigate("/register")} className="text-primary hover:text-primary/80 font-bold transition-colors">
              Kayıt Ol
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
