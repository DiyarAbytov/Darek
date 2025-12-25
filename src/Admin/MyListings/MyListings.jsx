// import React, { useState, useEffect } from "react";
// import { FormattedMessage, useIntl } from 'react-intl';
// import ListingModal from "../../pages/Listings/ListingModal";
// import EditListingModal from "../EditListing/EditListing"; // Импортируем исправленный компонент редактирования
// import styles from "../../pages/Listings/Listings.scss";

// const MyListings = () => {
//   const [listings, setListings] = useState([]);
//   const [page, setPage] = useState(1);
//   const [selectedListing, setSelectedListing] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [requestData, setRequestData] = useState({
//     name: "",
//     contact_phone: "",
//     message: "",
//   });
//   const [success, setSuccess] = useState("");
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [showRequestForm, setShowRequestForm] = useState(false);
//   const [likedListings, setLikedListings] = useState(
//     new Set(JSON.parse(localStorage.getItem("likedListings") || "[]"))
//   );
//   const [favorites, setFavorites] = useState(
//     JSON.parse(localStorage.getItem("favorites") || "[]")
//   );
//   const [toast, setToast] = useState({ message: "", type: "" });
//   const [userId, setUserId] = useState(null);
//   const [complexes, setComplexes] = useState([]);
//   const listingsPerPage = 10;
//   const USD_RATE = 85;
//   const intl = useIntl();

//   const refreshToken = async () => {
//     const refreshToken = localStorage.getItem('refresh_token');
//     if (!refreshToken) throw new Error('Нет refresh токена');
//     const response = await fetch('https://dar.kg/api/v1/users/auth/token/refresh/', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ refresh: refreshToken }),
//     });
//     if (response.ok) {
//       const data = await response.json();
//       localStorage.setItem('access_token', data.access);
//       return data.access;
//     } else {
//       localStorage.removeItem('access_token');
//       localStorage.removeItem('refresh_token');
//       throw new Error('Ошибка обновления токена');
//     }
//   };

//   const fetchWithAuth = async (url, options = {}) => {
//     let token = localStorage.getItem('access_token');
//     if (!token) token = await refreshToken();
//     const headers = { ...options.headers, Authorization: `Bearer ${token}` };
//     const response = await fetch(url, { ...options, headers });
//     if (response.status === 401) {
//       token = await refreshToken();
//       headers.Authorization = `Bearer ${token}`;
//       return await fetch(url, { ...options, headers });
//     }
//     return response;
//   };

//   const fetchProfile = async () => {
//     try {
//       const response = await fetchWithAuth('https://dar.kg/api/v1/users/me/');
//       if (response.ok) {
//         const data = await response.json();
//         setUserId(data.id);
//       } else {
//         setToast({ message: intl.formatMessage({ id: 'error_fetch_profile', defaultMessage: 'Ошибка загрузки профиля' }), type: "error" });
//         setTimeout(() => setToast({ message: "", type: "" }), 3000);
//       }
//     } catch (error) {
//       console.error("Ошибка fetchProfile:", error);
//       setToast({ message: intl.formatMessage({ id: 'error_fetch_profile', defaultMessage: 'Ошибка загрузки профиля' }), type: "error" });
//       setTimeout(() => setToast({ message: "", type: "" }), 3000);
//     }
//   };

//   const fetchListings = async () => {
//     try {
//       const response = await fetch('https://dar.kg/api/v1/listings/listings/?is_active=true');
//       if (!response.ok) throw new Error(`HTTP ошибка: ${response.status}`);
//       const data = await response.json();
//       const sortedListings = Array.isArray(data) ? data : data.results || [];
//       if (userId) {
//         const filteredListings = sortedListings.filter(listing => listing.owner?.id === userId);
//         setListings(filteredListings.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0)));
//       }
//     } catch (error) {
//       console.error("Ошибка fetchListings:", error);
//       setToast({ message: intl.formatMessage({ id: 'error_fetch_listings', defaultMessage: 'Ошибка загрузки объявлений' }), type: "error" });
//       setTimeout(() => setToast({ message: "", type: "" }), 3000);
//     }
//   };

//   const fetchComplexes = async () => {
//     try {
//       const response = await fetch(
//         "https://dar.kg/api/v1/listings/single-field/",
//         {
//           method: "GET",
//           headers: { "Content-Type": "application/json" },
//         }
//       );
//       if (response.ok) setComplexes(await response.json());
//       else console.error("Ошибка fetchComplexes:", response.status);
//     } catch (error) {
//       console.error("Ошибка fetchComplexes:", error);
//       setToast({ message: intl.formatMessage({ id: 'error_fetch_complexes', defaultMessage: 'Ошибка загрузки комплексов' }), type: "error" });
//       setTimeout(() => setToast({ message: "", type: "" }), 3000);
//     }
//   };

//   const handleDelete = async (listingId, event) => {
//     event.stopPropagation();
//     try {
//       const response = await fetchWithAuth(`https://dar.kg/api/v1/listings/listings/${listingId}/`, {
//         method: 'DELETE',
//       });
//       if (response.ok || response.status === 204) {
//         setListings(listings.filter(l => l.id !== listingId));
//         setToast({ message: intl.formatMessage({ id: 'listing_deleted', defaultMessage: 'Объявление удалено' }), type: "success" });
//       } else {
//         const errorData = await response.json();
//         setToast({ message: `Ошибка удаления: ${errorData.detail || response.status}`, type: "error" });
//       }
//     } catch (err) {
//       console.error('Ошибка handleDelete:', err);
//       setToast({ message: `Ошибка: ${err.message}`, type: "error" });
//     }
//     setTimeout(() => setToast({ message: "", type: "" }), 3000);
//   };

//   const handleEdit = (listing, event) => {
//     event.stopPropagation();
//     setSelectedListing(listing);
//     setIsEditModalOpen(true); // Открываем модальное окно редактирования сразу
//   };

//   useEffect(() => {
//     fetchProfile();
//   }, []);

//   useEffect(() => {
//     if (userId) {
//       fetchListings();
//       fetchComplexes();
//     }
//   }, [userId]);

//   useEffect(() => {
//     localStorage.setItem("likedListings", JSON.stringify([...likedListings]));
//     localStorage.setItem("favorites", JSON.stringify(favorites));
//   }, [likedListings, favorites]);

//   const handleLike = async (listingId, event) => {
//     event.stopPropagation();
//     if (likedListings.has(listingId)) return;
//     try {
//       const updatedListings = listings
//         .map((listing) =>
//           listing.id === listingId
//             ? { ...listing, likes_count: (listing.likes_count || 0) + 1 }
//             : listing
//         )
//         .sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
//       setListings(updatedListings);
//       setLikedListings(new Set([...likedListings, listingId]));
//       const response = await fetch(
//         `https://dar.kg/api/v1/listings/listings/${listingId}/like/`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ userId, listingId }),
//         }
//       );
//       if (!response.ok) throw new Error("Ошибка сервера");
//       setSuccess(intl.formatMessage({ id: 'like_added', defaultMessage: 'Лайк добавлен' }));
//       setTimeout(() => setSuccess(""), 2000);
//     } catch (error) {
//       console.error("Ошибка handleLike:", error);
//       setSuccess(intl.formatMessage({ id: 'error_like', defaultMessage: 'Ошибка добавления лайка' }));
//       setTimeout(() => setSuccess(""), 2000);
//     }
//   };

//   const handleFavorite = (listing, event) => {
//     event.stopPropagation();
//     setFavorites((prev) => {
//       const isFavorite = prev.some((item) => item.id === listing.id);
//       if (isFavorite) {
//         setSuccess(intl.formatMessage({ id: 'removed_from_favorites', defaultMessage: 'Удалено из избранного' }));
//         setTimeout(() => setSuccess(""), 2000);
//         return prev.filter((item) => item.id !== listing.id);
//       } else {
//         setSuccess(intl.formatMessage({ id: 'added_to_favorites', defaultMessage: 'Добавлено в избранное' }));
//         setTimeout(() => setSuccess(""), 2000);
//         return [...prev, listing];
//       }
//     });
//   };

//   const handleShare = (listing, event) => {
//     event.stopPropagation();
//     const shareUrl = `${window.location.origin}/listing/${listing.id}`;
//     navigator.clipboard.writeText(shareUrl).then(() => {
//       setToast({ message: intl.formatMessage({ id: 'link_copied', defaultMessage: 'Ссылка скопирована' }), type: "success" });
//       setTimeout(() => setToast({ message: "", type: "" }), 2000);
//     }).catch((error) => {
//       console.error("Ошибка копирования ссылки:", error);
//       setToast({ message: intl.formatMessage({ id: 'error_copy', defaultMessage: 'Ошибка копирования ссылки' }), type: "error" });
//     });
//   };

//   const handlePageChange = (newPage) => {
//     setPage(newPage);
//   };

//   const openModal = (listing) => {
//     setSelectedListing(listing);
//     setCurrentImageIndex(0);
//     setIsModalOpen(true);
//     setShowRequestForm(false);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setSelectedListing(null);
//     setRequestData({ name: "", contact_phone: "", message: "" });
//     setShowRequestForm(false);
//     setSuccess("");
//     window.history.pushState({}, '', '/');
//   };

//   const closeEditModal = () => {
//     setIsEditModalOpen(false);
//     setSelectedListing(null);
//     fetchListings(); // Обновляем список после закрытия
//   };

//   const handleRequestChange = (e) => {
//     setRequestData({ ...requestData, [e.target.name]: e.target.value });
//   };

//   const handleRequestSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const messageWithDetails = `${requestData.message}\n${intl.formatMessage({ id: 'listing', defaultMessage: 'Объявление' })}: ${
//         selectedListing.title
//       }\n${intl.formatMessage({ id: 'price', defaultMessage: 'Цена' })}: $${parseFloat(
//         selectedListing.price || 0
//       ).toFixed(2)} / ${parseFloat((selectedListing.price || 0) * USD_RATE).toLocaleString('ru-RU')} ${intl.formatMessage({ id: 'som', defaultMessage: 'сом' })}`;
//       await fetch("https://dar.kg/api/v1/listings/applications/", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           name: requestData.name,
//           contact_phone: requestData.contact_phone,
//           message: messageWithDetails,
//         }),
//       });
//       setSuccess(intl.formatMessage({ id: 'request_sent', defaultMessage: 'Заявка отправлена' }));
//       setTimeout(closeModal, 1000);
//     } catch (error) {
//       console.error("Ошибка handleRequestSubmit:", error);
//       setSuccess(intl.formatMessage({ id: 'error_submit_request', defaultMessage: 'Ошибка отправки заявки' }));
//       setTimeout(() => setSuccess(""), 2000);
//     }
//   };

//   const handleWhatsApp = (listing) => {
//     const message = intl.formatMessage(
//       { id: 'whatsapp_message', defaultMessage: 'Интересует объявление: {title}, {city}, {district}' },
//       { 
//         title: listing.title || intl.formatMessage({ id: 'no_title', defaultMessage: 'Без названия' }), 
//         city: listing.location?.city || intl.formatMessage({ id: 'not_specified', defaultMessage: 'Не указано' }), 
//         district: listing.location?.district || intl.formatMessage({ id: 'not_specified', defaultMessage: 'Не указано' }) 
//       }
//     );
//     window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
//   };

//   const toggleRequestForm = () => {
//     setShowRequestForm(!showRequestForm);
//   };

//   const paginatedListings = listings.slice(
//     (page - 1) * listingsPerPage,
//     page * listingsPerPage
//   );
//   const totalPages = Math.ceil(listings.length / listingsPerPage);
//   const displayListings = Array(10)
//     .fill(null)
//     .map((_, index) => paginatedListings[index] || null);

//   const formatPropertyType = (type) => {
//     return intl.formatMessage({ id: `property_${type || 'default'}`, defaultMessage: type || 'Не указано' });
//   };

//   const formatDealType = (type) => {
//     return intl.formatMessage({ id: `deal_type_${type || 'default'}`, defaultMessage: type || 'Не указано' });
//   };

//   const formatCondition = (condition) => {
//     return intl.formatMessage({ id: `condition_${condition || 'default'}`, defaultMessage: condition || 'Не указано' });
//   };

//   const formatDocument = (document) => {
//     return intl.formatMessage({ id: `document_${document || 'default'}`, defaultMessage: document || 'Не указано' });
//   };

//   const formatComplex = (complexId) => {
//     const complex = complexes.find((c) => c.id === complexId);
//     return complex ? complex.value : intl.formatMessage({ id: 'not_specified', defaultMessage: 'Не указано' });
//   };

//   const formatUtilities = (type) => {
//     return intl.formatMessage({ id: `utilities_${type || 'default'}`, defaultMessage: type || 'Не указано' });
//   };

//   const formatPurpose = (type) => {
//     return intl.formatMessage({ id: `purpose_${type || 'default'}`, defaultMessage: type || 'Не указано' });
//   };

//   const formatCommercialType = (type) => {
//     return intl.formatMessage({ id: `commercial_type_${type || 'default'}`, defaultMessage: type || 'Не указано' });
//   };

//   return (
//     <section id="my-listings" className={styles.listings}>
//       <div className={styles.listings__header}>
//         <h2 className={styles.listings__title}>
//           <FormattedMessage id="my_listings_title" defaultMessage="Мои объявления" />
//           {listings.length > 0 && ` (${listings.length})`}
//         </h2>
//       </div>
//       {success && <p className={styles.listings__success}>{success}</p>}
//       {toast.message && (
//         <div
//           className={`${styles.listings__toast} ${
//             styles[`listings__toast--${toast.type}`]
//           }`}
//         >
//           {toast.message}
//         </div>
//       )}
//       {listings.length === 0 ? (
//         <p className={styles.listings__empty}>
//           <FormattedMessage id="no_listings" defaultMessage="Объявления не найдены" />
//         </p>
//       ) : (
//         <>
//           <div className={styles.listings__grid}>
//             {displayListings.map((item, index) =>
//               item ? (
//                 <article
//                   key={item.id}
//                   className={styles.listings__card}
//                   onClick={() => openModal(item)}
//                   style={{ cursor: 'pointer' }}
//                 >
//                   {item.images?.length > 0 && item.images[0]?.image ? (
//                     <img
//                       src={item.images[0].image}
//                       alt={item.title || intl.formatMessage({ id: 'property_image_alt', defaultMessage: 'Изображение недвижимости' })}
//                       className={styles.listings__image}
//                       loading="lazy"
//                       onError={(e) =>
//                         (e.target.src = "/path/to/fallback-image.png")
//                       }
//                     />
//                   ) : (
//                     <div className={styles.listings__no_image}>
//                       <FormattedMessage id="no_images" defaultMessage="Изображения отсутствуют" />
//                     </div>
//                   )}
//                   <div className={styles.listings__content}>
//                     <h3 className={styles.listings__cardTitle}>
//                       {item.title || intl.formatMessage({ id: 'no_title', defaultMessage: 'Без названия' })}
//                     </h3>
//                     <p className={styles.listings__address}>
//                       {item.location?.city || intl.formatMessage({ id: 'not_specified', defaultMessage: 'Не указано' })},{" "}
//                       {item.location?.district || intl.formatMessage({ id: 'not_specified', defaultMessage: 'Не указано' })}
//                     </p>
//                     <p className={styles.listings__price}>
//                       <span className={styles.dollar}>
//                         ${parseFloat(item.price || 0).toFixed(2)} / {parseFloat((item.price || 0) * USD_RATE).toLocaleString('ru-RU')} <FormattedMessage id="som" defaultMessage="сом" />
//                       </span>
//                     </p>
//                     <div className={styles.listings__details}>
//                       <span>{item.rooms || "N/A"} <FormattedMessage id="rooms_short" defaultMessage="комн." /></span>
//                       <span>{item.area || "N/A"} <FormattedMessage id="square_meters" defaultMessage="м²" /></span>
//                       {item.floor && <span><FormattedMessage id="floor" defaultMessage="Этаж" />: {item.floor}</span>}
//                       {item.land_area && <span>{item.land_area} <FormattedMessage id="sotka" defaultMessage="соток" /></span>}
//                       {item.commercial_type && (
//                         <span>{formatCommercialType(item.commercial_type)}</span>
//                       )}
//                       <span>{formatPropertyType(item.property_type)}</span>
//                     </div>
//                     <div className={styles.listings__actions}>
//                       <button
//                         className={`${styles.listings__action_button} ${
//                           likedListings.has(item.id)
//                             ? styles["listings__action_button--liked"]
//                             : ""
//                         }`}
//                         onClick={(e) => handleLike(item.id, e)}
//                         disabled={likedListings.has(item.id)}
//                         title={intl.formatMessage({ id: 'like_button', defaultMessage: 'Лайк' })}
//                       >
//                         <svg
//                           width="20"
//                           height="20"
//                           viewBox="0 0 24 24"
//                           fill={likedListings.has(item.id) ? "#ef4444" : "none"}
//                           stroke={likedListings.has(item.id) ? "#ef4444" : "#4b5563"}
//                           strokeWidth="2"
//                         >
//                           <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
//                         </svg>
//                         <span>{item.likes_count || 0}</span>
//                       </button>
//                       <button
//                         className={`${styles.listings__action_button} ${
//                           favorites.some((fav) => fav.id === item.id)
//                             ? styles["listings__action_button--active"]
//                             : ""
//                         }`}
//                         onClick={(e) => handleFavorite(item, e)}
//                         title={intl.formatMessage({ id: 'favorite_button', defaultMessage: 'В избранное' })}
//                       >
//                         <svg
//                           width="20"
//                           height="20"
//                           viewBox="0 0 24 24"
//                           fill={favorites.some((fav) => fav.id === item.id) ? "#ef4444" : "none"}
//                           stroke={favorites.some((fav) => fav.id === item.id) ? "#ef4444" : "#4b5563"}
//                           strokeWidth="2"
//                         >
//                           <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
//                         </svg>
//                       </button>
//                       <button
//                         className={styles.listings__action_button}
//                         onClick={(e) => handleShare(item, e)}
//                         title={intl.formatMessage({ id: 'share_button', defaultMessage: 'Поделиться' })}
//                       >
//                         <svg
//                           width="20"
//                           height="20"
//                           viewBox="0 0 24 24"
//                           fill="none"
//                           stroke="#4b5563"
//                           strokeWidth="2"
//                         >
//                           <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.70s-.04-.47-.09-.70l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.70L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
//                         </svg>
//                       </button>
//                       <button
//                         className={styles.listings__action_button}
//                         onClick={(e) => handleEdit(item, e)}
//                         title={intl.formatMessage({ id: 'edit_button', defaultMessage: 'Изменить' })}
//                       >
//                         <svg
//                           width="20"
//                           height="20"
//                           viewBox="0 0 24 24"
//                           fill="none"
//                           stroke="#4b5563"
//                           strokeWidth="2"
//                         >
//                           <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
//                           <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
//                         </svg>
//                       </button>
//                       <button
//                         className={styles.listings__action_button}
//                         onClick={(e) => handleDelete(item.id, e)}
//                         title={intl.formatMessage({ id: 'delete_button', defaultMessage: 'Удалить' })}
//                       >
//                         <svg
//                           width="20"
//                           height="20"
//                           viewBox="0 0 24 24"
//                           fill="none"
//                           stroke="#dc2626"
//                           strokeWidth="2"
//                         >
//                           <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m-1 5v7a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-7m-4-3h18" />
//                         </svg>
//                       </button>
//                     </div>
//                   </div>
//                 </article>
//               ) : (
//                 <article
//                   key={`empty-${index}`}
//                   className={styles.listings__card_empty}
//                 >
//                   <div className={styles.listings__no_image}>
//                     <FormattedMessage id="no_listing" defaultMessage="Объявление отсутствует" />
//                   </div>
//                   <div className={styles.listings__content_empty}>
//                     <h3 className={styles.listings__cardTitle_empty}>
//                       <FormattedMessage id="no_data" defaultMessage="Нет данных" />
//                     </h3>
//                     <p className={styles.listings__address_empty}>—</p>
//                     <p className={styles.listings__price_empty}>—</p>
//                     <div className={styles.listings__details_empty}>
//                       <span>—</span>
//                       <span>—</span>
//                       <span>—</span>
//                     </div>
//                   </div>
//                 </article>
//               )
//             )}
//           </div>
//           {listings.length > listingsPerPage && (
//             <div className={styles.listings__pagination}>
//               <button
//                 className={styles.listings__paginationButton}
//                 onClick={() => handlePageChange(page - 1)}
//                 disabled={page === 1}
//                 aria-label={intl.formatMessage({ id: 'prev_page', defaultMessage: 'Предыдущая страница' })}
//               >
//                 ←
//               </button>
//               <span className={styles.listings__paginationText}>
//                 {page} <FormattedMessage id="of" defaultMessage="из" /> {totalPages}
//               </span>
//               <button
//                 className={styles.listings__paginationButton}
//                 onClick={() => handlePageChange(page + 1)}
//                 disabled={page === totalPages}
//                 aria-label={intl.formatMessage({ id: 'next_page', defaultMessage: 'Следующая страница' })}
//               >
//                 →
//               </button>
//             </div>
//           )}
//         </>
//       )}
//       {isModalOpen && selectedListing && (
//         <ListingModal
//           selectedListing={selectedListing}
//           closeModal={closeModal}
//           currentImageIndex={currentImageIndex}
//           setCurrentImageIndex={setCurrentImageIndex}
//           showRequestForm={showRequestForm}
//           toggleRequestForm={toggleRequestForm}
//           requestData={requestData}
//           handleRequestChange={handleRequestChange}
//           handleRequestSubmit={handleRequestSubmit}
//           handleLike={handleLike}
//           handleFavorite={handleFavorite}
//           handleShare={handleShare}
//           handleWhatsApp={handleWhatsApp}
//           likedListings={likedListings}
//           favorites={favorites}
//           formatPropertyType={formatPropertyType}
//           formatDealType={formatDealType}
//           formatCondition={formatCondition}
//           formatDocument={formatDocument}
//           formatComplex={formatComplex}
//           formatUtilities={formatUtilities}
//           formatPurpose={formatPurpose}
//           formatCommercialType={formatCommercialType}
//         />
//       )}
//       {isEditModalOpen && selectedListing && (
//         <EditListingModal
//           listing={selectedListing}
//           closeModal={closeEditModal}
//           fetchListings={fetchListings}
//           complexes={complexes}
//         />
//       )}
//     </section>
//   );
// };

// export default MyListings;


// src/pages/MyListings/MyListings.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import api from "../../Api/Api";
import ListingModal from "../../pages/Listings/ListingModal";
import EditListingModal from "../../Admin/EditListing/EditListing";
import { FiHeart, FiStar, FiShare2, FiEdit2, FiTrash2 } from "react-icons/fi";
import "./MyListings.scss";

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

const MyListings = ({ searchParams = {}, selectedListingId = null }) => {
  const intl = useIntl();

  const [listings, setListings] = useState([]);
  const [complexes, setComplexes] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [userId, setUserId] = useState(null);
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
      setUserId(data?.id || null);
    } catch (e) {
      console.error(e?.message || "error_fetch_profile");
      setUserRole("");
      setUserId(null);
      showToast("error_fetch_profile", "error");
    }
  };

  // ТОЛЬКО мои объявления
  const fetchListings = async ({ preservePage = false } = {}) => {
    if (!userId) return; // ждём профиль
    try {
      const params = new URLSearchParams();
      Object.entries(searchParams).forEach(([k, v]) => {
        if (v !== undefined && v !== null && String(v) !== "") params.append(k, v);
      });
      const { data } = await api.get(`/listings/listings/?${params.toString()}`);
      const arr = safeArray(data).filter((it) => it?.owner?.id === userId);

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

  // загрузки
  useEffect(() => {
    fetchProfile();
    getUsdToKgsRate().then(setUsdKgs).catch(() => setUsdKgs(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetchListings();
    fetchComplexes();
    if (selectedListingId) fetchListingById(selectedListingId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, JSON.stringify(searchParams), selectedListingId]);

  useEffect(() => {
    try {
      localStorage.setItem("userId", userId || "");
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
        className: isLiked ? "mylistings__action_button--liked" : "",
        title: intl.formatMessage({ id: "like_button", defaultMessage: "Лайк" }),
        icon: <FiHeart />,
        label: item.likes_count || 0,
      },
      {
        onClick: (e) => handleFavorite(item, e),
        disabled: false,
        className: isFav ? "mylistings__action_button--active" : "",
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
          onClick: (e) => openDeleteConfirm(item, e),
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
        className="mylistings__card"
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
            className="mylistings__image"
            loading="lazy"
            onError={(e) => {
              console.error("image_error");
              e.currentTarget.src = "https://via.placeholder.com/400";
            }}
          />
        ) : (
          <div className="mylistings__no_image">
            <FormattedMessage id="no_images" defaultMessage="Изображения отсутствуют" />
          </div>
        )}

        <div className="mylistings__content">
          <h3 className="mylistings__cardTitle">
            {item.title || <FormattedMessage id="no_title" defaultMessage="Без названия" />}
          </h3>

          <p className="mylistings__address">
            {item.location?.city || (
              <FormattedMessage id="not_specified" defaultMessage="Не указано" />
            )}
            ,{" "}
            {item.location?.district || (
              <FormattedMessage id="not_specified" defaultMessage="Не указано" />
            )}
          </p>

          <p className="mylistings__price">
            <span className="dollar">
              ${usd.toFixed(2)}
              {somText ? ` / ${somText}` : ""}
            </span>
          </p>

          <div className="mylistings__details">
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

          <div className="mylistings__actions" onClick={(e) => e.stopPropagation()}>
            {actions.map(({ onClick, disabled, className, title, icon, label }, idx) => (
              <button
                key={idx}
                className={`mylistings__action_button ${className}`}
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
    <section id="my-listings" className="mylistings">
      {toast.message && (
        <div
          className={`mylistings__toast mylistings__toast--${toast.type}`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}

      {/* счётчик "показано N из M" */}
      <div className="mylistings__meta">
        <div className="mylistings__counter">
          <FormattedMessage
            id="shown_of_total"
            defaultMessage="Показано {shown} из {total}"
            values={{ shown: shownCount, total: totalCount }}
          />
        </div>
      </div>

      {listings.length === 0 ? (
        <p className="mylistings__empty">
          <FormattedMessage id="no_listings" defaultMessage="Объявления не найдены" />
        </p>
      ) : (
        <>
          <div className="mylistings__grid">{paginatedListings.map((it) => renderCard(it))}</div>

          {totalPages > 1 && (
            <div
              className="mylistings__pagination"
              role="navigation"
              aria-label={intl.formatMessage({ id: "pagination", defaultMessage: "Пагинация" })}
            >
              <button
                className="mylistings__paginationButton"
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
              <span className="mylistings__paginationText">
                {page} <FormattedMessage id="of" defaultMessage="из" /> {totalPages}
              </span>
              <button
                className="mylistings__paginationButton"
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
        <div className="mylistings__confirm" role="dialog" aria-modal="true">
          <div className="mylistings__confirm_backdrop" onClick={closeDeleteConfirm} />
          <div className="mylistings__confirm_card" role="document">
            <h3 className="mylistings__confirm_title">
              <FormattedMessage id="confirm_delete_title" defaultMessage="Подтверждение удаления" />
            </h3>
            <p className="mylistings__confirm_text">
              <FormattedMessage
                id="confirm_delete_text"
                defaultMessage="Удалить объявление «{title}»?"
                values={{
                  title:
                    confirm.title ||
                    intl.formatMessage({ id: "no_title", defaultMessage: "Без названия" }),
                }}
              />
            </p>
            <div className="mylistings__confirm_actions">
              <button type="button" className="mylistings__confirm_btn" onClick={closeDeleteConfirm}>
                <FormattedMessage id="cancel" defaultMessage="Отмена" />
              </button>
              <button
                type="button"
                className="mylistings__confirm_btn mylistings__confirm_btn--danger"
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

export default MyListings;
