// /* eslint-disable react-hooks/rules-of-hooks */

// import React, { useEffect, useRef, useState } from "react";
// import { FormattedMessage, useIntl } from "react-intl";
// import api from "../../Api/Api";
// import {
//   FiHeart,
//   FiStar,
//   FiShare2,
//   FiChevronLeft,
//   FiChevronRight,
//   FiX,
// } from "react-icons/fi";
// import "./ListingModal.scss";

// const ListingModal = (props) => {
//   const {
//     listing: listingProp,
//     onClose,
//     selectedListing: selectedListingProp,
//     closeModal,
//     currentImageIndex,
//     setCurrentImageIndex,
//     showRequestForm,
//     toggleRequestForm,
//     handleLike,
//     handleFavorite,
//     handleShare,
//     handleWhatsApp,
//     likedListings,
//     favorites,
//     requestData,
//     handleRequestChange,
//     handleRequestSubmit,
//     formatPropertyType,
//     formatDealType,
//     formatCondition,
//     formatDocument,
//     formatComplex,
//     formatUtilities,
//     formatPurpose,
//     formatCommercialType,
//   } = props;

//   const listing = listingProp ?? selectedListingProp;
//   const handleClose = onClose ?? closeModal;
//   const intl = useIntl();
//   if (!listing) return null;

//   const [agentData, setAgentData] = useState({
//     name:
//       listing?.owner?.username ||
//       intl.formatMessage({ id: "agent_name_default", defaultMessage: "Агент" }),
//     phone: listing?.owner?.phone || "+996 XXX XXX XXX",
//     image: listing?.owner?.avatar || "https://via.placeholder.com/100",
//     role: listing?.owner?.role || "",
//   });

//   const [userRole, setUserRole] = useState("");
//   const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
//   const [isFullScreen, setIsFullScreen] = useState(false);
//   const [showModalHint, setShowModalHint] = useState(true);
//   const [showFullScreenHint, setShowFullScreenHint] = useState(true);
//   const [complexName, setComplexName] = useState("");

//   const USD_RATE = 85;
//   const DESCRIPTION_MAX_LENGTH = 200;

//   const touchStartX = useRef(null);
//   const touchStartY = useRef(null);
//   const SWIPE_THRESHOLD = 40;

//   useEffect(() => {
//     const loadMe = async () => {
//       try {
//         const { data } = await api.get("/users/me/");
//         setUserRole(data?.role || "");
//       } catch (e) {
//         console.error(e?.message || "profile_error");
//         setUserRole("");
//       }
//     };
//     const loadComplexName = async () => {
//       try {
//         if (listing?.deal_type === "new_building" && listing?.single_field) {
//           const { data } = await api.get(
//             `/listings/single-field/${listing.single_field}/`
//           );
//           setComplexName(
//             data?.value ||
//               intl.formatMessage({ id: "not_specified", defaultMessage: "Не указано" })
//           );
//         } else {
//           setComplexName("");
//         }
//       } catch (e) {
//         console.error(e?.message || "complex_name_error");
//         setComplexName(
//           intl.formatMessage({ id: "not_specified", defaultMessage: "Не указано" })
//         );
//       }
//     };
//     loadMe();
//     loadComplexName();
//     if (listing?.owner) {
//       setAgentData({
//         name:
//           listing.owner.username ||
//           intl.formatMessage({ id: "agent_name_default", defaultMessage: "Агент" }),
//         phone: listing.owner.phone || "+996 XXX XXX XXX",
//         image: listing.owner.avatar || "https://via.placeholder.com/100",
//         role: listing.owner.role || "",
//       });
//     }
//     setCurrentImageIndex?.(0);
//     setShowModalHint(true);
//     const t = setTimeout(() => setShowModalHint(false), 3000);
//     return () => clearTimeout(t);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [listing, intl]);

//   useEffect(() => {
//     if (isFullScreen) {
//       setShowFullScreenHint(true);
//       const timer = setTimeout(() => setShowFullScreenHint(false), 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [isFullScreen]);

//   useEffect(() => {
//     const onKey = (e) => {
//       const tag = (e.target?.tagName || "").toLowerCase();
//       if (tag === "input" || tag === "textarea") return;
//       if (e.key === "ArrowLeft") prevImage();
//       if (e.key === "ArrowRight") nextImage();
//       if (e.key === "Escape") {
//         if (isFullScreen) setIsFullScreen(false);
//         else handleClose?.();
//       }
//     };
//     document.addEventListener("keydown", onKey);
//     return () => document.removeEventListener("keydown", onKey);
//   }, [isFullScreen, handleClose]);

//   const images = Array.isArray(listing?.images) ? listing.images : [];
//   const hasImages = images.length > 0;

//   const goToImage = (idx) => {
//     if (!hasImages) return;
//     const total = images.length;
//     const next = ((idx % total) + total) % total;
//     setCurrentImageIndex?.(next);
//   };
//   const nextImage = () => goToImage((currentImageIndex ?? 0) + 1);
//   const prevImage = () => goToImage((currentImageIndex ?? 0) - 1);
//   const selectImage = (i) => goToImage(i);

//   const handleTouchStart = (e) => {
//     const t = e.changedTouches?.[0];
//     if (!t) return;
//     touchStartX.current = t.clientX;
//     touchStartY.current = t.clientY;
//   };
//   const handleTouchEnd = (e) => {
//     const t = e.changedTouches?.[0];
//     if (!t || touchStartX.current == null) return;
//     const dx = t.clientX - touchStartX.current;
//     const dy = t.clientY - touchStartY.current;
//     if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
//       if (dx < 0) nextImage();
//       else prevImage();
//     }
//     touchStartX.current = null;
//     touchStartY.current = null;
//   };

//   const onOverlayClick = (e) => {
//     if (e.target.classList.contains("listingmodal")) handleClose?.();
//   };

//   const likedNow = likedListings?.has?.(listing?.id);
//   const favNow = favorites?.some?.((f) => f.id === listing?.id);

//   const details = (() => {
//     const rows = [];
//     rows.push({ id: "likes", value: listing?.likes_count || 0 });
//     rows.push({ id: "property_type", value: formatPropertyType?.(listing?.property_type) });
//     if (listing?.property_type !== "house") {
//       rows.push({ id: "deal_type", value: formatDealType?.(listing?.deal_type) });
//     }
//     if (listing?.deal_type === "new_building") {
//       rows.push({
//         id: "complex",
//         value: complexName || formatComplex?.(listing?.single_field),
//       });
//     }
//     rows.push({
//       id: "city",
//       value:
//         listing?.location?.city ||
//         intl.formatMessage({ id: "not_specified", defaultMessage: "Не указано" }),
//     });
//     rows.push({
//       id: "district",
//       value:
//         listing?.location?.district ||
//         intl.formatMessage({ id: "not_specified", defaultMessage: "Не указано" }),
//     });
//     rows.push({
//       id: "address",
//       value:
//         listing?.address ||
//         intl.formatMessage({ id: "not_specified", defaultMessage: "Не указано" }),
//     });

//     const priceUSD = Number(listing?.price || 0);
//     rows.push({
//       id: "price",
//       value: (
//         <span className="listingmodal__money">
//           ${priceUSD.toFixed(2)} / {(priceUSD * USD_RATE).toLocaleString("ru-RU")}{" "}
//           <FormattedMessage id="som" defaultMessage="сом" />
//         </span>
//       ),
//     });

//     if (userRole === "admin" || (userRole === "realtor" && listing?.price2)) {
//       const p2 = Number(listing?.price2 || 0);
//       rows.push({
//         id: "price2",
//         value: (
//           <span className="listingmodal__money">
//             ${p2.toFixed(2)} / {(p2 * USD_RATE).toLocaleString("ru-RU")}{" "}
//             <FormattedMessage id="som" defaultMessage="сом" />
//           </span>
//         ),
//       });
//     }

//     if (listing?.area) {
//       rows.push({
//         id: "area",
//         value: `${Number(listing.area).toFixed(2)} ${intl.formatMessage({
//           id: "square_meters",
//           defaultMessage: "м²",
//         })}`,
//       });
//     }
//     if (listing?.rooms) rows.push({ id: "rooms", value: listing.rooms });
//     if (listing?.floor && listing?.property_type === "apartment") {
//       rows.push({ id: "floor", value: listing.floor });
//     }
//     if (listing?.string_fields1 && listing?.property_type === "apartment") {
//       rows.push({ id: "total_floors", value: listing.string_fields1 });
//     }
//     if (listing?.string_fields2 && listing?.condition === "delivery_date") {
//       rows.push({ id: "delivery_date", value: listing.string_fields2 });
//     }
//     if (listing?.land_area && listing?.property_type === "house") {
//       rows.push({
//         id: "land_area",
//         value: `${listing.land_area} ${intl.formatMessage({
//           id: "sotka",
//           defaultMessage: "соток",
//         })}`,
//       });
//     }
//     if (listing?.utilities && listing?.property_type === "house") {
//       rows.push({ id: "utilities", value: formatUtilities?.(listing.utilities) });
//     }
//     if (listing?.commercial_type && listing?.property_type === "commercial") {
//       rows.push({
//         id: "commercial_type",
//         value: formatCommercialType?.(listing.commercial_type),
//       });
//     }
//     if (listing?.purpose && listing?.property_type === "commercial") {
//       rows.push({ id: "purpose", value: formatPurpose?.(listing.purpose) });
//     }
//     if (listing?.condition) {
//       rows.push({ id: "condition", value: formatCondition?.(listing.condition) });
//     }
//     if (listing?.document) {
//       rows.push({ id: "document", value: formatDocument?.(listing.document) });
//     }
//     if (listing?.series) {
//       rows.push({
//         id: "series",
//         value: intl.formatMessage({
//           id: listing.series,
//           defaultMessage: listing.series,
//         }),
//       });
//     }
//     rows.push({
//       id: "created_at",
//       value: listing?.created_at
//         ? new Date(listing.created_at).toLocaleDateString("ru-RU")
//         : intl.formatMessage({ id: "not_specified", defaultMessage: "Не указано" }),
//     });
//     return rows;
//   })();

//   const descriptionText =
//     listing?.description ||
//     intl.formatMessage({ id: "no_description", defaultMessage: "Без описания" });
//   const isLongDescription = descriptionText.length > DESCRIPTION_MAX_LENGTH;

//   return (
//     <div className="listingmodal" onClick={onOverlayClick} role="dialog" aria-modal="true">
//       {isFullScreen && hasImages && images[currentImageIndex]?.image && (
//         <div
//           className="listingmodal__fs"
//           onClick={() => setIsFullScreen(false)}
//           onTouchStart={handleTouchStart}
//           onTouchEnd={handleTouchEnd}
//         >
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               setIsFullScreen(false);
//             }}
//             className="listingmodal__close"
//             aria-label={intl.formatMessage({ id: "close_modal", defaultMessage: "Закрыть" })}
//           >
//             <FiX />
//           </button>
//           {showFullScreenHint && (
//             <div className="listingmodal__fsHint">
//               <FormattedMessage id="tap_to_close" defaultMessage="Нажмите на экран, чтобы закрыть" />
//             </div>
//           )}
//           <div className="listingmodal__fsWrap" onClick={(e) => e.stopPropagation()}>
//             <img
//               src={images[currentImageIndex].image}
//               alt={intl.formatMessage({ id: "slide_alt", defaultMessage: "Слайд" })}
//               className="listingmodal__fsImg"
//               onError={(e) => {
//                 console.error("image_error");
//                 e.currentTarget.src = "https://via.placeholder.com/400";
//               }}
//             />
//             {images.length > 1 && (
//               <>
//                 <button
//                   type="button"
//                   className="listingmodal__nav listingmodal__nav--prev"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     prevImage();
//                   }}
//                   aria-label={intl.formatMessage({ id: "prev_image", defaultMessage: "Предыдущее изображение" })}
//                 >
//                   <FiChevronLeft />
//                 </button>
//                 <button
//                   type="button"
//                   className="listingmodal__nav listingmodal__nav--next"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     nextImage();
//                   }}
//                   aria-label={intl.formatMessage({ id: "next_image", defaultMessage: "Следующее изображение" })}
//                 >
//                   <FiChevronRight />
//                 </button>
//               </>
//             )}
//           </div>
//           {images.length > 1 && (
//             <div className="listingmodal__thumbs" onClick={(e) => e.stopPropagation()}>
//               {images.map((im, i) => (
//                 <img
//                   key={i}
//                   src={im.image}
//                   alt={intl.formatMessage({ id: "thumbnail_alt", defaultMessage: "Миниатюра" })}
//                   className={`listingmodal__thumb ${i === (currentImageIndex ?? 0) ? "is-active" : ""}`}
//                   onClick={() => selectImage(i)}
//                   onError={(e) => {
//                     console.error("thumb_error");
//                     e.currentTarget.src = "https://via.placeholder.com/100";
//                   }}
//                 />
//               ))}
//             </div>
//           )}
//         </div>
//       )}

//       <div className="listingmodal__card" onClick={(e) => e.stopPropagation()} role="document">
//         <button
//           onClick={handleClose}
//           className="listingmodal__close"
//           aria-label={intl.formatMessage({ id: "close_modal", defaultMessage: "Закрыть" })}
//         >
//           <FiX />
//         </button>

//         <div className="listingmodal__main">
//           <h3 className="listingmodal__title">
//             {listing?.title || intl.formatMessage({ id: "no_title", defaultMessage: "Без названия" })}
//           </h3>

//           {!hasImages || !images[currentImageIndex]?.image ? (
//             <p className="listingmodal__noimg">
//               <FormattedMessage id="no_images" defaultMessage="Нет изображений" />
//             </p>
//           ) : (
//             <>
//               <div
//                 className="listingmodal__slider"
//                 onTouchStart={handleTouchStart}
//                 onTouchEnd={handleTouchEnd}
//               >
//                 <div className="listingmodal__imageWrap">
//                   <img
//                     src={images[currentImageIndex].image}
//                     alt={intl.formatMessage({ id: "slide_alt", defaultMessage: "Слайд" })}
//                     className="listingmodal__image"
//                     onClick={() => setIsFullScreen(true)}
//                     onError={(e) => {
//                       console.error("image_error");
//                       e.currentTarget.src = "https://via.placeholder.com/400";
//                     }}
//                   />
//                   {showModalHint && (
//                     <div className="listingmodal__hint">
//                       <FormattedMessage id="tap_to_view" defaultMessage="Нажмите, чтобы посмотреть" />
//                     </div>
//                   )}
//                   {images.length > 1 && (
//                     <>
//                       <button
//                         type="button"
//                         className="listingmodal__nav listingmodal__nav--prev"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           prevImage();
//                         }}
//                         aria-label={intl.formatMessage({ id: "prev_image", defaultMessage: "Предыдущее изображение" })}
//                       >
//                         <FiChevronLeft />
//                       </button>
//                       <button
//                         type="button"
//                         className="listingmodal__nav listingmodal__nav--next"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           nextImage();
//                         }}
//                         aria-label={intl.formatMessage({ id: "next_image", defaultMessage: "Следующее изображение" })}
//                       >
//                         <FiChevronRight />
//                       </button>
//                     </>
//                   )}
//                 </div>
//               </div>

//               {images.length > 1 && (
//                 <div className="listingmodal__thumbs">
//                   {images.map((im, i) => (
//                     <img
//                       key={i}
//                       src={im.image}
//                       alt={intl.formatMessage({ id: "thumbnail_alt", defaultMessage: "Миниатюра" })}
//                       className={`listingmodal__thumb ${i === (currentImageIndex ?? 0) ? "is-active" : ""}`}
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         selectImage(i);
//                       }}
//                       onError={(e) => {
//                         console.error("thumb_error");
//                         e.currentTarget.src = "https://via.placeholder.com/100";
//                       }}
//                     />
//                   ))}
//                 </div>
//               )}
//             </>
//           )}

//           <div className="listingmodal__details">
//             {details.map(({ id, value }, idx) => (
//               <p key={idx}>
//                 <strong>
//                   <FormattedMessage id={id} defaultMessage={id} />:
//                 </strong>{" "}
//                 {typeof value === "string" ? (
//                   <FormattedMessage id={value} defaultMessage={value} />
//                 ) : (
//                   value
//                 )}
//               </p>
//             ))}
//           </div>

//           <div className="listingmodal__descWrap">
//             <p>
//               <strong>
//                 <FormattedMessage id="description" defaultMessage="Описание" />:
//               </strong>
//               <span className="listingmodal__desc" data-expanded={isDescriptionExpanded}>
//                 {isLongDescription && !isDescriptionExpanded
//                   ? `${descriptionText.slice(0, DESCRIPTION_MAX_LENGTH)}...`
//                   : descriptionText}
//               </span>
//               {isLongDescription && (
//                 <button
//                   type="button"
//                   className="listingmodal__descToggle"
//                   onClick={() => setIsDescriptionExpanded((s) => !s)}
//                 >
//                   <FormattedMessage
//                     id={isDescriptionExpanded ? "show_less" : "show_more"}
//                     defaultMessage={isDescriptionExpanded ? "Свернуть" : "Показать больше"}
//                   />
//                 </button>
//               )}
//             </p>
//           </div>
//         </div>

//         <aside className="listingmodal__aside">
//           <img
//             src={agentData.image}
//             alt={intl.formatMessage({ id: "agent_avatar_alt", defaultMessage: "Аватар агента" })}
//             className="listingmodal__avatar"
//             onError={(e) => {
//               console.error("avatar_error");
//               e.currentTarget.src = "https://via.placeholder.com/100";
//             }}
//           />
//           <p className="listingmodal__agent">{agentData.name}</p>
//           <p className="listingmodal__phone">{agentData.phone}</p>

//           <div className="listingmodal__btns">
//             <button
//               className={`listingmodal__iconBtn ${likedNow ? "is-accent" : ""}`}
//               onClick={() => handleLike?.(listing?.id)}
//               disabled={likedNow}
//               title={intl.formatMessage({ id: "like_button", defaultMessage: "Лайк" })}
//               aria-label={intl.formatMessage({ id: "like_button", defaultMessage: "Лайк" })}
//               type="button"
//             >
//               <FiHeart />
//               <span>{listing?.likes_count || 0}</span>
//             </button>

//             <button
//               className={`listingmodal__iconBtn ${favNow ? "is-accent" : ""}`}
//               onClick={() => handleFavorite?.(listing)}
//               title={intl.formatMessage({ id: "favorite_button", defaultMessage: "Избранное" })}
//               aria-label={intl.formatMessage({ id: "favorite_button", defaultMessage: "Избранное" })}
//               type="button"
//             >
//               <FiStar />
//             </button>

//             <button
//               className="listingmodal__iconBtn"
//               onClick={() => handleShare?.(listing)}
//               title={intl.formatMessage({ id: "share_button", defaultMessage: "Поделиться" })}
//               aria-label={intl.formatMessage({ id: "share_button", defaultMessage: "Поделиться" })}
//               type="button"
//             >
//               <FiShare2 />
//             </button>

//             <button
//               onClick={() =>
//                 handleWhatsApp
//                   ? handleWhatsApp(listing)
//                   : window.open(`https://wa.me/${agentData.phone.replace(/\D/g, "")}`, "_blank")
//               }
//               className="listingmodal__cta listingmodal__cta--wa"
//               type="button"
//             >
//               <FormattedMessage id="whatsapp_button" defaultMessage="WhatsApp" />
//             </button>

//             <button
//               onClick={toggleRequestForm}
//               className="listingmodal__cta"
//               type="button"
//             >
//               <FormattedMessage id="request_button" defaultMessage="Заявка" />
//             </button>
//           </div>

//           {showRequestForm && (
//             <form className="listingmodal__form" onSubmit={handleRequestSubmit}>
//               <input
//                 type="text"
//                 name="name"
//                 value={requestData?.name || ""}
//                 onChange={handleRequestChange}
//                 placeholder={intl.formatMessage({ id: "name_placeholder", defaultMessage: "Ваше имя" })}
//                 className="listingmodal__input"
//                 required
//               />
//               <input
//                 type="text"
//                 name="contact_phone"
//                 value={requestData?.contact_phone || ""}
//                 onChange={handleRequestChange}
//                 placeholder={intl.formatMessage({ id: "phone_placeholder", defaultMessage: "Номер телефона" })}
//                 className="listingmodal__input"
//                 required
//               />
//               <textarea
//                 name="message"
//                 value={requestData?.message || ""}
//                 onChange={handleRequestChange}
//                 placeholder={intl.formatMessage({ id: "message_placeholder", defaultMessage: "Ваше сообщение" })}
//                 className="listingmodal__textarea"
//                 required
//               />
//               <button type="submit" className="listingmodal__submit">
//                 <FormattedMessage id="send_button" defaultMessage="Отправить" />
//               </button>
//             </form>
//           )}
//         </aside>
//       </div>
//     </div>
//   );
// };

// export default ListingModal;



/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import api from "../../Api/Api";
import { FiHeart, FiStar, FiShare2, FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import "./ListingModal.scss";

const ListingModal = (props) => {
  const {
    listing: listingProp,
    onClose,
    selectedListing: selectedListingProp,
    closeModal,
    currentImageIndex,
    setCurrentImageIndex,
    showRequestForm,
    toggleRequestForm,
    handleLike,
    handleFavorite,
    handleShare,
    handleWhatsApp,
    likedListings,
    favorites,
    requestData,
    handleRequestChange,
    handleRequestSubmit, // из Listings прокидываем — там формируем текст и постим
    formatPropertyType,
    formatDealType,
    formatCondition,
    formatDocument,
    formatComplex,
    formatUtilities,
    formatPurpose,
    formatCommercialType,
    usdKgs, // актуальный курс
  } = props;

  const listing = listingProp ?? selectedListingProp;
  const handleClose = onClose ?? closeModal;
  const intl = useIntl();
  if (!listing) return null;

  const [agentData, setAgentData] = useState({
    name:
      listing?.owner?.username ||
      intl.formatMessage({ id: "agent_name_default", defaultMessage: "Агент" }),
    phone: listing?.owner?.phone || "+996 XXX XXX XXX",
    image: listing?.owner?.avatar || "https://via.placeholder.com/100",
    role: listing?.owner?.role || "",
  });

  const [userRole, setUserRole] = useState("");
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showModalHint, setShowModalHint] = useState(true);
  const [showFullScreenHint, setShowFullScreenHint] = useState(true);
  const [complexName, setComplexName] = useState("");

  const DESCRIPTION_MAX_LENGTH = 200;

  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const SWIPE_THRESHOLD = 40;

const formatSom = (usd) => {
  if (typeof usd !== "number" || !isFinite(usd)) return "";
  if (typeof usdKgs !== "number") return "";
  const som = Math.floor(usd * usdKgs);
  return `${som.toLocaleString("ru-RU")} ${intl.formatMessage({ id: "som", defaultMessage: "сом" })}`;
};


  useEffect(() => {
    const loadMe = async () => {
      try {
        const { data } = await api.get("/users/me/");
        setUserRole(data?.role || "");
      } catch (e) {
        console.error(e?.message || "profile_error");
        setUserRole("");
      }
    };
    const loadComplexName = async () => {
      try {
        if (listing?.deal_type === "new_building" && listing?.single_field) {
          const { data } = await api.get(`/listings/single-field/${listing.single_field}/`);
          setComplexName(
            data?.value ||
              intl.formatMessage({ id: "not_specified", defaultMessage: "Не указано" })
          );
        } else {
          setComplexName("");
        }
      } catch (e) {
        console.error(e?.message || "complex_name_error");
        setComplexName(
          intl.formatMessage({ id: "not_specified", defaultMessage: "Не указано" })
        );
      }
    };
    loadMe();
    loadComplexName();
    if (listing?.owner) {
      setAgentData({
        name:
          listing.owner.username ||
          intl.formatMessage({ id: "agent_name_default", defaultMessage: "Агент" }),
        phone: listing.owner.phone || "+996 XXX XXX XXX",
        image: listing.owner.avatar || "https://via.placeholder.com/100",
        role: listing.owner.role || "",
      });
    }
    setCurrentImageIndex?.(0);
    setShowModalHint(true);
    const t = setTimeout(() => setShowModalHint(false), 3000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing, intl]);

  useEffect(() => {
    if (isFullScreen) {
      setShowFullScreenHint(true);
      const timer = setTimeout(() => setShowFullScreenHint(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isFullScreen]);

  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "Escape") {
        if (isFullScreen) setIsFullScreen(false);
        else handleClose?.();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isFullScreen, handleClose]);

  const images = Array.isArray(listing?.images) ? listing.images : [];
  const hasImages = images.length > 0;

  const goToImage = (idx) => {
    if (!hasImages) return;
    const total = images.length;
    const next = ((idx % total) + total) % total;
    setCurrentImageIndex?.(next);
  };
  const nextImage = () => goToImage((currentImageIndex ?? 0) + 1);
  const prevImage = () => goToImage((currentImageIndex ?? 0) - 1);
  const selectImage = (i) => goToImage(i);

  const handleTouchStart = (e) => {
    const t = e.changedTouches?.[0];
    if (!t) return;
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
  };
  const handleTouchEnd = (e) => {
    const t = e.changedTouches?.[0];
    if (!t || touchStartX.current == null) return;
    const dx = t.clientX - touchStartX.current;
    const dy = t.clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
      if (dx < 0) nextImage();
      else prevImage();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const onOverlayClick = (e) => {
    if (e.target.classList.contains("listingmodal")) handleClose?.();
  };

  const likedNow = likedListings?.has?.(listing?.id);
  const favNow = favorites?.some?.((f) => f.id === listing?.id);

  const details = (() => {
    const rows = [];
    rows.push({ id: "likes", value: listing?.likes_count || 0 });
    rows.push({ id: "property_type", value: formatPropertyType?.(listing?.property_type) });
    if (listing?.property_type !== "house") {
      rows.push({ id: "deal_type", value: formatDealType?.(listing?.deal_type) });
    }
    if (listing?.deal_type === "new_building") {
      rows.push({ id: "complex", value: complexName || formatComplex?.(listing?.single_field) });
    }
    rows.push({
      id: "city",
      value:
        listing?.location?.city ||
        intl.formatMessage({ id: "not_specified", defaultMessage: "Не указано" }),
    });
    rows.push({
      id: "district",
      value:
        listing?.location?.district ||
        intl.formatMessage({ id: "not_specified", defaultMessage: "Не указано" }),
    });
    rows.push({
      id: "address",
      value:
        listing?.address ||
        intl.formatMessage({ id: "not_specified", defaultMessage: "Не указано" }),
    });

    const priceUSD = Number(listing?.price || 0);
    rows.push({
      id: "price",
      value: (
        <span className="listingmodal__money">
          ${priceUSD.toFixed(2)}
          {formatSom(priceUSD) ? ` / ${formatSom(priceUSD)}` : ""}
        </span>
      ),
    });

    if (userRole === "admin" || (userRole === "realtor" && listing?.price2)) {
      const p2 = Number(listing?.price2 || 0);
      rows.push({
        id: "price2",
        value: (
          <span className="listingmodal__money">
            ${p2.toFixed(2)}
            {formatSom(p2) ? ` / ${formatSom(p2)}` : ""}
          </span>
        ),
      });
    }

    if (listing?.area) {
      rows.push({
        id: "area",
        value: `${Number(listing.area).toFixed(2)} ${intl.formatMessage({
          id: "square_meters",
          defaultMessage: "м²",
        })}`,
      });
    }
    if (listing?.rooms) rows.push({ id: "rooms", value: listing.rooms });
    if (listing?.floor && listing?.property_type === "apartment") {
      rows.push({ id: "floor", value: listing.floor });
    }
    if (listing?.string_fields1 && listing?.property_type === "apartment") {
      rows.push({ id: "total_floors", value: listing.string_fields1 });
    }
    if (listing?.string_fields2 && listing?.condition === "delivery_date") {
      rows.push({ id: "delivery_date", value: listing.string_fields2 });
    }
    if (listing?.land_area && listing?.property_type === "house") {
      rows.push({
        id: "land_area",
        value: `${listing.land_area} ${intl.formatMessage({
          id: "sotka",
          defaultMessage: "соток",
        })}`,
      });
    }
    if (listing?.utilities && listing?.property_type === "house") {
      rows.push({ id: "utilities", value: formatUtilities?.(listing.utilities) });
    }
    if (listing?.commercial_type && listing?.property_type === "commercial") {
      rows.push({
        id: "commercial_type",
        value: formatCommercialType?.(listing.commercial_type),
      });
    }
    if (listing?.purpose && listing?.property_type === "commercial") {
      rows.push({ id: "purpose", value: formatPurpose?.(listing.purpose) });
    }
    if (listing?.condition) {
      rows.push({ id: "condition", value: formatCondition?.(listing.condition) });
    }
    if (listing?.document) {
      rows.push({ id: "document", value: formatDocument?.(listing.document) });
    }
    if (listing?.series) {
      rows.push({
        id: "series",
        value: intl.formatMessage({ id: listing.series, defaultMessage: listing.series }),
      });
    }
    rows.push({
      id: "created_at",
      value: listing?.created_at
        ? new Date(listing.created_at).toLocaleDateString("ru-RU")
        : intl.formatMessage({ id: "not_specified", defaultMessage: "Не указано" }),
    });
    return rows;
  })();

  const descriptionText =
    listing?.description ||
    intl.formatMessage({ id: "no_description", defaultMessage: "Без описания" });
  const isLongDescription = descriptionText.length > DESCRIPTION_MAX_LENGTH;

  return (
    <div className="listingmodal" onClick={onOverlayClick} role="dialog" aria-modal="true">
      {isFullScreen && hasImages && images[currentImageIndex]?.image && (
        <div
          className="listingmodal__fs"
          onClick={() => setIsFullScreen(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFullScreen(false);
            }}
            className="listingmodal__close"
            aria-label={intl.formatMessage({ id: "close_modal", defaultMessage: "Закрыть" })}
          >
            <FiX />
          </button>
          {showFullScreenHint && (
            <div className="listingmodal__fsHint">
              <FormattedMessage
                id="tap_to_close"
                defaultMessage="Нажмите на экран, чтобы закрыть"
              />
            </div>
          )}
          <div className="listingmodal__fsWrap" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[currentImageIndex].image}
              alt={intl.formatMessage({ id: "slide_alt", defaultMessage: "Слайд" })}
              className="listingmodal__fsImg"
              onError={(e) => {
                console.error("image_error");
                e.currentTarget.src = "https://via.placeholder.com/400";
              }}
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className="listingmodal__nav listingmodal__nav--prev"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  aria-label={intl.formatMessage({
                    id: "prev_image",
                    defaultMessage: "Предыдущее изображение",
                  })}
                >
                  <FiChevronLeft />
                </button>
                <button
                  type="button"
                  className="listingmodal__nav listingmodal__nav--next"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  aria-label={intl.formatMessage({
                    id: "next_image",
                    defaultMessage: "Следующее изображение",
                  })}
                >
                  <FiChevronRight />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="listingmodal__thumbs" onClick={(e) => e.stopPropagation()}>
              {images.map((im, i) => (
                <img
                  key={i}
                  src={im.image}
                  alt={intl.formatMessage({
                    id: "thumbnail_alt",
                    defaultMessage: "Миниатюра",
                  })}
                  className={`listingmodal__thumb ${
                    i === (currentImageIndex ?? 0) ? "is-active" : ""
                  }`}
                  onClick={() => selectImage(i)}
                  onError={(e) => {
                    console.error("thumb_error");
                    e.currentTarget.src = "https://via.placeholder.com/100";
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="listingmodal__card" onClick={(e) => e.stopPropagation()} role="document">
        <button
          onClick={handleClose}
          className="listingmodal__close"
          aria-label={intl.formatMessage({ id: "close_modal", defaultMessage: "Закрыть" })}
        >
          <FiX />
        </button>

        <div className="listingmodal__main">
          <h3 className="listingmodal__title">
            {listing?.title ||
              intl.formatMessage({ id: "no_title", defaultMessage: "Без названия" })}
          </h3>

          {!hasImages || !images[currentImageIndex]?.image ? (
            <p className="listingmodal__noimg">
              <FormattedMessage id="no_images" defaultMessage="Нет изображений" />
            </p>
          ) : (
            <>
              <div
                className="listingmodal__slider"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <div className="listingmodal__imageWrap">
                  <img
                    src={images[currentImageIndex].image}
                    alt={intl.formatMessage({ id: "slide_alt", defaultMessage: "Слайд" })}
                    className="listingmodal__image"
                    onClick={() => setIsFullScreen(true)}
                    onError={(e) => {
                      console.error("image_error");
                      e.currentTarget.src = "https://via.placeholder.com/400";
                    }}
                  />
                  {showModalHint && (
                    <div className="listingmodal__hint">
                      <FormattedMessage
                        id="tap_to_view"
                        defaultMessage="Нажмите, чтобы посмотреть"
                      />
                    </div>
                  )}
                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        className="listingmodal__nav listingmodal__nav--prev"
                        onClick={(e) => {
                          e.stopPropagation();
                          prevImage();
                        }}
                        aria-label={intl.formatMessage({
                          id: "prev_image",
                          defaultMessage: "Предыдущее изображение",
                        })}
                      >
                        <FiChevronLeft />
                      </button>
                      <button
                        type="button"
                        className="listingmodal__nav listingmodal__nav--next"
                        onClick={(e) => {
                          e.stopPropagation();
                          nextImage();
                        }}
                        aria-label={intl.formatMessage({
                          id: "next_image",
                          defaultMessage: "Следующее изображение",
                        })}
                      >
                        <FiChevronRight />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {images.length > 1 && (
                <div className="listingmodal__thumbs">
                  {images.map((im, i) => (
                    <img
                      key={i}
                      src={im.image}
                      alt={intl.formatMessage({
                        id: "thumbnail_alt",
                        defaultMessage: "Миниатюра",
                      })}
                      className={`listingmodal__thumb ${
                        i === (currentImageIndex ?? 0) ? "is-active" : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectImage(i);
                      }}
                      onError={(e) => {
                        console.error("thumb_error");
                        e.currentTarget.src = "https://via.placeholder.com/100";
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          <div className="listingmodal__details">
            {details.map(({ id, value }, idx) => (
              <p key={idx}>
                <strong>
                  <FormattedMessage id={id} defaultMessage={id} />:
                </strong>{" "}
                {typeof value === "string" ? (
                  <FormattedMessage id={value} defaultMessage={value} />
                ) : (
                  value
                )}
              </p>
            ))}
          </div>

          <div className="listingmodal__descWrap">
            <p>
              <strong>
                <FormattedMessage id="description" defaultMessage="Описание" />:
              </strong>
              <span className="listingmodal__desc" data-expanded={isDescriptionExpanded}>
                {isLongDescription && !isDescriptionExpanded
                  ? `${descriptionText.slice(0, DESCRIPTION_MAX_LENGTH)}...`
                  : descriptionText}
              </span>
              {isLongDescription && (
                <button
                  type="button"
                  className="listingmodal__descToggle"
                  onClick={() => setIsDescriptionExpanded((s) => !s)}
                >
                  <FormattedMessage
                    id={isDescriptionExpanded ? "show_less" : "show_more"}
                    defaultMessage={isDescriptionExpanded ? "Свернуть" : "Показать больше"}
                  />
                </button>
              )}
            </p>
          </div>
        </div>

        <aside className="listingmodal__aside">
          <img
            src={agentData.image}
            alt={intl.formatMessage({ id: "agent_avatar_alt", defaultMessage: "Аватар агента" })}
            className="listingmodal__avatar"
            onError={(e) => {
              console.error("avatar_error");
              e.currentTarget.src = "https://via.placeholder.com/100";
            }}
          />
          <p className="listingmodal__agent">{agentData.name}</p>
          <p className="listingmodal__phone">{agentData.phone}</p>

          <div className="listingmodal__btns">
            <button
              className={`listingmodal__iconBtn ${likedNow ? "is-accent" : ""}`}
              onClick={() => handleLike?.(listing?.id)}
              disabled={likedNow}
              title={intl.formatMessage({ id: "like_button", defaultMessage: "Лайк" })}
              aria-label={intl.formatMessage({ id: "like_button", defaultMessage: "Лайк" })}
              type="button"
            >
              <FiHeart />
              <span>{listing?.likes_count || 0}</span>
            </button>

            <button
              className={`listingmodal__iconBtn ${favNow ? "is-accent" : ""}`}
              onClick={() => handleFavorite?.(listing)}
              title={intl.formatMessage({ id: "favorite_button", defaultMessage: "Избранное" })}
              aria-label={intl.formatMessage({ id: "favorite_button", defaultMessage: "Избранное" })}
              type="button"
            >
              <FiStar />
            </button>

            <button
              className="listingmodal__iconBtn"
              onClick={() => handleShare?.(listing)}
              title={intl.formatMessage({ id: "share_button", defaultMessage: "Поделиться" })}
              aria-label={intl.formatMessage({ id: "share_button", defaultMessage: "Поделиться" })}
              type="button"
            >
              <FiShare2 />
            </button>

            <button
              onClick={() =>
                handleWhatsApp
                  ? handleWhatsApp(listing)
                  : window.open(`https://wa.me/${agentData.phone.replace(/\D/g, "")}`, "_blank")
              }
              className="listingmodal__cta listingmodal__cta--wa"
              type="button"
            >
              <FormattedMessage id="whatsapp_button" defaultMessage="WhatsApp" />
            </button>

            <button onClick={toggleRequestForm} className="listingmodal__cta" type="button">
              <FormattedMessage id="request_button" defaultMessage="Заявка" />
            </button>
          </div>

          {showRequestForm && (
            <form className="listingmodal__form" onSubmit={handleRequestSubmit}>
              <input
                type="text"
                name="name"
                value={requestData?.name || ""}
                onChange={handleRequestChange}
                placeholder={intl.formatMessage({ id: "name_placeholder", defaultMessage: "Ваше имя" })}
                className="listingmodal__input"
                required
              />
              <input
                type="text"
                name="contact_phone"
                value={requestData?.contact_phone || ""}
                onChange={handleRequestChange}
                placeholder={intl.formatMessage({ id: "phone_placeholder", defaultMessage: "Номер телефона" })}
                className="listingmodal__input"
                required
              />
              <textarea
                name="message"
                value={requestData?.message || ""}
                onChange={handleRequestChange}
                placeholder={intl.formatMessage({ id: "message_placeholder", defaultMessage: "Ваше сообщение" })}
                className="listingmodal__textarea"
                required
              />
              <button type="submit" className="listingmodal__submit">
                <FormattedMessage id="send_button" defaultMessage="Отправить" />
              </button>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
};

export default ListingModal;
