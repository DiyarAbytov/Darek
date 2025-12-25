import React, { useEffect, useMemo, useRef, useState } from "react";
import "./AboutUs.scss";
import api from "../../Api/Api";

const LIST_URL = "/listings/text-message/";
const PAGE_SIZE = 10;

const AboutUs = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState({ text: "", type: "" });

  const [newRu, setNewRu] = useState("");
  const [newKy, setNewKy] = useState("");

  const [editId, setEditId] = useState(null);
  const [editRu, setEditRu] = useState("");
  const [editKy, setEditKy] = useState("");

  const [confirm, setConfirm] = useState({ open: false, mode: "", id: null });

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [comboOpen, setComboOpen] = useState(false);
  const [comboActive, setComboActive] = useState(-1);
  const comboRef = useRef(null);
  const listRef = useRef(null);

  const show = (text, type = "success", ms = 4000) => {
    setNote({ text, type });
    window.setTimeout(() => setNote({ text: "", type: "" }), ms);
  };

  const load = async () => {
    try {
      const { data, status } = await api.get(LIST_URL);
      if (status === 200 && Array.isArray(data)) setItems(data);
      else show(`Ошибка загрузки: ${status}`, "error");
    } catch (e) {
      console.error(e?.message || "Load error");
      show("Ошибка загрузки текстов", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { setPage(1); }, [query]);

  useEffect(() => {
    const onDoc = (e) => { if (!comboRef.current) return; if (!comboRef.current.contains(e.target)) setComboOpen(false); };
    document.addEventListener("mousedown", onDoc, true);
    return () => document.removeEventListener("mousedown", onDoc, true);
  }, []);

  useEffect(() => {
    if (comboOpen && listRef.current && comboActive >= 0) {
      const el = listRef.current.querySelector(`[data-idx="${comboActive}"]`);
      if (el?.scrollIntoView) el.scrollIntoView({ block: "nearest" });
    }
  }, [comboOpen, comboActive]);

  const filtered = useMemo(() => {
    const s = String(query || "").trim().toLowerCase();
    if (!s) return items;
    return items.filter((it) =>
      String(it.text_ru || "").toLowerCase().includes(s) ||
      String(it.text_ky || "").toLowerCase().includes(s)
    );
  }, [items, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const slice = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const suggestions = useMemo(() => {
    const s = String(query || "").trim().toLowerCase();
    if (!s) return [];
    const pool = [];
    filtered.forEach((it) => {
      if (String(it.text_ru || "").toLowerCase().includes(s)) pool.push(it.text_ru);
      if (String(it.text_ky || "").toLowerCase().includes(s)) pool.push(it.text_ky);
    });
    const uniq = Array.from(new Set(pool));
    return uniq.slice(0, 50);
  }, [filtered, query]);

  const existsPair = (ru, ky, excludeId = null) => {
    const r = String(ru || "").trim().toLowerCase();
    const k = String(ky || "").trim().toLowerCase();
    if (!r || !k) return false;
    return items.some((it) => String(it.text_ru || "").trim().toLowerCase() === r &&
      String(it.text_ky || "").trim().toLowerCase() === k && it.id !== excludeId);
  };

  const validatePair = (ru, ky, excludeId = null) => {
    if (!String(ru).trim() || !String(ky).trim()) { show("Оба поля должны быть заполнены", "error"); return false; }
    if (String(ru).trim().length < 2 || String(ky).trim().length < 2) { show("Минимум 2 символа в каждом поле", "error"); return false; }
    if (existsPair(ru, ky, excludeId)) { show("Дубликат текста", "error"); return false; }
    return true;
  };

  const askConfirm = (mode, id) => setConfirm({ open: true, mode, id });
  const closeConfirm = () => setConfirm({ open: false, mode: "", id: null });

  const addItem = async () => {
    if (!validatePair(newRu, newKy)) return;
    try {
      const res = await api.post(LIST_URL, { text_ru: newRu.trim(), text_ky: newKy.trim() });
      if (res.status === 201 || res.status === 200) {
        setItems((prev) => [...prev, res.data]);
        setNewRu(""); setNewKy("");
        show("Текст добавлен", "success");
      } else show(`Ошибка добавления: ${res.status}`, "error");
    } catch (e) {
      console.error(e?.message || "Create error");
      const m = e?.response?.data?.detail || "Ошибка добавления текста";
      show(m, "error");
    }
  };

  const openEdit = (it) => {
    setEditId(it.id);
    setEditRu(it.text_ru || "");
    setEditKy(it.text_ky || "");
  };

  const confirmAction = async () => {
    if (confirm.mode === "edit" && editId === confirm.id) {
      if (!validatePair(editRu, editKy, editId)) { closeConfirm(); return; }
      try {
        const res = await api.put(`${LIST_URL}${editId}/`, { text_ru: editRu.trim(), text_ky: editKy.trim() });
        if (res.status === 200) {
          const upd = res.data;
          setItems((prev) => prev.map((x) => (x.id === editId ? upd : x)));
          setEditId(null); setEditRu(""); setEditKy("");
          show("Текст обновлён", "success");
        } else show(`Ошибка обновления: ${res.status}`, "error");
      } catch (e) {
        console.error(e?.message || "Update error");
        const m = e?.response?.data?.detail || "Ошибка обновления";
        show(m, "error");
      } finally {
        closeConfirm();
      }
    } else if (confirm.mode === "delete" && confirm.id) {
      try {
        const res = await api.delete(`${LIST_URL}${confirm.id}/`);
        if (res.status === 204 || res.status === 200) {
          setItems((prev) => prev.filter((x) => x.id !== confirm.id));
          show("Текст удалён", "success");
        } else show(`Ошибка удаления: ${res.status}`, "error");
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

  const onComboKey = (e) => {
    if (!comboOpen && (e.key === "ArrowDown" || e.key === "Enter")) {
      if (query.trim().length === 0) return;
      e.preventDefault();
      setComboOpen(true);
      return;
    }
    if (!comboOpen) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setComboActive((i) => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setComboActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions[comboActive]) {
        setQuery(suggestions[comboActive]);
        setComboOpen(false);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setComboOpen(false);
    }
  };

  if (loading) return <div className="aboutus__loading">Загрузка…</div>;

  return (
    <section className="aboutus">
      <div className="aboutus__container">
        <h1 className="aboutus__title">О нас</h1>

        {note.text ? <div className={`aboutus__note aboutus__note--${note.type}`}>{note.text}</div> : null}

        <div className="aboutus__toolbar">
          <div className="aboutus__form">
            <input
              className="aboutus__input"
              placeholder="Текст на русском"
              value={newRu}
              onChange={(e) => setNewRu(e.target.value)}
            />
            <input
              className="aboutus__input"
              placeholder="Текст на кыргызском"
              value={newKy}
              onChange={(e) => setNewKy(e.target.value)}
            />
            <button className="aboutus__btn" onClick={addItem}>
              <svg viewBox="0 0 24 24"><path d="M12 5v14m-7-7h14"/></svg>
              Добавить
            </button>
          </div>

          <div ref={comboRef} className="aboutus__search" role="combobox" aria-expanded={comboOpen} aria-haspopup="listbox">
            <input
              className="aboutus__search-input"
              placeholder="Поиск по текстам"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setComboOpen(e.target.value.trim().length > 0); setComboActive(-1); }}
              onFocus={() => { if (query.trim().length > 0) setComboOpen(true); }}
              onKeyDown={onComboKey}
              autoComplete="off"
            />
            {comboOpen && query.trim().length > 0 ? (
              <div className="aboutus__search-dropdown" ref={listRef} role="listbox">
                {suggestions.length === 0 ? (
                  <div className="aboutus__search-empty">Ничего не найдено</div>
                ) : suggestions.map((n, idx) => (
                  <div
                    key={`${n}-${idx}`}
                    data-idx={idx}
                    className={`aboutus__search-option ${idx === comboActive ? "is-active" : ""}`}
                    role="option"
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setComboActive(idx)}
                    onClick={() => { setQuery(n); setComboOpen(false); }}
                  >
                    {n}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="aboutus__list" role="list">
          {slice.length > 0 ? slice.map((it) => (
            <div key={it.id} className="aboutus__item" role="listitem">
              {editId === it.id ? (
                <>
                  <input className="aboutus__input" value={editRu} onChange={(e) => setEditRu(e.target.value)} placeholder="Текст на русском" />
                  <input className="aboutus__input" value={editKy} onChange={(e) => setEditKy(e.target.value)} placeholder="Текст на кыргызском" />
                  <div className="aboutus__actions">
                    <button className="aboutus__btn aboutus__btn--muted" onClick={() => { setEditId(null); setEditRu(""); setEditKy(""); }}>Отмена</button>
                    <button className="aboutus__btn" onClick={() => askConfirm("edit", it.id)}>Сохранить</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="aboutus__pair"><span className="aboutus__label">RU</span><span className="aboutus__value">{it.text_ru}</span></div>
                  <div className="aboutus__pair"><span className="aboutus__label">KY</span><span className="aboutus__value">{it.text_ky}</span></div>
                  <div className="aboutus__actions">
                    <button className="aboutus__btn aboutus__btn--ghost" onClick={() => openEdit(it)}>Редактировать</button>
                    <button className="aboutus__btn aboutus__btn--danger" onClick={() => askConfirm("delete", it.id)}>Удалить</button>
                  </div>
                </>
              )}
            </div>
          )) : (
            <div className="aboutus__empty">Записей нет</div>
          )}
        </div>

        {filtered.length > PAGE_SIZE ? (
          <div className="aboutus__pagination">
            <button className="aboutus__pagebtn" disabled={page <= 1} onClick={() => setPage(1)}>«</button>
            <button className="aboutus__pagebtn" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>‹</button>
            <span className="aboutus__pageinfo">{page} / {totalPages}</span>
            <button className="aboutus__pagebtn" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>›</button>
            <button className="aboutus__pagebtn" disabled={page >= totalPages} onClick={() => setPage(totalPages)}>»</button>
          </div>
        ) : null}

        {confirm.open ? (
          <div className="aboutus__modal" role="dialog" aria-modal="true">
            <div className="aboutus__backdrop" onClick={closeConfirm}></div>
            <div className="aboutus__confirm-card">
              <h3 className="aboutus__modal-title">{confirm.mode === "delete" ? "Подтверждение удаления" : "Подтверждение изменений"}</h3>
              <p className="aboutus__confirm-text">{confirm.mode === "delete" ? "Удалить запись?" : "Сохранить изменения?"}</p>
              <div className="aboutus__modal-actions">
                <button className="aboutus__btn aboutus__btn--muted" onClick={closeConfirm}>Отмена</button>
                <button className={`aboutus__btn ${confirm.mode === "delete" ? "aboutus__btn--danger" : ""}`} onClick={confirmAction}>Подтвердить</button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default AboutUs;
