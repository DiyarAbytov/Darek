import React, { useEffect, useMemo, useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import api from "../../Api/Api";
import ListingModal from "./ListingModal";
import EditListingModal from "../../Admin/EditListing/EditListing";
import { FiHeart, FiStar, FiShare2, FiEdit2, FiTrash2 } from "react-icons/fi";
import "./Listings.scss";

/* ===== курс USD→KGS (кэш 6ч, несколько фолбэков) ===== */
const RATE_CACHE_KEY = "usd_kgs_rate_v1";
const RATE_TTL_MS = 6 * 60 * 60 * 1000;

async function fetchUsdKgsFromPrimary() {
  const r = await fetch("https://api.exchangerate.host/latest?base=USD&symbols=KGS");
  if (!r.ok) throw new Error("rate_primary_http");
  const j = await r.json();
  const rate = j?.rates?.KGS;
  if (typeof rate !== "number" || !isFinite(rate)) throw new Error("rate_primary_parse");
  return rate;
}
async function fetchUsdKgsFromSecondary() {
  const r = await fetch("https://open.er-api.com/v6/latest/USD");
  if (!r.ok) throw new Error("rate_secondary_http");
  const j = await r.json();
  const rate = j?.rates?.KGS;
  if (typeof rate !== "number" || !isFinite(rate)) throw new Error("rate_secondary_parse");
  return rate;
}
async function getUsdToKgsRate() {
  try {
    const cached = JSON.parse(localStorage.getItem(RATE_CACHE_KEY) || "null");
    const now = Date.now();
    if (cached && typeof cached.rate === "number" && now - cached.ts < RATE_TTL_MS) {
      return cached.rate;
    }
  } catch {}
  let rate = null;
  try {
    rate = await fetchUsdKgsFromPrimary();
  } catch {
    try {
      rate = await fetchUsdKgsFromSecondary();
    } catch {}
  }
  if (typeof rate === "number") {
    try {
      localStorage.setItem(RATE_CACHE_KEY, JSON.stringify({ rate, ts: Date.now() }));
    } catch {}
    return rate;
  }
  return null;
}

const Listings = ({ searchParams = {}, selectedListingId = null }) => {
  const intl = useIntl();

  const [listings, setListings] = useState([]);
  const [complexes, setComplexes] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [usdKgs, setUsdKgs] = useState(null);

  const listingsPerPage = 8;
  const [page, setPage] = useState(1);

  const [selectedListing, setSelectedListing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [likedListings, setLikedListings] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("likedListings") || "[]"));
    } catch {
      return new Set();
    }
  });
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("favorites") || "[]");
    } catch {
      return [];
    }
  });
  const [userId] = useState(() => {
    try {
      return localStorage.getItem("userId") || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    } catch {
      return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
  });

  const [toast, setToast] = useState({ message: "", type: "" });
  const toastTimer = useRef(null);

  const [requestData, setRequestData] = useState({ name: "", contact_phone: "", message: "" });
  const [showRequestForm, setShowRequestForm] = useState(false);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // подтверждение удаления
  const [confirm, setConfirm] = useState({ open: false, id: null, title: "" });

  const showToast = (messageId, type) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message: intl.formatMessage({ id: messageId, defaultMessage: messageId }), type });
    toastTimer.current = setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  const safeArray = (d) =>
    Array.isArray(d?.results) ? d.results : Array.isArray(d) ? d : [];

  const formatSom = (usd) => {
    if (typeof usd !== "number" || !isFinite(usd)) return "";
    if (typeof usdKgs !== "number") return "";
    const som = Math.floor(usd * usdKgs);
    return `${som.toLocaleString("ru-RU")} ${intl.formatMessage({ id: "som", defaultMessage: "сом" })}`;
  };

  const fetchProfile = async () => {
    try {
      const { data } = await api.get("/users/me/");
      setUserRole(data?.role || "");
    } catch (e) {
      console.error(e?.message || "error_fetch_profile");
      setUserRole("");
      showToast("error_fetch_profile", "error");
    }
  };

  const fetchListings = async ({ preservePage = false } = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(searchParams).forEach(([k, v]) => {
        if (v !== undefined && v !== null && String(v) !== "") params.append(k, v);
      });
      const { data } = await api.get(`/listings/listings/?${params.toString()}`);
      const arr = safeArray(data);
      const sorted = [...arr].sort((a, b) => {
        const l = (b.likes_count || 0) - (a.likes_count || 0);
        if (l) return l;
        return new Date(b?.created_at || 0) - new Date(a?.created_at || 0);
      });
      setListings(sorted);

      const total = Math.max(1, Math.ceil(sorted.length / listingsPerPage));
      if (preservePage) {
        setPage((p) => Math.min(Math.max(1, p), total));
      } else {
        setPage(1);
      }
    } catch (e) {
      console.error(e?.message || "error_fetch_listings");
      setListings([]);
      showToast("error_fetch_listings", "error");
    }
  };

  const fetchComplexes = async () => {
    try {
      const { data } = await api.get("/listings/single-field/");
      setComplexes(safeArray(data));
    } catch (e) {
      console.error(e?.message || "error_fetch_complexes");
      setComplexes([]);
      showToast("error_fetch_complexes", "error");
    }
  };

  const fetchListingById = async (id) => {
    try {
      const { data } = await api.get(`/listings/listings/${id}/`);
      setSelectedListing(data);
      setIsModalOpen(true);
      setCurrentImageIndex(0);
    } catch (e) {
      console.error(e?.message || "error_fetch_listing");
      showToast("error_fetch_listing", "error");
    }
  };

  // Открыть подтверждение удаления
  const openDeleteConfirm = (listing, event) => {
    if (event) event.stopPropagation();
    setConfirm({ open: true, id: listing.id, title: listing.title || "" });
  };
  const closeDeleteConfirm = () => setConfirm({ open: false, id: null, title: "" });

  // Удаление с подтверждением
  const onConfirmDelete = async () => {
    if (!confirm.id) { closeDeleteConfirm(); return; }
    try {
      await api.delete(`/listings/listings/${confirm.id}/`);
      setListings((prev) => {
        const next = prev.filter((l) => l.id !== confirm.id);
        // корректируем пагинацию, если текущая страница стала "пустой"
        const totalPages = Math.max(1, Math.ceil(next.length / listingsPerPage));
        setPage((p) => Math.min(p, totalPages));
        return next;
      });
      showToast("listing_deleted", "success");
    } catch (e) {
      console.error(e?.message || "error_delete");
      showToast("error_delete", "error");
    } finally {
      closeDeleteConfirm();
    }
  };

  const handleEdit = (listing, event) => {
    event.stopPropagation();
    setSelectedListing(listing);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedListing(null);
    fetchListings({ preservePage: true });
  };

  const handleLike = async (listingId, event) => {
    if (event) event.stopPropagation();
    if (likedListings.has(listingId)) return;
    try {
      setListings((prev) =>
        [...prev]
          .map((l) => (l.id === listingId ? { ...l, likes_count: (l.likes_count || 0) + 1 } : l))
          .sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
      );
      const next = new Set(likedListings);
      next.add(listingId);
      setLikedListings(next);
      await api.post(`/listings/listings/${listingId}/like/`, { userId, listingId });
      showToast("like_added", "success");
    } catch (e) {
      console.error(e?.message || "error_like");
      showToast("error_like", "error");
    }
  };

  const handleFavorite = (listing, event) => {
    if (event) event.stopPropagation();
    setFavorites((prev) => {
      const exists = prev.some((x) => x.id === listing.id);
      showToast(exists ? "removed_from_favorites" : "added_to_favorites", "success");
      if (exists) return prev.filter((x) => x.id !== listing.id);
      const out = [...prev, listing];
      const seen = new Set();
      return out.filter((x) => (seen.has(x.id) ? false : (seen.add(x.id), true)));
    });
  };

  const handleShare = (listing, event) => {
    if (event) event.stopPropagation();
    try {
      const shareUrl = `${window.location.origin}/listing/${listing.id}`;
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => showToast("link_copied", "success"))
        .catch(() => showToast("error_copy", "error"));
    } catch (e) {
      console.error(e?.message || "error_copy");
      showToast("error_copy", "error");
    }
  };

  const handlePageChange = (newPage) => setPage(newPage);

  const openModal = (listing) => {
    setSelectedListing(listing);
    setIsModalOpen(true);
    setCurrentImageIndex(0);
    setShowRequestForm(false);
    try {
      window.history.pushState({}, "", `/listing/${listing.id}`);
    } catch (e) {
      console.error(e?.message || "history_push_error");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedListing(null);
    setRequestData({ name: "", contact_phone: "", message: "" });
  };

  const handleRequestChange = (e) =>
    setRequestData({ ...requestData, [e.target.name]: e.target.value });

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      const title =
        selectedListing?.title ||
        intl.formatMessage({ id: "no_title", defaultMessage: "Без названия" });
      const city =
        selectedListing?.location?.city ||
        intl.formatMessage({ id: "not_specified", defaultMessage: "Не указано" });
      const district =
        selectedListing?.location?.district ||
        intl.formatMessage({ id: "not_specified", defaultMessage: "Не указано" });
      const address =
        selectedListing?.address ||
        intl.formatMessage({ id: "not_specified", defaultMessage: "Не указано" });

      const p1 = Number(selectedListing?.price || 0);
      const p2 = Number(selectedListing?.price2 || 0);
      const p1Som = formatSom(p1);
      const p2Som = formatSom(p2);

      const lines = [
        `${intl.formatMessage({ id: "listing", defaultMessage: "Объявление" })}: ${title}`,
        `${intl.formatMessage({ id: "city", defaultMessage: "Город" })}: ${city}`,
        `${intl.formatMessage({ id: "district", defaultMessage: "Район" })}: ${district}`,
        `${intl.formatMessage({ id: "address", defaultMessage: "Адрес" })}: ${address}`,
        `${intl.formatMessage({ id: "price", defaultMessage: "Цена" })}: $${p1.toFixed(2)}${
          p1Som ? ` / ${p1Som}` : ""
        }`,
      ];
      if (p2 > 0) {
        lines.push(
          `${intl.formatMessage({ id: "price2", defaultMessage: "Вторая цена" })}: $${p2.toFixed(
            2
          )}${p2Som ? ` / ${p2Som}` : ""}`
        );
      }
      if (requestData.message?.trim()) {
        lines.push(
          `${intl.formatMessage({ id: "message", defaultMessage: "Сообщение" })}: ${
            requestData.message
          }`
        );
      }
      const messageWithDetails = lines.join("\n");

      await api.post("/listings/bit/", {
        name: requestData.name,
        contact_phone: requestData.contact_phone,
        message: messageWithDetails,
      });
      showToast("request_sent", "success");
      setTimeout(closeModal, 800);
    } catch (e) {
      console.error(e?.message || "error_submit_request");
      showToast("error_submit_request", "error");
    }
  };

  const handleWhatsApp = (listing) => {
    try {
      const message = intl.formatMessage(
        {
          id: "whatsapp_message",
          defaultMessage:
            "Здравствуйте, интересуюсь объявлением: {title}, {city}, {district}",
        },
        {
          title:
            listing.title ||
            intl.formatMessage({ id: "no_title", defaultMessage: "Без названия" }),
          city:
            listing.location?.city ||
            intl.formatMessage({ id: "not_specified", defaultMessage: "Не указано" }),
          district:
            listing.location?.district ||
            intl.formatMessage({ id: "not_specified", defaultMessage: "Не указано" }),
        }
      );
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
    } catch (e) {
      console.error(e?.message || "whatsapp_error");
    }
  };

  const toggleRequestForm = () => setShowRequestForm((s) => !s);

  const formatters = {
    propertyType: (type) =>
      intl.formatMessage({
        id: `property_${type || "default"}`,
        defaultMessage: type || "Не указано",
      }),
    dealType: (type) =>
      intl.formatMessage({
        id: `deal_type_${type || "default"}`,
        defaultMessage: type || "Не указано",
      }),
    condition: (type) =>
      intl.formatMessage({
        id: `condition_${type || "default"}`,
        defaultMessage: type || "Не указано",
      }),
    document: (type) =>
      intl.formatMessage({
        id: `document_${type || "default"}`,
        defaultMessage: type || "Не указано",
      }),
    complex: (complexId) => {
      const c = complexes.find((x) => x.id === complexId);
      return c
        ? c.value
        : intl.formatMessage({ id: "not_specified", defaultMessage: "Не указано" });
    },
    utilities: (type) =>
      intl.formatMessage({
        id: `utilities_${type || "default"}`,
        defaultMessage: type || "Не указано",
      }),
    purpose: (type) =>
      intl.formatMessage({
        id: `purpose_${type || "default"}`,
        defaultMessage: type || "Не указано",
      }),
    commercialType: (type) =>
      intl.formatMessage({
        id: `commercial_type_${type || "default"}`,
        defaultMessage: type || "Не указано",
      }),
  };

  useEffect(() => {
    fetchProfile();
    fetchListings();
    fetchComplexes();
    if (selectedListingId) fetchListingById(selectedListingId);
    getUsdToKgsRate().then(setUsdKgs).catch(() => setUsdKgs(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(searchParams), selectedListingId]);

  useEffect(() => {
    try {
      localStorage.setItem("userId", userId);
      localStorage.setItem("likedListings", JSON.stringify([...likedListings]));
      localStorage.setItem("favorites", JSON.stringify(favorites));
    } catch {}
  }, [userId, likedListings, favorites]);

  const totalPages = Math.max(1, Math.ceil(listings.length / listingsPerPage));
  const paginatedListings = useMemo(() => {
    const start = (page - 1) * listingsPerPage;
    return listings.slice(start, start + listingsPerPage);
  }, [listings, page]);

  const renderCard = (item) => {
    if (!item) return null;

    const cover =
      item.images?.length > 0 && item.images[0]?.image
        ? item.images[0].image
        : "https://via.placeholder.com/400";

    const isFav = favorites.some((f) => f.id === item.id);
    const isLiked = likedListings.has(item.id);

    const actions = [
      {
        onClick: (e) => handleLike(item.id, e),
        disabled: isLiked,
        className: isLiked ? "listings__action_button--liked" : "",
        title: intl.formatMessage({ id: "like_button", defaultMessage: "Лайк" }),
        icon: <FiHeart />,
        label: item.likes_count || 0,
      },
      {
        onClick: (e) => handleFavorite(item, e),
        disabled: false,
        className: isFav ? "listings__action_button--active" : "",
        title: intl.formatMessage({ id: "favorite_button", defaultMessage: "Избранное" }),
        icon: <FiStar />,
      },
      {
        onClick: (e) => handleShare(item, e),
        disabled: false,
        className: "",
        title: intl.formatMessage({ id: "share_button", defaultMessage: "Поделиться" }),
        icon: <FiShare2 />,
      },
    ];

    if (userRole === "admin") {
      actions.push(
        {
          onClick: (e) => handleEdit(item, e),
          disabled: false,
          className: "",
          title: intl.formatMessage({ id: "edit_button", defaultMessage: "Редактировать" }),
          icon: <FiEdit2 />,
        },
        {
          onClick: (e) => openDeleteConfirm(item, e), // теперь через подтверждение
          disabled: false,
          className: "",
          title: intl.formatMessage({ id: "delete_button", defaultMessage: "Удалить" }),
          icon: <FiTrash2 />,
        }
      );
    }

    const usd = Number(item.price || 0);
    const somText = formatSom(usd);

    return (
      <article
        key={item.id}
        className="listings__card"
        onClick={() => openModal(item)}
        style={{ cursor: "pointer" }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && openModal(item)}
      >
        {cover ? (
          <img
            src={cover}
            alt={
              item.title ||
              intl.formatMessage({
                id: "property_image_alt",
                defaultMessage: "Изображение недвижимости",
              })
            }
            className="listings__image"
            loading="lazy"
            onError={(e) => {
              console.error("image_error");
              e.currentTarget.src = "https://via.placeholder.com/400";
            }}
          />
        ) : (
          <div className="listings__no_image">
            <FormattedMessage id="no_images" defaultMessage="Изображения отсутствуют" />
          </div>
        )}

        <div className="listings__content">
          <h3 className="listings__cardTitle">
            {item.title || <FormattedMessage id="no_title" defaultMessage="Без названия" />}
          </h3>

          <p className="listings__address">
            {item.location?.city || (
              <FormattedMessage id="not_specified" defaultMessage="Не указано" />
            )}
            ,{" "}
            {item.location?.district || (
              <FormattedMessage id="not_specified" defaultMessage="Не указано" />
            )}
          </p>

          <p className="listings__price">
            <span className="dollar">
              ${usd.toFixed(2)}
              {somText ? ` / ${somText}` : ""}
            </span>
          </p>

          <div className="listings__details">
            {item.rooms && (
              <span>
                {item.rooms} <FormattedMessage id="rooms_short" defaultMessage="комн." />
              </span>
            )}
            {item.area && (
              <span>
                {item.area} <FormattedMessage id="square_meters" defaultMessage="м²" />
              </span>
            )}
            {item.floor && (
              <span>
                <FormattedMessage id="floor" defaultMessage="Этаж" />: {item.floor}
              </span>
            )}
            {item.land_area && (
              <span>
                {item.land_area} <FormattedMessage id="sotka" defaultMessage="соток" />
              </span>
            )}
            {item.commercial_type && <span>{formatters.commercialType(item.commercial_type)}</span>}
            <span>{formatters.propertyType(item.property_type)}</span>
          </div>

          <div className="listings__actions" onClick={(e) => e.stopPropagation()}>
            {actions.map(({ onClick, disabled, className, title, icon, label }, idx) => (
              <button
                key={idx}
                className={`listings__action_button ${className}`}
                onClick={onClick}
                disabled={disabled}
                title={title}
                aria-label={title}
                type="button"
              >
                {icon}
                {label !== undefined && <span>{label}</span>}
              </button>
            ))}
          </div>
        </div>
      </article>
    );
  };

  const shownCount = paginatedListings.length;
  const totalCount = listings.length;

  return (
    <section id="listings" className="listings">
      {toast.message && (
        <div
          className={`listings__toast listings__toast--${toast.type}`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}

      {/* счётчик "показано N из M" */}
      <div className="listings__meta">
        <div className="listings__counter">
          <FormattedMessage
            id="shown_of_total"
            defaultMessage="Показано {shown} из {total}"
            values={{ shown: shownCount, total: totalCount }}
          />
        </div>
      </div>

      {listings.length === 0 ? (
        <p className="listings__empty">
          <FormattedMessage id="no_listings" defaultMessage="Объявления не найдены" />
        </p>
      ) : (
        <>
          <div className="listings__grid">{paginatedListings.map((it) => renderCard(it))}</div>

          {totalPages > 1 && (
            <div
              className="listings__pagination"
              role="navigation"
              aria-label={intl.formatMessage({ id: "pagination", defaultMessage: "Пагинация" })}
            >
              <button
                className="listings__paginationButton"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                aria-label={intl.formatMessage({
                  id: "prev_page",
                  defaultMessage: "Предыдущая страница",
                })}
                type="button"
              >
                ←
              </button>
              <span className="listings__paginationText">
                {page} <FormattedMessage id="of" defaultMessage="из" /> {totalPages}
              </span>
              <button
                className="listings__paginationButton"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                aria-label={intl.formatMessage({
                  id: "next_page",
                  defaultMessage: "Следующая страница",
                })}
                type="button"
              >
                →
              </button>
            </div>
          )}
        </>
      )}

      {isModalOpen && selectedListing && (
        <ListingModal
          selectedListing={selectedListing}
          closeModal={closeModal}
          currentImageIndex={currentImageIndex}
          setCurrentImageIndex={setCurrentImageIndex}
          showRequestForm={showRequestForm}
          toggleRequestForm={() => setShowRequestForm((s) => !s)}
          requestData={requestData}
          handleRequestChange={handleRequestChange}
          handleRequestSubmit={handleRequestSubmit}
          handleLike={handleLike}
          handleFavorite={handleFavorite}
          handleShare={handleShare}
          handleWhatsApp={handleWhatsApp}
          likedListings={likedListings}
          favorites={favorites}
          usdKgs={usdKgs}
          formatPropertyType={formatters.propertyType}
          formatDealType={formatters.dealType}
          formatCondition={formatters.condition}
          formatDocument={formatters.document}
          formatComplex={(id) => {
            const c = complexes.find((x) => x.id === id);
            return c
              ? c.value
              : intl.formatMessage({ id: "not_specified", defaultMessage: "Не указано" });
          }}
          formatUtilities={formatters.utilities}
          formatPurpose={formatters.purpose}
          formatCommercialType={formatters.commercialType}
        />
      )}

      {isEditModalOpen && selectedListing && (
        <EditListingModal
          listing={selectedListing}
          closeModal={closeEditModal}
          fetchListings={() => fetchListings({ preservePage: true })}
          complexes={complexes}
        />
      )}

      {/* Модалка подтверждения удаления */}
      {confirm.open && (
        <div className="listings__confirm" role="dialog" aria-modal="true">
          <div className="listings__confirm_backdrop" onClick={closeDeleteConfirm} />
          <div className="listings__confirm_card" role="document">
            <h3 className="listings__confirm_title">
              <FormattedMessage id="confirm_delete_title" defaultMessage="Подтверждение удаления" />
            </h3>
            <p className="listings__confirm_text">
              <FormattedMessage
                id="confirm_delete_text"
                defaultMessage="Удалить объявление «{title}»?"
                values={{ title: confirm.title || intl.formatMessage({ id: "no_title", defaultMessage: "Без названия" }) }}
              />
            </p>
            <div className="listings__confirm_actions">
              <button type="button" className="listings__confirm_btn" onClick={closeDeleteConfirm}>
                <FormattedMessage id="cancel" defaultMessage="Отмена" />
              </button>
              <button
                type="button"
                className="listings__confirm_btn listings__confirm_btn--danger"
                onClick={onConfirmDelete}
              >
                <FormattedMessage id="delete" defaultMessage="Удалить" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Listings;
