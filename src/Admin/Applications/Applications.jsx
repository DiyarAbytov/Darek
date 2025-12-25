// Applications.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./Applications.scss";
import api from "../../Api/Api";

const LIST_URL = "/listings/bit/";
const DELETE_URL = (id) => `/listings/bit/${id}/`;
const PAGE_SIZE = 10;

const Applications = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState({ text: "", type: "" });
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [details, setDetails] = useState({ open: false, item: null });

  const [comboOpen, setComboOpen] = useState(false);
  const [comboActive, setComboActive] = useState(-1);
  const comboRef = useRef(null);
  const listRef = useRef(null);

  const show = (text, type = "success", ms = 4000) => {
    setNote({ text, type });
    window.setTimeout(() => setNote({ text: "", type: "" }), ms);
  };

  const normalize = (data) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
  };

  const load = async () => {
    try {
      const { data, status } = await api.get(LIST_URL);
      if (status === 200) {
        const arr = normalize(data)
          .filter((x) => x && typeof x === "object")
          .sort(
            (a, b) =>
              new Date(b?.created_at || b?.created || b?.createdAt || 0) -
              new Date(a?.created_at || a?.created || a?.createdAt || 0)
          );
        setItems(arr);
      } else {
        show(`Ошибка загрузки: ${status}`, "error");
      }
    } catch (e) {
      show("Ошибка загрузки заявок", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { setPage(1); }, [query]);

  useEffect(() => {
    const onDoc = (e) => {
      if (!comboRef.current) return;
      if (!comboRef.current.contains(e.target)) setComboOpen(false);
    };
    document.addEventListener("mousedown", onDoc, true);
    return () => document.removeEventListener("mousedown", onDoc, true);
  }, []);

  useEffect(() => {
    if (comboOpen && listRef.current && comboActive >= 0) {
      const el = listRef.current.querySelector(`[data-idx="${comboActive}"]`);
      if (el?.scrollIntoView) el.scrollIntoView({ block: "nearest" });
    }
  }, [comboOpen, comboActive]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (confirm.open) setConfirm({ open: false, id: null });
        if (details.open) setDetails({ open: false, item: null });
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [confirm.open, details.open]);

  const formatDate = (v) => {
    try { return new Date(v).toLocaleString("ru-RU"); } catch { return ""; }
  };

  const filtered = useMemo(() => {
    const s = String(query || "").trim().toLowerCase();
    if (!s) return items;
    return items.filter((it) => {
      const msg =
        it?.message ?? it?.text ?? it?.content ?? it?.comment ?? it?.body ?? "";
      return (
        String(it.name || "").toLowerCase().includes(s) ||
        String(it.contact_phone || "").toLowerCase().includes(s) ||
        String(msg).toLowerCase().includes(s)
      );
    });
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
      .flatMap((x) => {
        const n = String(x?.name || "").trim();
        const p = String(x?.contact_phone || "").trim();
        const msg =
          String(
            x?.message ?? x?.text ?? x?.content ?? x?.comment ?? x?.body ?? ""
          ).trim();
        const joined = [n, p].filter(Boolean).join(" — ");
        const alt = msg.length > 40 ? `${msg.slice(0, 40)}…` : msg;
        return [joined, alt].filter(Boolean);
      })
      .filter((v) => v.toLowerCase().includes(s));
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
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setComboActive((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setComboActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
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

  const openConfirm = (id) => setConfirm({ open: true, id });
  const closeConfirm = () => setConfirm({ open: false, id: null });

  const openDetails = (item) => setDetails({ open: true, item });
  const closeDetails = () => setDetails({ open: false, item: null });
  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text || ""); show("Скопировано"); }
    catch { show("Не удалось скопировать", "error"); }
  };

  const onDelete = async () => {
    const id = confirm.id;
    if (!id) { closeConfirm(); return; }
    try {
      const res = await api.delete(DELETE_URL(id));
      if (res.status === 204 || res.status === 200) {
        setItems((prev) => {
          const next = prev.filter((x) => x.id !== id);
          const start = (page - 1) * PAGE_SIZE;
          if (start >= next.length && page > 1) setPage((p) => p - 1);
          return next;
        });
        show("Заявка удалена", "success");
      } else {
        show(`Ошибка удаления: ${res.status}`, "error");
      }
    } catch {
      const m = "Ошибка удаления";
      show(m, "error");
    } finally {
      closeConfirm();
    }
  };

  if (loading) return <div className="applications__loading">Загрузка…</div>;

  return (
    <section className="applications">
      <div className="applications__container">
        <div className="applications__header">
          <h1 className="applications__title">Заявки</h1>
        </div>

        {note.text ? (
          <div className={`applications__note applications__note--${note.type}`}>
            {note.text}
          </div>
        ) : null}

        <div className="applications__toolbar">
          <div
            ref={comboRef}
            className="applications__search"
            role="combobox"
            aria-expanded={comboOpen}
            aria-haspopup="listbox"
          >
            <input
              className="applications__search-input"
              placeholder="Поиск: имя, телефон или текст"
              value={query}
              onChange={(e) => {
                const v = e.target.value;
                setQuery(v);
                setComboOpen(v.trim().length > 0);
                setComboActive(-1);
              }}
              onFocus={() => { if (query.trim().length > 0) setComboOpen(true); }}
              onKeyDown={onComboKey}
              autoComplete="off"
            />
            {comboOpen && query.trim().length > 0 ? (
              <div className="applications__search-dropdown" ref={listRef} role="listbox">
                {suggestions.length === 0 ? (
                  <div className="applications__search-empty">Ничего не найдено</div>
                ) : suggestions.map((n, idx) => (
                  <div
                    key={`${n}-${idx}`}
                    data-idx={idx}
                    className={`applications__search-option ${idx === comboActive ? "is-active" : ""}`}
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

        <div className="applications__list">
          {pageSlice.length > 0 ? pageSlice.map((r) => {
            const msg = r?.message ?? r?.text ?? r?.content ?? r?.comment ?? r?.body ?? "";
            const created = r?.created_at ?? r?.created ?? r?.createdAt ?? "";
            return (
              <div
                key={r.id}
                className="applications__item"
                role="button"
                tabIndex={0}
                onClick={() => openDetails(r)}
                onKeyDown={(e) => { if (e.key === "Enter") openDetails(r); }}
              >
                <div className="applications__item-left">
                  <div className="applications__avatar">
                    <span className="applications__avatar-initial">
                      {String(r.name || "Гость").trim()[0]?.toUpperCase() || "Г"}
                    </span>
                  </div>
                  <div className="applications__meta">
                    <div className="applications__name">{r.name || "Не указано"}</div>
                    <div className="applications__phone">{r.contact_phone || "Не указано"}</div>
                    <div className="applications__date">{formatDate(created)}</div>
                  </div>
                </div>

                <div className="applications__message" title={msg}>
                  {msg || "Не указано"}
                </div>

                <div className="applications__actions">
                  <button
                    type="button"
                    className="applications__btn applications__btn--danger"
                    onClick={(e) => { e.stopPropagation(); openConfirm(r.id); }}
                  >
                    <svg viewBox="0 0 24 24">
                      <path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6zm3-14l1-1h4l1 1h4v2H5V5z"/>
                    </svg>
                    Удалить
                  </button>
                </div>
              </div>
            );
          }) : (
            <div className="applications__empty">Заявки отсутствуют</div>
          )}
        </div>

        {filtered.length > PAGE_SIZE ? (
          <div className="applications__pagination">
            <button className="applications__pagebtn" disabled={page <= 1} onClick={() => setPage(1)}>«</button>
            <button className="applications__pagebtn" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>‹</button>
            <span className="applications__pageinfo">{page} / {totalPages}</span>
            <button className="applications__pagebtn" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>›</button>
            <button className="applications__pagebtn" disabled={page >= totalPages} onClick={() => setPage(totalPages)}>»</button>
          </div>
        ) : null}

        {confirm.open ? (
          <div className="applications__modal" role="dialog" aria-modal="true">
            <div className="applications__backdrop" onClick={closeConfirm}></div>
            <div className="applications__confirm-card" role="document">
              <h3 className="applications__modal-title">Подтверждение удаления</h3>
              <p className="applications__confirm-text">Удалить выбранную заявку?</p>
              <div className="applications__modal-actions">
                <button className="applications__btn applications__btn--muted" onClick={closeConfirm}>Отмена</button>
                <button className="applications__btn applications__btn--danger" onClick={onDelete}>Удалить</button>
              </div>
            </div>
          </div>
        ) : null}

        {details.open ? (
          <div className="applications__modal" role="dialog" aria-modal="true">
            <div className="applications__backdrop" onClick={closeDetails}></div>
            <div className="applications__details-card" role="document">
              <h3 className="applications__modal-title">
                Заявка #{details.item?.id ?? "—"}
              </h3>

              <div className="applications__details-grid">
                <div><span className="applications__label">Имя:</span> <span className="applications__value">{details.item?.name || "Не указано"}</span></div>
                <div><span className="applications__label">Телефон:</span> <span className="applications__value">{details.item?.contact_phone || "Не указано"}</span></div>
                <div><span className="applications__label">Создано:</span> <span className="applications__value">
                  {formatDate(details.item?.created_at ?? details.item?.created ?? details.item?.createdAt)}
                </span></div>
              </div>

              <div className="applications__details-body" id="full-message">
                {details.item?.message ?? details.item?.text ?? details.item?.content ?? details.item?.comment ?? details.item?.body ?? "Не указано"}
              </div>

              <div className="applications__modal-actions">
                <button
                  className="applications__btn applications__btn--muted"
                  onClick={() => copy(
                    details.item?.message ?? details.item?.text ?? details.item?.content ?? details.item?.comment ?? details.item?.body ?? ""
                  )}
                >
                  Копировать
                </button>
                <button className="applications__btn" onClick={closeDetails}>Закрыть</button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default Applications;
