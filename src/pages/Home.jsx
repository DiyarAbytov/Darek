import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import HeroSection from './HeroSection/HeroSection';
import Listings from './Listings/Listings';
import About from './About/About';
import Map from './Map/Map';
import Contacts from './Footer/Footer';
import Background from './BackgroundImage/BackgroundImage';
import styles from './Home.module.scss';
import ListingManager from '../Admin/ListingManager/ListingManager';

const Home = ({ onSearch, searchParams, selectedCity, language }) => {
  const { id } = useParams();
  const [isMapVisible, setIsMapVisible] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsMapVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (mapRef.current) {
      observer.observe(mapRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.home}>
      <div id="background">
        <Background />
      </div>
      {/* <div id="home">
        <HeroSection onSearch={onSearch} selectedCity={selectedCity} />
      </div> */}
      <div id="listing-manager">
        <ListingManager/>
      </div>
      <div id="about">
        <About language={language} />
      </div>
      <div id="map" ref={mapRef}>
        {isMapVisible && <Map />}
      </div>
      <div id="contacts">
        <Contacts />
      </div>
    </div>
  );
};

export default Home;