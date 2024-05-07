import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import styles from './TrailPoiListPage.module.css';
import PoiListPageComponent from '../../../components/PoiListPageComponent/PoiListPageComponent';
import SectionTitle from "../../../components/SectionTitle/SectionTitle";

const TrailPoiListPage = () => {
  const {trailId} = useParams();
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(`tc-api/poi/list/trail/${trailId}`);
  }, []);

  useEffect(() => {
    console.info('url: ', url);
  }, [url]);

  return (
    <>
      <div className="ms-4"><SectionTitle>Lista POI trasy</SectionTitle></div>
      <PoiListPageComponent {...{url}}/>
    </>
  )
    ;
}

TrailPoiListPage.propTypes = {};

TrailPoiListPage.defaultProps = {};

export default TrailPoiListPage;
