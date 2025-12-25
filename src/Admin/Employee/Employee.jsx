import React, { useEffect, useMemo, useState } from "react";
import "./Employee.scss";
import api from "../../Api/Api";
import Register from "../../Auth/Register/Register";
import { FiPlus, FiX } from "react-icons/fi";

const PAGE_SIZE = 10;
const LIST_URL = "/users/list/";
const EDIT_URL = (id) => `/users/users/${id}/edit/`;
const DELETE_URL = (id) => `/users/users/${id}/delete/`;

const Employee = () => {
  const [users, setUsers] = useState([]);
  const [note, setNote] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    role: "realtor",
  });
  const [editAvatarFile, setEditAvatarFile] = useState(null);
  const [editAvatarPreview, setEditAvatarPreview] = useState("");

  const [confirm, setConfirm] = useState({ open: false, mode: "", id: null });

  // новое: модалка регистрации
  const [createOpen, setCreateOpen] = useState(false);

  const show = (text, type = "success", ms = 4000) => {
    setNote({ text, type });
    window.setTimeout(() => setNote({ text: "", type: "" }), ms);
  };

  const load = async () => {
    try {
      const { data, status } = await api.get(LIST_URL);
      if (status === 200 && Array.isArray(data)) setUsers(data);
      else show(`Ошибка загрузки: ${status}`, "error");
    } catch (e) {
      console.error(e?.message || "Load error");
      show("Ошибка загрузки", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { setPage(1); }, [query]);

  const openEdit = (u) => {
    setEditUser(u);
    setEditForm({
      username: u.username || "",
      email: u.email || "",
      first_name: u.first_name || "",
      last_name: u.last_name || "",
      phone: u.phone || "",
      role: u.role || "realtor",
    });
    setEditAvatarFile(null);
    setEditAvatarPreview(u.avatar ? String(u.avatar) : "");
  };

  const closeEdit = () => {
    setEditUser(null);
    setEditAvatarFile(null);
    setEditAvatarPreview("");
  };

  const onAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\//.test(file.type)) { show("Выберите изображение", "error"); return; }
    if (file.size > 5 * 1024 * 1024) { show("Изображение до 5 МБ", "error"); return; }
    setEditAvatarFile(file);
    setEditAvatarPreview(URL.createObjectURL(file));
  };

  const existsBy = (field, value, excludeId = null) => {
    const v = String(value || "").trim().toLowerCase();
    if (!v) return false;
    return users.some((u) => String(u?.[field] || "").trim().toLowerCase() === v && u?.id !== excludeId);
  };

  const validateEdit = () => {
    if (!editForm.username.trim() || editForm.username.trim().length < 2) { show("Введите логин (мин. 2 символа)", "error"); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email.trim())) { show("Введите корректный email", "error"); return false; }
    if (!editForm.role) { show("Выберите роль", "error"); return false; }
    if (existsBy("username", editForm.username, editUser?.id)) { show("Дубликат логина", "error"); return false; }
    if (existsBy("email", editForm.email, editUser?.id)) { show("Дубликат email", "error"); return false; }
    return true;
  };

  const askConfirm = (mode, id) => setConfirm({ open: true, mode, id });
  const closeConfirm = () => setConfirm({ open: false, mode: "", id: null });

  const onConfirm = async () => {
    if (confirm.mode === "edit" && editUser?.id === confirm.id) {
      if (!validateEdit()) { closeConfirm(); return; }
      try {
        let res;
        if (editAvatarFile) {
          const fd = new FormData();
          Object.entries(editForm).forEach(([k, v]) => fd.append(k, v ?? ""));
          fd.append("avatar", editAvatarFile);
          res = await api.put(EDIT_URL(editUser.id), fd, { headers: { "Content-Type": "multipart/form-data" } });
        } else {
          res = await api.put(EDIT_URL(editUser.id), editForm);
        }
        if (res.status === 200) {
          const updated = res.data;
          setUsers((prev) => prev.map((u) => (u.id === editUser.id ? updated : u)));
          show("Сотрудник обновлён", "success");
          closeEdit();
        } else {
          show(`Ошибка обновления: ${res.status}`, "error");
        }
      } catch (e) {
        console.error(e?.message || "Update error");
        const m = e?.response?.data?.detail || "Ошибка обновления";
        show(m, "error");
      } finally {
        closeConfirm();
      }
    } else if (confirm.mode === "delete" && confirm.id) {
      try {
        const res = await api.delete(DELETE_URL(confirm.id));
        if (res.status === 204 || res.status === 200) {
          setUsers((prev) => prev.filter((u) => u.id !== confirm.id));
          show("Сотрудник удалён", "success");
        } else {
          show(`Ошибка удаления: ${res.status}`, "error");
        }
      } catch (e) {
        console.error(e?.message || "Delete error");
        const m = e?.response?.data?.detail || "Ошибка удаления";
        show(m, "error");
      } finally {
        closeConfirm();
      }
    } else {
      closeConfirm();
    }
  };

  const filtered = useMemo(() => {
    const s = String(query || "").trim().toLowerCase();
    if (!s) return users;
    return users.filter((u) => {
      const name = `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase();
      return (
        String(u.username || "").toLowerCase().includes(s) ||
        name.includes(s) ||
        String(u.email || "").toLowerCase().includes(s) ||
        String(u.phone || "").toLowerCase().includes(s)
      );
    });
  }, [users, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const slice = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  if (loading) return <div className="employee__loading">Загрузка…</div>;

  return (
    <section className="employee">
      <div className="employee__container">
        <h1 className="employee__title">Сотрудники</h1>

        {note.text ? <div className={`employee__note employee__note--${note.type}`}>{note.text}</div> : null}

        <div className="employee__toolbar">
          <div className="employee__toolbar-row">
            <div className="employee__searchbar">
              <input
                className="employee__searchbar-input"
                placeholder="Поиск сотрудника"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="employee__addbtn"
              onClick={() => setCreateOpen(true)}
              aria-label="Добавить сотрудника"
              title="Добавить сотрудника"
            >
              <FiPlus />
            </button>
          </div>
        </div>

        <div className="employee__list" role="list">
          {slice.length > 0 ? (
            slice.map((user) => (
              <div key={user.id} className="employee__card" role="listitem">
                <div className="employee__card-head">
                  <img
                    src={user.avatar || "https://via.placeholder.com/40"}
                    alt={`${(user.first_name || "")} ${(user.last_name || "")}`.trim() || "Аватар"}
                    className="employee__avatar"
                  />
                  <div className="employee__name">
                    {`${user.first_name || ""} ${user.last_name || ""}`.trim() || "Без имени"}
                  </div>
                </div>
                <div className="employee__card-info">
                  <div className="employee__row"><span className="employee__label">Логин</span><span className="employee__value">@{user.username}</span></div>
                  <div className="employee__row"><span className="employee__label">Телефон</span><span className="employee__value">{user.phone || "Не указано"}</span></div>
                  <div className="employee__row"><span className="employee__label">Роль</span><span className="employee__value">{user.role === "realtor" ? "Агент по недвижимости" : "Админ"}</span></div>
                </div>
                <div className="employee__actions">
                  <button className="employee__btn employee__btn--ghost" onClick={() => openEdit(user)}>Редактировать</button>
                  <button className="employee__btn employee__btn--danger" onClick={() => askConfirm("delete", user.id)}>Удалить</button>
                </div>
              </div>
            ))
          ) : (
            <div className="employee__empty">Сотрудников нет</div>
          )}
        </div>

        {filtered.length > PAGE_SIZE ? (
          <div className="employee__pagination">
            <button className="employee__pagebtn" disabled={page <= 1} onClick={() => setPage(1)}>«</button>
            <button className="employee__pagebtn" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>‹</button>
            <span className="employee__pageinfo">{page} / {totalPages}</span>
            <button className="employee__pagebtn" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>›</button>
            <button className="employee__pagebtn" disabled={page >= totalPages} onClick={() => setPage(totalPages)}>»</button>
          </div>
        ) : null}

        {/* Модалка редактирования */}
        {editUser ? (
          <div className="employee__modal" role="dialog" aria-modal="true">
            <div className="employee__backdrop" onClick={() => setEditUser(null)}></div>
            <div className="employee__modal-card">
              <h3 className="employee__modal-title">Редактировать</h3>
              <div className="employee__form">
                <div className="employee__formgroup">
                  <label className="employee__formlabel">Аватар</label>
                  <div className="employee__avatarbox">
                    <img src={editAvatarPreview || "https://via.placeholder.com/64"} alt="Аватар" className="employee__avatar-preview" />
                    <input type="file" accept="image/*" className="employee__file" onChange={onAvatarChange} />
                  </div>
                </div>
                <div className="employee__formgrid">
                  <div className="employee__formgroup">
                    <label className="employee__formlabel">Логин</label>
                    <input className="employee__input" value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} />
                  </div>
                  <div className="employee__formgroup">
                    <label className="employee__formlabel">Email</label>
                    <input type="email" className="employee__input" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                  </div>
                  <div className="employee__formgroup">
                    <label className="employee__formlabel">Имя</label>
                    <input className="employee__input" value={editForm.first_name} onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })} />
                  </div>
                  <div className="employee__formgroup">
                    <label className="employee__formlabel">Фамилия</label>
                    <input className="employee__input" value={editForm.last_name} onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })} />
                  </div>
                  <div className="employee__formgroup">
                    <label className="employee__formlabel">Телефон</label>
                    <input className="employee__input" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                  </div>
                  <div className="employee__formgroup">
                    <label className="employee__formlabel">Роль</label>
                    <select className="employee__select" value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}>
                      <option value="admin">Админ</option>
                      <option value="realtor">Агент по недвижимости</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="employee__modal-actions">
                <button className="employee__btn employee__btn--muted" onClick={closeEdit}>Отмена</button>
                <button className="employee__btn" onClick={() => askConfirm("edit", editUser.id)}>Сохранить</button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Модалка подтверждения */}
        {confirm.open ? (
          <div className="employee__modal" role="dialog" aria-modal="true">
            <div className="employee__backdrop" onClick={closeConfirm}></div>
            <div className="employee__confirm-card">
              <h3 className="employee__modal-title">
                {confirm.mode === "delete" ? "Подтверждение удаления" : "Подтверждение изменений"}
              </h3>
              <p className="employee__confirm-text">
                {confirm.mode === "delete" ? "Удалить сотрудника?" : "Сохранить изменения?"}
              </p>
              <div className="employee__modal-actions">
                <button className="employee__btn employee__btn--muted" onClick={closeConfirm}>Отмена</button>
                <button className={`employee__btn ${confirm.mode === "delete" ? "employee__btn--danger" : ""}`} onClick={onConfirm}>Подтвердить</button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Модалка создания (Register) */}
        {createOpen ? (
          <div className="employee__modal" role="dialog" aria-modal="true">
            <div className="employee__backdrop" onClick={() => setCreateOpen(false)}></div>
            <div className="employee__modal-card employee__modal-card--wide">
              <button
                type="button"
                className="employee__modal-close"
                aria-label="Закрыть"
                onClick={() => setCreateOpen(false)}
                title="Закрыть"
              >
                <FiX />
              </button>
              <Register />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default Employee;
