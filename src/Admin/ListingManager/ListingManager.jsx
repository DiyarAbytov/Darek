import React, { useState, useCallback } from "react";
import HeroSection from "../../pages/HeroSection/HeroSection";
import Listings from "../../pages/Listings/Listings";
import "./ListingManager.scss";

const ListingManager = () => {
  const [searchParams, setSearchParams] = useState({});

  const handleSearch = useCallback((params) => {
    try {
      setSearchParams(params || {});
    } catch (e) {
      console.error(e?.message || "search_params_error");
      setSearchParams({});
    }
  }, []);

  return (
    <section className="lm" aria-label="Управление объявлениями">
      <div className="lm__container">
        <header className="lm__header">
          <h1 className="lm__title">Объявления</h1>
          <p className="lm__subtitle">Новый дом. Новая жизнь!</p>
        </header>

        <div className="lm__hero">
          <HeroSection onSearch={handleSearch} />
        </div>

        <div className="lm__content" id="lm-content">
          <Listings searchParams={searchParams} />
        </div>
      </div>
    </section>
  );
};

export default ListingManager;
