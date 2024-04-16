import React, {useState} from 'react';
import PropTypes from 'prop-types';
import styles from './HomePage.module.css';
import {
  Button,
  Carousel,
  CarouselItem,
  CarouselControl,
  CarouselIndicators,
  CarouselCaption
} from 'reactstrap';
import TCMap from "../../components/TCMap/TCMap";

import AppalachianMap from '../../assets/gpx/appalachian-trail-connecticut.gpx'
import AppalachianImg from '../../assets/images/appalachian-trail-connecticut.png'

const HomePage = () => {
  const [gpxUrls, setGpxUrls] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const items = [
    {
      src: 'https://picsum.photos/id/456/700/500',
      altText: '',
      caption: '',
      captionHeader: '',
      key: 1,
    },
    {
      src: AppalachianImg,
      altText: '',
      caption: '',
      captionHeader: '',
      TCmap: [AppalachianMap],
      key: 2,
    },
    {
      src: 'https://picsum.photos/id/678/700/500',
      altText: '',
      caption: '',
      captionHeader: '',
      key: 3,
    }
  ];

  const toggleShowMap = () => {
    const index = activeIndex;
    if(items[index].TCmap && items[index].TCmap.length > 0 && gpxUrls.length === 0) {
      setGpxUrls(items[index].TCmap);
    } else {
      setGpxUrls([]);
    }
  };

  const next = () => {
    if (animating) return;
    const nextIndex = activeIndex === items.length - 1 ? 0 : activeIndex + 1;
    setActiveIndex(nextIndex);
  };

  const previous = () => {
    if (animating) return;
    const nextIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1;
    setActiveIndex(nextIndex);
  };

  const goToIndex = (newIndex) => {
    if (animating) return;
    setActiveIndex(newIndex);
  };

  const slides = items.map((item) => {
    return (
      <CarouselItem
        onExiting={() => setAnimating(true)}
        onExited={() => setAnimating(false)}
        key={item.key}
      >
        <img src={item.src} alt={item.altText} className="img-fluid"/>
        <CarouselCaption
          captionText={item.caption}
          captionHeader={item.captionHeader}
        />
      </CarouselItem>
    );
  });

  return (
    <div className={styles.container}>
      <div className={styles.showMapButton}>
        { items[activeIndex].TCmap && items[activeIndex].TCmap.length > 0 ?
          (<Button onClick={toggleShowMap}>{gpxUrls.length > 0 ? 'Wróć do slajdów' : 'Pokaż mapę'}</Button>) :
          (<div className={styles.noButton}></div>)
        }
      </div>
      <div className={styles.carousel}>
        <p className={styles.carouselTitle}>Zobacz polecane trasy</p>
        { gpxUrls && gpxUrls.length > 0 ?
          (<div className={styles.TCmap}><TCMap gpxArr = {gpxUrls} /></div>) :
          (<Carousel
            activeIndex={activeIndex}
            next={next}
            previous={previous}
          >
            <CarouselIndicators
              items={items}
              activeIndex={activeIndex}
              onClickHandler={goToIndex}
            />
            {slides}
            <CarouselControl
              direction="prev"
              directionText="Previous"
              onClickHandler={previous}
            />
            <CarouselControl
              direction="next"
              directionText="Next"
              onClickHandler={next}
            />
          </Carousel>)
        }
      </div>
    </div>
  );
}

HomePage.propTypes = {};

HomePage.defaultProps = {};

export default HomePage;
