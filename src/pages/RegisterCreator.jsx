import { useState } from "react";
import { useLocation } from "wouter";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Sparkles, ArrowLeft, ArrowRight, Info } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { authAPI } from "@/services/api";

export default function RegisterCreator() {
  const [, navigate] = useLocation();
  const { login } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: { name: "", email: "", password: "", confirmPassword: "", bio: "", portfolioUrl: "", youTubeUrl: "", linkedInUrl: "", experienceYears: "" },
    validationSchema: Yup.object({
      name: Yup.string().required("Ad Soyad zorunludur"),
      email: Yup.string().email("Geçerli bir e-posta girin").required("E-posta zorunludur"),
      password: Yup.string().min(8, "En az 8 karakter olmalıdır").required("Şifre zorunludur"),
      confirmPassword: Yup.string().oneOf([Yup.ref("password"), null], "Şifreler eşleşmiyor").required("Şifre onayı zorunludur"),
      bio: Yup.string().max(500, "Biyografi çok uzun"),
      portfolioUrl: Yup.string().url("Geçerli bir URL girin"),
      youTubeUrl: Yup.string().url("Geçerli bir URL girin"),
      linkedInUrl: Yup.string().url("Geçerli bir URL girin"),
      experienceYears: Yup.number().min(0, "Negatif olamaz").nullable(),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const payload = {
          fullName: values.name, email: values.email, password: values.password, role: 2,
          bio: values.bio || null, portfolioUrl: values.portfolioUrl || null,
          youTubeUrl: values.youTubeUrl || null, linkedInUrl: values.linkedInUrl || null,
          experienceYears: values.experienceYears ? parseInt(values.experienceYears, 10) : null
        };
        const response = await authAPI.register(payload);
        if (response?.token) localStorage.setItem("auth_token", response.token);
        login({ id: response?.id || `user_${Date.now()}`, name: values.name, email: values.email, role: "creator", joinedAt: new Date().toISOString() });
        toast.success("Başvurunuz alındı! Yönetici onayı bekleniyor.");
        navigate("/login");
      } catch (error) {
        toast.error(error.response?.data?.message || "Kayıt başarısız. Lütfen tekrar deneyin.");
      } finally {
        setIsLoading(false);
      }
    }
  });

  const inputCls = (t, e) =>
    `w-full px-4 py-3 rounded-xl text-sm bg-white border text-gray-900 placeholder-gray-400 outline-none transition-all focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${t && e ? "border-red-400" : "border-gray-200"}`;

  return (
    <div className="min-h-screen bg-[#F4F6FB] flex items-center justify-center p-6 py-12">
      <div className="w-full max-w-[500px]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-md shadow-amber-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">ÖYS Platform</div>
            <div className="text-sm font-semibold text-gray-700">İçerik Üretici Kaydı</div>
          </div>
        </div>

        <div className="mb-7">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">İçerik üretici olarak katılın</h2>
          <p className="text-gray-500 text-sm">Harika eğitim içerikleri oluşturmaya başlayın.</p>
        </div>

        {/* Approval notice */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 mb-6">
          <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-700 leading-relaxed">
            İçerik üretici hesapları bir yönetici tarafından incelenir. Onay sonrası eğitim oluşturabilirsiniz.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ad Soyad</label>
            <input id="name" placeholder="Ayşe Yılmaz" {...formik.getFieldProps("name")} className={inputCls(formik.touched.name, formik.errors.name)} />
            {formik.touched.name && formik.errors.name && <p className="mt-1 text-xs text-red-500">{formik.errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">E-posta Adresi</label>
            <input id="email" type="email" placeholder="ornek@email.com" {...formik.getFieldProps("email")} className={inputCls(formik.touched.email, formik.errors.email)} />
            {formik.touched.email && formik.errors.email && <p className="mt-1 text-xs text-red-500">{formik.errors.email}</p>}
          </div>

          {/* Experience + Portfolio */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Deneyim (Yıl)</label>
              <input id="experienceYears" type="number" min="0" placeholder="Örn. 3" {...formik.getFieldProps("experienceYears")} className={inputCls(formik.touched.experienceYears, formik.errors.experienceYears)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Portfolyo URL</label>
              <input id="portfolioUrl" placeholder="https://..." {...formik.getFieldProps("portfolioUrl")} className={inputCls(formik.touched.portfolioUrl, formik.errors.portfolioUrl)} />
            </div>
          </div>

          {/* YouTube + LinkedIn */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">YouTube</label>
              <input id="youTubeUrl" placeholder="https://youtube.com/..." {...formik.getFieldProps("youTubeUrl")} className={inputCls(formik.touched.youTubeUrl, formik.errors.youTubeUrl)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">LinkedIn</label>
              <input id="linkedInUrl" placeholder="https://linkedin.com/in/..." {...formik.getFieldProps("linkedInUrl")} className={inputCls(formik.touched.linkedInUrl, formik.errors.linkedInUrl)} />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Hakkında <span className="text-gray-400 font-normal">(İsteğe bağlı)</span>
            </label>
            <textarea id="bio" placeholder="Bize biraz kendinizden bahsedin..." {...formik.getFieldProps("bio")} className={`${inputCls(formik.touched.bio, formik.errors.bio)} resize-none h-20`} />
            {formik.touched.bio && formik.errors.bio && <p className="mt-1 text-xs text-red-500">{formik.errors.bio}</p>}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">Güvenlik</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Password */}
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

          {/* Confirm password */}
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
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white bg-amber-500 hover:bg-amber-600 transition-all disabled:opacity-60 shadow-md shadow-amber-500/20 active:scale-[0.98] mt-2"
          >
            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Gönderiliyor...</> : <><span>Başvuruyu Gönder</span><ArrowRight className="w-4 h-4" /></>}
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
