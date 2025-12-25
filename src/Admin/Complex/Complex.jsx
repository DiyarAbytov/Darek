import React, { useEffect, useMemo, useState } from "react";
import "./Complex.scss";
import api from "../../Api/Api";

const endpoint = "/listings/single-field/";
const PAGE_SIZE = 10;

const Complex = () => {
  const [list, setList] = useState([]);
  const [query, setQuery] = useState("");
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [note, setNote] = useState({ text: "", type: "" });
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState({ open: false, mode: "", id: null, payload: "" });

  const show = (text, type = "success", ms = 4000) => {
    setNote({ text, type });
    window.setTimeout(() => setNote({ text: "", type: "" }), ms);
  };

  const load = async () => {
    try {
      const { data, status } = await api.get(endpoint);
      if (status === 200 && Array.isArray(data)) setList(data);
      else show(`Ошибка загрузки: ${status}`, "error");
    } catch (e) {
      console.error(e?.message || "Load error");
      show("Ошибка загрузки", "error");
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { setPage(1); }, [query]);

  const exists = (name, excludeId = null) => {
    const v = String(name || "").trim().toLowerCase();
    if (!v) return false;
    return list.some((i) => String(i?.value || "").trim().toLowerCase() === v && i?.id !== excludeId);
  };

  const add = async (ev) => {
    ev.preventDefault();
    const v = String(newName || "").trim();
    if (v.length < 2) { show("Введите название (минимум 2 символа)", "error"); return; }
    if (exists(v)) { show("Такой комплекс уже существует", "error"); return; }
    try {
      const { status } = await api.post(endpoint, { value: v });
      if (status === 201 || status === 200) {
        setNewName("");
        show("Комплекс добавлен", "success");
        await load();
      } else {
        show(`Ошибка добавления: ${status}`, "error");
      }
    } catch (e) {
      console.error(e?.message || "Create error");
      const m = e?.response?.data?.detail || "Ошибка добавления";
      show(m, "error");
    }
  };

  const startEdit = (item) => {
    setEditId(item.id);
    setEditValue(item.value);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditValue("");
  };

  const openConfirm = (mode, id, payload = "") => {
    setConfirm({ open: true, mode, id, payload });
  };

  const closeConfirm = () => setConfirm({ open: false, mode: "", id: null, payload: "" });

  const onConfirm = async () => {
    if (confirm.mode === "edit") {
      const v = String(confirm.payload || "").trim();
      if (v.length < 2) { show("Введите корректное название", "error"); closeConfirm(); return; }
      if (exists(v, confirm.id)) { show("Дубликат названия", "error"); closeConfirm(); return; }
      try {
        const { status } = await api.put(`${endpoint}${confirm.id}/`, { value: v });
        if (status === 200) {
          show("Комплекс обновлён", "success");
          setEditId(null);
          setEditValue("");
          await load();
        } else {
          show(`Ошибка обновления: ${status}`, "error");
        }
      } catch (e) {
        console.error(e?.message || "Update error");
        const m = e?.response?.data?.detail || "Ошибка обновления";
        show(m, "error");
      } finally {
        closeConfirm();
      }
    } else if (confirm.mode === "delete") {
      try {
        const { status } = await api.delete(`${endpoint}${confirm.id}/`);
        if (status === 204 || status === 200) {
          show("Комплекс удалён", "success");
          await load();
        } else {
          show(`Ошибка удаления: ${status}`, "error");
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
    if (!s) return list;
    return list.filter((i) => String(i?.value || "").toLowerCase().includes(s));
  }, [list, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const slice = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  return (
    <section className="complex">
      <div className="complex__container">
        <h1 className="complex__title">Комплексы</h1>

        {note.text ? <div className={`complex__notification complex__notification--${note.type}`}>{note.text}</div> : null}

        <div className="complex__panel">
          <form className="complex__form" onSubmit={add} noValidate>
            <div className="complex__input-group">
              <input
                className="complex__input"
                placeholder="Название комплекса"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <button type="submit" className="complex__button">
                <svg viewBox="0 0 24 24"><path d="M12 5v14m-7-7h14"/></svg>
                Добавить
              </button>
            </div>
          </form>

          <div className="complex__searchbar">
            <input
              className="complex__searchbar-input"
              placeholder="Поиск комплекса"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="complex__list" role="list">
          {slice.length > 0 ? slice.map((item) => (
            <div key={item.id} className="complex__item" role="listitem">
              <div className="complex__item-icon">
                <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2z"/></svg>
              </div>

              {editId === item.id ? (
                <div className="complex__input-group complex__input-group--inline">
                  <input
                    className="complex__input"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                  />
                  <button
                    type="button"
                    className="complex__button"
                    onClick={() => openConfirm("edit", item.id, editValue)}
                  >
                    <svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                    Сохранить
                  </button>
                  <button type="button" className="complex__button complex__button--muted" onClick={cancelEdit}>
                    <svg viewBox="0 0 24 24"><path d="M6 6l12 12M6 18L18 6"/></svg>
                    Отмена
                  </button>
                </div>
              ) : (
                <>
                  <div className="complex__item-text">{item.value}</div>
                  <div className="complex__actions">
                    <button type="button" className="complex__button complex__button--ghost" onClick={() => startEdit(item)}>
                      <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0L15 5.25l3.75 3.75z"/></svg>
                      Редактировать
                    </button>
                    <button type="button" className="complex__button complex__button--danger" onClick={() => openConfirm("delete", item.id)}>
                      <svg viewBox="0 0 24 24"><path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6zm3-14l1-1h4l1 1h4v2H5V5z"/></svg>
                      Удалить
                    </button>
                  </div>
                </>
              )}
            </div>
          )) : (
            <div className="complex__empty">Нет данных</div>
          )}
        </div>

        {filtered.length > PAGE_SIZE ? (
          <div className="complex__pagination">
            <button className="complex__pager-btn" disabled={page <= 1} onClick={() => setPage(1)}>«</button>
            <button className="complex__pager-btn" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>‹</button>
            <span className="complex__pager-info">{page} / {Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))}</span>
            <button className="complex__pager-btn" disabled={page >= Math.ceil(filtered.length / PAGE_SIZE)} onClick={() => setPage((p) => Math.min(Math.ceil(filtered.length / PAGE_SIZE), p + 1))}>›</button>
            <button className="complex__pager-btn" disabled={page >= Math.ceil(filtered.length / PAGE_SIZE)} onClick={() => setPage(Math.ceil(filtered.length / PAGE_SIZE))}>»</button>
          </div>
        ) : null}

        {confirm.open ? (
          <div className="complex__modal" role="dialog" aria-modal="true">
            <div className="complex__modal-backdrop" onClick={closeConfirm}></div>
            <div className="complex__modal-card">
              <h3 className="complex__modal-title">
                {confirm.mode === "edit" ? "Подтвердите изменение" : "Подтвердите удаление"}
              </h3>
              {confirm.mode === "edit" ? (
                <p className="complex__modal-text">Сохранить название: «{confirm.payload || ""}»?</p>
              ) : (
                <p className="complex__modal-text">Действительно удалить комплекс?</p>
              )}
              <div className="complex__modal-actions">
                <button className="complex__button complex__button--muted" onClick={closeConfirm}>Отмена</button>
                <button className={`complex__button ${confirm.mode === "delete" ? "complex__button--danger" : ""}`} onClick={onConfirm}>Подтвердить</button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default Complex;
