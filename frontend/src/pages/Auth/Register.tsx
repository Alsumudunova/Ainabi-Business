import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Briefcase, Lock, Mail, Phone, User as UserIcon, UserPlus } from "lucide-react";
import { BrandPanel } from "./BrandPanel";
import { GoogleSignInButton } from "../../components/GoogleSignInButton";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { extractErrorMessage } from "../../services/api";
import "./Auth.css";

const schema = z.object({
  name: z.string().min(2, "Атыңызды толук жазыңыз"),
  businessName: z.string().min(2, "Бизнес атын жазыңыз"),
  phone: z.string().min(6, "Телефон номерин туура жазыңыз"),
  email: z.string().email("Email туура эмес"),
  password: z.string().min(6, "Пароль эң аз дегенде 6 белгиден турушу керек"),
});
type FormValues = z.infer<typeof schema>;

export default function Register() {
  const { register: registerAccount } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      await registerAccount(values);
      showToast({ variant: "success", title: "Аккаунт түзүлдү!", message: "Ainabi Business'ке кош келиңиз." });
      navigate("/");
    } catch (error) {
      showToast({ variant: "error", title: "Катталган жок", message: extractErrorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <BrandPanel />
      <div className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-card-header">
            <h1 className="auth-title">Бизнесиңизди каттаңыз</h1>
            <p className="auth-subtitle">2 мүнөттөн азыраак убакытта башталыңыз — карта талап кылынбайт.</p>
          </div>

          <GoogleSignInButton onSuccess={() => { showToast({ variant: "success", title: "Аккаунт түзүлдү!", message: "Ainabi Business'ке кош келиңиз." }); navigate("/"); }} />
          <div className="auth-divider">же email менен катталуу</div>

          <form className="stack gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="field">
              <label className="field-label" htmlFor="name">Атыңыз</label>
              <div className="input-with-icon">
                <UserIcon size={16} />
                <input id="name" className={`input ${errors.name ? "has-error" : ""}`} placeholder="Айбек Осмонов" {...register("name")} />
              </div>
              {errors.name && <span className="field-error">{errors.name.message}</span>}
            </div>

            <div className="field">
              <label className="field-label" htmlFor="businessName">Бизнес аты</label>
              <div className="input-with-icon">
                <Briefcase size={16} />
                <input id="businessName" className={`input ${errors.businessName ? "has-error" : ""}`} placeholder="Мисалы: Ainabi Дүкөн" {...register("businessName")} />
              </div>
              {errors.businessName && <span className="field-error">{errors.businessName.message}</span>}
            </div>

            <div className="form-grid">
              <div className="field">
                <label className="field-label" htmlFor="phone">Телефон</label>
                <div className="input-with-icon">
                  <Phone size={16} />
                  <input id="phone" className={`input ${errors.phone ? "has-error" : ""}`} placeholder="+996 700 123 456" {...register("phone")} />
                </div>
                {errors.phone && <span className="field-error">{errors.phone.message}</span>}
              </div>
              <div className="field">
                <label className="field-label" htmlFor="email">Email</label>
                <div className="input-with-icon">
                  <Mail size={16} />
                  <input id="email" type="email" className={`input ${errors.email ? "has-error" : ""}`} placeholder="you@example.com" {...register("email")} />
                </div>
                {errors.email && <span className="field-error">{errors.email.message}</span>}
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="password">Пароль</label>
              <div className="input-with-icon">
                <Lock size={16} />
                <input id="password" type="password" className={`input ${errors.password ? "has-error" : ""}`} placeholder="Эң аз 6 белги" {...register("password")} />
              </div>
              {errors.password && <span className="field-error">{errors.password.message}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={submitting}>
              <UserPlus size={18} />
              {submitting ? "Катталууда..." : "Аккаунт түзүү"}
            </button>
          </form>

          <p className="auth-footer-note">
            Аккаунтуңуз барбы? <Link to="/login">Кирүү</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
