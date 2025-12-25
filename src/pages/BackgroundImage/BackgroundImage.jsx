// import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import api from "../../Api/Api";
// import "./BackgroundImage.scss";

// const AUTOPLAY_MS = 5000;

// const BackgroundImage = () => {
//   const [images, setImages] = useState([]);
//   const [idx, setIdx] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState("");
//   const sliderRef = useRef(null);

//   // fetch images
//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       try {
//         const { data } = await api.get("/listings/images/");
//         const arr = Array.isArray(data) ? data : data?.image ? [data] : [];
//         const valid = arr
//           .filter((i) => i && typeof i.image === "string" && i.image.trim().length)
//           .map((i) => ({ id: i.id ?? i.image, image: i.image, thumbnail: i.thumbnail || i.image }));
//         // deduplicate by image url
//         const seen = new Set();
//         const unique = valid.filter((i) => (seen.has(i.image) ? false : (seen.add(i.image), true)));
//         if (mounted) setImages(unique);
//       } catch (e) {
//         console.error(e?.message || "Ошибка загрузки изображений");
//         if (mounted) setErr("Не удалось загрузить изображения. Попробуйте позже.");
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     })();
//     return () => {
//       mounted = false;
//     };
//   }, []);

//   // autoplay
//   useEffect(() => {
//     if (images.length <= 1) return;
//     const t = setInterval(() => setIdx((p) => (p + 1) % images.length), AUTOPLAY_MS);
//     return () => clearInterval(t);
//   }, [images.length]);

//   // keyboard navigation
//   useEffect(() => {
//     const h = (e) => {
//       if (!images.length) return;
//       if (e.key === "ArrowLeft") setIdx((p) => (p - 1 + images.length) % images.length);
//       if (e.key === "ArrowRight") setIdx((p) => (p + 1) % images.length);
//     };
//     window.addEventListener("keydown", h);
//     return () => window.removeEventListener("keydown", h);
//   }, [images.length]);

//   const go = useCallback(
//     (to) => {
//       if (!images.length) return;
//       const next = ((to % images.length) + images.length) % images.length;
//       setIdx(next);
//       sliderRef.current?.focus({ preventScroll: true });
//     },
//     [images.length]
//   );

//   const current = useMemo(() => images[idx], [images, idx]);

//   if (loading) return <div className="background-image__loading">Загрузка…</div>;
//   if (err) return <div className="background-image__error">{err}</div>;

//   return (
//     <section className="background-image" aria-label="Слайдер изображений">
//       {images.length === 0 ? (
//         <div className="background-image__placeholder" />
//       ) : (
//         <>
//           <div
//             className="background-image__slider"
//             ref={sliderRef}
//             tabIndex={0}
//             aria-roledescription="carousel"
//             aria-label="Фоновый слайдер"
//           >
//             {images.length > 1 && (
//               <button
//                 type="button"
//                 className="background-image__button background-image__button--prev"
//                 onClick={() => go(idx - 1)}
//                 aria-label="Предыдущее изображение"
//               >
//                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                   <path d="M15 18l-6-6 6-6" />
//                 </svg>
//               </button>
//             )}

//             <img
//               key={current?.image}
//               src={current?.image}
//               srcSet={
//                 current?.thumbnail
//                   ? `${current.thumbnail} 800w, ${current.image} 1920w`
//                   : `${current?.image} 1920w`
//               }
//               sizes="(max-width: 768px) 800px, 1920px"
//               alt="Слайд"
//               className="background-image__img"
//             />

//             {images.length > 1 && (
//               <button
//                 type="button"
//                 className="background-image__button background-image__button--next"
//                 onClick={() => go(idx + 1)}
//                 aria-label="Следующее изображение"
//               >
//                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                   <path d="M9 18l6-6-6-6" />
//                 </svg>
//               </button>
//             )}
//           </div>

//           {images.length > 1 && (
//             <>
//               <ul className="background-image__dots" role="tablist" aria-label="Пагинация слайдов">
//                 {images.map((_, i) => (
//                   <li key={i}>
//                     <button
//                       type="button"
//                       role="tab"
//                       aria-selected={i === idx}
//                       aria-label={`Слайд ${i + 1}`}
//                       className={
//                         "background-image__dot" +
//                         (i === idx ? " background-image__dot--active" : "")
//                       }
//                       onClick={() => go(i)}
//                     />
//                   </li>
//                 ))}
//               </ul>

//               <div className="background-image__thumbs" aria-label="Миниатюры" tabIndex={-1}>
//                 {images.map((im, i) => (
//                   <button
//                     type="button"
//                     key={im.image}
//                     className={
//                       "background-image__thumb" +
//                       (i === idx ? " background-image__thumb--active" : "")
//                     }
//                     onClick={() => go(i)}
//                     aria-label={`Открыть слайд ${i + 1}`}
//                     title={`Слайд ${i + 1}`}
//                   >
//                     <img src={im.thumbnail || im.image} alt="" />
//                   </button>
//                 ))}
//               </div>
//             </>
//           )}
//         </>
//       )}
//     </section>
//   );
// };

// export default BackgroundImage;


import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "../../Api/Api";
import "./BackgroundImage.scss";

const AUTOPLAY_MS = 5000;

const BackgroundImage = () => {
  const [images, setImages] = useState([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [ratio, setRatio] = useState(16 / 9);
  const [box, setBox] = useState({ h: 420, cover: false });
  const sliderRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get("/listings/images/");
        const arr = Array.isArray(data) ? data : data?.image ? [data] : [];
        const valid = arr
          .filter((i) => i && typeof i.image === "string" && i.image.trim().length)
          .map((i) => ({ id: i.id ?? i.image, image: i.image, thumbnail: i.thumbnail || i.image }));
        const seen = new Set();
        const unique = valid.filter((i) => (seen.has(i.image) ? false : (seen.add(i.image), true)));
        if (mounted) setImages(unique);
      } catch (e) {
        console.error(e?.message || "Ошибка загрузки изображений");
        if (mounted) setErr("Не удалось загрузить изображения. Попробуйте позже.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const recalcBox = useCallback((r) => {
    const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    const maxH = Math.floor(vh * 0.78);
    const hByWidth = Math.floor(vw / r);
    const cover = hByWidth > maxH;
    const h = Math.max(240, Math.min(maxH, hByWidth));
    setBox({ h, cover });
  }, []);

  useEffect(() => {
    recalcBox(ratio);
    const onResize = () => recalcBox(ratio);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [ratio, recalcBox]);

  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => setIdx((p) => (p + 1) % images.length), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [images.length]);

  useEffect(() => {
    const h = (e) => {
      if (!images.length) return;
      if (e.key === "ArrowLeft") setIdx((p) => (p - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") setIdx((p) => (p + 1) % images.length);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [images.length]);

  const go = useCallback(
    (to) => {
      if (!images.length) return;
      const next = ((to % images.length) + images.length) % images.length;
      setIdx(next);
      sliderRef.current?.focus({ preventScroll: true });
    },
    [images.length]
  );

  const current = useMemo(() => images[idx], [images, idx]);

  if (loading) return <div className="background-image__loading">Загрузка…</div>;
  if (err) return <div className="background-image__error">{err}</div>;

  return (
    <section className="background-image" aria-label="Слайдер изображений">
      {images.length === 0 ? (
        <div className="background-image__placeholder" />
      ) : (
        <div
          className="background-image__slider"
          ref={sliderRef}
          tabIndex={0}
          aria-roledescription="carousel"
          aria-label="Фоновый слайдер"
          style={{ height: `${box.h}px` }}
        >
          {images.length > 1 && (
            <button
              type="button"
              className="background-image__button background-image__button--prev"
              onClick={() => go(idx - 1)}
              aria-label="Предыдущее изображение"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}

          <img
            key={current?.image}
            src={current?.image}
            srcSet={
              current?.thumbnail
                ? `${current.thumbnail} 800w, ${current.image} 1920w`
                : `${current?.image} 1920w`
            }
            sizes="100vw"
            alt="Слайд"
            className={
              "background-image__img" + (box.cover ? " background-image__img--cover" : "")
            }
            onLoad={(e) => {
              const w = e.currentTarget.naturalWidth || 16;
              const h = e.currentTarget.naturalHeight || 9;
              const r = Math.max(0.2, Math.min(5, w / h));
              setRatio(r);
              recalcBox(r);
            }}
          />

          {images.length > 1 && (
            <button
              type="button"
              className="background-image__button background-image__button--next"
              onClick={() => go(idx + 1)}
              aria-label="Следующее изображение"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          )}
        </div>
      )}
    </section>
  );
};

export default BackgroundImage;
