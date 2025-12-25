import React, { useEffect, useMemo, useRef, useState } from "react";
import "./Register.scss";
import { registerRealtor, registerUser, uniqueCheck } from "../../Api/Auth";

const onlyDigits = (s) => String(s || "").replace(/\D/g, "");
const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || "").trim());
const strongPass = (s) => /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(String(s || ""));
const fileOk = (f) => !!f && /^image\//i.test(f.type) && f.size <= 3 * 1024 * 1024;

const ROLES = [
  { label: "Агент по недвижимости", value: "realtor" },
  { label: "Админ", value: "admin" },
];

const Combobox = ({ id, label, value, onChange, options = [], placeholder = "Выберите...", pageSize = 6, disabled }) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(-1);
  const [page, setPage] = useState(1);
  const rootRef = useRef(null);
  const listRef = useRef(null);

  const uniq = useMemo(() => {
    const m = new Map();
    options.forEach((o) => { if (!m.has(o.value)) m.set(o.value, o); });
    return Array.from(m.values());
  }, [options]);

  const filtered = useMemo(() => {
    const s = String(q || "").trim().toLowerCase();
    if (!s) return uniq;
    return uniq.filter((o) => o.label.toLowerCase().includes(s) || String(o.value).toLowerCase().includes(s));
  }, [q, uniq]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const sliced = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  useEffect(() => {
    const onDoc = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc, true);
    return () => document.removeEventListener("mousedown", onDoc, true);
  }, []);

  useEffect(() => {
    if (open && listRef.current && active >= 0) {
      const el = listRef.current.querySelector(`[data-index="${active}"]`);
      if (el?.scrollIntoView) el.scrollIntoView({ block: "nearest" });
    }
  }, [open, active]);

  useEffect(() => { setPage(1); setActive(-1); }, [q]);

  const currentLabel = useMemo(() => uniq.find((o) => o.value === value)?.label || "", [uniq, value]);

  const onKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, sliced.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (sliced[active]) onChange && onChange(sliced[active].value);
      setOpen(false);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className={`register__combobox ${disabled ? "register__combobox--disabled" : ""}`}>
      {label ? <label className="register__combobox-label" htmlFor={id}>{label}</label> : null}
      <div className="register__combobox-control" role="combobox" aria-expanded={open} aria-haspopup="listbox" onKeyDown={onKeyDown}>
        <input
          id={id}
          className="register__combobox-input"
          value={open ? q : currentLabel}
          onChange={(e) => { setQ(e.target.value); if (!open) setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          disabled={disabled}
        />
        <button type="button" className="register__combobox-toggle" onClick={() => setOpen((v) => !v)} aria-label={open ? "Скрыть" : "Показать"} disabled={disabled}>▾</button>
      </div>
      {open && (
        <div className="register__combobox-dropdown" role="listbox" ref={listRef}>
          {sliced.length === 0 ? (
            <div className="register__combobox-empty">Ничего не найдено</div>
          ) : (
            <>
              {sliced.map((opt, idx) => {
                const selected = opt.value === value;
                const isActive = idx === active;
                return (
                  <div
                    key={opt.value}
                    data-index={idx}
                    className={`register__combobox-option ${selected ? "is-selected" : ""} ${isActive ? "is-active" : ""}`}
                    role="option"
                    aria-selected={selected}
                    tabIndex={-1}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setActive(idx)}
                    onClick={() => { onChange && onChange(opt.value); setOpen(false); }}
                  >
                    <span className="register__combobox-option-label">{opt.label}</span>
                  </div>
                );
              })}
              {totalPages > 1 ? (
                <div className="register__combobox-pager">
                  <button type="button" className="register__combobox-pager-btn" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>←</button>
                  <span className="register__combobox-pager-info">{page}/{totalPages}</span>
                  <button type="button" className="register__combobox-pager-btn" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>→</button>
                </div>
              ) : null}
            </>
          )}
        </div>
      )}
    </div>
  );
};

const Register = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    password: "",
    password2: "",
    role: "",
    avatar: null,
  });
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState("");
  const [notice, setNotice] = useState({ type: "", text: "", visible: false });
  const [busy, setBusy] = useState(false);

  const show = (text, type = "success", ms = 4000) => {
    setNotice({ type, text, visible: true });
    window.setTimeout(() => setNotice({ type: "", text: "", visible: false }), ms);
  };

  const onField = (e) => {
    const { name, value, files } = e.target;
    if (name === "avatar") {
      const f = files?.[0];
      if (f) {
        setForm((s) => ({ ...s, avatar: f }));
        setPreview(URL.createObjectURL(f));
        setErrors((s) => ({ ...s, avatar: "" }));
      } else {
        setForm((s) => ({ ...s, avatar: null }));
        setPreview("");
      }
      return;
    }
    setForm((s) => ({ ...s, [name]: name === "phone" ? onlyDigits(value) : value }));
    setErrors((s) => ({ ...s, [name]: "" }));
  };

  const validate = async () => {
    const e = {};
    if (!form.username || form.username.trim().length < 3) e.username = "Минимум 3 символа";
    if (!/^[a-zA-Z0-9._-]+$/.test(form.username || "")) e.username = (e.username ? e.username + ". " : "") + "Разрешены латинские буквы, цифры и ._-";
    if (!form.email || !isEmail(form.email)) e.email = "Некорректный email";
    if (!form.first_name || form.first_name.trim().length < 2) e.first_name = "Укажите имя (мин. 2 символа)";
    if (!form.last_name || form.last_name.trim().length < 2) e.last_name = "Укажите фамилию (мин. 2 символа)";
    if (!form.phone || form.phone.length < 7 || form.phone.length > 18) e.phone = "Телефон 7–18 цифр";
    if (!form.password || !strongPass(form.password)) e.password = "Минимум 8 символов, буквы и цифры";
    if (!form.password2) e.password2 = "Подтвердите пароль";
    if (form.password && form.password2 && form.password !== form.password2) e.password2 = "Пароли не совпадают";
    if (!form.role) e.role = "Выберите роль";
    if (form.avatar && !fileOk(form.avatar)) e.avatar = "Только изображение до 3 МБ";

    let emailOk = true;
    let userOk = true;
    if (!e.email) emailOk = await uniqueCheck("email", form.email).catch(() => true);
    if (!e.username) userOk = await uniqueCheck("username", form.username).catch(() => true);
    if (!emailOk) e.email = "Email уже используется";
    if (!userOk) e.username = e.username ? e.username : "Имя пользователя занято";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (busy) return;
    setNotice({ type: "", text: "", visible: false });

    const ok = await validate();
    if (!ok) {
      show("Исправьте ошибки формы", "error");
      return;
    }

    const fd = new FormData();
    fd.append("username", form.username);
    fd.append("email", form.email);
    fd.append("first_name", form.first_name);
    fd.append("last_name", form.last_name);
    fd.append("phone", form.phone);
    fd.append("password", form.password);
    fd.append("password2", form.password2);
    if (form.avatar) fd.append("avatar", form.avatar);

    setBusy(true);
    try {
      const apiCall = form.role === "realtor" ? registerRealtor : registerUser;
      const { status, data } = await apiCall(fd);
      if (status >= 200 && status < 300) {
        setForm({ username: "", email: "", first_name: "", last_name: "", phone: "", password: "", password2: "", role: "", avatar: null });
        setErrors({});
        setPreview("");
        show("Регистрация успешно выполнена", "success");
      } else {
        const errText =
          data?.detail ||
          Object.entries(data || {})
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
            .join("; ") ||
          "Ошибка регистрации";
        show(errText, "error");
      }
    } catch (e) {
      console.error(e?.message || "Register error");
      const payload = e?.response?.data;
      const errText =
        payload?.detail ||
        Object.entries(payload || {})
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join("; ") ||
        "Ошибка регистрации";
      show(errText, "error");
    } finally {
      setBusy(false);
    }
  };

  const roleOptions = ROLES;

  return (
    <section className="register">
      <div className="register__container">
        <h2 className="register__title">Регистрация</h2>

        {notice.visible ? (
          <div className={`register__notification register__notification--${notice.type}`}>{notice.text}</div>
        ) : null}

        <form className="register__form" onSubmit={submit} noValidate>
          <div className="register__section">
            <h3 className="register__subtitle">Личные данные</h3>

            <div className="register__form-row">
              <div className="register__form-group">
                <input
                  className={`register__input ${errors.username ? "register__input--error" : ""}`}
                  name="username"
                  placeholder="Имя пользователя"
                  value={form.username}
                  onChange={onField}
                  required
                />
                {errors.username ? <span className="register__error">{errors.username}</span> : null}
              </div>

              <div className="register__form-group">
                <input
                  className={`register__input ${errors.email ? "register__input--error" : ""}`}
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={onField}
                  required
                />
                {errors.email ? <span className="register__error">{errors.email}</span> : null}
              </div>
            </div>

            <div className="register__form-row">
              <div className="register__form-group">
                <input
                  className={`register__input ${errors.first_name ? "register__input--error" : ""}`}
                  name="first_name"
                  placeholder="Имя"
                  value={form.first_name}
                  onChange={onField}
                  required
                />
                {errors.first_name ? <span className="register__error">{errors.first_name}</span> : null}
              </div>

              <div className="register__form-group">
                <input
                  className={`register__input ${errors.last_name ? "register__input--error" : ""}`}
                  name="last_name"
                  placeholder="Фамилия"
                  value={form.last_name}
                  onChange={onField}
                  required
                />
                {errors.last_name ? <span className="register__error">{errors.last_name}</span> : null}
              </div>
            </div>

            <div className="register__form-row">
              <div className="register__form-group">
                <input
                  className={`register__input ${errors.phone ? "register__input--error" : ""}`}
                  name="phone"
                  placeholder="Телефон"
                  value={form.phone}
                  onChange={onField}
                  inputMode="numeric"
                  required
                />
                {errors.phone ? <span className="register__error">{errors.phone}</span> : null}
              </div>

              <div className="register__form-group">
                {/* <label className="register__form-label">Аватар</label> */}
                <input className="register__file" type="file" name="avatar" accept="image/*" onChange={onField} />
                {preview ? <img className="register__preview" src={preview} alt="Превью аватара" /> : null}
                {errors.avatar ? <span className="register__error">{errors.avatar}</span> : null}
              </div>
            </div>
          </div>

          <div className="register__section">
            <h3 className="register__subtitle">Роль и пароль</h3>

            <div className="register__form-row">
              <div className="register__form-group">
                <Combobox
                  id="role"
                  // label="Роль"
                  value={form.role}
                  onChange={(v) => setForm((s) => ({ ...s, role: v }))}
                  options={roleOptions}
                  placeholder="Выберите роль"
                />
                {errors.role ? <span className="register__error">{errors.role}</span> : null}
              </div>

              <div className="register__form-group">
                <input
                  className={`register__input ${errors.password ? "register__input--error" : ""}`}
                  type="password"
                  name="password"
                  placeholder="Пароль"
                  value={form.password}
                  onChange={onField}
                  required
                />
                {errors.password ? <span className="register__error">{errors.password}</span> : null}
              </div>
            </div>

            <div className="register__form-row">
              <div className="register__form-group">
                <input
                  className={`register__input ${errors.password2 ? "register__input--error" : ""}`}
                  type="password"
                  name="password2"
                  placeholder="Подтверждение пароля"
                  value={form.password2}
                  onChange={onField}
                  required
                />
                {errors.password2 ? <span className="register__error">{errors.password2}</span> : null}
              </div>
              <div className="register__form-group"></div>
            </div>
          </div>

          <button type="submit" className="register__button" disabled={busy}>
            <svg viewBox="0 0 24 24" className="register__button-icon"><path d="M12 5v14m-7-7h14"/></svg>
            Зарегистрироваться
          </button>
        </form>
      </div>
    </section>
  );
};

export default Register;
