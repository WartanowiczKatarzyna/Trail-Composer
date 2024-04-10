import React from 'react';
import PropTypes from 'prop-types';
import styles from './HomePage.module.css';
import TCMap from "../../components/TCMap/TCMap";
import Test from '../../assets/gpx/test.gpx';
import Demo from '../../assets/gpx/demo.gpx';

const gpxUrls = [Test, Demo];

const HomePage = () => {


  return (
    <div >
      <TCMap gpxUrls={gpxUrls} />
    </div>
  );
}

HomePage.propTypes = {};

HomePage.defaultProps = {};

export default HomePage;
