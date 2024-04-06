import React, {useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import styles from './TCMap.module.css';
import * as L from 'leaflet-gpx';
import PinIconStart from '../../assets/icons/pin-icon-start.png';
import PinIconEnd from '../../assets/icons/pin-icon-end.png';

const TCMap = ( { gpxUrls }) => {
  const mapRef = useRef(null);

  async function renderMap() {
    const map = L.map(mapRef.current);

    L.tileLayer(
      "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    ).addTo(map);

    const latitudeMinList = [];
    const latitudeMaxList = [];
    const longitudeMinList = [];
    const longitudeMaxList = [];

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
          shadowUrl: null
        }
      })
        .on("loaded", (e) => {
          const gpx = e.target;
          const bounds = gpx.getBounds();
          const SouthWes = bounds.getSouthWest();
          const NorthEast = bounds.getNorthEast();
          latitudeMinList.push(SouthWes.lat);
          latitudeMaxList.push(NorthEast.lat);
          longitudeMinList.push(SouthWes.lng);
          longitudeMaxList.push(NorthEast.lng);
          if(index === gpxUrls.length - 1) {
            const boundsRectangle = [
              [Math.min(...latitudeMinList), Math.min(...longitudeMinList)],
              [Math.max(...latitudeMaxList), Math.max(...longitudeMaxList)]
            ];
            map.fitBounds(boundsRectangle);
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
