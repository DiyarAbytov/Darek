import React from "react";
import "./Map.scss";

const Map = () => {
  return (
    <section id="map" className="map" role="region" aria-label="Наша локация">
      <div className="map__container">
        <h2 className="map__title">Наша локация</h2>

        <div className="map__iframe-wrapper">
          <iframe
            title="Google Map"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d24261.45314068444!2d72.76882230000001!3d40.52652725!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38bdac1282b97f0d%3A0x2630e584014cece!2z0KHRg9C70LDQudC80LDQvSDQotC-0L4!5e0!3m2!1sru!2skg!4v1752692813004!5m2!1sru!2skg"
          ></iframe>
        </div>

        <a
          className="map__text"
          href="https://maps.google.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Открыть карту в Google Maps"
        >
          Посмотреть на Google Maps
        </a>
      </div>
    </section>
  );
};

export default Map;
