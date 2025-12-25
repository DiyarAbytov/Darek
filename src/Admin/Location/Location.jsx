import React, { useEffect, useMemo, useRef, useState } from "react";
import "./Location.scss";
import api from "../../Api/Api";

const LIST_URL = "/listings/locations/list/";
const CREATE_URL = "/listings/locations/create/";
const DELETE_URL = (id) => `/listings/locations/${id}/delete/`;
const PAGE_SIZE = 10;

const Location = () => {
  const [items, setItems] = useState([]);
  const [note, setNote] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(true);

  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [confirm, setConfirm] = useState({ open: false, id: null });

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
      show("Ошибка загрузки локаций", "error");
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

  const pairKey = (c, d) => `${String(c || "").trim().toLowerCase()}|${String(d || "").trim().toLowerCase()}`;
  const hasDuplicate = (c, d) => items.some((x) => pairKey(x.city, x.district) === pairKey(c, d));

  const validate = () => {
    const c = String(city).trim();
    const d = String(district).trim();
    if (!c || !d) { show("Заполните город и район", "error"); return false; }
    if (c.length < 2 || d.length < 2) { show("Минимум 2 символа в каждом поле", "error"); return false; }
    if (hasDuplicate(c, d)) { show("Такая локация уже существует", "error"); return false; }
    return true;
  };

  const add = async () => {
    if (!validate()) return;
    try {
      const res = await api.post(CREATE_URL, { city: city.trim(), district: district.trim() });
      if (res.status === 201 || res.status === 200) {
        setItems((prev) => [...prev, res.data]);
        setCity(""); setDistrict("");
        show("Локация добавлена", "success");
      } else show(`Ошибка добавления: ${res.status}`, "error");
    } catch (e) {
      console.error(e?.message || "Create error");
      const m = e?.response?.data?.detail || "Ошибка добавления";
      show(m, "error");
    }
  };

  const askDelete = (id) => setConfirm({ open: true, id });
  const closeConfirm = () => setConfirm({ open: false, id: null });

  const onDelete = async () => {
    const id = confirm.id;
    if (!id) { closeConfirm(); return; }
    try {
      const res = await api.delete(DELETE_URL(id));
      if (res.status === 204 || res.status === 200) {
        setItems((prev) => prev.filter((x) => x.id !== id));
        show("Локация удалена", "success");
      } else show(`Ошибка удаления: ${res.status}`, "error");
    } catch (e) {
      console.error(e?.message || "Delete error");
      const m = e?.response?.data?.detail || "Ошибка удаления";
      show(m, "error");
    } finally {
      closeConfirm();
    }
  };

  const filtered = useMemo(() => {
    const s = String(query || "").trim().toLowerCase();
    if (!s) return items;
    return items.filter((it) =>
      String(it.city || "").toLowerCase().includes(s) ||
      String(it.district || "").toLowerCase().includes(s) ||
      `${it.city || ""}, ${it.district || ""}`.toLowerCase().includes(s)
    );
  }, [items, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSlice = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const suggestions = useMemo(() => {
    const s = String(query || "").trim().toLowerCase();
    if (!s) return [];
    const pool = items
      .map((x) => `${x.city || ""}, ${x.district || ""}`)
      .filter((n) => n.toLowerCase().includes(s));
    return Array.from(new Set(pool)).slice(0, 60);
  }, [items, query]);

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

  if (loading) return <div className="location__loading">Загрузка…</div>;

  return (
    <section className="location">
      <div className="location__container">
        <h1 className="location__title">Локации</h1>

        {note.text ? <div className={`location__note location__note--${note.type}`}>{note.text}</div> : null}

        <div className="location__toolbar">
          <div className="location__form">
            <input
              className="location__input"
              placeholder="Город"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <input
              className="location__input"
              placeholder="Район"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            />
            <button className="location__btn" onClick={add}>
              <svg viewBox="0 0 24 24"><path d="M12 5v14m-7-7h14"/></svg>
              Добавить
            </button>
          </div>

          <div ref={comboRef} className="location__search" role="combobox" aria-expanded={comboOpen} aria-haspopup="listbox">
            <input
              className="location__search-input"
              placeholder="Поиск: город или район"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setComboOpen(e.target.value.trim().length > 0); setComboActive(-1); }}
              onFocus={() => { if (query.trim().length > 0) setComboOpen(true); }}
              onKeyDown={onComboKey}
              autoComplete="off"
            />
            {comboOpen && query.trim().length > 0 ? (
              <div className="location__search-dropdown" ref={listRef} role="listbox">
                {suggestions.length === 0 ? (
                  <div className="location__search-empty">Ничего не найдено</div>
                ) : suggestions.map((n, idx) => (
                  <div
                    key={`${n}-${idx}`}
                    data-idx={idx}
                    className={`location__search-option ${idx === comboActive ? "is-active" : ""}`}
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

        <div className="location__list">
          {pageSlice.length > 0 ? pageSlice.map((loc) => (
            <div key={loc.id} className="location__item">
              <div className="location__item-icon">
                <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div className="location__item-text">{loc.city}, {loc.district}</div>
              <button className="location__btn location__btn--danger" onClick={() => askDelete(loc.id)}>
                <svg viewBox="0 0 24 24"><path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6zm3-14l1-1h4l1 1h4v2H5V5z"/></svg>
                Удалить
              </button>
            </div>
          )) : (
            <div className="location__empty">Нет локаций</div>
          )}
        </div>

        {filtered.length > PAGE_SIZE ? (
          <div className="location__pagination">
            <button className="location__pagebtn" disabled={page <= 1} onClick={() => setPage(1)}>«</button>
            <button className="location__pagebtn" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>‹</button>
            <span className="location__pageinfo">{page} / {totalPages}</span>
            <button className="location__pagebtn" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>›</button>
            <button className="location__pagebtn" disabled={page >= totalPages} onClick={() => setPage(totalPages)}>»</button>
          </div>
        ) : null}

        {confirm.open ? (
          <div className="location__modal" role="dialog" aria-modal="true">
            <div className="location__backdrop" onClick={closeConfirm}></div>
            <div className="location__confirm-card">
              <h3 className="location__modal-title">Подтверждение удаления</h3>
              <p className="location__confirm-text">Удалить выбранную локацию?</p>
              <div className="location__modal-actions">
                <button className="location__btn location__btn--muted" onClick={closeConfirm}>Отмена</button>
                <button className="location__btn location__btn--danger" onClick={onDelete}>Удалить</button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default Location;
