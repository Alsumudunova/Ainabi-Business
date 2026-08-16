import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, LogIn, Mail } from "lucide-react";
import { BrandPanel } from "./BrandPanel";
import { GoogleSignInButton } from "../../components/GoogleSignInButton";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { extractErrorMessage } from "../../services/api";
import "./Auth.css";

const schema = z.object({
  email: z.string().email("Email туура эмес"),
  password: z.string().min(1, "Пароль талап кылынат"),
});
type FormValues = z.infer<typeof schema>;

export default function Login() {
  const { login } = useAuth();
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
      await login(values.email, values.password);
      showToast({ variant: "success", title: "Кош келиңиз!", message: "Ийгиликтүү кирдиңиз." });
      navigate("/");
    } catch (error) {
      showToast({ variant: "error", title: "Кире алган жок", message: extractErrorMessage(error, "Email же пароль туура эмес.") });
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
            <h1 className="auth-title">Кайра кош келиңиз</h1>
            <p className="auth-subtitle">Аккаунтуңузга кирип, дүкөнүңүздү башкарууну улантыңыз.</p>
          </div>

          <GoogleSignInButton onSuccess={() => { showToast({ variant: "success", title: "Кош келиңиз!" }); navigate("/"); }} />
          <div className="auth-divider">же email менен</div>

          <form className="stack gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="field">
              <label className="field-label" htmlFor="email">Email</label>
              <div className="input-with-icon">
                <Mail size={16} />
                <input id="email" type="email" className={`input ${errors.email ? "has-error" : ""}`} placeholder="you@example.com" {...register("email")} />
              </div>
              {errors.email && <span className="field-error">{errors.email.message}</span>}
            </div>

            <div className="field">
              <label className="field-label" htmlFor="password">Пароль</label>
              <div className="input-with-icon">
                <Lock size={16} />
                <input id="password" type="password" className={`input ${errors.password ? "has-error" : ""}`} placeholder="••••••••" {...register("password")} />
              </div>
              {errors.password && <span className="field-error">{errors.password.message}</span>}
              <Link to="/forgot-password" style={{ alignSelf: "flex-end", fontSize: "var(--font-size-xs)", color: "var(--color-primary-600)", fontWeight: 600 }}>
                Паролду унуттуңузбу?
              </Link>
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={submitting}>
              <LogIn size={18} />
              {submitting ? "Кирүүдө..." : "Кирүү"}
            </button>
          </form>

          <p className="auth-footer-note">
            Аккаунтуңуз жокпу? <Link to="/register">Катталуу</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
