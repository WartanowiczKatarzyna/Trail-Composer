import React, {useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import styles from './TCMap.module.css';
import * as L from 'leaflet-gpx';
import PinIconStart from '../../assets/icons/pin-icon-start.png';
import PinIconEnd from '../../assets/icons/pin-icon-end.png';
import PinIconWpt from '../../assets/icons/pin-icon-wpt.png';
import PinShadow from '../../assets/icons/pin-shadow.png';


const TCMap = ( { gpxArr, type, gpxNotValidated, gpxValidated }) => {
  const mapRef = useRef(null);

  async function renderMap() {
    const map = L.map(mapRef.current);

    L.tileLayer(
      "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    ).addTo(map);

    const allBounds = [];
    let distance = 0;

    const IterateUrls = async (index) => {
      if( gpxArr.length === 0 || index >= gpxArr.length) return;

      let gpxString = '';
      if( type && type === 'url') {
        gpxString = await fetch(gpxArr[index]).then((res) =>
          res.text()
        );
      } else {
        gpxString = gpxArr[index];
      }
      let timeoutHandler = 0;
      if(gpxNotValidated) {
        timeoutHandler = setTimeout(gpxNotValidated, 10000);
      }
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
          if(gpxNotValidated && timeoutHandler) {
            clearTimeout(timeoutHandler);
          }
          const gpx = e.target;
          distance += gpx.get_distance();
          allBounds.push(gpx.getBounds());
          if(index === gpxArr.length - 1) {
            const boundingBox = L.latLngBounds().extend(allBounds);
            map.fitBounds(boundingBox.pad(0.1));
            if(gpxValidated) {
              gpxValidated(boundingBox, distance);
            }
          }
          IterateUrls(index + 1);
        })
        .addTo(map);
    }

    await IterateUrls(0);

  }

  useEffect(() => {
    renderMap().catch(console.error);
  }, [gpxArr, type]);

  return (
    <>
      { !!gpxArr && gpxArr.length > 0 && (<div ref={mapRef} className={styles.TcMap} />)}
    </>
  );
}

TCMap.propTypes = {
  gpxArr: PropTypes.arrayOf(PropTypes.string),
  type: PropTypes.string,
  gpxNotValidated: PropTypes.func,
  gpxValidated: PropTypes.func,
};

TCMap.defaultProps = {
  gpxArr: [],
  type: 'url',
};

export default TCMap;
