import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";
import logo from "../logo2.png";
import { loginApi } from "../api/auth";

export default function Login() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Si ya hay sesión, ir directo al dashboard
  useEffect(() => {
    const hasToken = localStorage.getItem("access") || sessionStorage.getItem("access");
    if (hasToken) navigate("/dashboard", { replace: true });
  }, [navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!user || !pass) {
      setError("Datos incompletos.");
      return;
    }

    try {
      setLoading(true);
      const { access, refresh } = await loginApi(user, pass);

      if (remember) {
        localStorage.setItem("access", access);
        localStorage.setItem("refresh", refresh);
        sessionStorage.removeItem("access");
        sessionStorage.removeItem("refresh");
      } else {
        sessionStorage.setItem("access", access);
        sessionStorage.setItem("refresh", refresh);
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError("Usuario o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-bg">
      <form className="auth-card" onSubmit={onSubmit} aria-label="Login administradores">
        <div className="brand">
          <div className="brand-logo"><img src={logo} alt="Smart Condominium" /></div>
          <h1 className="brand-title">SMART</h1>
          <p className="brand-sub">CONDOMINIUM</p>
          <p className="brand-desc">Acceso exclusivo para Administradores</p>
        </div>

        <div className="field">
          <label className="label" htmlFor="user">Usuario</label>
          <div className="input-wrap">
            <span className="icon" aria-hidden>👤</span>
            <input id="user" className="input" value={user}
                   onChange={(e)=>setUser(e.target.value)} autoComplete="username" />
          </div>
        </div>

        <div className="field">
          <label className="label" htmlFor="pass">Contraseña</label>
          <div className="input-wrap">
            <span className="icon" aria-hidden>🔒</span>
            <input id="pass" className="input" type={show ? "text" : "password"}
                   value={pass} onChange={(e)=>setPass(e.target.value)}
                   autoComplete="current-password" />
            <button type="button" onClick={()=>setShow(s=>!s)} className="linklike">
              {show ? "Ocultar" : "Ver"}
            </button>
          </div>
        </div>

        <div className="actions">
          <label className="checkbox">
            <input type="checkbox" checked={remember} onChange={()=>setRemember(v=>!v)} />
            Recordarme
          </label>
        </div>

        {error && <div role="alert" className="error">{error}</div>}

        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Ingresando..." : "Iniciar Sesión"}
        </button>
      </form>
    </div>
  );
}