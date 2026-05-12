import { useState } from "react";
import { useLocation } from "wouter";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";
import { Eye, EyeOff, Loader2, Zap, ArrowRight } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { authAPI, userAPI } from "@/services/api";

export default function Login() {
  const [, navigate] = useLocation();
  const { login } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Geçerli bir e-posta girin").required("E-posta zorunludur"),
      password: Yup.string().required("Şifre zorunludur"),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const response = await authAPI.login({ email: values.email, password: values.password });
        if (response?.token) localStorage.setItem("auth_token", response.token);

        let roleId = "3", userEmail = values.email, userId = "";
        if (response?.token) {
          try {
            const decoded = jwtDecode(response.token);
            let roleClaim = decoded.role || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
            if (Array.isArray(roleClaim)) roleClaim = roleClaim.find(r => String(r).toLowerCase().includes("super")) || roleClaim[0];
            if (roleClaim) roleId = String(roleClaim);
            userEmail = decoded.email || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || values.email;
            userId = decoded.sub || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || "";
          } catch (e) { console.error(e); }
        }

        let profile = { email: userEmail, id: userId };
        try { const p = await userAPI.getProfile(); profile = { ...profile, ...p }; } catch {}

        let roleValue = parseInt(roleId, 10);
        if (isNaN(roleValue)) {
          const r = roleId.toLowerCase();
          if (r.includes("super")) roleValue = 0;
          else if (r === "admin") roleValue = 1;
          else if (r === "creator") roleValue = 2;
          else roleValue = 3;
        }

        login({ ...profile, role: roleValue });
        toast.success("Tekrar hoş geldiniz!");
        if (roleValue === 0 || roleValue === 1) navigate("/dashboard/admin");
        else if (roleValue === 2) navigate("/dashboard/creator");
        else navigate("/dashboard/trainee");
      } catch (error) {
        toast.error(error.response?.data?.message || "Giriş yapılamadı. Bilgilerinizi kontrol edin.");
      } finally {
        setIsLoading(false);
      }
    }
  });

  return (
    <div className="min-h-screen bg-[#F4F6FB] flex items-center justify-center p-6">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-11 h-11 rounded-2xl bg-[#4F46E5] flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-3">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-gray-500 text-sm font-medium">ÖYS Platform</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Giriş Yap</h2>
            <p className="text-gray-500 text-sm">Hesabınıza erişmek için bilgilerinizi girin.</p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">E-posta Adresi</label>
              <input
                id="email" type="email" placeholder="ornek@email.com"
                {...formik.getFieldProps("email")}
                className={`w-full px-4 py-3 rounded-xl text-sm bg-[#F4F6FB] border text-gray-900 placeholder-gray-400 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] ${formik.touched.email && formik.errors.email ? "border-red-400" : "border-gray-200"}`}
              />
              {formik.touched.email && formik.errors.email && <p className="mt-1 text-xs text-red-500">{formik.errors.email}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-semibold text-gray-700">Şifre</label>
                <button type="button" className="text-xs text-[#4F46E5] hover:text-indigo-800 font-medium transition-colors">Şifremi unuttum</button>
              </div>
              <div className="relative">
                <input
                  id="password" type={showPassword ? "text" : "password"} placeholder="Şifrenizi girin"
                  {...formik.getFieldProps("password")}
                  className={`w-full px-4 py-3 pr-11 rounded-xl text-sm bg-[#F4F6FB] border text-gray-900 placeholder-gray-400 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] ${formik.touched.password && formik.errors.password ? "border-red-400" : "border-gray-200"}`}
                />
                <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && <p className="mt-1 text-xs text-red-500">{formik.errors.password}</p>}
            </div>

            <button
              type="submit" disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white bg-[#4F46E5] hover:bg-[#4338CA] transition-all disabled:opacity-60 shadow-md shadow-indigo-500/20 active:scale-[0.98]"
            >
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Giriş yapılıyor...</> : <><span>Giriş Yap</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Hesabınız yok mu?{" "}
            <button onClick={() => navigate("/register")} className="text-[#4F46E5] hover:text-indigo-800 font-semibold transition-colors">
              Kayıt Ol
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
