import React, {useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import styles from './TCMap.module.css';
import * as L from 'leaflet-gpx';
import PinIconStart from '../../assets/icons/pin-icon-start.png';
import PinIconEnd from '../../assets/icons/pin-icon-end.png';
import PinIconWpt from '../../assets/icons/pin-icon-wpt.png';
import PinShadow from '../../assets/icons/pin-shadow.png';


const TCMap = ( { gpxUrls }) => {
  const mapRef = useRef(null);

  async function renderMap() {
    const map = L.map(mapRef.current);

    L.tileLayer(
      "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    ).addTo(map);

    const allBounds = [];

    const IterateUrls = async (index) => {
      if( gpxUrls.length === 0 || index >= gpxUrls.length) return;

      let gpxString = await fetch(gpxUrls[index]).then((res) =>
        res.text()
      );

      new L.GPX(gpxString, {
        async: true,
        marker_options: {
          startIconUrl: PinIconStart,
          endIconUrl: PinIconEnd,
          wptIconUrls: {
            '': PinIconWpt,
          },
          shadowUrl: PinShadow
        }
      })
        .on("loaded", (e) => {
          const gpx = e.target;
          allBounds.push(gpx.getBounds());
          if(index === gpxUrls.length - 1) {
            map.fitBounds(L.latLngBounds().extend(allBounds).pad(0.1));
          }
          IterateUrls(index + 1);
        })
        .addTo(map);
    }

    await IterateUrls(0);

  }

  useEffect(() => {
    renderMap().catch(console.error);
  }, []);

  return (
    <>
      { !!gpxUrls && gpxUrls.length > 0 && (<div ref={mapRef} className={styles.TcMap} />)}
    </>
  );
}

TCMap.propTypes = {
  gpxUrls: PropTypes.arrayOf(PropTypes.string).isRequired,
};

TCMap.defaultProps = {
  gpxUrls: [],
};

export default TCMap;
