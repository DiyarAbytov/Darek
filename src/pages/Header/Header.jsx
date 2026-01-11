// import React, { useState } from "react";
// import { NavLink, useLocation, useNavigate } from "react-router-dom";
// import { FaHome, FaInfoCircle, FaHeart, FaPhone, FaSignInAlt } from "react-icons/fa";
// import "./Header.scss";
// import logo from "../../img/logo.JPG";

// const messages = {
//   ru: {
//     home: "Главная",
//     about: "О нас",
//     favorites: "Избранное",
//     contacts: "Контакты",
//     login: "Логин",
//     settings: "Настройки",
//     language: "Язык",
//     city: "Город",
//     save: "Сохранить",
//     selectLanguage: "Выбрать язык",
//     selectCity: "Выбрать город",
//     logoAlt: "Darek Logo",
//     languageRussian: "Русский",
//     languageKyrgyz: "Кыргызский",
//     cityBishkek: "Бишкек",
//     cityOsh: "Ош",
//     cityPlaceholder: "Город",
//     settingsButton: "{language} / {city}",
//     closeSettings: "Закрыть настройки",
//   },
//   ky: {
//     home: "Башкы бет",
//     about: "Биз жөнүндө",
//     favorites: "Тандалмалар",
//     contacts: "Байланыштар",
//     login: "Кирүү",
//     settings: "Жөндөөлөр",
//     language: "Тил",
//     city: "Шаар",
//     save: "Сактоо",
//     selectLanguage: "Тил тандаңыз",
//     selectCity: "Шаар тандаңыз",
//     logoAlt: "Darek Logo",
//     languageRussian: "Орусча",
//     languageKyrgyz: "Кыргызча",
//     cityBishkek: "Бишкек",
//     cityOsh: "Ош",
//     cityPlaceholder: "Шаар",
//     settingsButton: "{language} / {city}",
//     closeSettings: "Жөндөөлөрдү жабуу",
//   },
// };

// const Header = ({ onCityChange, onLanguageChange, language = "ru", city = "" }) => {
//   const [tempCity, setTempCity] = useState(city);
//   const [tempLanguage, setTempLanguage] = useState(language);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [isSettingsOpen, setIsSettingsOpen] = useState(false);

//   const location = useLocation();
//   const navigate = useNavigate();

//   const t = (key, values = {}) => {
//     let text = messages[language][key] || messages.ru[key] || "";
//     Object.keys(values).forEach((k) => (text = text.replace(`{${k}}`, values[k])));
//     return text;
//   };

//   const toggleMobileMenu = () => setIsMobileMenuOpen((v) => !v);
//   const closeMobileMenu = () => setIsMobileMenuOpen(false);
//   const toggleSettings = () => setIsSettingsOpen((v) => !v);

//   const handleLanguageChange = (e) => setTempLanguage(e.target.value);
//   const handleCityChange = (e) => setTempCity(e.target.value);

//   const handleSave = () => {
//     onLanguageChange(tempLanguage);
//     onCityChange(tempCity);
//     setIsSettingsOpen(false);
//   };

//   const handleCloseSettings = () => {
//     setTempLanguage(language);
//     setTempCity(city);
//     setIsSettingsOpen(false);
//   };

//   const handleScroll = (sectionId) => {
//     if (location.pathname !== "/") {
//       navigate(`/#${sectionId}`);
//     } else {
//       const el = document.getElementById(sectionId);
//       if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
//     }
//     closeMobileMenu();
//   };

//   // единая функция активного класса (чтобы не светились сразу несколько)
//   const linkClass = (section) => {
//     const { pathname, hash } = location;
//     const active =
//       (section === "home" && pathname === "/" && (!hash || hash === "#home")) ||
//       (section === "about" && pathname === "/" && hash === "#about") ||
//       (section === "contacts" && pathname === "/" && hash === "#contacts") ||
//       (section === "favorites" && pathname === "/favorites") ||
//       (section === "login" && pathname === "/login");
//     return `header__nav-link ${active ? "header__nav-link--active" : ""}`;
//   };

//   return (
//     <header className="header">
//       <div className="header__container">
//         <NavLink to="/" className="header__logo" aria-label="Darek">
//           <img src={logo} alt={t("logoAlt")} className="header__logo-img" />
//           <span className="header__logo-text"></span>
//         </NavLink>

//         <nav className="header__nav">
//           <NavLink to="/" className={() => linkClass("home")} onClick={() => handleScroll("home")}>
//             <FaHome className="header__nav-icon" />
//             {t("home")}
//           </NavLink>

//           {/* якорные секции — считаем активность сами по hash */}
//           <a href="/#about" className={linkClass("about")} onClick={(e) => { e.preventDefault(); handleScroll("about"); }}>
//             <FaInfoCircle className="header__nav-icon" />
//             {t("about")}
//           </a>

//           <NavLink to="/favorites" className={() => linkClass("favorites")}>
//             <FaHeart className="header__nav-icon" />
//             {t("favorites")}
//           </NavLink>

//           <a
//             href="/#contacts"
//             className={linkClass("contacts")}
//             onClick={(e) => { e.preventDefault(); handleScroll("contacts"); }}
//           >
//             <FaPhone className="header__nav-icon" />
//             {t("contacts")}
//           </a>
//         </nav>

//         <div className="header__actions">
//           <button className="header__settings-button" onClick={toggleSettings} aria-label={t("settings")}>
//             {t("settingsButton", {
//               language: t(`language${language === "ru" ? "Russian" : "Kyrgyz"}`),
//               city: city || t("cityPlaceholder"),
//             })}
//           </button>

//           <NavLink to="/login" className={() => linkClass("login")}>
//             <FaSignInAlt className="header__nav-icon" />
//             {t("login")}
//           </NavLink>
//         </div>

//         <button className={`header__burger ${isMobileMenuOpen ? "open" : ""}`} onClick={toggleMobileMenu} aria-label="Меню">
//           <span></span><span></span><span></span>
//         </button>
//       </div>

//       {isMobileMenuOpen && (
//         <>
//           <div className={`header__mobile-overlay ${isMobileMenuOpen ? "open" : ""}`} onClick={closeMobileMenu} />
//           <aside className={`header__mobile ${isMobileMenuOpen ? "open" : ""}`}>
//             <nav className="header__mobile-nav">
//               <NavLink to="/" className={() => linkClass("home")} onClick={() => handleScroll("home")}>
//                 <FaHome className="header__nav-icon" />
//                 {t("home")}
//               </NavLink>
//               <a href="/#about" className={linkClass("about")} onClick={(e) => { e.preventDefault(); handleScroll("about"); }}>
//                 <FaInfoCircle className="header__nav-icon" />
//                 {t("about")}
//               </a>
//               <NavLink to="/favorites" className={() => linkClass("favorites")} onClick={closeMobileMenu}>
//                 <FaHeart className="header__nav-icon" />
//                 {t("favorites")}
//               </NavLink>
//               <a href="/#contacts" className={linkClass("contacts")} onClick={(e) => { e.preventDefault(); handleScroll("contacts"); }}>
//                 <FaPhone className="header__nav-icon" />
//                 {t("contacts")}
//               </a>
//               <NavLink to="/login" className={() => linkClass("login")} onClick={closeMobileMenu}>
//                 <FaSignInAlt className="header__nav-icon" />
//                 {t("login")}
//               </NavLink>

//               <button className="header__mobile-settings" onClick={toggleSettings} aria-label={t("settings")}>
//                 {t("settingsButton", {
//                   language: t(`language${language === "ru" ? "Russian" : "Kyrgyz"}`),
//                   city: city || t("cityPlaceholder"),
//                 })}
//               </button>
//             </nav>
//           </aside>
//         </>
//       )}

//       {isSettingsOpen && (
//         <div className="header__settings">
//           <div className="header__settings-content" role="dialog" aria-modal="true">
//             <button className="header__settings-close" onClick={handleCloseSettings} aria-label={t("closeSettings")} />
//             <h3 className="header__settings-title">{t("settings")}</h3>

//             <div className="header__settings-group">
//               <label htmlFor="language">{t("language")}</label>
//               <select id="language" value={tempLanguage} onChange={handleLanguageChange} className="header__select" aria-label={t("selectLanguage")}>
//                 <option value="ru">{t("languageRussian")}</option>
//                 <option value="ky">{t("languageKyrgyz")}</option>
//               </select>
//             </div>

//             <div className="header__settings-group">
//               <label htmlFor="city">{t("city")}</label>
//               <select id="city" value={tempCity} onChange={handleCityChange} className="header__select" aria-label={t("selectCity")}>
//                 <option value="">{t("cityPlaceholder")}</option>
//                 <option value="Бишкек">{t("cityBishkek")}</option>
//                 <option value="Ош">{t("cityOsh")}</option>
//               </select>
//             </div>

//             <button className="header__save" onClick={handleSave}>{t("save")}</button>
//           </div>
//         </div>
//       )}
//     </header>
//   );
// };

// export default Header;



import React, { useCallback, useEffect, useRef, useState } from "react";
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

const Header = ({
  onCityChange = () => {},
  onLanguageChange = () => {},
  language = "ru",
  city = "",
}) => {
  const [tempCity, setTempCity] = useState(city);
  const [tempLanguage, setTempLanguage] = useState(language);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const headerRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const t = (key, values = {}) => {
    let text = messages[language]?.[key] || messages.ru[key] || "";
    Object.keys(values).forEach((k) => {
      text = text.replace(`{${k}}`, values[k]);
    });
    return text;
  };

  const getHeaderOffset = () => {
    const h = headerRef.current?.getBoundingClientRect?.().height;
    return Number.isFinite(h) && h > 0 ? h : 80;
  };

  const scrollToSection = useCallback(
    (sectionId) => {
      const el = document.getElementById(sectionId);
      if (!el) return false;

      const offset = getHeaderOffset() + 8;
      const top = el.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: "smooth" });
      return true;
    },
    [location.pathname]
  );

  const scheduleScroll = useCallback(
    (sectionId) => {
      const tries = [0, 80, 200, 420];
      tries.forEach((ms) => {
        window.setTimeout(() => scrollToSection(sectionId), ms);
      });
    },
    [scrollToSection]
  );

  const setHashAndGo = useCallback(
    (sectionId) => {
      const hash = sectionId === "home" ? "#home" : `#${sectionId}`;
      navigate({ pathname: "/", hash }, { replace: false });
      scheduleScroll(sectionId);
    },
    [navigate, scheduleScroll]
  );

  const handleScroll = useCallback(
    (sectionId) => {
      setIsSettingsOpen(false);
      setIsMobileMenuOpen(false);

      if (location.pathname !== "/") {
        setHashAndGo(sectionId);
        return;
      }

      const hash = sectionId === "home" ? "#home" : `#${sectionId}`;
      if (location.hash !== hash) {
        navigate({ pathname: "/", hash }, { replace: false });
      }
      scheduleScroll(sectionId);
    },
    [location.pathname, location.hash, navigate, scheduleScroll, setHashAndGo]
  );

  useEffect(() => {
    if (!isSettingsOpen) {
      setTempCity(city);
      setTempLanguage(language);
    }
  }, [city, language, isSettingsOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    if (isMobileMenuOpen || isSettingsOpen) document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [isMobileMenuOpen, isSettingsOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen && !isSettingsOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsSettingsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMobileMenuOpen, isSettingsOpen]);

  const openSettings = () => {
    setTempLanguage(language);
    setTempCity(city);
    setIsMobileMenuOpen(false);
    setIsSettingsOpen(true);
  };

  const closeSettings = () => {
    setTempLanguage(language);
    setTempCity(city);
    setIsSettingsOpen(false);
  };

  const handleSave = () => {
    onLanguageChange(tempLanguage);
    onCityChange(tempCity);
    setIsSettingsOpen(false);
  };

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

  const langLabel = t(`language${language === "ru" ? "Russian" : "Kyrgyz"}`);
  const cityLabel = city || t("cityPlaceholder");

  return (
    <header className="header" ref={headerRef}>
      <div className="header__container">
        <NavLink to="/#home" className="header__logo" aria-label="Darek" onClick={() => handleScroll("home")}>
          <img src={logo} alt={t("logoAlt")} className="header__logo-img" />
          <span className="header__logo-text"></span>
        </NavLink>

        <nav className="header__nav" aria-label="Навигация">
          <NavLink to="/#home" className={linkClass("home")} onClick={() => handleScroll("home")}>
            <FaHome className="header__nav-icon" />
            {t("home")}
          </NavLink>

          <button type="button" className={linkClass("about")} onClick={() => handleScroll("about")}>
            <FaInfoCircle className="header__nav-icon" />
            {t("about")}
          </button>

          <NavLink to="/favorites" className={linkClass("favorites")}>
            <FaHeart className="header__nav-icon" />
            {t("favorites")}
          </NavLink>

          <button type="button" className={linkClass("contacts")} onClick={() => handleScroll("contacts")}>
            <FaPhone className="header__nav-icon" />
            {t("contacts")}
          </button>
        </nav>

        <div className="header__actions">
          <button className="header__settings-button" onClick={openSettings} aria-label={t("settings")}>
            {t("settingsButton", { language: langLabel, city: cityLabel })}
          </button>

          <NavLink to="/login" className={linkClass("login")}>
            <FaSignInAlt className="header__nav-icon" />
            {t("login")}
          </NavLink>
        </div>

        <button
          className={`header__burger ${isMobileMenuOpen ? "open" : ""}`}
          onClick={() => setIsMobileMenuOpen((v) => !v)}
          aria-label="Меню"
          aria-expanded={isMobileMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {isMobileMenuOpen && (
        <>
          <div className="header__mobile-overlay open" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="header__mobile open" role="dialog" aria-modal="true" aria-label="Меню">
            <nav className="header__mobile-nav">
              <button type="button" className={linkClass("home")} onClick={() => handleScroll("home")}>
                <FaHome className="header__nav-icon" />
                {t("home")}
              </button>

              <button type="button" className={linkClass("about")} onClick={() => handleScroll("about")}>
                <FaInfoCircle className="header__nav-icon" />
                {t("about")}
              </button>

              <NavLink to="/favorites" className={linkClass("favorites")} onClick={() => setIsMobileMenuOpen(false)}>
                <FaHeart className="header__nav-icon" />
                {t("favorites")}
              </NavLink>

              <button type="button" className={linkClass("contacts")} onClick={() => handleScroll("contacts")}>
                <FaPhone className="header__nav-icon" />
                {t("contacts")}
              </button>

              <NavLink to="/login" className={linkClass("login")} onClick={() => setIsMobileMenuOpen(false)}>
                <FaSignInAlt className="header__nav-icon" />
                {t("login")}
              </NavLink>

              <button className="header__mobile-settings" onClick={openSettings} aria-label={t("settings")} type="button">
                {t("settingsButton", { language: langLabel, city: cityLabel })}
              </button>
            </nav>
          </aside>
        </>
      )}

      {isSettingsOpen && (
        <div className="header__settings" onMouseDown={(e) => e.target === e.currentTarget && closeSettings()}>
          <div className="header__settings-content" role="dialog" aria-modal="true">
            <button className="header__settings-close" onClick={closeSettings} aria-label={t("closeSettings")} />
            <h3 className="header__settings-title">{t("settings")}</h3>

            <div className="header__settings-group">
              <label htmlFor="language">{t("language")}</label>
              <select
                id="language"
                value={tempLanguage}
                onChange={(e) => setTempLanguage(e.target.value)}
                className="header__select"
                aria-label={t("selectLanguage")}
              >
                <option value="ru">{t("languageRussian")}</option>
                <option value="ky">{t("languageKyrgyz")}</option>
              </select>
            </div>

            <div className="header__settings-group">
              <label htmlFor="city">{t("city")}</label>
              <select
                id="city"
                value={tempCity}
                onChange={(e) => setTempCity(e.target.value)}
                className="header__select"
                aria-label={t("selectCity")}
              >
                <option value="">{t("cityPlaceholder")}</option>
                <option value="Бишкек">{t("cityBishkek")}</option>
                <option value="Ош">{t("cityOsh")}</option>
              </select>
            </div>

            <button className="header__save" onClick={handleSave} type="button">
              {t("save")}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
