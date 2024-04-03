import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import styles from './TrailPoiListPage.module.css';
import PoiListPageComponent from '../../../components/PoiListPageComponent/PoiListPageComponent';

const TrailPoiListPage = () => {
  const { trailId } = useParams();
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(`tc-api/poi/list/trail/${trailId}`);
  }, []);

  useEffect(()=>{
    console.info('url: ', url);
  }, [url]);

  return (
    <PoiListPageComponent {...{url}}/>
  );
}

TrailPoiListPage.propTypes = {};

TrailPoiListPage.defaultProps = {};

export default TrailPoiListPage;
