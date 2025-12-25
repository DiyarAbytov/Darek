import React, { useEffect, useMemo, useRef, useState } from "react";
import "./ImageAdmin.scss";
import api from "../../Api/Api";

const LIST_URL = "/listings/images/";
const PAGE_SIZE = 10;

const ImageAdmin = () => {
  const [items, setItems] = useState([]);
  const [note, setNote] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(true);

  const [file, setFile] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [confirm, setConfirm] = useState({ open: false, id: null });

  const show = (text, type = "success", ms = 4000) => {
    setNote({ text, type });
    window.setTimeout(() => setNote({ text: "", type: "" }), ms);
  };

  const parseName = (u) => {
    try {
      const s = String(u || "");
      const ix = s.lastIndexOf("/");
      return ix >= 0 ? s.slice(ix + 1) : s;
    } catch {
      return "";
    }
  };

  const load = async () => {
    try {
      const { data, status } = await api.get(LIST_URL);
      if (status === 200 && Array.isArray(data)) {
        setItems(data);
        if (data.length && !selectedId) setSelectedId(data[0].id);
      } else {
        show(`Ошибка загрузки: ${status}`, "error");
      }
    } catch (e) {
      console.error(e?.message || "Load error");
      show("Ошибка загрузки изображений", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { setPage(1); }, [query]);

  const namesSet = useMemo(() => {
    const m = new Map();
    items.forEach((it) => {
      const n = parseName(it.image).toLowerCase();
      if (n && !m.has(n)) m.set(n, true);
    });
    return m;
  }, [items]);

  const onChooseFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return setFile(null);
    if (!/^image\//.test(f.type)) { show("Выберите файл изображения", "error"); return; }
    if (f.size > 5 * 1024 * 1024) { show("Размер до 5 МБ", "error"); return; }
    const n = String(f.name || "").trim().toLowerCase();
    if (namesSet.has(n)) { show("Такое изображение уже загружено", "error"); return; }
    setFile(f);
  };

  const upload = async () => {
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    try {
      const res = await api.post(LIST_URL, fd, { headers: { "Content-Type": "multipart/form-data" } });
      if (res.status === 201 || res.status === 200) {
        setItems((prev) => [...prev, res.data]);
        setFile(null);
        show("Изображение добавлено", "success");
        if (!selectedId) setSelectedId(res.data.id);
      } else {
        show(`Ошибка добавления: ${res.status}`, "error");
      }
    } catch (e) {
      console.error(e?.message || "Create error");
      const m = e?.response?.data?.detail || "Ошибка добавления изображения";
      show(m, "error");
    }
  };

  const askDelete = (id) => setConfirm({ open: true, id });
  const closeConfirm = () => setConfirm({ open: false, id: null });

  const onDelete = async () => {
    const id = confirm.id;
    if (!id) { closeConfirm(); return; }
    try {
      const res = await api.delete(`${LIST_URL}${id}/`);
      if (res.status === 204 || res.status === 200) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        if (selectedId === id) setSelectedId(null);
        show("Изображение удалено", "success");
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
  };

  const filtered = useMemo(() => {
    const s = String(query || "").trim().toLowerCase();
    if (!s) return items;
    return items.filter((i) => parseName(i.image).toLowerCase().includes(s));
  }, [items, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const slice = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const suggestions = useMemo(() => {
    const s = String(query || "").trim().toLowerCase();
    if (!s) return [];
    return filtered
      .map((i) => parseName(i.image))
      .filter((n) => n.toLowerCase().includes(s))
      .slice(0, 50);
  }, [filtered, query]);

  const [comboOpen, setComboOpen] = useState(false);
  const [comboActive, setComboActive] = useState(-1);
  const comboRef = useRef(null);
  const listRef = useRef(null);

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

  if (loading) return <div className="image-admin__loading">Загрузка…</div>;

  return (
    <section className="image-admin">
      <div className="image-admin__container">
        <h1 className="image-admin__title">Изображения</h1>

        {note.text ? <div className={`image-admin__note image-admin__note--${note.type}`}>{note.text}</div> : null}

        <div className="image-admin__toolbar">
          <div className="image-admin__uploader">
            <input type="file" accept="image/*" className="image-admin__file" onChange={onChooseFile} />
            <button className="image-admin__btn" disabled={!file} onClick={upload}>
              <svg viewBox="0 0 24 24"><path d="M12 5v14m-7-7h14"/></svg>
              Добавить
            </button>
          </div>

          <div ref={comboRef} className="image-admin__search" role="combobox" aria-expanded={comboOpen} aria-haspopup="listbox">
            <input
              className="image-admin__search-input"
              placeholder="Поиск по названию файла"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setComboOpen(e.target.value.trim().length > 0); setComboActive(-1); }}
              onFocus={() => { if (query.trim().length > 0) setComboOpen(true); }}
              onKeyDown={onComboKey}
              autoComplete="off"
            />
            {comboOpen && query.trim().length > 0 ? (
              <div className="image-admin__search-dropdown" ref={listRef} role="listbox">
                {suggestions.length === 0 ? (
                  <div className="image-admin__search-empty">Ничего не найдено</div>
                ) : suggestions.map((n, idx) => (
                  <div
                    key={`${n}-${idx}`}
                    data-idx={idx}
                    className={`image-admin__search-option ${idx === comboActive ? "is-active" : ""}`}
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

        <div className="image-admin__content">
          <div className="image-admin__grid">
            {slice.length > 0 ? slice.map((it) => (
              <div
                key={it.id}
                className={`image-admin__card ${selectedId === it.id ? "is-selected" : ""}`}
                onClick={() => setSelectedId(it.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") setSelectedId(it.id); }}
              >
                <img
                  src={it.image}
                  alt={parseName(it.image) || "Изображение"}
                  className="image-admin__thumb"
                  onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/240x160?text=No+Image"; }}
                />
                <div className="image-admin__name" title={parseName(it.image)}>{parseName(it.image)}</div>
                <button className="image-admin__btn image-admin__btn--danger" onClick={(ev) => { ev.stopPropagation(); askDelete(it.id); }}>
                  <svg viewBox="0 0 24 24"><path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6zm3-14l1-1h4l1 1h4v2H5V5z"/></svg>
                  Удалить
                </button>
              </div>
            )) : (
              <div className="image-admin__empty">Нет изображений</div>
            )}
          </div>

          {previewOpen && selectedId ? (
            <div className="image-admin__preview">
              <img
                src={(items.find((x) => x.id === selectedId) || {}).image}
                alt="Просмотр"
                className="image-admin__preview-img"
                onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/800x500?text=No+Image"; }}
              />
            </div>
          ) : null}
        </div>

        {filtered.length > PAGE_SIZE ? (
          <div className="image-admin__pagination">
            <button className="image-admin__pagebtn" disabled={page <= 1} onClick={() => setPage(1)}>«</button>
            <button className="image-admin__pagebtn" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>‹</button>
            <span className="image-admin__pageinfo">{page} / {totalPages}</span>
            <button className="image-admin__pagebtn" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>›</button>
            <button className="image-admin__pagebtn" disabled={page >= totalPages} onClick={() => setPage(totalPages)}>»</button>
          </div>
        ) : null}

        <div className="image-admin__switch">
          <label className="image-admin__switch-lbl">
            <input type="checkbox" checked={previewOpen} onChange={() => setPreviewOpen((v) => !v)} />
            <span>Показывать предпросмотр</span>
          </label>
        </div>

        {confirm.open ? (
          <div className="image-admin__modal" role="dialog" aria-modal="true">
            <div className="image-admin__backdrop" onClick={closeConfirm}></div>
            <div className="image-admin__confirm-card">
              <h3 className="image-admin__modal-title">Подтверждение удаления</h3>
              <p className="image-admin__confirm-text">Удалить выбранное изображение?</p>
              <div className="image-admin__modal-actions">
                <button className="image-admin__btn image-admin__btn--muted" onClick={closeConfirm}>Отмена</button>
                <button className="image-admin__btn image-admin__btn--danger" onClick={onDelete}>Удалить</button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default ImageAdmin;
