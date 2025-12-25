import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { FaHome, FaInfoCircle, FaHeart, FaPhone, FaSignInAlt } from "react-icons/fa";
import "./Header.scss";
import logo from "../../img/logo.JPG";

const messages = {
  ru: {
    home: "Главная",
    about: "О нас",
    favorites: "Избранное",
    contacts: "Контакты",
    login: "Логин",
    settings: "Настройки",
    language: "Язык",
    city: "Город",
    save: "Сохранить",
    selectLanguage: "Выбрать язык",
    selectCity: "Выбрать город",
    logoAlt: "Darek Logo",
    languageRussian: "Русский",
    languageKyrgyz: "Кыргызский",
    cityBishkek: "Бишкек",
    cityOsh: "Ош",
    cityPlaceholder: "Город",
    settingsButton: "{language} / {city}",
    closeSettings: "Закрыть настройки",
  },
  ky: {
    home: "Башкы бет",
    about: "Биз жөнүндө",
    favorites: "Тандалмалар",
    contacts: "Байланыштар",
    login: "Кирүү",
    settings: "Жөндөөлөр",
    language: "Тил",
    city: "Шаар",
    save: "Сактоо",
    selectLanguage: "Тил тандаңыз",
    selectCity: "Шаар тандаңыз",
    logoAlt: "Darek Logo",
    languageRussian: "Орусча",
    languageKyrgyz: "Кыргызча",
    cityBishkek: "Бишкек",
    cityOsh: "Ош",
    cityPlaceholder: "Шаар",
    settingsButton: "{language} / {city}",
    closeSettings: "Жөндөөлөрдү жабуу",
  },
};

const Header = ({ onCityChange, onLanguageChange, language = "ru", city = "" }) => {
  const [tempCity, setTempCity] = useState(city);
  const [tempLanguage, setTempLanguage] = useState(language);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const t = (key, values = {}) => {
    let text = messages[language][key] || messages.ru[key] || "";
    Object.keys(values).forEach((k) => (text = text.replace(`{${k}}`, values[k])));
    return text;
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen((v) => !v);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const toggleSettings = () => setIsSettingsOpen((v) => !v);

  const handleLanguageChange = (e) => setTempLanguage(e.target.value);
  const handleCityChange = (e) => setTempCity(e.target.value);

  const handleSave = () => {
    onLanguageChange(tempLanguage);
    onCityChange(tempCity);
    setIsSettingsOpen(false);
  };

  const handleCloseSettings = () => {
    setTempLanguage(language);
    setTempCity(city);
    setIsSettingsOpen(false);
  };

  const handleScroll = (sectionId) => {
    if (location.pathname !== "/") {
      navigate(`/#${sectionId}`);
    } else {
      const el = document.getElementById(sectionId);
      if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
    }
    closeMobileMenu();
  };

  // единая функция активного класса (чтобы не светились сразу несколько)
  const linkClass = (section) => {
    const { pathname, hash } = location;
    const active =
      (section === "home" && pathname === "/" && (!hash || hash === "#home")) ||
      (section === "about" && pathname === "/" && hash === "#about") ||
      (section === "contacts" && pathname === "/" && hash === "#contacts") ||
      (section === "favorites" && pathname === "/favorites") ||
      (section === "login" && pathname === "/login");
    return `header__nav-link ${active ? "header__nav-link--active" : ""}`;
  };

  return (
    <header className="header">
      <div className="header__container">
        <NavLink to="/" className="header__logo" aria-label="Darek">
          <img src={logo} alt={t("logoAlt")} className="header__logo-img" />
          <span className="header__logo-text"></span>
        </NavLink>

        <nav className="header__nav">
          <NavLink to="/" className={() => linkClass("home")} onClick={() => handleScroll("home")}>
            <FaHome className="header__nav-icon" />
            {t("home")}
          </NavLink>

          {/* якорные секции — считаем активность сами по hash */}
          <a href="/#about" className={linkClass("about")} onClick={(e) => { e.preventDefault(); handleScroll("about"); }}>
            <FaInfoCircle className="header__nav-icon" />
            {t("about")}
          </a>

          <NavLink to="/favorites" className={() => linkClass("favorites")}>
            <FaHeart className="header__nav-icon" />
            {t("favorites")}
          </NavLink>

          <a
            href="/#contacts"
            className={linkClass("contacts")}
            onClick={(e) => { e.preventDefault(); handleScroll("contacts"); }}
          >
            <FaPhone className="header__nav-icon" />
            {t("contacts")}
          </a>
        </nav>

        <div className="header__actions">
          <button className="header__settings-button" onClick={toggleSettings} aria-label={t("settings")}>
            {t("settingsButton", {
              language: t(`language${language === "ru" ? "Russian" : "Kyrgyz"}`),
              city: city || t("cityPlaceholder"),
            })}
          </button>

          <NavLink to="/login" className={() => linkClass("login")}>
            <FaSignInAlt className="header__nav-icon" />
            {t("login")}
          </NavLink>
        </div>

        <button className={`header__burger ${isMobileMenuOpen ? "open" : ""}`} onClick={toggleMobileMenu} aria-label="Меню">
          <span></span><span></span><span></span>
        </button>
      </div>

      {isMobileMenuOpen && (
        <>
          <div className={`header__mobile-overlay ${isMobileMenuOpen ? "open" : ""}`} onClick={closeMobileMenu} />
          <aside className={`header__mobile ${isMobileMenuOpen ? "open" : ""}`}>
            <nav className="header__mobile-nav">
              <NavLink to="/" className={() => linkClass("home")} onClick={() => handleScroll("home")}>
                <FaHome className="header__nav-icon" />
                {t("home")}
              </NavLink>
              <a href="/#about" className={linkClass("about")} onClick={(e) => { e.preventDefault(); handleScroll("about"); }}>
                <FaInfoCircle className="header__nav-icon" />
                {t("about")}
              </a>
              <NavLink to="/favorites" className={() => linkClass("favorites")} onClick={closeMobileMenu}>
                <FaHeart className="header__nav-icon" />
                {t("favorites")}
              </NavLink>
              <a href="/#contacts" className={linkClass("contacts")} onClick={(e) => { e.preventDefault(); handleScroll("contacts"); }}>
                <FaPhone className="header__nav-icon" />
                {t("contacts")}
              </a>
              <NavLink to="/login" className={() => linkClass("login")} onClick={closeMobileMenu}>
                <FaSignInAlt className="header__nav-icon" />
                {t("login")}
              </NavLink>

              <button className="header__mobile-settings" onClick={toggleSettings} aria-label={t("settings")}>
                {t("settingsButton", {
                  language: t(`language${language === "ru" ? "Russian" : "Kyrgyz"}`),
                  city: city || t("cityPlaceholder"),
                })}
              </button>
            </nav>
          </aside>
        </>
      )}

      {isSettingsOpen && (
        <div className="header__settings">
          <div className="header__settings-content" role="dialog" aria-modal="true">
            <button className="header__settings-close" onClick={handleCloseSettings} aria-label={t("closeSettings")} />
            <h3 className="header__settings-title">{t("settings")}</h3>

            <div className="header__settings-group">
              <label htmlFor="language">{t("language")}</label>
              <select id="language" value={tempLanguage} onChange={handleLanguageChange} className="header__select" aria-label={t("selectLanguage")}>
                <option value="ru">{t("languageRussian")}</option>
                <option value="ky">{t("languageKyrgyz")}</option>
              </select>
            </div>

            <div className="header__settings-group">
              <label htmlFor="city">{t("city")}</label>
              <select id="city" value={tempCity} onChange={handleCityChange} className="header__select" aria-label={t("selectCity")}>
                <option value="">{t("cityPlaceholder")}</option>
                <option value="Бишкек">{t("cityBishkek")}</option>
                <option value="Ош">{t("cityOsh")}</option>
              </select>
            </div>

            <button className="header__save" onClick={handleSave}>{t("save")}</button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
