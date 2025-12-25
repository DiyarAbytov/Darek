// import React, { useState, useEffect } from 'react';
// import { FormattedMessage, useIntl } from 'react-intl';
// import styles from './EditListing.module.scss';

// const refreshToken = async () => {
//   const refresh = localStorage.getItem('refresh_token');
//   if (!refresh) throw new Error('Нет refresh токена');
//   const response = await fetch('https://dar.kg/api/v1/users/auth/token/refresh/', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ refresh }),
//   });
//   if (response.ok) {
//     const data = await response.json();
//     localStorage.setItem('access_token', data.access);
//     return data.access;
//   }
//   localStorage.removeItem('access_token');
//   localStorage.removeItem('refresh_token');
//   throw new Error('Ошибка обновления токена');
// };

// const fetchWithAuth = async (url, options = {}) => {
//   let token = localStorage.getItem('access_token');
//   if (!token) {
//     token = await refreshToken();
//   }
//   const headers = { ...options.headers, Authorization: `Bearer ${token}` };
//   let response = await fetch(url, { ...options, headers });
//   if (response.status === 401) {
//     token = await refreshToken();
//     headers.Authorization = `Bearer ${token}`;
//     response = await fetch(url, { ...options, headers });
//   }
//   if (response.status === 403) {
//     return { ok: false, status: 403, error: 'Доступ запрещен: недостаточно прав' };
//   }
//   return response;
// };

// const EditListingModal = ({ listing, closeModal, fetchListings, complexes }) => {
//   const intl = useIntl();
//   const [formData, setFormData] = useState({
//     title: listing.title || '',
//     description: listing.description || '',
//     price: listing.price || '',
//     price2: listing.price ? (parseFloat(listing.price) * 85).toFixed(2) : '',
//     rooms: listing.rooms || '',
//     area: listing.area || '',
//     city: listing.location?.city || '',
//     district: listing.location?.district || '',
//     address: listing.address || '',
//     deal_type: listing.deal_type || '',
//     property_type: listing.property_type || '',
//     floor: listing.floor || '',
//     land_area: listing.land_area || '',
//     commercial_type: listing.commercial_type || '',
//     condition: listing.condition || '',
//     utilities: listing.utilities || '',
//     purpose: listing.purpose || '',
//     location_id: listing.location?.id || '',
//     document: listing.document || '',
//     complex: listing.single_field || '',
//     series: listing.series || ''
//   });
//   const [images, setImages] = useState([]);
//   const [imagePreviews, setImagePreviews] = useState(listing.images?.map(img => img.image) || []);
//   const [locations, setLocations] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [notification, setNotification] = useState({ message: '', type: '', visible: false });
//   const USD_RATE = 85;

//   const fetchLocations = async () => {
//     try {
//       const response = await fetchWithAuth('https://dar.kg/api/v1/listings/locations/list/');
//       if (response.ok) {
//         setLocations(await response.json());
//       } else {
//         setNotification({ message: intl.formatMessage({ id: 'error_locations_fetch', defaultMessage: 'Ошибка загрузки локаций' }), type: 'error', visible: true });
//       }
//     } catch (err) {
//       console.error('Ошибка fetchLocations:', err);
//       setNotification({ message: intl.formatMessage({ id: 'error_locations_fetch', defaultMessage: 'Ошибка загрузки локаций' }) + `: ${err.message}`, type: 'error', visible: true });
//     }
//   };

//   useEffect(() => {
//     fetchLocations();
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => {
//       const newFormData = { ...prev, [name]: value };
//       if (name === 'city') {
//         newFormData.district = '';
//         newFormData.location_id = '';
//       }
//       if (name === 'district') {
//         const selectedLocation = locations.find(
//           loc => loc.city === newFormData.city && loc.district === value
//         );
//         newFormData.location_id = selectedLocation ? selectedLocation.id : '';
//       }
//       if (name === 'deal_type') {
//         newFormData.complex = '';
//       }
//       if (name === 'price') {
//         newFormData.price2 = value ? (parseFloat(value) * USD_RATE).toFixed(2) : '';
//       }
//       return newFormData;
//     });
//   };

//   const handleImageChange = (e) => {
//     const files = Array.from(e.target.files);
//     setImages([...images, ...files]);
//     setImagePreviews([...imagePreviews, ...files.map(file => URL.createObjectURL(file))]);
//   };

//   const handleRemoveImage = (index) => {
//     setImages(images.filter((_, i) => i !== index));
//     setImagePreviews(imagePreviews.filter((_, i) => i !== index));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setNotification({ message: '', type: '', visible: false });

//     if (!formData.title) {
//       setNotification({ message: intl.formatMessage({ id: 'error_title_required', defaultMessage: 'Заголовок обязателен' }), type: 'error', visible: true });
//       return;
//     }
//     if (!formData.description) {
//       setNotification({ message: intl.formatMessage({ id: 'error_description_required', defaultMessage: 'Описание обязательно' }), type: 'error', visible: true });
//       return;
//     }
//     if (!formData.price || isNaN(parseFloat(formData.price))) {
//       setNotification({ message: intl.formatMessage({ id: 'error_price_required', defaultMessage: 'Цена обязательна и должна быть числом' }), type: 'error', visible: true });
//       return;
//     }
//     if (!formData.price2 || isNaN(parseFloat(formData.price2))) {
//       setNotification({ message: intl.formatMessage({ id: 'error_price2_required', defaultMessage: 'Цена в сомах обязательна и должна быть числом' }), type: 'error', visible: true });
//       return;
//     }
//     if (!formData.area || isNaN(parseFloat(formData.area))) {
//       setNotification({ message: intl.formatMessage({ id: 'error_area_required', defaultMessage: 'Площадь обязательна и должна быть числом' }), type: 'error', visible: true });
//       return;
//     }
//     if (!formData.location_id) {
//       setNotification({ message: intl.formatMessage({ id: 'error_location_required', defaultMessage: 'Выберите город и район' }), type: 'error', visible: true });
//       return;
//     }
//     if (!formData.address) {
//       setNotification({ message: intl.formatMessage({ id: 'error_address_required', defaultMessage: 'Адрес обязателен' }), type: 'error', visible: true });
//       return;
//     }
//     if (!formData.deal_type) {
//       setNotification({ message: intl.formatMessage({ id: 'error_deal_type_required', defaultMessage: 'Тип категории обязателен' }), type: 'error', visible: true });
//       return;
//     }
//     if (!formData.property_type) {
//       setNotification({ message: intl.formatMessage({ id: 'error_property_type_required', defaultMessage: 'Тип недвижимости обязателен' }), type: 'error', visible: true });
//       return;
//     }
//     if (formData.property_type === 'apartment' && (!formData.floor || isNaN(parseFloat(formData.floor)))) {
//       setNotification({ message: intl.formatMessage({ id: 'error_floor_required', defaultMessage: 'Этаж обязателен для квартиры' }), type: 'error', visible: true });
//       return;
//     }
//     if (formData.property_type === 'house' && (!formData.land_area || isNaN(parseFloat(formData.land_area)))) {
//       setNotification({ message: intl.formatMessage({ id: 'error_land_area_required', defaultMessage: 'Площадь участка обязательна для дома' }), type: 'error', visible: true });
//       return;
//     }
//     if (formData.property_type === 'commercial' && !formData.commercial_type) {
//       setNotification({ message: intl.formatMessage({ id: 'error_commercial_type_required', defaultMessage: 'Тип коммерции обязателен' }), type: 'error', visible: true });
//       return;
//     }
//     if ((formData.deal_type === 'secondary' || formData.deal_type === 'new_building') && !formData.complex) {
//       setNotification({ message: intl.formatMessage({ id: 'error_complex_required', defaultMessage: 'Комплекс обязателен' }), type: 'error', visible: true });
//       return;
//     }

//     try {
//       setLoading(true);
//       const formDataToSend = new FormData();
//       formDataToSend.append('title', formData.title);
//       formDataToSend.append('description', formData.description);
//       formDataToSend.append('price', formData.price);
//       formDataToSend.append('price2', formData.price2);
//       formDataToSend.append('area', formData.area);
//       formDataToSend.append('address', formData.address);
//       formDataToSend.append('deal_type', formData.deal_type);
//       formDataToSend.append('property_type', formData.property_type);
//       formDataToSend.append('is_active', 'true');
//       formDataToSend.append('location_id', formData.location_id);
//       if (formData.rooms) formDataToSend.append('rooms', formData.rooms);
//       if (formData.floor && formData.property_type === 'apartment') formDataToSend.append('floor', formData.floor);
//       if (formData.land_area && formData.property_type === 'house') formDataToSend.append('land_area', formData.land_area);
//       if (formData.commercial_type && formData.property_type === 'commercial') formDataToSend.append('commercial_type', formData.commercial_type);
//       if (formData.condition) formDataToSend.append('condition', formData.condition);
//       if (formData.utilities) formDataToSend.append('utilities', formData.utilities);
//       if (formData.purpose) formDataToSend.append('purpose', formData.purpose);
//       if (formData.document) formDataToSend.append('document', formData.document);
//       if (formData.complex) formDataToSend.append('single_field', formData.complex);
//       if (formData.series) formDataToSend.append('series', formData.series);
//       images.forEach(image => formDataToSend.append('media_files', image));

//       const response = await fetchWithAuth(`https://dar.kg/api/v1/listings/listings/${listing.id}/`, {
//         method: 'PUT',
//         body: formDataToSend
//       });

//       if (!response.ok) {
//         let errorDetail = intl.formatMessage({ id: 'error_update_listing', defaultMessage: 'Ошибка обновления объявления' });
//         try {
//           const data = await response.json();
//           errorDetail = data.detail || JSON.stringify(data) || `HTTP ошибка: ${response.status}`;
//         } catch {
//           errorDetail = `HTTP ошибка: ${response.status}`;
//         }
//         console.error('Ошибка handleSubmit:', errorDetail);
//         setNotification({ message: errorDetail, type: 'error', visible: true });
//         setLoading(false);
//         return;
//       }

//       setNotification({ message: intl.formatMessage({ id: 'success_update_listing', defaultMessage: 'Объявление обновлено!' }), type: 'success', visible: true });
//       setLoading(false);
//       closeModal();
//       await fetchListings();
//     } catch (err) {
//       console.error('Ошибка handleSubmit:', err);
//       setNotification({ message: intl.formatMessage({ id: 'error_update_listing', defaultMessage: 'Ошибка: ' }) + err.message, type: 'error', visible: true });
//       setLoading(false);
//     }
//     setTimeout(() => setNotification({ message: '', type: '', visible: false }), 5000);
//   };

//   const renderSpecificFields = () => {
//     switch (formData.property_type) {
//       case 'apartment':
//         return (
//           <div className={styles.form__row}>
//             <div className={styles.form__group}>
//               <label className={styles.form__label}>
//                 <FormattedMessage id="floor" defaultMessage="Этаж" />
//               </label>
//               <input
//                 type="number"
//                 name="floor"
//                 value={formData.floor}
//                 onChange={handleChange}
//                 placeholder={intl.formatMessage({ id: 'enter_floor', defaultMessage: 'Введите этаж' })}
//                 required
//                 className={styles.form__input}
//               />
//             </div>
//             <div className={styles.form__group}>
//               <label className={styles.form__label}>
//                 <FormattedMessage id="rooms" defaultMessage="Комнаты" />
//               </label>
//               <select
//                 name="rooms"
//                 value={formData.rooms}
//                 onChange={handleChange}
//                 className={styles.form__select}
//               >
//                 <option value="">{intl.formatMessage({ id: 'select_rooms', defaultMessage: 'Выберите комнаты' })}</option>
//                 <option value="1">1</option>
//                 <option value="2">2</option>
//                 <option value="3">3</option>
//                 <option value="4">4+</option>
//               </select>
//             </div>
//           </div>
//         );
//       case 'house':
//         return (
//           <>
//             <div className={styles.form__row}>
//               <div className={styles.form__group}>
//                 <label className={styles.form__label}>
//                   <FormattedMessage id="land_area" defaultMessage="Площадь участка (сотки)" />
//                 </label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   name="land_area"
//                   value={formData.land_area}
//                   onChange={handleChange}
//                   placeholder={intl.formatMessage({ id: 'enter_land_area', defaultMessage: 'Введите площадь' })}
//                   required
//                   className={styles.form__input}
//                 />
//               </div>
//               <div className={styles.form__group}>
//                 <label className={styles.form__label}>
//                   <FormattedMessage id="utilities" defaultMessage="Коммуникации" />
//                 </label>
//                 <select
//                   name="utilities"
//                   value={formData.utilities}
//                   onChange={handleChange}
//                   className={styles.form__select}
//                 >
//                   <option value="">{intl.formatMessage({ id: 'select_utilities', defaultMessage: 'Выберите коммуникации' })}</option>
//                   <option value="all">{intl.formatMessage({ id: 'utilities_all', defaultMessage: 'Все подключены' })}</option>
//                   <option value="partial">{intl.formatMessage({ id: 'utilities_partial', defaultMessage: 'Частично' })}</option>
//                   <option value="none">{intl.formatMessage({ id: 'utilities_none', defaultMessage: 'Отсутствуют' })}</option>
//                 </select>
//               </div>
//             </div>
//             <div className={styles.form__row}>
//               <div className={styles.form__group}>
//                 <label className={styles.form__label}>
//                   <FormattedMessage id="rooms" defaultMessage="Комнаты" />
//                 </label>
//                 <select
//                   name="rooms"
//                   value={formData.rooms}
//                   onChange={handleChange}
//                   className={styles.form__select}
//                 >
//                   <option value="">{intl.formatMessage({ id: 'select_rooms', defaultMessage: 'Выберите комнаты' })}</option>
//                   <option value="1">1</option>
//                   <option value="2">2</option>
//                   <option value="3">3</option>
//                   <option value="4">4+</option>
//                 </select>
//               </div>
//               <div className={styles.form__group}></div>
//             </div>
//           </>
//         );
//       case 'commercial':
//         return (
//           <>
//             <div className={styles.form__row}>
//               <div className={styles.form__group}>
//                 <label className={styles.form__label}>
//                   <FormattedMessage id="commercial_type" defaultMessage="Тип коммерции" />
//                 </label>
//                 <select
//                   name="commercial_type"
//                   value={formData.commercial_type}
//                   onChange={handleChange}
//                   required
//                   className={styles.form__select}
//                 >
//                   <option value="">{intl.formatMessage({ id: 'select_commercial_type', defaultMessage: 'Выберите тип' })}</option>
//                   <option value="office">{intl.formatMessage({ id: 'commercial_type_office', defaultMessage: 'Офис' })}</option>
//                   <option value="retail">{intl.formatMessage({ id: 'commercial_type_retail', defaultMessage: 'Торговая площадь' })}</option>
//                   <option value="warehouse">{intl.formatMessage({ id: 'commercial_type_warehouse', defaultMessage: 'Склад' })}</option>
//                   <option value="other">{intl.formatMessage({ id: 'commercial_type_other', defaultMessage: 'Прочее' })}</option>
//                 </select>
//               </div>
//               <div className={styles.form__group}>
//                 <label className={styles.form__label}>
//                   <FormattedMessage id="purpose" defaultMessage="Назначение" />
//                 </label>
//                 <select
//                   name="purpose"
//                   value={formData.purpose}
//                   onChange={handleChange}
//                   className={styles.form__select}
//                 >
//                   <option value="">{intl.formatMessage({ id: 'select_purpose', defaultMessage: 'Выберите назначение' })}</option>
//                   <option value="cafe">{intl.formatMessage({ id: 'purpose_cafe', defaultMessage: 'Кафе/ресторан' })}</option>
//                   <option value="shop">{intl.formatMessage({ id: 'purpose_shop', defaultMessage: 'Магазин' })}</option>
//                   <option value="office">{intl.formatMessage({ id: 'purpose_office', defaultMessage: 'Офис' })}</option>
//                 </select>
//               </div>
//             </div>
//             <div className={styles.form__row}>
//               <div className={styles.form__group}>
//                 <label className={styles.form__label}>
//                   <FormattedMessage id="rooms" defaultMessage="Комнаты" />
//                 </label>
//                 <select
//                   name="rooms"
//                   value={formData.rooms}
//                   onChange={handleChange}
//                   className={styles.form__select}
//                 >
//                   <option value="">{intl.formatMessage({ id: 'select_rooms', defaultMessage: 'Выберите комнаты' })}</option>
//                   <option value="1">1</option>
//                   <option value="2">2</option>
//                   <option value="3">3</option>
//                   <option value="4">4+</option>
//                 </select>
//               </div>
//               <div className={styles.form__group}></div>
//             </div>
//           </>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className={styles.modal}>
//       <div className={styles.modal__content}>
//         <button className={styles.modal__close} onClick={closeModal}>×</button>
//         <form onSubmit={handleSubmit} className={styles.form}>
//           <div className={styles.form__row}>
//             <div className={styles.form__group}>
//               <label className={styles.form__label}>
//                 <FormattedMessage id="property_type" defaultMessage="Тип недвижимости" />
//               </label>
//               <select
//                 name="property_type"
//                 value={formData.property_type}
//                 onChange={handleChange}
//                 required
//                 className={styles.form__select}
//               >
//                 <option value="">{intl.formatMessage({ id: 'select_property_type', defaultMessage: 'Выберите тип' })}</option>
//                 <option value="apartment">{intl.formatMessage({ id: 'property_apartment', defaultMessage: 'Квартира' })}</option>
//                 <option value="house">{intl.formatMessage({ id: 'property_house', defaultMessage: 'Дом/Участок' })}</option>
//                 <option value="commercial">{intl.formatMessage({ id: 'property_commercial', defaultMessage: 'Коммерческая' })}</option>
//               </select>
//             </div>
//             <div className={styles.form__group}>
//               <label className={styles.form__label}>
//                 <FormattedMessage id="deal_type" defaultMessage="Тип категории" />
//               </label>
//               <select
//                 name="deal_type"
//                 value={formData.deal_type}
//                 onChange={handleChange}
//                 required
//                 className={styles.form__select}
//               >
//                 <option value="">{intl.formatMessage({ id: 'select_deal_type', defaultMessage: 'Выберите категорию' })}</option>
//                 <option value="secondary">{intl.formatMessage({ id: 'deal_type_secondary', defaultMessage: 'Вторичная' })}</option>
//                 <option value="new_building">{intl.formatMessage({ id: 'deal_type_new_building', defaultMessage: 'Новостройки' })}</option>
//               </select>
//             </div>
//           </div>
//           {formData.deal_type && (
//             <div className={styles.form__row}>
//               <div className={styles.form__group}>
//                 <label className={styles.form__label}>
//                   <FormattedMessage id="complex" defaultMessage="Комплекс" />
//                 </label>
//                 <select
//                   name="complex"
//                   value={formData.complex}
//                   onChange={handleChange}
//                   required={formData.deal_type === 'secondary' || formData.deal_type === 'new_building'}
//                   className={styles.form__select}
//                 >
//                   <option value="">{intl.formatMessage({ id: 'select_complex', defaultMessage: 'Выберите комплекс' })}</option>
//                   {complexes.map(complex => (
//                     <option key={complex.id} value={complex.id}>{complex.value}</option>
//                   ))}
//                 </select>
//               </div>
//               <div className={styles.form__group}></div>
//             </div>
//           )}
//           <div className={styles.form__row}>
//             <div className={styles.form__group}>
//               <label className={styles.form__label}>
//                 <FormattedMessage id="title" defaultMessage="Заголовок" />
//               </label>
//               <input
//                 type="text"
//                 name="title"
//                 value={formData.title}
//                 onChange={handleChange}
//                 placeholder={intl.formatMessage({ id: 'enter_title', defaultMessage: 'Введите заголовок' })}
//                 required
//                 className={styles.form__input}
//               />
//             </div>
//             <div className={styles.form__group}>
//               <label className={styles.form__label}>
//                 <FormattedMessage id="area" defaultMessage="Площадь (кв.м.)" />
//               </label>
//               <input
//                 type="number"
//                 step="0.01"
//                 name="area"
//                 value={formData.area}
//                 onChange={handleChange}
//                 placeholder={intl.formatMessage({ id: 'enter_area', defaultMessage: 'Введите площадь' })}
//                 required
//                 className={styles.form__input}
//               />
//             </div>
//           </div>
//           <div className={styles.form__group}>
//             <label className={styles.form__label}>
//               <FormattedMessage id="description" defaultMessage="Описание" />
//             </label>
//             <textarea
//               name="description"
//               value={formData.description}
//               onChange={handleChange}
//               placeholder={intl.formatMessage({ id: 'enter_description', defaultMessage: 'Введите описание' })}
//               required
//               className={styles.form__textarea}
//             />
//           </div>
//           <div className={styles.form__row}>
//             <div className={styles.form__group}>
//               <label className={styles.form__label}>
//                 <FormattedMessage id="price" defaultMessage="Цена ($)" />
//               </label>
//               <input
//                 type="number"
//                 step="0.01"
//                 name="price"
//                 value={formData.price}
//                 onChange={handleChange}
//                 placeholder={intl.formatMessage({ id: 'enter_price', defaultMessage: 'Введите цену' })}
//                 required
//                 className={styles.form__input}
//               />
//               <p className={styles.form__price_conversion}>
//                 {formData.price && !isNaN(parseFloat(formData.price))
//                   ? `${parseFloat(formData.price * USD_RATE).toLocaleString('ru-RU')} ${intl.formatMessage({ id: 'som', defaultMessage: 'сом' })}`
//                   : ''}
//               </p>
//             </div>
//             <div className={styles.form__group}>
//               <label className={styles.form__label}>
//                 <FormattedMessage id="price2" defaultMessage="Цена (сом)" />
//               </label>
//               <input
//                 type="number"
//                 step="0.01"
//                 name="price2"
//                 value={formData.price2}
//                 onChange={handleChange}
//                 placeholder={intl.formatMessage({ id: 'enter_price2', defaultMessage: 'Введите цену в сомах' })}
//                 required
//                 className={styles.form__input}
//               />
//             </div>
//           </div>
//           <div className={styles.form__row}>
//             <div className={styles.form__group}>
//               <label className={styles.form__label}>
//                 <FormattedMessage id="address" defaultMessage="Адрес" />
//               </label>
//               <input
//                 type="text"
//                 name="address"
//                 value={formData.address}
//                 onChange={handleChange}
//                 placeholder={intl.formatMessage({ id: 'enter_address', defaultMessage: 'Введите адрес' })}
//                 required
//                 className={styles.form__input}
//               />
//             </div>
//             <div className={styles.form__group}>
//               <label className={styles.form__label}>
//                 <FormattedMessage id="city" defaultMessage="Город" />
//               </label>
//               <select
//                 name="city"
//                 value={formData.city}
//                 onChange={handleChange}
//                 required
//                 className={styles.form__select}
//               >
//                 <option value="">{intl.formatMessage({ id: 'select_city', defaultMessage: 'Выберите город' })}</option>
//                 {[...new Set(locations.map(loc => loc.city))].map(city => (
//                   <option key={city} value={city}>{city}</option>
//                 ))}
//               </select>
//             </div>
//           </div>
//           <div className={styles.form__row}>
//             <div className={styles.form__group}>
//               <label className={styles.form__label}>
//                 <FormattedMessage id="district" defaultMessage="Район" />
//               </label>
//               <select
//                 name="district"
//                 value={formData.district}
//                 onChange={handleChange}
//                 required
//                 className={styles.form__select}
//               >
//                 <option value="">{intl.formatMessage({ id: 'select_district', defaultMessage: 'Выберите район' })}</option>
//                 {locations
//                   .filter(loc => !formData.city || loc.city === formData.city)
//                   .map(location => (
//                     <option key={location.id} value={location.district}>{location.district}</option>
//                   ))}
//               </select>
//             </div>
//             <div className={styles.form__group}>
//               <label className={styles.form__label}>
//                 <FormattedMessage id="condition" defaultMessage="Состояние" />
//               </label>
//               <select
//                 name="condition"
//                 value={formData.condition}
//                 onChange={handleChange}
//                 className={styles.form__select}
//               >
//                 <option value="">{intl.formatMessage({ id: 'select_condition', defaultMessage: 'Выберите состояние' })}</option>
//                 <option value="renovated">{intl.formatMessage({ id: 'condition_renovated', defaultMessage: 'С ремонтом' })}</option>
//                 <option value="no_renovation">{intl.formatMessage({ id: 'condition_no_renovation', defaultMessage: 'Без ремонта' })}</option>
//                 <option value="pso">{intl.formatMessage({ id: 'condition_pso', defaultMessage: 'Сдан ПСО' })}</option>
//                 <option value="euro_remont">{intl.formatMessage({ id: 'condition_euro_remont', defaultMessage: 'Евроремонт' })}</option>
//               </select>
//             </div>
//           </div>
//           <div className={styles.form__row}>
//             <div className={styles.form__group}>
//               <label className={styles.form__label}>
//                 <FormattedMessage id="document" defaultMessage="Документ" />
//               </label>
//               <select
//                 name="document"
//                 value={formData.document}
//                 onChange={handleChange}
//                 className={styles.form__select}
//               >
//                 <option value="">{intl.formatMessage({ id: 'select_document', defaultMessage: 'Выберите документ' })}</option>
//                 <option value="general_power_of_attorney">{intl.formatMessage({ id: 'document_general_power_of_attorney', defaultMessage: 'Генеральная доверенность' })}</option>
//                 <option value="gift_agreement">{intl.formatMessage({ id: 'document_gift_agreement', defaultMessage: 'Договор дарения' })}</option>
//                 <option value="equity_participation_agreement">{intl.formatMessage({ id: 'document_equity_participation_agreement', defaultMessage: 'Договор долевого участия' })}</option>
//                 <option value="sale_purchase_agreement">{intl.formatMessage({ id: 'document_sale_purchase_agreement', defaultMessage: 'Договор купли-продажи' })}</option>
//                 <option value="red_book">{intl.formatMessage({ id: 'document_red_book', defaultMessage: 'Красная книга' })}</option>
//                 <option value="technical_passport">{intl.formatMessage({ id: 'document_technical_passport', defaultMessage: 'Техпаспорт' })}</option>
//               </select>
//             </div>
//             <div className={styles.form__group}>
//               <label className={styles.form__label}>
//                 <FormattedMessage id="series" defaultMessage="Серия" />
//               </label>
//               <select
//                 name="series"
//                 value={formData.series}
//                 onChange={handleChange}
//                 className={styles.form__select}
//               >
//                 <option value="">{intl.formatMessage({ id: 'select_series', defaultMessage: 'Выберите серию' })}</option>
//                 <option value="104_series">{intl.formatMessage({ id: 'series_104', defaultMessage: '104-я серия' })}</option>
//                 <option value="105_series">{intl.formatMessage({ id: 'series_105', defaultMessage: '105-я серия' })}</option>
//                 <option value="106_series">{intl.formatMessage({ id: 'series_106', defaultMessage: '106-я серия' })}</option>
//                 <option value="individual_project">{intl.formatMessage({ id: 'series_individual', defaultMessage: 'Индивидуальный проект' })}</option>
//                 <option value="khrushchevka">{intl.formatMessage({ id: 'series_khrushchevka', defaultMessage: 'Хрущевка' })}</option>
//                 <option value="stalinka">{intl.formatMessage({ id: 'series_stalinka', defaultMessage: 'Сталинка' })}</option>
//               </select>
//             </div>
//           </div>
//           {formData.property_type && renderSpecificFields()}
//           <div className={styles.form__group}>
//             <label className={styles.form__label}>
//               <FormattedMessage id="images" defaultMessage="Изображения" />
//             </label>
//             <div className={styles.image__upload}>
//               <label className={styles.image__label}>
//                 <FormattedMessage id="upload_images" defaultMessage="Загрузить изображения" />
//                 <input
//                   type="file"
//                   accept="image/*"
//                   multiple
//                   onChange={handleImageChange}
//                   className={styles.image__input}
//                 />
//               </label>
//               <div className={styles.image__previews}>
//                 {imagePreviews.map((preview, index) => (
//                   <div key={index} className={styles.image__preview}>
//                     <img src={preview} alt={intl.formatMessage({ id: 'image_preview', defaultMessage: `Превью ${index + 1}` })} />
//                     <button
//                       type="button"
//                       onClick={() => handleRemoveImage(index)}
//                       className={styles.image__remove}
//                     >
//                       ×
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//           <button type="submit" className={styles.form__button} disabled={loading}>
//             {loading ? <FormattedMessage id="loading" defaultMessage="Загрузка..." /> : <FormattedMessage id="save_changes" defaultMessage="Сохранить изменения" />}
//           </button>
//         </form>
//         {notification.visible && (
//           <div className={`${styles.notification} ${styles[`notification--${notification.type}`]}`}>
//             {notification.message}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default EditListingModal;


import React, { useEffect, useMemo, useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import api from "../../Api/Api";
import "./EditListing.scss";

const USD_RATE = 85;

const isNumber = (v) => v !== "" && !Number.isNaN(Number(v)) && Number(v) >= 0;

const dedupeFiles = (files) => {
  const seen = new Set();
  const unique = [];
  for (const f of files) {
    const key = `${f.name}__${f.size}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(f);
    }
  }
  return unique;
};

const chunk = (arr, size) => {
  if (size <= 0) return [arr];
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

const ComboBox = ({ id, labelId, placeholderId, options, value, onChange, pageSize = 20 }) => {
  const intl = useIntl();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hover, setHover] = useState(-1);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const pages = useMemo(() => chunk(filtered, pageSize), [filtered, pageSize]);
  const curr = pages[Math.max(0, page - 1)] || [];
  const totalPages = Math.max(1, pages.length);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  useEffect(() => {
    setHover(-1);
  }, [open, page, query]);

  const selectedLabel = useMemo(() => {
    const found = options.find((o) => o.value === value);
    return found?.label || "";
  }, [options, value]);

  const close = () => {
    setOpen(false);
    setQuery("");
    setPage(1);
  };

  const handleSelect = (val) => {
    onChange?.(val);
    close();
  };

  const onKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHover((h) => Math.min(h + 1, curr.length - 1));
      requestAnimationFrame(() => {
        const el = listRef.current?.querySelector(`[data-idx="${Math.min(hover + 1, curr.length - 1)}"]`);
        el?.scrollIntoView({ block: "nearest" });
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHover((h) => Math.max(h - 1, 0));
      requestAnimationFrame(() => {
        const el = listRef.current?.querySelector(`[data-idx="${Math.max(hover - 1, 0)}"]`);
        el?.scrollIntoView({ block: "nearest" });
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (hover >= 0 && curr[hover]) handleSelect(curr[hover].value);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  };

  useEffect(() => {
    const onDoc = (e) => {
      if (!open) return;
      const root = document.getElementById(id);
      if (root && !root.contains(e.target)) close();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, id]);

  return (
    <div className="combo" id={id}>
      {labelId && (
        <label className="combo__label" htmlFor={`${id}-input`}>
          <FormattedMessage id={labelId} defaultMessage="Label" />
        </label>
      )}

      <div className={`combo__control ${open ? "combo__control--open" : ""}`}>
        <input
          id={`${id}-input`}
          ref={inputRef}
          className="combo__input"
          value={open ? query : selectedLabel}
          placeholder={intl.formatMessage({ id: placeholderId, defaultMessage: "Выберите" })}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={`${id}-list`}
        />

        <button
          type="button"
          className="combo__arrow"
          aria-label="toggle"
          onClick={() => (open ? close() : setOpen(true))}
        />
      </div>

      {open && (
        <div className="combo__list" id={`${id}-list`} role="listbox">
          <div className="combo__options" ref={listRef}>
            {curr.length === 0 ? (
              <div className="combo__empty">
                <FormattedMessage id="nothing_found" defaultMessage="Ничего не найдено" />
              </div>
            ) : (
              curr.map((o, i) => {
                const active = o.value === value;
                const hovered = i === hover;
                return (
                  <div
                    key={o.id ?? o.value ?? `${o.label}_${i}`}
                    data-idx={i}
                    className={`combo__option ${active ? "combo__option--active" : ""} ${hovered ? "combo__option--hover" : ""}`}
                    role="option"
                    aria-selected={active}
                    onMouseEnter={() => setHover(i)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(o.value);
                    }}
                  >
                    {o.label}
                  </div>
                );
              })
            )}
          </div>

          <div className="combo__pagination">
            <button
              type="button"
              className="combo__pageBtn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label={intl.formatMessage({ id: "prev_page", defaultMessage: "Предыдущая" })}
            >
              ‹
            </button>
            <span className="combo__pageText">
              {page} <FormattedMessage id="of" defaultMessage="из" /> {totalPages}
            </span>
            <button
              type="button"
              className="combo__pageBtn"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label={intl.formatMessage({ id: "next_page", defaultMessage: "Следующая" })}
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const EditListing = ({ listing, closeModal, fetchListings, complexes = [] }) => {
  const intl = useIntl();

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState({ type: "", text: "", visible: false });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState(Array.isArray(listing?.images) ? listing.images.map((m) => m.image) : []);

  const [form, setForm] = useState({
    title: listing?.title || "",
    description: listing?.description || "",
    price: listing?.price ?? "",
    price2: listing?.price != null ? Number(listing.price * USD_RATE).toFixed(2) : "",
    rooms: listing?.rooms ?? "",
    area: listing?.area ?? "",
    city: listing?.location?.city || "",
    district: listing?.location?.district || "",
    address: listing?.address || "",
    deal_type: listing?.deal_type || "",
    property_type: listing?.property_type || "",
    floor: listing?.floor ?? "",
    land_area: listing?.land_area ?? "",
    commercial_type: listing?.commercial_type || "",
    condition: listing?.condition || "",
    utilities: listing?.utilities || "",
    purpose: listing?.purpose || "",
    location_id: listing?.location?.id ?? "",
    document: listing?.document || "",
    complex: listing?.single_field ?? "",
    series: listing?.series || "",
  });

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const { data } = await api.get("/listings/locations/list/");
        const arr = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
        setLocations(arr);
      } catch (e) {
        console.error(e?.message || "locations_fetch_error");
        showNotice("error", intl.formatMessage({ id: "error_locations_fetch", defaultMessage: "Ошибка загрузки локаций" }));
      }
    };
    loadLocations();
  }, []);

  const cityOptions = useMemo(() => {
    const uniq = Array.from(new Set(locations.map((l) => l.city))).sort((a, b) =>
      String(a).localeCompare(String(b), "ru")
    );
    return uniq.map((c, i) => ({ id: i, label: c, value: c }));
  }, [locations]);

  const districtOptions = useMemo(() => {
    const filtered = locations
      .filter((l) => !form.city || l.city === form.city)
      .map((l) => ({ id: l.id, label: l.district, value: l.district }));
    const seen = new Set();
    const out = [];
    for (const o of filtered) {
      const key = `${o.label}`;
      if (!seen.has(key)) {
        seen.add(key);
        out.push(o);
      }
    }
    return out.sort((a, b) => a.label.localeCompare(b.label, "ru"));
  }, [locations, form.city]);

  useEffect(() => {
    if (!form.city || !form.district) {
      setForm((p) => ({ ...p, location_id: "" }));
      return;
    }
    const loc = locations.find((l) => l.city === form.city && l.district === form.district);
    setForm((p) => ({ ...p, location_id: loc?.id ?? "" }));
  }, [form.city, form.district, locations]);

  useEffect(() => {
    if (!isNumber(form.price)) {
      setForm((p) => ({ ...p, price2: "" }));
      return;
    }
    setForm((p) => ({ ...p, price2: (Number(p.price) * USD_RATE).toFixed(2) }));
  }, [form.price]);

  const onChangeField = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSelectCity = (val) => {
    setForm((p) => ({ ...p, city: val, district: "", location_id: "" }));
  };

  const onSelectDistrict = (val) => {
    setForm((p) => ({ ...p, district: val }));
  };

  const onAddImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const unique = dedupeFiles(files);
    const next = dedupeFiles([...images, ...unique]);
    const newPreviews = unique.map((f) => URL.createObjectURL(f));
    setImages(next);
    setPreviews((p) => [...p, ...newPreviews]);
  };

  const onRemovePreview = (idx) => {
    setPreviews((p) => p.filter((_, i) => i !== idx));
    setImages((arr) => {
      const copy = [...arr];
      if (copy[idx - (previews.length - arr.length)] && idx >= previews.length - arr.length) {
        copy.splice(idx - (previews.length - arr.length), 1);
      }
      return copy;
    });
  };

  const showNotice = (type, text) => {
    setNotice({ type, text, visible: true });
    window.clearTimeout(showNotice._t);
    showNotice._t = window.setTimeout(() => setNotice({ type: "", text: "", visible: false }), 5000);
  };

  const validate = () => {
    const t = (id, def) => intl.formatMessage({ id, defaultMessage: def });
    const numOk = (v) => v === "" || isNumber(v);
    if (!numOk(form.price) || !numOk(form.price2) || !numOk(form.area) || !numOk(form.floor) || !numOk(form.land_area)) {
      return t("invalid_numbers", "Неверные числовые значения");
    }
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      showNotice("error", err);
      return;
    }

    try {
      setLoading(true);
      const fd = new FormData();

      const appendIf = (k, v) => {
        if (v !== undefined && v !== null && String(v) !== "") fd.append(k, String(v));
      };

      appendIf("title", form.title.trim());
      appendIf("description", form.description.trim());
      appendIf("price", form.price);
      appendIf("price2", form.price2);
      appendIf("area", form.area);
      appendIf("address", form.address.trim());
      appendIf("deal_type", form.deal_type);
      appendIf("property_type", form.property_type);
      appendIf("location_id", form.location_id);
      appendIf("rooms", form.rooms);
      appendIf("floor", form.floor);
      appendIf("land_area", form.land_area);
      appendIf("commercial_type", form.commercial_type);
      appendIf("condition", form.condition);
      appendIf("utilities", form.utilities);
      appendIf("purpose", form.purpose);
      appendIf("document", form.document);
      appendIf("single_field", form.complex);
      appendIf("series", form.series);
      fd.append("is_active", "true");

      images.forEach((file) => fd.append("media_files", file));

      const url = `/listings/listings/${listing.id}/`;
      const config = { headers: { "Content-Type": "multipart/form-data" } };

      const res = await api.put(url, fd, config);
      if (!res || res.status < 200 || res.status >= 300) {
        const detail = res?.data?.detail || JSON.stringify(res?.data || {}) || `HTTP: ${res?.status}`;
        showNotice("error", detail);
        setLoading(false);
        return;
      }

      showNotice("success", intl.formatMessage({ id: "success_update_listing", defaultMessage: "Объявление обновлено!" }));
      setLoading(false);
      closeModal?.();
      await fetchListings?.();
    } catch (e2) {
      console.error(e2?.message || "update_listing_error");
      showNotice("error", intl.formatMessage({ id: "error_update_listing", defaultMessage: "Ошибка обновления объявления" }));
      setLoading(false);
    }
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closeModal?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeModal]);

  const complexOptions = useMemo(
    () =>
      (Array.isArray(complexes) ? complexes : []).map((c) => ({
        id: c.id,
        label: String(c.value || c.name || c.id),
        value: c.id,
      })),
    [complexes]
  );

  return (
    <div className="edit__modal" role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && closeModal?.()}>
      <div className="edit__content" role="document" onClick={(e) => e.stopPropagation()}>
        <button className="edit__close" onClick={closeModal} aria-label={intl.formatMessage({ id: "close_modal", defaultMessage: "Закрыть" })}>
          ×
        </button>

        <form className="edit__form" onSubmit={onSubmit} noValidate>
          <div className="edit__row">
            <div className="edit__group">
              <label className="edit__label">
                <FormattedMessage id="property_type" defaultMessage="Тип недвижимости" />
              </label>
              <select name="property_type" value={form.property_type} onChange={onChangeField} className="edit__select">
                <option value="">{intl.formatMessage({ id: "select_property_type", defaultMessage: "Выберите тип" })}</option>
                <option value="apartment">{intl.formatMessage({ id: "property_apartment", defaultMessage: "Квартира" })}</option>
                <option value="house">{intl.formatMessage({ id: "property_house", defaultMessage: "Дом/Участок" })}</option>
                <option value="commercial">{intl.formatMessage({ id: "property_commercial", defaultMessage: "Коммерческая" })}</option>
              </select>
            </div>

            <div className="edit__group">
              <label className="edit__label">
                <FormattedMessage id="deal_type" defaultMessage="Тип категории" />
              </label>
              <select
                name="deal_type"
                value={form.deal_type}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm((p) => ({ ...p, deal_type: val, complex: "" }));
                }}
                className="edit__select"
              >
                <option value="">{intl.formatMessage({ id: "select_deal_type", defaultMessage: "Выберите категорию" })}</option>
                <option value="secondary">{intl.formatMessage({ id: "deal_type_secondary", defaultMessage: "Вторичная" })}</option>
                <option value="new_building">{intl.formatMessage({ id: "deal_type_new_building", defaultMessage: "Новостройки" })}</option>
              </select>
            </div>
          </div>

          {form.deal_type && (
            <div className="edit__row">
              <div className="edit__group">
                <ComboBox
                  id="complex-combo"
                  labelId="complex"
                  placeholderId="select_complex"
                  options={complexOptions}
                  value={form.complex}
                  onChange={(val) => setForm((p) => ({ ...p, complex: val }))}
                  pageSize={15}
                />
              </div>
              <div className="edit__group" />
            </div>
          )}

          <div className="edit__row">
            <div className="edit__group">
              <label className="edit__label">
                <FormattedMessage id="title" defaultMessage="Заголовок" />
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={onChangeField}
                placeholder={intl.formatMessage({ id: "enter_title", defaultMessage: "Введите заголовок" })}
                className="edit__input"
              />
            </div>

            <div className="edit__group">
              <label className="edit__label">
                <FormattedMessage id="area" defaultMessage="Площадь (м²)" />
              </label>
              <input
                type="number"
                step="0.01"
                name="area"
                value={form.area}
                onChange={onChangeField}
                placeholder={intl.formatMessage({ id: "enter_area", defaultMessage: "Введите площадь" })}
                className="edit__input"
              />
            </div>
          </div>

          <div className="edit__group">
            <label className="edit__label">
              <FormattedMessage id="description" defaultMessage="Описание" />
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={onChangeField}
              placeholder={intl.formatMessage({ id: "enter_description", defaultMessage: "Введите описание" })}
              className="edit__textarea"
            />
          </div>

          <div className="edit__row">
            <div className="edit__group">
              <label className="edit__label">
                <FormattedMessage id="price" defaultMessage="Цена ($)" />
              </label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={form.price}
                onChange={onChangeField}
                placeholder={intl.formatMessage({ id: "enter_price", defaultMessage: "Введите цену" })}
                className="edit__input"
              />
              <p className="edit__hint">
                {isNumber(form.price)
                  ? `${(Number(form.price) * USD_RATE).toLocaleString("ru-RU")} ${intl.formatMessage({
                      id: "som",
                      defaultMessage: "сом",
                    })}`
                  : ""}
              </p>
            </div>

            <div className="edit__group">
              <label className="edit__label">
                <FormattedMessage id="price2" defaultMessage="Цена (сом)" />
              </label>
              <input
                type="number"
                step="0.01"
                name="price2"
                value={form.price2}
                onChange={onChangeField}
                placeholder={intl.formatMessage({ id: "enter_price2", defaultMessage: "Введите цену в сомах" })}
                className="edit__input"
              />
            </div>
          </div>

          <div className="edit__row">
            <div className="edit__group">
              <label className="edit__label">
                <FormattedMessage id="address" defaultMessage="Адрес" />
              </label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={onChangeField}
                placeholder={intl.formatMessage({ id: "enter_address", defaultMessage: "Введите адрес" })}
                className="edit__input"
              />
            </div>

            <div className="edit__group">
              <ComboBox
                id="city-combo"
                labelId="city"
                placeholderId="select_city"
                options={cityOptions}
                value={form.city}
                onChange={onSelectCity}
                pageSize={15}
              />
            </div>
          </div>

          <div className="edit__row">
            <div className="edit__group">
              <ComboBox
                id="district-combo"
                labelId="district"
                placeholderId="select_district"
                options={districtOptions}
                value={form.district}
                onChange={onSelectDistrict}
                pageSize={20}
              />
            </div>

            <div className="edit__group">
              <label className="edit__label">
                <FormattedMessage id="condition" defaultMessage="Состояние" />
              </label>
              <select name="condition" value={form.condition} onChange={onChangeField} className="edit__select">
                <option value="">{intl.formatMessage({ id: "select_condition", defaultMessage: "Выберите состояние" })}</option>
                <option value="renovated">{intl.formatMessage({ id: "condition_renovated", defaultMessage: "С ремонтом" })}</option>
                <option value="no_renovation">{intl.formatMessage({ id: "condition_no_renovation", defaultMessage: "Без ремонта" })}</option>
                <option value="pso">{intl.formatMessage({ id: "condition_pso", defaultMessage: "Сдан ПСО" })}</option>
                <option value="euro_remont">{intl.formatMessage({ id: "condition_euro_remont", defaultMessage: "Евроремонт" })}</option>
              </select>
            </div>
          </div>

          <div className="edit__row">
            <div className="edit__group">
              <label className="edit__label">
                <FormattedMessage id="document" defaultMessage="Документ" />
              </label>
              <select name="document" value={form.document} onChange={onChangeField} className="edit__select">
                <option value="">{intl.formatMessage({ id: "select_document", defaultMessage: "Выберите документ" })}</option>
                <option value="general_power_of_attorney">
                  <FormattedMessage id="document_general_power_of_attorney" defaultMessage="Генеральная доверенность" />
                </option>
                <option value="gift_agreement">
                  <FormattedMessage id="document_gift_agreement" defaultMessage="Договор дарения" />
                </option>
                <option value="equity_participation_agreement">
                  <FormattedMessage id="document_equity_participation_agreement" defaultMessage="ДДУ" />
                </option>
                <option value="sale_purchase_agreement">
                  <FormattedMessage id="document_sale_purchase_agreement" defaultMessage="Купля-продажа" />
                </option>
                <option value="red_book">
                  <FormattedMessage id="document_red_book" defaultMessage="Красная книга" />
                </option>
                <option value="technical_passport">
                  <FormattedMessage id="document_technical_passport" defaultMessage="Техпаспорт" />
                </option>
              </select>
            </div>

            <div className="edit__group">
              <label className="edit__label">
                <FormattedMessage id="series" defaultMessage="Серия" />
              </label>
              <select name="series" value={form.series} onChange={onChangeField} className="edit__select">
                <option value="">{intl.formatMessage({ id: "select_series", defaultMessage: "Выберите серию" })}</option>
                <option value="104_series"><FormattedMessage id="series_104" defaultMessage="104-я серия" /></option>
                <option value="105_series"><FormattedMessage id="series_105" defaultMessage="105-я серия" /></option>
                <option value="106_series"><FormattedMessage id="series_106" defaultMessage="106-я серия" /></option>
                <option value="individual_project"><FormattedMessage id="series_individual" defaultMessage="Индивидуальный проект" /></option>
                <option value="khrushchevka"><FormattedMessage id="series_khrushchevka" defaultMessage="Хрущёвка" /></option>
                <option value="stalinka"><FormattedMessage id="series_stalinka" defaultMessage="Сталинка" /></option>
              </select>
            </div>
          </div>

          {form.property_type === "apartment" && (
            <div className="edit__row">
              <div className="edit__group">
                <label className="edit__label">
                  <FormattedMessage id="floor" defaultMessage="Этаж" />
                </label>
                <input
                  type="number"
                  name="floor"
                  value={form.floor}
                  onChange={onChangeField}
                  placeholder={intl.formatMessage({ id: "enter_floor", defaultMessage: "Введите этаж" })}
                  className="edit__input"
                />
              </div>

              <div className="edit__group">
                <label className="edit__label">
                  <FormattedMessage id="rooms" defaultMessage="Комнаты" />
                </label>
                <select name="rooms" value={form.rooms} onChange={onChangeField} className="edit__select">
                  <option value="">{intl.formatMessage({ id: "select_rooms", defaultMessage: "Выберите комнаты" })}</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4+</option>
                </select>
              </div>
            </div>
          )}

          {form.property_type === "house" && (
            <>
              <div className="edit__row">
                <div className="edit__group">
                  <label className="edit__label">
                    <FormattedMessage id="land_area" defaultMessage="Площадь участка (соток)" />
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="land_area"
                    value={form.land_area}
                    onChange={onChangeField}
                    placeholder={intl.formatMessage({ id: "enter_land_area", defaultMessage: "Введите площадь" })}
                    className="edit__input"
                  />
                </div>

                <div className="edit__group">
                  <label className="edit__label">
                    <FormattedMessage id="utilities" defaultMessage="Коммуникации" />
                  </label>
                  <select name="utilities" value={form.utilities} onChange={onChangeField} className="edit__select">
                    <option value="">{intl.formatMessage({ id: "select_utilities", defaultMessage: "Выберите коммуникации" })}</option>
                    <option value="all">{intl.formatMessage({ id: "utilities_all", defaultMessage: "Все подключены" })}</option>
                    <option value="partial">{intl.formatMessage({ id: "utilities_partial", defaultMessage: "Частично" })}</option>
                    <option value="none">{intl.formatMessage({ id: "utilities_none", defaultMessage: "Отсутствуют" })}</option>
                  </select>
                </div>
              </div>

              <div className="edit__row">
                <div className="edit__group">
                  <label className="edit__label">
                    <FormattedMessage id="rooms" defaultMessage="Комнаты" />
                  </label>
                  <select name="rooms" value={form.rooms} onChange={onChangeField} className="edit__select">
                    <option value="">{intl.formatMessage({ id: "select_rooms", defaultMessage: "Выберите комнаты" })}</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4+</option>
                  </select>
                </div>
                <div className="edit__group" />
              </div>
            </>
          )}

          {form.property_type === "commercial" && (
            <>
              <div className="edit__row">
                <div className="edit__group">
                  <label className="edit__label">
                    <FormattedMessage id="commercial_type" defaultMessage="Тип коммерции" />
                  </label>
                  <select
                    name="commercial_type"
                    value={form.commercial_type}
                    onChange={onChangeField}
                    className="edit__select"
                  >
                    <option value="">{intl.formatMessage({ id: "select_commercial_type", defaultMessage: "Выберите тип" })}</option>
                    <option value="office">{intl.formatMessage({ id: "commercial_type_office", defaultMessage: "Офис" })}</option>
                    <option value="retail">{intl.formatMessage({ id: "commercial_type_retail", defaultMessage: "Торговая площадь" })}</option>
                    <option value="warehouse">{intl.formatMessage({ id: "commercial_type_warehouse", defaultMessage: "Склад" })}</option>
                    <option value="other">{intl.formatMessage({ id: "commercial_type_other", defaultMessage: "Прочее" })}</option>
                  </select>
                </div>

                <div className="edit__group">
                  <label className="edit__label">
                    <FormattedMessage id="purpose" defaultMessage="Назначение" />
                  </label>
                  <select name="purpose" value={form.purpose} onChange={onChangeField} className="edit__select">
                    <option value="">{intl.formatMessage({ id: "select_purpose", defaultMessage: "Выберите назначение" })}</option>
                    <option value="cafe">{intl.formatMessage({ id: "purpose_cafe", defaultMessage: "Кафе/ресторан" })}</option>
                    <option value="shop">{intl.formatMessage({ id: "purpose_shop", defaultMessage: "Магазин" })}</option>
                    <option value="office">{intl.formatMessage({ id: "purpose_office", defaultMessage: "Офис" })}</option>
                  </select>
                </div>
              </div>

              <div className="edit__row">
                <div className="edit__group">
                  <label className="edit__label">
                    <FormattedMessage id="rooms" defaultMessage="Комнаты" />
                  </label>
                  <select name="rooms" value={form.rooms} onChange={onChangeField} className="edit__select">
                    <option value="">{intl.formatMessage({ id: "select_rooms", defaultMessage: "Выберите комнаты" })}</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4+</option>
                  </select>
                </div>
                <div className="edit__group" />
              </div>
            </>
          )}

          <div className="edit__group">
            <label className="edit__label">
              <FormattedMessage id="images" defaultMessage="Изображения" />
            </label>

            <div className="edit__upload">
              <label className="edit__uploadBtn">
                <FormattedMessage id="upload_images" defaultMessage="Загрузить изображения" />
                <input type="file" multiple accept="image/*" onChange={onAddImages} className="edit__file" />
              </label>

              <div className="edit__previews">
                {previews.map((src, i) => (
                  <div className="edit__preview" key={`${src}_${i}`}>
                    <img
                      src={src}
                      alt={intl.formatMessage({ id: "image_preview", defaultMessage: "Превью" })}
                      onError={(e) => {
                        console.error("image_preview_error");
                        e.currentTarget.src = "https://via.placeholder.com/120";
                      }}
                    />
                    <button
                      type="button"
                      className="edit__remove"
                      onClick={() => onRemovePreview(i)}
                      aria-label={intl.formatMessage({ id: "remove_image", defaultMessage: "Удалить изображение" })}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button type="submit" className="edit__submit" disabled={loading}>
            {loading ? (
              <FormattedMessage id="loading" defaultMessage="Загрузка..." />
            ) : (
              <FormattedMessage id="save_changes" defaultMessage="Сохранить изменения" />
            )}
          </button>
        </form>

        {notice.visible && (
          <div className={`edit__notice edit__notice--${notice.type}`} role="status" aria-live="polite">
            {notice.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditListing;
