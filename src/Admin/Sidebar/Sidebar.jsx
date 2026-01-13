// import React, { useState } from "react";
// import { NavLink, Outlet } from "react-router-dom";
// import {
//   FiUser,
//   FiList,
//   FiGrid,
//   FiPlusSquare,
//   FiInbox,
//   FiMapPin,
//   FiInfo,
//   FiImage,
//   FiUsers,
//   FiLayers,
//   FiUserPlus,
//   FiLogOut,
// } from "react-icons/fi";
// import "./Sidebar.scss";

// const Sidebar = ({ onLogout }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const user = JSON.parse(localStorage.getItem("user")) || { role: "realtor" };

//   const toggle = () => setIsOpen((v) => !v);
//   const close = () => setIsOpen(false);

//   return (
//     <div className="sidebar">
//       <button
//         className={`sidebar__toggle ${isOpen ? "is-open" : ""}`}
//         onClick={toggle}
//         aria-label="Открыть меню"
//       >
//         <span />
//         <span />
//         <span />
//       </button>

//       {isOpen && <div className="sidebar__overlay is-open" onClick={close} />}

//       <aside className={`sidebar__panel ${isOpen ? "is-open" : ""}`}>
//         <button
//           className="sidebar__close"
//           onClick={close}
//           aria-label="Закрыть меню"
//         />
//         <nav className="sidebar__nav">
//           <NavLink
//             to="profile"
//             className={({ isActive }) =>
//               `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
//             }
//             title="Мой профиль"
//             onClick={close}
//           >
//             <FiUser aria-hidden="true" />
//             Мой профиль
//           </NavLink>

//           <NavLink
//             to="my-listings"
//             className={({ isActive }) =>
//               `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
//             }
//             title="Мои объявления"
//             onClick={close}
//           >
//             <FiList aria-hidden="true" />
//             Мои объявления
//           </NavLink>

//           <NavLink
//             to="listing-manager"
//             className={({ isActive }) =>
//               `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
//             }
//             title="Объявления"
//             onClick={close}
//           >
//             <FiGrid aria-hidden="true" />
//             Объявления
//           </NavLink>

//           <NavLink
//             to="create-listing"
//             className={({ isActive }) =>
//               `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
//             }
//             title="Новое объявление"
//             onClick={close}
//           >
//             <FiPlusSquare aria-hidden="true" />
//             Новое объявление
//           </NavLink>

//           <NavLink
//             to="applications"
//             className={({ isActive }) =>
//               `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
//             }
//             title="Заявки"
//             onClick={close}
//           >
//             <FiInbox aria-hidden="true" />
//             Заявки
//           </NavLink>

//           {user.role === "admin" && (
//             <>
//               <NavLink
//                 to="locations"
//                 className={({ isActive }) =>
//                   `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
//                 }
//                 title="Локация"
//                 onClick={close}
//               >
//                 <FiMapPin aria-hidden="true" />
//                 Локация
//               </NavLink>

//               <NavLink
//                 to="about-us"
//                 className={({ isActive }) =>
//                   `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
//                 }
//                 title="О нас"
//                 onClick={close}
//               >
//                 <FiInfo aria-hidden="true" />
//                 О нас
//               </NavLink>

//               <NavLink
//                 to="image-admin"
//                 className={({ isActive }) =>
//                   `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
//                 }
//                 title="Изображения"
//                 onClick={close}
//               >
//                 <FiImage aria-hidden="true" />
//                 Изображения
//               </NavLink>

//               <NavLink
//                 to="employee"
//                 className={({ isActive }) =>
//                   `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
//                 }
//                 title="Сотрудники"
//                 onClick={close}
//               >
//                 <FiUsers aria-hidden="true" />
//                 Сотрудники
//               </NavLink>

//               <NavLink
//                 to="complex"
//                 className={({ isActive }) =>
//                   `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
//                 }
//                 title="Комплекс"
//                 onClick={close}
//               >
//                 <FiLayers aria-hidden="true" />
//                 Комплекс
//               </NavLink>

//               {/* <NavLink
//                 to="register"
//                 className={({ isActive }) =>
//                   `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
//                 }
//                 title="Регистрация"
//                 onClick={close}
//               >
//                 <FiUserPlus aria-hidden="true" />
//                 Регистрация
//               </NavLink> */}
//             </>
//           )}

//           <button
//             onClick={() => {
//               onLogout && onLogout();
//               close();
//             }}
//             className="sidebar__logout"
//             title="Выход"
//           >
//             <FiLogOut aria-hidden="true" />
//             Выход
//           </button>
//         </nav>
//       </aside>

//       <main className="sidebar__content">
//         <Outlet />
//       </main>
//     </div>
//   );
// };

// export default Sidebar;



import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  FiUser,
  FiList,
  FiGrid,
  FiPlusSquare,
  FiInbox,
  FiMapPin,
  FiInfo,
  FiImage,
  FiUsers,
  FiLayers,
  FiLogOut,
} from "react-icons/fi";
import "./Sidebar.scss";

const safeJson = (v) => {
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
};

const Sidebar = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const user = useMemo(() => {
    const raw = localStorage.getItem("user");
    const parsed = safeJson(raw);
    return parsed && typeof parsed === "object" ? parsed : { role: "realtor" };
  }, []);

  const toggle = () => setIsOpen((v) => !v);
  const close = () => setIsOpen(false);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  return (
    <div className="sidebar">
      <button
        className={`sidebar__toggle ${isOpen ? "is-open" : ""}`}
        onClick={toggle}
        aria-label={isOpen ? "Закрыть меню" : "Открыть меню"}
        aria-expanded={isOpen}
        aria-controls="sidebar-panel"
        type="button"
      >
        <span />
        <span />
        <span />
      </button>

      {isOpen && <div className="sidebar__overlay is-open" onClick={close} />}

      <aside
        id="sidebar-panel"
        className={`sidebar__panel ${isOpen ? "is-open" : ""}`}
      >
        <button
          className="sidebar__close"
          onClick={close}
          aria-label="Закрыть меню"
          type="button"
        />

        <nav className="sidebar__nav">
          <NavLink
            to="profile"
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
            }
            onClick={close}
          >
            <FiUser aria-hidden="true" />
            Мой профиль
          </NavLink>

          <NavLink
            to="my-listings"
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
            }
            onClick={close}
          >
            <FiList aria-hidden="true" />
            Мои объявления
          </NavLink>

          <NavLink
            to="listing-manager"
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
            }
            onClick={close}
          >
            <FiGrid aria-hidden="true" />
            Объявления
          </NavLink>

          <NavLink
            to="create-listing"
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
            }
            onClick={close}
          >
            <FiPlusSquare aria-hidden="true" />
            Новое объявление
          </NavLink>

          <NavLink
            to="applications"
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
            }
            onClick={close}
          >
            <FiInbox aria-hidden="true" />
            Заявки
          </NavLink>

          {user.role === "admin" && (
            <>
              <NavLink
                to="locations"
                className={({ isActive }) =>
                  `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
                }
                onClick={close}
              >
                <FiMapPin aria-hidden="true" />
                Локация
              </NavLink>

              <NavLink
                to="about-us"
                className={({ isActive }) =>
                  `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
                }
                onClick={close}
              >
                <FiInfo aria-hidden="true" />
                О нас
              </NavLink>

              <NavLink
                to="image-admin"
                className={({ isActive }) =>
                  `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
                }
                onClick={close}
              >
                <FiImage aria-hidden="true" />
                Изображения
              </NavLink>

              <NavLink
                to="employee"
                className={({ isActive }) =>
                  `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
                }
                onClick={close}
              >
                <FiUsers aria-hidden="true" />
                Сотрудники
              </NavLink>

              <NavLink
                to="complex"
                className={({ isActive }) =>
                  `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
                }
                onClick={close}
              >
                <FiLayers aria-hidden="true" />
                Комплекс
              </NavLink>
            </>
          )}

          <button
            onClick={() => {
              if (onLogout) onLogout();
              close();
            }}
            className="sidebar__logout"
            type="button"
          >
            <FiLogOut aria-hidden="true" />
            Выход
          </button>
        </nav>
      </aside>

      <main className="sidebar__content">
        <Outlet />
      </main>
    </div>
  );
};

export default Sidebar;
