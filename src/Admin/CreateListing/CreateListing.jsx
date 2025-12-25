import React, { useState, useEffect } from "react";
import api from "../../Api/Api";
import "./CreateListing.scss";

const CreateListing = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    price2: "",
    rooms: "",
    area: "",
    city: "",
    district: "",
    address: "",
    deal_type: "",
    property_type: "",
    floor: "",
    land_area: "",
    commercial_type: "",
    condition: "",
    utilities: "",
    purpose: "",
    location_id: "",
    document: "",
    complex: "",          // хранит id комплекса
    series: "",
    string_fields1: "",
    string_fields2: ""
  });

  const [images, setImages] = useState([]);      // File[]
  const [previews, setPreviews] = useState([]);  // string[]

  const [locations, setLocations] = useState([]);
  const [complexes, setComplexes] = useState([]);
  const [role, setRole] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const safeNumber = (v) => {
    if (v === null || v === undefined || String(v).trim() === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  // --- загрузка справочников ---
  useEffect(() => {
    const load = async () => {
      try {
        const [locRes, cxRes, meRes] = await Promise.all([
          api.get("/listings/locations/list/"),
          api.get("/listings/single-field/"),
          api.get("/users/me/")
        ]);
        setLocations(Array.isArray(locRes.data) ? locRes.data : []);
        setComplexes(Array.isArray(cxRes.data) ? cxRes.data : []);
        setRole(meRes?.data?.role || "");
      } catch (e) {
        console.error(e?.message || "Load error");
        setError("Ошибка загрузки данных");
      }
    };
    load();
  }, []);

  // --- изменения формы ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "city") {
        next.district = "";
        next.location_id = "";
      }
      if (name === "district") {
        const found = locations.find((l) => l.city === next.city && l.district === value);
        next.location_id = found ? String(found.id) : "";
      }
      if (name === "deal_type" || name === "property_type") {
        // при смене типа / категории сбрасываем выбранный комплекс
        next.complex = "";
      }
      if (name === "condition" && value !== "delivery_date") {
        next.string_fields2 = "";
      }
      if (name === "property_type" && value === "house") {
        next.deal_type = "";
      }
      return next;
    });
  };

  // --- файлы ---
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  };

  const removeImage = (idx) => {
    setImages((arr) => arr.filter((_, i) => i !== idx));
    setPreviews((arr) => {
      const url = arr[idx];
      if (url) URL.revokeObjectURL(url);
      return arr.filter((_, i) => i !== idx);
    });
  };

  useEffect(() => {
    return () => {
      previews.forEach((u) => { try { URL.revokeObjectURL(u); } catch {} });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- отправка ---
  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const fd = new FormData();
    const appendIf = (k, v) => {
      if (v !== undefined && v !== null && String(v).trim() !== "") fd.append(k, v);
    };

    appendIf("title", form.title);
    appendIf("description", form.description);

    const p1 = safeNumber(form.price);
    if (p1 !== null) fd.append("price", String(p1));

    if (["admin", "realtor"].includes(role)) {
      const p2 = safeNumber(form.price2);
      if (p2 !== null) fd.append("price2", String(p2));
    }

    const area = safeNumber(form.area);
    if (area !== null) fd.append("area", String(area));

    appendIf("address", form.address);
    appendIf("deal_type", form.deal_type);
    appendIf("property_type", form.property_type);
    appendIf("location_id", form.location_id);
    appendIf("rooms", form.rooms);

    if (form.property_type === "apartment") {
      const floor = safeNumber(form.floor);
      if (floor !== null) fd.append("floor", String(floor));
    }

    appendIf("string_fields1", form.string_fields1);
    appendIf("string_fields2", form.string_fields2);

    if (form.property_type === "house") {
      const land = safeNumber(form.land_area);
      if (land !== null) fd.append("land_area", String(land));
      appendIf("utilities", form.utilities);
    }

    if (form.property_type === "commercial") {
      appendIf("commercial_type", form.commercial_type);
      appendIf("purpose", form.purpose);
    }

    appendIf("condition", form.condition);
    appendIf("document", form.document);

    // ВАЖНО: single_field должен быть PK (id), а не строковое value
    if (form.deal_type === "new_building" && String(form.complex).trim() !== "") {
      fd.append("single_field", String(form.complex)); // отправляем id комплекса
    }

    appendIf("series", form.series);

    // не делаем поля обязательными; is_active можно передать по умолчанию
    fd.append("is_active", "true");

    // файлы необязательны
    images.forEach((file) => {
      fd.append("media_files", file, file.name);
    });

    try {
      const res = await api.post("/listings/listings/", fd);
      if (res?.status === 200 || res?.status === 201) {
        setSuccess("Объявление создано");

        // сброс формы и превью
        setForm({
          title: "",
          description: "",
          price: "",
          price2: "",
          rooms: "",
          area: "",
          city: "",
          district: "",
          address: "",
          deal_type: "",
          property_type: "",
          floor: "",
          land_area: "",
          commercial_type: "",
          condition: "",
          utilities: "",
          purpose: "",
          location_id: "",
          document: "",
          complex: "",
          series: "",
          string_fields1: "",
          string_fields2: ""
        });
        previews.forEach((u) => { try { URL.revokeObjectURL(u); } catch {} });
        setImages([]);
        setPreviews([]);
      } else {
        setError(`Ошибка сохранения: ${res?.status || "неизвестно"}`);
      }
    } catch (e2) {
      console.error(e2?.message || "Create error");
      // собираем читаемое сообщение с бэка
      let msg = "";
      const data = e2?.response?.data;
      if (data) {
        if (typeof data === "string") {
          msg = data;
        } else if (typeof data === "object") {
          const parts = [];
          Object.entries(data).forEach(([k, v]) => {
            if (Array.isArray(v)) parts.push(`${k}: ${v.join(" ")}`);
            else if (v && typeof v === "object") parts.push(`${k}: ${Object.values(v).flat().join(" ")}`);
            else if (v) parts.push(`${k}: ${String(v)}`);
          });
          msg = parts.join(" • ");
        }
      }
      setError(msg || "Ошибка создания объявления");
    }
  };

  return (
    <div className="create-listing">
      <h2 className="create-listing__title">Создать объявление</h2>
      <form onSubmit={onSubmit} className="create-listing__form">
        <div className="create-listing__grid">
          <div className="create-listing__group">
            <label className="create-listing__label">Тип недвижимости</label>
            <select
              name="property_type"
              value={form.property_type}
              onChange={handleChange}
              className="create-listing__select"
            >
              <option value="">Выберите тип</option>
              <option value="apartment">Квартира</option>
              <option value="house">Дом/Участок</option>
              <option value="commercial">Коммерческая</option>
            </select>
          </div>
          {form.property_type !== "house" && (
            <div className="create-listing__group">
              <label className="create-listing__label">Тип категории</label>
              <select
                name="deal_type"
                value={form.deal_type}
                onChange={handleChange}
                className="create-listing__select"
              >
                <option value="">Выберите категорию</option>
                <option value="secondary">Вторичная</option>
                <option value="new_building">Новостройки</option>
              </select>
            </div>
          )}
        </div>

        {form.deal_type === "new_building" && (
          <div className="create-listing__group">
            <label className="create-listing__label">Комплекс</label>
            <select
              name="complex"
              value={form.complex}
              onChange={handleChange}
              className="create-listing__select"
            >
              <option value="">Выберите комплекс</option>
              {complexes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.value}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="create-listing__group">
          <label className="create-listing__label">Заголовок</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Введите заголовок"
            className="create-listing__input"
          />
        </div>

        <div className="create-listing__group">
          <label className="create-listing__label">Описание</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Введите описание"
            className="create-listing__textarea"
          />
        </div>

        <div className="create-listing__grid">
          <div className="create-listing__group">
            <label className="create-listing__label">Цена ($)</label>
            <input
              type="number"
              step="0.01"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="Введите цену"
              className="create-listing__input"
            />
          </div>
          {["admin", "realtor"].includes(role) && (
            <div className="create-listing__group">
              <label className="create-listing__label">Вторая цена ($)</label>
              <input
                type="number"
                step="0.01"
                name="price2"
                value={form.price2}
                onChange={handleChange}
                placeholder="Введите вторую цену"
                className="create-listing__input"
              />
            </div>
          )}
          <div className="create-listing__group">
            <label className="create-listing__label">Площадь (кв.м.)</label>
            <input
              type="number"
              step="0.01"
              name="area"
              value={form.area}
              onChange={handleChange}
              placeholder="Введите площадь"
              className="create-listing__input"
            />
          </div>
        </div>

        <div className="create-listing__grid">
          <div className="create-listing__group">
            <label className="create-listing__label">Город</label>
            <select
              name="city"
              value={form.city}
              onChange={handleChange}
              className="create-listing__select"
            >
              <option value="">Выберите город</option>
              {[...new Set(locations.map((l) => l.city))].map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          <div className="create-listing__group">
            <label className="create-listing__label">Район</label>
            <select
              name="district"
              value={form.district}
              onChange={handleChange}
              className="create-listing__select"
            >
              <option value="">Выберите район</option>
              {locations
                .filter((l) => !form.city || l.city === form.city)
                .map((l) => (
                  <option key={l.id} value={l.district}>
                    {l.district}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="create-listing__group">
          <label className="create-listing__label">Адрес</label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Введите адрес"
            className="create-listing__input"
          />
        </div>

        <div className="create-listing__grid">
          <div className="create-listing__group">
            <label className="create-listing__label">Состояние</label>
            <select
              name="condition"
              value={form.condition}
              onChange={handleChange}
              className="create-listing__select"
            >
              <option value="">Выберите состояние</option>
              <option value="renovated">С ремонтом</option>
              <option value="no_renovation">Без ремонта</option>
              <option value="pso">Сдан ПСО</option>
              <option value="euro_remont">Евроремонт</option>
              <option value="delivery_date">Срок сдачи</option>
            </select>
          </div>
          <div className="create-listing__group">
            <label className="create-listing__label">Документ</label>
            <select
              name="document"
              value={form.document}
              onChange={handleChange}
              className="create-listing__select"
            >
              <option value="">Выберите документ</option>
              <option value="general_power_of_attorney">Генеральная доверенность</option>
              <option value="gift_agreement">Договор дарения</option>
              <option value="equity_participation_agreement">Договор долевого участия</option>
              <option value="sale_purchase_agreement">Договор купли-продажи</option>
              <option value="red_book">Красная книга</option>
              <option value="technical_passport">Техпаспорт</option>
            </select>
          </div>
          <div className="create-listing__group">
            <label className="create-listing__label">Серия</label>
            <select
              name="series"
              value={form.series}
              onChange={handleChange}
              className="create-listing__select"
            >
              <option value="">Выберите серию</option>
              <option value="104_series">104-я серия</option>
              <option value="105_series">105-я серия</option>
              <option value="106_series">106-я серия</option>
              <option value="individual_project">Индивидуальный проект</option>
              <option value="khrushchevka">Хрущевка</option>
              <option value="stalinka">Сталинка</option>
            </select>
          </div>
        </div>

        {form.property_type === "apartment" && (
          <div className="create-listing__grid">
            <div className="create-listing__group">
              <label className="create-listing__label">Этаж</label>
              <input
                type="number"
                name="floor"
                value={form.floor}
                onChange={handleChange}
                placeholder="Введите этаж"
                className="create-listing__input"
              />
            </div>
            <div className="create-listing__group">
              <label className="create-listing__label">Общее количество этажей</label>
              <input
                type="number"
                name="string_fields1"
                value={form.string_fields1}
                onChange={handleChange}
                placeholder="Введите количество"
                className="create-listing__input"
              />
            </div>
            <div className="create-listing__group">
              <label className="create-listing__label">Комнаты</label>
              <select
                name="rooms"
                value={form.rooms}
                onChange={handleChange}
                className="create-listing__select"
              >
                <option value="">Выберите комнаты</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4+</option>
              </select>
            </div>
            {form.condition === "delivery_date" && (
              <div className="create-listing__group">
                <label className="create-listing__label">Срок сдачи</label>
                <input
                  type="text"
                  name="string_fields2"
                  value={form.string_fields2}
                  onChange={handleChange}
                  placeholder="Введите срок сдачи"
                  className="create-listing__input"
                />
              </div>
            )}
          </div>
        )}

        {form.property_type === "house" && (
          <div className="create-listing__grid">
            <div className="create-listing__group">
              <label className="create-listing__label">Площадь участка (сотки)</label>
              <input
                type="number"
                step="0.01"
                name="land_area"
                value={form.land_area}
                onChange={handleChange}
                placeholder="Введите площадь"
                className="create-listing__input"
              />
            </div>
            <div className="create-listing__group">
              <label className="create-listing__label">Коммуникации</label>
              <input
                type="text"
                name="utilities"
                value={form.utilities}
                onChange={handleChange}
                placeholder="Введите коммуникации"
                className="create-listing__input"
              />
            </div>
            <div className="create-listing__group">
              <label className="create-listing__label">Комнаты</label>
              <select
                name="rooms"
                value={form.rooms}
                onChange={handleChange}
                className="create-listing__select"
              >
                <option value="">Выберите комнаты</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4+</option>
              </select>
            </div>
            {form.condition === "delivery_date" && (
              <div className="create-listing__group">
                <label className="create-listing__label">Срок сдачи</label>
                <input
                  type="text"
                  name="string_fields2"
                  value={form.string_fields2}
                  onChange={handleChange}
                  placeholder="Введите срок сдачи"
                  className="create-listing__input"
                />
              </div>
            )}
          </div>
        )}

        {form.property_type === "commercial" && (
          <div className="create-listing__grid">
            <div className="create-listing__group">
              <label className="create-listing__label">Тип коммерции</label>
              <select
                name="commercial_type"
                value={form.commercial_type}
                onChange={handleChange}
                className="create-listing__select"
              >
                <option value="">Выберите тип</option>
                <option value="office">Офис</option>
                <option value="retail">Торговая площадь</option>
                <option value="warehouse">Склад</option>
                <option value="other">Прочее</option>
              </select>
            </div>
            <div className="create-listing__group">
              <label className="create-listing__label">Назначение</label>
              <select
                name="purpose"
                value={form.purpose}
                onChange={handleChange}
                className="create-listing__select"
              >
                <option value="">Выберите назначение</option>
                <option value="cafe">Кафе/ресторан</option>
                <option value="shop">Магазин</option>
                <option value="office">Офис</option>
              </select>
            </div>
            <div className="create-listing__group">
              <label className="create-listing__label">Комнаты</label>
              <select
                name="rooms"
                value={form.rooms}
                onChange={handleChange}
                className="create-listing__select"
              >
                <option value="">Выберите комнаты</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4+</option>
              </select>
            </div>
            {form.condition === "delivery_date" && (
              <div className="create-listing__group">
                <label className="create-listing__label">Срок сдачи</label>
                <input
                  type="text"
                  name="string_fields2"
                  value={form.string_fields2}
                  onChange={handleChange}
                  placeholder="Введите срок сдачи"
                  className="create-listing__input"
                />
              </div>
            )}
          </div>
        )}

        <div className="create-listing__group">
          <label className="create-listing__label">Изображения</label>
          <div className="create-listing__image-upload">
            <label className="create-listing__image-label">
              Загрузить изображения
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="create-listing__image-input"
              />
            </label>
            <div className="create-listing__image-previews">
              {previews.map((src, i) => (
                <div key={i} className="create-listing__image-preview">
                  <img src={src} alt={`Превью ${i + 1}`} />
                  <button type="button" onClick={() => removeImage(i)} className="create-listing__image-remove">
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="create-listing__error">{error}</p>}
        {success && <p className="create-listing__success">{success}</p>}

        <button type="submit" className="create-listing__button">Создать объявление</button>
      </form>
    </div>
  );
};

export default CreateListing;
