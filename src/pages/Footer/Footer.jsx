// import React from "react";
// import { Link } from "react-router-dom";
// import "./Footer.scss";

// const Footer = () => {
//   const types = [
//     {
//       id: "apartment",
//       label: "Квартира",
//       d: "M12 2H4v20h16V8h-8V2zm-2 18H6v-4h4v4zm0-6H6v-4h4v4zm0-6H6V4h4v4zm6 10h-4v-4h4v4zm0-6h-4v-4h4v4z",
//     },
//     {
//       id: "house",
//       label: "Дом/Участок",
//       d: "M3 12l9-9 9 9v10a2 2 0 01-2 2H5a2 2 0 01-2-2V12zm6 8h6v-6H9v6zm0-8h6V6H9v6z",
//     },
//     {
//       id: "commercial",
//       label: "Коммерческая",
//       d: "M3 5v14a2 2 0 002 2h14a2 2 0 002-2V5H3zm2 2h14v6H5V7zm0 8h6v4H5v-4zm8 0h6v4h-6v-4z",
//     },
//   ];

//   return (
//     <footer className="footer" role="contentinfo">
//       <div className="footer__container">
//         <h2 className="footer__title">Недвижимость</h2>

//         <div className="footer__content">
//           <nav className="footer__section" aria-label="Категории">
//             <ul className="footer__list">
//               {types.map((t) => (
//                 <li key={t.id} className="footer__item">
//                   <svg className="footer__icon" viewBox="0 0 24 24" aria-hidden="true">
//                     <path d={t.d} />
//                   </svg>
//                   <Link className="footer__link" to={`/listings?property_type=${t.id}`}>
//                     {t.label}
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           </nav>

//           <address className="footer__section footer__contacts">
//             <ul className="footer__list">
//               <li className="footer__item">
//                 <svg className="footer__icon" viewBox="0 0 24 24" aria-hidden="true">
//                   <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm-1 14H5V8l7 5 7-5v10zm-7 0V9" />
//                 </svg>
//                 <a className="footer__link" href="mailto:info@darek.kg">darek.kg@gmail.com</a>
//               </li>
//               <li className="footer__item">
//                 <svg className="footer__icon" viewBox="0 0 24 24" aria-hidden="true">
//                   <path d="M22 16.92v3A2 2 0 0119.82 22a19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012 4.11 2 2 0 014.11 2h3A2 2 0 019 3.72c.16.96.4 1.93.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.88.3 1.85.54 2.81.7A2 2 0 0122 16.92z" />
//                 </svg>
//                 <a className="footer__link" href="tel:+996123456789">+996 123 456 789</a>
//               </li>
//               <li className="footer__item">
//                 <svg className="footer__icon" viewBox="0 0 24 24" aria-hidden="true">
//                   <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
//                   <circle cx="12" cy="10" r="3" />
//                 </svg>
//                 <span className="footer__text">г. Ош, ул. Ленина 12, офис 101</span>
//               </li>
//             </ul>
//           </address>
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;



import React from "react";
import { Link } from "react-router-dom";
import "./Footer.scss";

const Footer = () => {
  const types = [
    {
      id: "apartment",
      label: "Квартира",
      d: "M12 2H4v20h16V8h-8V2zm-2 18H6v-4h4v4zm0-6H6v-4h4v4zm0-6H6V4h4v4zm6 10h-4v-4h4v4zm0-6h-4v-4h4v4z",
    },
    {
      id: "house",
      label: "Дом/Участок",
      d: "M3 12l9-9 9 9v10a2 2 0 01-2 2H5a2 2 0 01-2-2V12zm6 8h6v-6H9v6zm0-8h6V6H9v6z",
    },
    {
      id: "commercial",
      label: "Коммерческая",
      d: "M3 5v14a2 2 0 002 2h14a2 2 0 002-2V5H3zm2 2h14v6H5V7zm0 8h6v4H5v-4zm8 0h6v4h-6v-4z",
    },
  ];

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__container">
        <h2 className="footer__title">Недвижимость</h2>

        <div className="footer__content">
          <nav className="footer__section" aria-label="Категории">
            <ul className="footer__list">
              {types.map((t) => (
                <li key={t.id} className="footer__item">
                  <svg className="footer__icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d={t.d} />
                  </svg>
                  <Link className="footer__link" to={`/listings?property_type=${t.id}`}>
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <address className="footer__section footer__contacts" aria-label="Контакты">
            <ul className="footer__list">
              <li className="footer__item">
                <svg className="footer__icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm-1 14H5V8l7 5 7-5v10z" />
                </svg>
                <a className="footer__link" href="mailto:darek.kg@gmail.com">
                  darek.kg@gmail.com
                </a>
              </li>

              <li className="footer__item">
                <svg className="footer__icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22 16.92v3A2 2 0 0119.82 22a19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012 4.11 2 2 0 014.11 2h3A2 2 0 019 3.72c.16.96.4 1.93.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.88.3 1.85.54 2.81.7A2 2 0 0122 16.92z" />
                </svg>
                <a className="footer__link" href="tel:+996123456789">
                  +996 123 456 789
                </a>
              </li>

              <li className="footer__item">
                <svg className="footer__icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="footer__text">г. Ош, ул. Ленина 12, офис 101</span>
              </li>
            </ul>
          </address>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
