import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import api from "../../Api/Api";
import "./HeroSection.scss";

const ComboBox = ({ name, value, onChange, options, placeholder, disabled, ariaLabel }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef(null);
  const listRef = useRef(null);

  const normalized = useMemo(() => {
    const uniq = new Map();
    options.forEach((o) => {
      if (o && typeof o.value !== "undefined" && !uniq.has(o.value)) {
        uniq.set(o.value, { value: String(o.value), label: String(o.label ?? o.value) });
      }
    });
    const arr = Array.from(uniq.values());
    if (!query.trim()) return arr;
    const q = query.trim().toLowerCase();
    return arr.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const currentLabel = useMemo(() => {
    const found = normalized.find((o) => o.value === String(value));
    return found ? found.label : "";
  }, [normalized, value]);

  const handleSelect = useCallback(
    (opt) => {
      onChange({ target: { name, value: opt?.value || "" } });
      setQuery("");
      setActiveIndex(-1);
      setOpen(false);
    },
    [name, onChange]
  );

  useEffect(() => {
    const onDocClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    const li = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    if (li && typeof li.scrollIntoView === "function") li.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const onKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, normalized.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = normalized[activeIndex];
      if (target) handleSelect(target);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div className={`hero__combo ${disabled ? "hero__combo--disabled" : ""}`} ref={rootRef} aria-expanded={open}>
      <input
        className="hero__combo-input"
        name={name}
        value={open ? query : currentLabel}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-controls={`${name}-listbox`}
        aria-autocomplete="list"
        aria-activedescendant={activeIndex >= 0 ? `${name}-opt-${activeIndex}` : undefined}
        aria-label={ariaLabel}
        disabled={disabled}
      />
      <button
        type="button"
        className="hero__combo-toggle"
        aria-label="Toggle"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
      />
      {open && (
        <ul id={`${name}-listbox`} role="listbox" className="hero__combo-list" ref={listRef}>
          {normalized.length === 0 ? (
            <li className="hero__combo-empty" role="option" aria-disabled="true">
              <FormattedMessage id="nothing_found" defaultMessage="Ничего не найдено" />
            </li>
          ) : (
            normalized.map((opt, i) => (
              <li
                key={opt.value}
                id={`${name}-opt-${i}`}
                data-index={i}
                role="option"
                aria-selected={String(value) === opt.value}
                className={`hero__combo-option ${i === activeIndex ? "hero__combo-option--active" : ""} ${
                  String(value) === opt.value ? "hero__combo-option--selected" : ""
                }`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(opt)}
              >
                {opt.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

const HeroSection = ({ onSearch, selectedCity }) => {
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "" });
  const [locations, setLocations] = useState([]);
  const [complexes, setComplexes] = useState([]);

  const [filters, setFilters] = useState({
    property_type: "",
    city: selectedCity || "",
    district: "",
    location_id: "",
    price_min: "",
    price_max: "",
    rooms: "",
    area_min: "",
    area_max: "",
    floor_min: "",
    floor_max: "",
    land_area_min: "",
    land_area_max: "",
    commercial_type: "",
    condition: "",
    purpose: "",
    document: "",
    series: "",
    deal_type: "",
    complex: "",
  });

  const showToast = (messageId, type) => {
    setToast({ message: intl.formatMessage({ id: messageId, defaultMessage: "Ошибка" }), type });
    window.setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [locRes, compRes] = await Promise.all([
          api.get("/listings/locations/list/"),
          api.get("/listings/single-field/"),
        ]);
        setLocations(Array.isArray(locRes.data) ? locRes.data : []);
        setComplexes(Array.isArray(compRes.data) ? compRes.data : []);
        if (!Array.isArray(locRes.data)) showToast("error_fetch_locations", "error");
        if (!Array.isArray(compRes.data)) showToast("error_fetch_complexes", "error");
      } catch (e) {
        console.error(e?.message || "Load error");
        showToast("error_loading", "error");
        setLocations([]);
        setComplexes([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (selectedCity && selectedCity !== filters.city) {
      setFilters((p) => ({ ...p, city: selectedCity, district: "", location_id: "" }));
    }
  }, [selectedCity, filters.city]);

  const numbersValid = useCallback((obj) => {
    const keys = [
      "price_min",
      "price_max",
      "area_min",
      "area_max",
      "floor_min",
      "floor_max",
      "land_area_min",
      "land_area_max",
    ];
    for (const k of keys) {
      const v = obj[k];
      if (v === "") continue;
      const n = Number(v);
      if (Number.isNaN(n) || n < 0) return false;
    }
    return true;
  }, []);

  const handleFilterChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFilters((prev) => {
        const next = { ...prev, [name]: value };
        if (name === "city") {
          next.district = "";
          next.location_id = "";
        }
        if (name === "district") {
          const found = locations.find((l) => l.city === next.city && l.district === value);
          next.location_id = found?.id || "";
        }
        if (name === "deal_type") {
          next.complex = "";
        }
        return next;
      });
    },
    [locations]
  );

  const handleTabClick = useCallback((type) => {
    setFilters((prev) => ({
      ...prev,
      property_type: type,
      commercial_type: "",
      purpose: "",
      floor_min: "",
      floor_max: "",
      land_area_min: "",
      land_area_max: "",
      rooms: "",
      deal_type: "",
      complex: "",
      condition: "",
      document: "",
      series: "",
    }));
  }, []);

  const handleClear = useCallback(() => {
    setFilters({
      property_type: "",
      city: "",
      district: "",
      location_id: "",
      price_min: "",
      price_max: "",
      rooms: "",
      area_min: "",
      area_max: "",
      floor_min: "",
      floor_max: "",
      land_area_min: "",
      land_area_max: "",
      commercial_type: "",
      condition: "",
      purpose: "",
      document: "",
      series: "",
      deal_type: "",
      complex: "",
    });
    onSearch({});
  }, [onSearch]);

  const selectOptions = useMemo(
    () => ({
      series: [
        { value: "104_series", label: intl.formatMessage({ id: "series_104", defaultMessage: "104 серия" }) },
        { value: "105_series", label: intl.formatMessage({ id: "series_105", defaultMessage: "105 серия" }) },
        { value: "106_series", label: intl.formatMessage({ id: "series_106", defaultMessage: "106 серия" }) },
        { value: "individual_project", label: intl.formatMessage({ id: "series_individual", defaultMessage: "Индивидуальный проект" }) },
        { value: "khrushchevka", label: intl.formatMessage({ id: "series_khrushchevka", defaultMessage: "Хрущевка" }) },
        { value: "stalinka", label: intl.formatMessage({ id: "series_stalinka", defaultMessage: "Сталинка" }) },
      ],
      condition: [
        { value: "renovated", label: intl.formatMessage({ id: "condition_renovated", defaultMessage: "С ремонтом" }) },
        { value: "no_renovation", label: intl.formatMessage({ id: "condition_no_renovation", defaultMessage: "Без ремонта" }) },
        { value: "pso", label: intl.formatMessage({ id: "condition_pso", defaultMessage: "ПСО" }) },
        { value: "euro_remont", label: intl.formatMessage({ id: "condition_euro_remont", defaultMessage: "Евроремонт" }) },
        { value: "delivery_date", label: intl.formatMessage({ id: "condition_delivery_date", defaultMessage: "Срок сдачи" }) },
      ],
      document: [
        { value: "general_power_of_attorney", label: intl.formatMessage({ id: "document_general_power_of_attorney", defaultMessage: "Генеральная доверенность" }) },
        { value: "gift_agreement", label: intl.formatMessage({ id: "document_gift_agreement", defaultMessage: "Договор дарения" }) },
        { value: "equity_participation_agreement", label: intl.formatMessage({ id: "document_equity_participation_agreement", defaultMessage: "ДДУ" }) },
        { value: "sale_purchase_agreement", label: intl.formatMessage({ id: "document_sale_purchase_agreement", defaultMessage: "Купля-продажа" }) },
        { value: "red_book", label: intl.formatMessage({ id: "document_red_book", defaultMessage: "Красная книга" }) },
        { value: "technical_passport", label: intl.formatMessage({ id: "document_technical_passport", defaultMessage: "Техпаспорт" }) },
      ],
      commercial_type: [
        { value: "office", label: intl.formatMessage({ id: "commercial_type_office", defaultMessage: "Офис" }) },
        { value: "retail", label: intl.formatMessage({ id: "commercial_type_retail", defaultMessage: "Торговая площадь" }) },
        { value: "warehouse", label: intl.formatMessage({ id: "commercial_type_warehouse", defaultMessage: "Склад" }) },
        { value: "other", label: intl.formatMessage({ id: "commercial_type_other", defaultMessage: "Другое" }) },
      ],
      purpose: [
        { value: "cafe", label: intl.formatMessage({ id: "purpose_cafe", defaultMessage: "Кафе/ресторан" }) },
        { value: "shop", label: intl.formatMessage({ id: "purpose_shop", defaultMessage: "Магазин" }) },
        { value: "office", label: intl.formatMessage({ id: "purpose_office", defaultMessage: "Офис" }) },
      ],
      deal_type: [
        { value: "secondary", label: intl.formatMessage({ id: "deal_type_default", defaultMessage: "Вторичка" }) },
        { value: "new_building", label: intl.formatMessage({ id: "deal_type_new_building", defaultMessage: "Новостройка" }) },
      ],
      rooms: [
        { value: "1", label: "1" },
        { value: "2", label: "2" },
        { value: "3", label: "3" },
        { value: "4", label: "4+" },
      ],
    }),
    [intl]
  );

  const cities = useMemo(() => {
    const set = new Set(locations.map((l) => l.city).filter(Boolean));
    return Array.from(set).map((c) => ({ value: c, label: c }));
  }, [locations]);

  const districts = useMemo(() => {
    const set = new Set(
      locations
        .filter((l) => !filters.city || l.city === filters.city)
        .map((l) => l.district)
        .filter(Boolean)
    );
    return Array.from(set).map((d) => ({ value: d, label: d }));
  }, [locations, filters.city]);

  const complexesOptions = useMemo(() => {
    const map = new Map();
    complexes.forEach((c) => {
      if (c?.id && !map.has(c.id)) map.set(c.id, { value: c.id, label: c.value || String(c.id) });
    });
    return Array.from(map.values());
  }, [complexes]);

  const renderSelect = (name, options, labelId) => (
    <select
      name={name}
      value={filters[name]}
      onChange={handleFilterChange}
      className="hero__filter"
      aria-label={intl.formatMessage({ id: labelId, defaultMessage: labelId })}
      disabled={isLoading || !filters.property_type}
    >
      <option value="">{intl.formatMessage({ id: labelId, defaultMessage: labelId })}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );

  const renderInput = (name, labelId) => (
    <input
      type="number"
      name={name}
      value={filters[name]}
      onChange={(e) => {
        const v = e.target.value;
        if (v === "" || (/^\d+(\.\d+)?$/.test(v) && Number(v) >= 0)) {
          handleFilterChange(e);
        } else {
          showToast("invalid_number", "error");
        }
      }}
      placeholder={intl.formatMessage({ id: labelId, defaultMessage: labelId })}
      className="hero__filter"
      aria-label={intl.formatMessage({ id: labelId, defaultMessage: labelId })}
      disabled={isLoading}
      inputMode="decimal"
    />
  );

  const renderSpecific = () => {
    switch (filters.property_type) {
      case "apartment":
        return (
          <div className="hero__specific">
            <div className="hero__group">
              <span className="hero__label">
                <FormattedMessage id="apartment_params" defaultMessage="Параметры квартиры" />
              </span>
              {renderSelect("rooms", selectOptions.rooms, "rooms")}
              {renderInput("floor_min", "floor_min")}
              {renderInput("floor_max", "floor_max")}
            </div>
          </div>
        );
      case "house":
        return (
          <div className="hero__specific">
            <div className="hero__group">
              <span className="hero__label">
                <FormattedMessage id="house_params" defaultMessage="Параметры дома" />
              </span>
              {renderInput("land_area_min", "land_area_min")}
              {renderInput("land_area_max", "land_area_max")}
              {renderSelect("rooms", selectOptions.rooms, "rooms")}
            </div>
          </div>
        );
      case "commercial":
        return (
          <div className="hero__specific">
            <div className="hero__group">
              <span className="hero__label">
                <FormattedMessage id="commercial_params" defaultMessage="Параметры коммерческой" />
              </span>
              {renderSelect("commercial_type", selectOptions.commercial_type, "commercial_type")}
              {renderSelect("purpose", selectOptions.purpose, "purpose")}
              {renderSelect("rooms", selectOptions.rooms, "rooms")}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!numbersValid(filters)) {
        showToast("invalid_number", "error");
        return;
      }
      const raw = Object.fromEntries(
        Object.entries(filters).filter(([key, value]) => {
          if (["condition", "document", "series"].includes(key) && !filters.property_type) return false;
          return value !== "";
        })
      );
      const qs = new URLSearchParams();
      if (raw.location_id) qs.append("location", String(raw.location_id));
      else if (raw.city) qs.append("city", raw.city);
      ["city", "district", "location_id"].forEach((k) => delete raw[k]);
      if (raw.complex) {
        qs.append("single_field", String(raw.complex));
        delete raw.complex;
      }
      const ranges = {
        price_min: "price__gte",
        price_max: "price__lte",
        area_min: "area__gte",
        area_max: "area__lte",
        floor_min: "floor__gte",
        floor_max: "floor__lte",
        land_area_min: "land_area__gte",
        land_area_max: "land_area__lte",
      };
      Object.entries(raw).forEach(([k, v]) => {
        if (ranges[k]) qs.append(ranges[k], v);
        else qs.append(k, v);
      });
      const searchParamsObject = {};
      qs.forEach((v, k) => (searchParamsObject[k] = v));
      onSearch(searchParamsObject);
      const el = document.getElementById("listings");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    },
    [filters, numbersValid, onSearch]
  );

  const showFilters = filters.property_type !== "";

  return (
    <section id="hero" className="hero">
      <div className="hero__container">
        {isLoading && (
          <div className="hero__loading">
            <FormattedMessage id="loading" defaultMessage="Загрузка..." />
          </div>
        )}
        {toast.message && <div className={`hero__toast hero__toast--${toast.type}`}>{toast.message}</div>}

        <form className="hero__form" onSubmit={handleSubmit}>
          <div className="hero__tabs" role="tablist" aria-label="Property type">
            {[
              { key: "apartment", icon: "M4 4h16v16H4zM4 10h16M10 4v16M14 4v16", id: "apartment", label: "Квартира" },
              { key: "house", icon: "M12 2L2 10v12h20V10L12 2z", id: "house", label: "Дом или участок" },
              { key: "commercial", icon: "M3 6h18v14H3zM6 10h12M6 14h12M6 18h12", id: "commercial", label: "Коммерческая" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                className={`hero__tab ${filters.property_type === t.key ? "hero__tab--active" : ""}`}
                onClick={() => handleTabClick(t.key)}
                aria-selected={filters.property_type === t.key}
              >
                <svg className="hero__tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d={t.icon} />
                </svg>
                <FormattedMessage id={`tab_${t.id}`} defaultMessage={t.label} />
              </button>
            ))}
          </div>

          {showFilters && (
            <div className="hero__filters">
              {(filters.property_type !== "house" || filters.deal_type === "new_building") && (
                <div className="hero__group">
                  <span className="hero__label">
                    <FormattedMessage id="type_and_complex_label" defaultMessage="Тип и комплекс" />
                  </span>
                  {filters.property_type !== "house" &&
                    renderSelect("deal_type", selectOptions.deal_type, "deal_type")}
                  {filters.deal_type === "new_building" && (
                    <ComboBox
                      name="complex"
                      value={filters.complex}
                      onChange={handleFilterChange}
                      options={complexesOptions}
                      placeholder={intl.formatMessage({ id: "complex", defaultMessage: "Комплекс" })}
                      ariaLabel={intl.formatMessage({ id: "complex", defaultMessage: "Комплекс" })}
                      disabled={isLoading || complexesOptions.length === 0}
                    />
                  )}
                </div>
              )}

              <div className="hero__group">
                <span className="hero__label">
                  <FormattedMessage id="location_label" defaultMessage="Местоположение" />
                </span>
                <ComboBox
                  name="city"
                  value={filters.city}
                  onChange={handleFilterChange}
                  options={cities}
                  placeholder={intl.formatMessage({ id: "city", defaultMessage: "Город" })}
                  ariaLabel={intl.formatMessage({ id: "city", defaultMessage: "Город" })}
                  disabled={isLoading || cities.length === 0}
                />
                <ComboBox
                  name="district"
                  value={filters.district}
                  onChange={handleFilterChange}
                  options={districts}
                  placeholder={intl.formatMessage({ id: "district", defaultMessage: "Район" })}
                  ariaLabel={intl.formatMessage({ id: "district", defaultMessage: "Район" })}
                  disabled={isLoading || !filters.city || districts.length === 0}
                />
              </div>

              <div className="hero__group">
                <span className="hero__label">
                  <FormattedMessage id="price_and_area_label" defaultMessage="Цена и площадь" />
                </span>
                {renderInput("price_min", "price_min")}
                {renderInput("price_max", "price_max")}
                {renderInput("area_min", "area_min")}
                {renderInput("area_max", "area_max")}
              </div>

              <div className="hero__group">
                <span className="hero__label">
                  <FormattedMessage id="condition_label" defaultMessage="Состояние и документы" />
                </span>
                {renderSelect("condition", selectOptions.condition, "condition")}
                {renderSelect("document", selectOptions.document, "document")}
                {renderSelect("series", selectOptions.series, "series")}
              </div>

              {renderSpecific()}

              <div className="hero__buttons">
                <button type="submit" className="hero__btn hero__btn--primary" disabled={isLoading}>
                  <FormattedMessage id="search_button" defaultMessage="Поиск" />
                </button>
                <button type="button" className="hero__btn hero__btn--ghost" onClick={handleClear} disabled={isLoading}>
                  <FormattedMessage id="clear_button" defaultMessage="Очистить" />
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </section>
  );
};

export default HeroSection;
