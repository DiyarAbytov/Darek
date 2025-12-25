import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIntl } from "react-intl";
import "./Login.scss";
import { apiLogin, getMe } from "../../Api/Auth";

const Login = ({ onLogin }) => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [notice, setNotice] = useState({ message: "", type: "", visible: false });
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const intl = useIntl();

  const show = (message, type = "success", ms = 3000) => {
    setNotice({ message, type, visible: true });
    window.setTimeout(() => setNotice({ message: "", type: "", visible: false }), ms);
  };

  const onField = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const validate = () => {
    const uOk = String(form.username || "").trim().length > 0;
    const pOk = String(form.password || "").length > 0;
    return uOk && pOk;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (busy) return;
    setNotice({ message: "", type: "", visible: false });

    if (!validate()) {
      show(intl.formatMessage({ id: "login_fix_errors", defaultMessage: "Заполните корректно поля" }), "error");
      return;
    }

    setBusy(true);
    try {
      const { data, status } = await apiLogin(form.username, form.password);
      if (status >= 200 && status < 300 && data?.access && data?.refresh) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        try {
          const me = await getMe();
          localStorage.setItem("user", JSON.stringify(me?.data || {}));
        } catch (e) {
          console.error(e?.message || "User load error");
        }
        show(intl.formatMessage({ id: "login_success", defaultMessage: "Успешный вход! Перенаправление..." }), "success", 1200);
        if (typeof onLogin === "function") onLogin();
        window.setTimeout(() => navigate("/dashboard/profile"), 1000);
      } else {
        const msg =
          data?.detail ||
          intl.formatMessage({ id: "invalid_credentials", defaultMessage: "Неверные учетные данные" });
        show(msg, "error");
      }
    } catch (e) {
      console.error(e?.message || "Login error");
      const payload = e?.response?.data;
      const msg =
        payload?.detail ||
        intl.formatMessage({ id: "error_try_again", defaultMessage: "Ошибка: попробуйте снова" });
      show(msg, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="login">
      <div className="login__container">
        <h2 className="login__title">{intl.formatMessage({ id: "login", defaultMessage: "Вход" })}</h2>

        <form className="login__form" onSubmit={submit} noValidate>
          <div className="login__form-row">
            <div className="login__form-group">
              <input
                className="login__input"
                name="username"
                value={form.username}
                onChange={onField}
                placeholder={intl.formatMessage({ id: "username_placeholder", defaultMessage: "Имя пользователя" })}
                autoComplete="username"
                required
              />
            </div>
            <div className="login__form-group">
              <input
                className="login__input"
                type="password"
                name="password"
                value={form.password}
                onChange={onField}
                placeholder={intl.formatMessage({ id: "password_placeholder", defaultMessage: "Пароль" })}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          {notice.visible ? (
            <div className={`login__notification login__notification--${notice.type}`}>{notice.message}</div>
          ) : null}

          <button type="submit" className="login__button" disabled={busy}>
            {intl.formatMessage({ id: "login_button", defaultMessage: "Войти" })}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Login;
