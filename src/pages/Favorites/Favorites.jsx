import React, { useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import api from "../../Api/Api";
import ListingModal from "../Listings/ListingModal";
import {
  FaHeart,
  FaStar,
  FaRegStar,
  FaShareAlt,
  FaWhatsapp,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import "./Favorites.scss";

const USD_RATE = 85;
const PER_PAGE = 10; // фиксировано 10

const Favorites = ({ language = "ru" }) => {
  const intl = useIntl();

  const [favorites, setFavorites] = useState(() => {
    const raw = localStorage.getItem("favorites");
    const parsed = (() => {
      try {
        const v = JSON.parse(raw || "[]");
        return Array.isArray(v) ? v : [];
      } catch {
        return [];
      }
    })();
    // удаляем дубликаты по id
    const seen = new Set();
    return parsed.filter((x) => {
      const id = x?.id;
      if (id == null || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  });

  const [likedIds, setLikedIds] = useState(
    new Set(
      (() => {
        try {
          const raw = localStorage.getItem("likedListings") || "[]";
          const arr = JSON.parse(raw);
          return Array.isArray(arr) ? arr : [];
        } catch {
          return [];
        }
      })()
    )
  );

  const [userId] = useState(() => {
    const existing = localStorage.getItem("userId");
    if (existing) return existing;
    const gen = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("userId", gen);
    return gen;
  });

  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [request, setRequest] = useState({ name: "", contact_phone: "", message: "" });
  const [showRequestForm, setShowRequestForm] = useState(false);

  const [toast, setToast] = useState({ message: "", type: "" });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);

  // persist
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("likedListings", JSON.stringify([...likedIds]));
  }, [likedIds]);

  const list = useMemo(() => favorites, [favorites]);
  const totalPages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const pageClamped = Math.min(page, totalPages);

  useEffect(() => {
    if (page !== pageClamped) setPage(pageClamped);
    const root = document.querySelector(".favorites");
    if (root) root.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [pageClamped, page]);

  const pageSlice = useMemo(() => {
    const start = (pageClamped - 1) * PER_PAGE;
    return list.slice(start, start + PER_PAGE);
  }, [list, pageClamped]);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setToast({
        message: intl.formatMessage({ id: "link_copied", defaultMessage: "Ссылка скопирована!" }),
        type: "success",
      });
      setTimeout(() => setToast({ message: "", type: "" }), 1800);
    } catch {
      setError(intl.formatMessage({ id: "error_copy_link", defaultMessage: "Ошибка копирования ссылки" }));
      setTimeout(() => setError(""), 2000);
    }
  };

  const handleLike = async (id) => {
    if (likedIds.has(id)) return;
    try {
      setFavorites((prev) =>
        prev
          .map((x) => (x.id === id ? { ...x, likes_count: (x.likes_count || 0) + 1 } : x))
          .sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
      );
      setLikedIds((prev) => new Set([...prev, id]));
      await api.post(`/listings/listings/${id}/like/`, { userId, listingId: id });
      setSuccess(intl.formatMessage({ id: "like_added", defaultMessage: "Лайк добавлен!" }));
      setTimeout(() => setSuccess(""), 1600);
    } catch (e) {
      console.error(e?.message || "Ошибка при добавлении лайка");
      // откат
      setFavorites((prev) =>
        prev.map((x) => (x.id === id ? { ...x, likes_count: Math.max(0, (x.likes_count || 1) - 1) } : x))
      );
      setLikedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setError(intl.formatMessage({ id: "error_like", defaultMessage: "Ошибка при добавлении лайка" }));
      setTimeout(() => setError(""), 2000);
    }
  };

  const toggleFavorite = (listing) => {
    setFavorites((prev) => {
      const exists = prev.some((x) => x.id === listing.id);
      if (exists) {
        setSuccess(intl.formatMessage({ id: "removed_from_favorites", defaultMessage: "Удалено из избранного!" }));
        setTimeout(() => setSuccess(""), 1600);
        return prev.filter((x) => x.id !== listing.id);
      }
      setSuccess(intl.formatMessage({ id: "added_to_favorites", defaultMessage: "Добавлено в избранное!" }));
      setTimeout(() => setSuccess(""), 1600);
      const ids = new Set(prev.map((x) => x.id));
      return ids.has(listing.id) ? prev : [...prev, listing];
    });
  };

  const handleShare = (listing) => {
    copyToClipboard(`${window.location.origin}/listing/${listing.id}`);
  };

  const handleWhatsApp = (listing) => {
    const msg = intl.formatMessage(
      {
        id: "whatsapp_message",
        defaultMessage: 'Здравствуйте! Интересует объявление: "{title}" ({city}, {district})',
      },
      {
        title: listing.title || intl.formatMessage({ id: "no_title", defaultMessage: "Без названия" }),
        city: listing.location?.city || intl.formatMessage({ id: "not_specified", defaultMessage: "Не указан" }),
        district:
          listing.location?.district || intl.formatMessage({ id: "not_specified", defaultMessage: "Не указан" }),
      }
    );
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const openModal = (item) => {
    setSelected(item);
    setCurrentImageIndex(0);
    setShowRequestForm(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelected(null);
    setRequest({ name: "", contact_phone: "", message: "" });
    setShowRequestForm(false);
    setSuccess("");
    setError("");
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    if (!selected) return;
    try {
      const messageWithDetails = `${request.message || ""}\n${intl.formatMessage({
        id: "listing",
        defaultMessage: "Объявление",
      })}: ${selected.title}\n${intl.formatMessage({ id: "price", defaultMessage: "Цена" })}: ${
        parseFloat(selected.price || 0).toLocaleString("ru-RU")
      } ${intl.formatMessage({ id: "som", defaultMessage: "сом" })} / ${parseFloat(
        (selected.price || 0) / USD_RATE
      ).toFixed(2)} $`;

      await api.post("/listings/applications/", {
        name: request.name,
        contact_phone: request.contact_phone,
        message: messageWithDetails,
      });

      setSuccess(intl.formatMessage({ id: "request_sent", defaultMessage: "Заявка отправлена!" }));
      setTimeout(closeModal, 900);
    } catch (e) {
      console.error(e?.message || "Ошибка при отправке заявки");
      setError(intl.formatMessage({ id: "error_submit_request", defaultMessage: "Ошибка при отправке заявки" }));
      setTimeout(() => setError(""), 2000);
    }
  };

  const fmtProperty = (t) =>
    intl.formatMessage({
      id: `property_${t}`,
      defaultMessage:
        { apartment: "Квартира", house: "Дом/Участок", commercial: "Коммерческая" }[t] || "Не указан",
    });

  const fmtCommercial = (t) =>
    intl.formatMessage({
      id: `commercial_type_${t}`,
      defaultMessage:
        { office: "Офис", retail: "Торговая площадь", warehouse: "Склад", other: "Прочее" }[t] || "Не указан",
    });

  return (
    <section className="favorites">
      <div className="favorites__header">
        <h2 className="favorites__title">
          {intl.formatMessage({ id: "favorites", defaultMessage: "Избранное" })}
        </h2>
      </div>

      {error && <p className="favorites__error">{error}</p>}
      {success && <p className="favorites__success">{success}</p>}
      {toast.message && <div className={`favorites__toast favorites__toast--${toast.type}`}>{toast.message}</div>}

      {list.length === 0 ? (
        <p className="favorites__empty">
          {intl.formatMessage({ id: "no_favorites", defaultMessage: "Избранные объявления отсутствуют" })}
        </p>
      ) : (
        <>
          <div className="favorites__grid">
            {pageSlice.map((item) => (
              <article key={item.id} className="favorites__card">
                {item.images?.[0]?.image ? (
                  <img
                    className="favorites__image"
                    src={item.images[0].image}
                    alt={intl.formatMessage({
                      id: "property_image_alt",
                      defaultMessage: "Изображение недвижимости",
                    })}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = "/no-image.png";
                    }}
                  />
                ) : (
                  <div className="favorites__no_image">
                    {intl.formatMessage({ id: "no_images", defaultMessage: "Изображения отсутствуют" })}
                  </div>
                )}

                <div className="favorites__content">
                  <h3 className="favorites__card_title" onClick={() => openModal(item)}>
                    {item.title || intl.formatMessage({ id: "no_title", defaultMessage: "Без названия" })}
                  </h3>

                  {/* адрес/локацию убрали по требованию */}

                  <p className="favorites__price">
                    {`${parseFloat(item.price || 0).toLocaleString("ru-RU")} ${intl.formatMessage({
                      id: "som",
                      defaultMessage: "сом",
                    })} / ${parseFloat((item.price || 0) / USD_RATE).toFixed(2)} $`}
                  </p>

                  <div className="favorites__details">
                    <span>
                      {item.rooms || "N/A"} {intl.formatMessage({ id: "rooms_short", defaultMessage: "комн." })}
                    </span>
                    <span>
                      {item.area || "N/A"} {intl.formatMessage({ id: "square_meters", defaultMessage: "м²" })}
                    </span>
                    {item.floor && (
                      <span>
                        {intl.formatMessage({ id: "floor", defaultMessage: "Этаж" })}: {item.floor}
                      </span>
                    )}
                    {item.land_area && (
                      <span>
                        {item.land_area} {intl.formatMessage({ id: "sotka", defaultMessage: "соток" })}
                      </span>
                    )}
                    {item.commercial_type && <span>{fmtCommercial(item.commercial_type)}</span>}
                    <span>{fmtProperty(item.property_type)}</span>
                  </div>

                  <div className="favorites__actions">
                    <button
                      type="button"
                      className={`favorites__icon_btn ${likedIds.has(item.id) ? "favorites__icon_btn--liked" : ""}`}
                      onClick={() => handleLike(item.id)}
                      disabled={likedIds.has(item.id)}
                      title={intl.formatMessage({ id: "like_button", defaultMessage: "Лайк" })}
                    >
                      <FaHeart />
                      <span>{item.likes_count || 0}</span>
                    </button>

                    <button
                      type="button"
                      className="favorites__icon_btn"
                      onClick={() => toggleFavorite(item)}
                      title={intl.formatMessage({ id: "favorite_button", defaultMessage: "Избранное" })}
                    >
                      {favorites.some((f) => f.id === item.id) ? <FaStar /> : <FaRegStar />}
                    </button>

                    <button
                      type="button"
                      className="favorites__icon_btn"
                      onClick={() => handleShare(item)}
                      title={intl.formatMessage({ id: "share_button", defaultMessage: "Поделиться" })}
                    >
                      <FaShareAlt />
                    </button>

                    <button
                      type="button"
                      className="favorites__icon_btn favorites__icon_btn--whatsapp"
                      onClick={() => handleWhatsApp(item)}
                      title="WhatsApp"
                      aria-label="WhatsApp"
                    >
                      <FaWhatsapp />
                    </button>

                    <button type="button" className="favorites__btn" onClick={() => openModal(item)}>
                      {intl.formatMessage({ id: "details_button", defaultMessage: "Подробнее" })}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <nav className="favorites__pagination" aria-label="Пагинация">
            <button
              type="button"
              className="favorites__page_btn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pageClamped === 1}
              aria-label={intl.formatMessage({ id: "prev", defaultMessage: "Назад" })}
            >
              <FaChevronLeft />
            </button>
            <ul className="favorites__pages">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <li key={n}>
                  <button
                    type="button"
                    className={`favorites__page_num ${n === pageClamped ? "favorites__page_num--active" : ""}`}
                    onClick={() => setPage(n)}
                    aria-current={n === pageClamped ? "page" : undefined}
                  >
                    {n}
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="favorites__page_btn"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={pageClamped === totalPages}
              aria-label={intl.formatMessage({ id: "next", defaultMessage: "Вперёд" })}
            >
              <FaChevronRight />
            </button>
          </nav>
        </>
      )}

      {modalOpen && selected && (
        <ListingModal
          selectedListing={selected}
          closeModal={closeModal}
          currentImageIndex={currentImageIndex}
          setCurrentImageIndex={setCurrentImageIndex}
          showRequestForm={showRequestForm}
          toggleRequestForm={() => setShowRequestForm((v) => !v)}
          requestData={request}
          handleRequestChange={(e) => setRequest({ ...request, [e.target.name]: e.target.value })}
          handleRequestSubmit={submitApplication}
          handleLike={handleLike}
          handleFavorite={toggleFavorite}
          handleShare={handleShare}
          handleWhatsApp={handleWhatsApp}
          likedListings={likedIds}
          favorites={favorites}
          formatPropertyType={(t) =>
            intl.formatMessage({
              id: `property_${t}`,
              defaultMessage:
                { apartment: "Квартира", house: "Дом/Участок", commercial: "Коммерческая" }[t] || "Не указан",
            })
          }
          formatDealType={(t) => t}
          formatCondition={(t) => t}
          formatDocument={(t) => t}
          formatComplex={(id) => id}
          formatUtilities={(t) => t}
          formatPurpose={(t) => t}
          formatCommercialType={(t) =>
            intl.formatMessage({
              id: `commercial_type_${t}`,
              defaultMessage:
                { office: "Офис", retail: "Торговая площадь", warehouse: "Склад", other: "Прочее" }[t] || "Не указан",
            })
          }
          language={language}
        />
      )}
    </section>
  );
};

export default Favorites;
