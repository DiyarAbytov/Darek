import React, { useEffect, useMemo, useRef, useState } from "react";
import api from "../../Api/Api";
import "./About.scss";

const PAGE_SIZE = 10;

const About = ({ language = "ru" }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [page, setPage] = useState(1);

  const listRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/listings/text-message/");
        if (!mounted) return;
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e?.message || "Ошибка загрузки текстов");
        if (mounted) setErr("Не удалось загрузить тексты. Попробуйте позже.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;

  const pageSlice = useMemo(
    () => items.slice(start, start + PAGE_SIZE),
    [items, start]
  );

  useEffect(() => {
    listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const goTo = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  const pickText = (it) => (language === "ru" ? it.text_ru : it.text_ky) || "";

  return (
    <section id="about" className="about" aria-label="О нас">
      <div className="about__container">
        <h2 className="about__title">О нас</h2>

        <div className="about__content">
          {loading ? (
            <p className="about__text">Загрузка…</p>
          ) : err ? (
            <p className="about__text">{err}</p>
          ) : total === 0 ? (
            <p className="about__text">Нет текстов.</p>
          ) : (
            <>
              <div ref={listRef} className="about__list" aria-live="polite">
                {pageSlice.map((it) => (
                  <p key={it.id} className="about__text">
                    {pickText(it)}
                  </p>
                ))}
              </div>

              {totalPages > 1 && (
                <nav className="pagination" aria-label="Пагинация">
                  <button
                    type="button"
                    className="pagination__btn"
                    onClick={() => goTo(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Назад
                  </button>

                  <ul className="pagination__list">
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const p = i + 1;
                      return (
                        <li key={p}>
                          <button
                            type="button"
                            className={
                              "pagination__page" +
                              (p === currentPage ? " pagination__page--active" : "")
                            }
                            onClick={() => goTo(p)}
                          >
                            {p}
                          </button>
                        </li>
                      );
                    })}
                  </ul>

                  <button
                    type="button"
                    className="pagination__btn"
                    onClick={() => goTo(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Вперёд
                  </button>
                </nav>
              )}
            </>
          )}

          {/* Карточки статистики как на скрине */}
          <div className="about__stats">
            <div className="about__stat">
              <span className="about__stat-num">5+</span>
              <p className="about__stat-label">Лет опыта</p>
            </div>
            <div className="about__stat">
              <span className="about__stat-num">1000+</span>
              <p className="about__stat-label">Сделок</p>
            </div>
            <div className="about__stat">
              <span className="about__stat-num">1000+</span>
              <p className="about__stat-label">Довольных клиентов</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
