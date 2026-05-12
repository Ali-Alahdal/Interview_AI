import { useState } from "react";
import { useLocation } from "wouter";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Users, ArrowLeft, ArrowRight } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { authAPI } from "@/services/api";

export default function RegisterTrainee() {
  const [, navigate] = useLocation();
  const { login } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: { name: "", email: "", password: "", confirmPassword: "" },
    validationSchema: Yup.object({
      name: Yup.string().required("Ad Soyad zorunludur"),
      email: Yup.string().email("Geçerli bir e-posta girin").required("E-posta zorunludur"),
      password: Yup.string().min(8, "En az 8 karakter olmalıdır").required("Şifre zorunludur"),
      confirmPassword: Yup.string().oneOf([Yup.ref("password"), null], "Şifreler eşleşmiyor").required("Şifre onayı zorunludur"),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const response = await authAPI.register({ fullName: values.name, email: values.email, password: values.password, role: 3 });
        if (response?.token) localStorage.setItem("auth_token", response.token);
        login({ id: response?.id || `user_${Date.now()}`, name: values.name, email: values.email, role: "trainee", joinedAt: new Date().toISOString() });
        toast.success("Hesabınız başarıyla oluşturuldu!");
        navigate("/login");
      } catch (error) {
        toast.error(error.response?.data?.message || "Kayıt başarısız. Lütfen tekrar deneyin.");
      } finally {
        setIsLoading(false);
      }
    }
  });

  const inputCls = (t, e) =>
    `w-full px-4 py-3 rounded-xl text-sm bg-white border text-gray-900 placeholder-gray-400 outline-none transition-all focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${t && e ? "border-red-400" : "border-gray-200"}`;

  return (
    <div className="min-h-screen bg-[#F4F6FB] flex items-center justify-center p-6">
      <div className="w-full max-w-[420px]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/25">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">ÖYS Platform</div>
            <div className="text-sm font-semibold text-gray-700">Öğrenci Kaydı</div>
          </div>
        </div>

        <div className="mb-7">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Hesabınızı oluşturun</h2>
          <p className="text-gray-500 text-sm">Mülakat hazırlık yolculuğunuza başlayın.</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ad Soyad</label>
            <input id="name" placeholder="Ahmet Yılmaz" {...formik.getFieldProps("name")} className={inputCls(formik.touched.name, formik.errors.name)} />
            {formik.touched.name && formik.errors.name && <p className="mt-1 text-xs text-red-500">{formik.errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">E-posta Adresi</label>
            <input id="email" type="email" placeholder="ornek@email.com" {...formik.getFieldProps("email")} className={inputCls(formik.touched.email, formik.errors.email)} />
            {formik.touched.email && formik.errors.email && <p className="mt-1 text-xs text-red-500">{formik.errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Şifre</label>
            <div className="relative">
              <input id="password" type={showPassword ? "text" : "password"} placeholder="En az 8 karakter" {...formik.getFieldProps("password")} className={`${inputCls(formik.touched.password, formik.errors.password)} pr-11`} />
              <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && <p className="mt-1 text-xs text-red-500">{formik.errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Şifreyi Onayla</label>
            <div className="relative">
              <input id="confirmPassword" type={showConfirm ? "text" : "password"} placeholder="Şifrenizi tekrar girin" {...formik.getFieldProps("confirmPassword")} className={`${inputCls(formik.touched.confirmPassword, formik.errors.confirmPassword)} pr-11`} />
              <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {formik.touched.confirmPassword && formik.errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{formik.errors.confirmPassword}</p>}
          </div>

          <button
            type="button"
            onClick={formik.handleSubmit}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white bg-emerald-500 hover:bg-emerald-600 transition-all disabled:opacity-60 shadow-md shadow-emerald-500/20 active:scale-[0.98] mt-2"
          >
            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Hesap oluşturuluyor...</> : <><span>Kayıt Ol</span><ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>

        <div className="flex items-center justify-between mt-6">
          <button onClick={() => navigate("/register")} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Geri
          </button>
          <p className="text-sm text-gray-500">
            Hesabınız var mı?{" "}
            <button onClick={() => navigate("/login")} className="text-[#4F46E5] hover:text-indigo-800 font-semibold transition-colors">
              Giriş Yap
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
