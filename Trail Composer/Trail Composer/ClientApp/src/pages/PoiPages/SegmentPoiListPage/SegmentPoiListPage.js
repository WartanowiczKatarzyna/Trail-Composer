import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import styles from './SegmentPoiListPage.module.css';
import PoiListPageComponent from '../../../components/PoiListPageComponent/PoiListPageComponent';

const SegmentPoiListPage = () => {
  const { segmentId } = useParams();
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(`tc-api/poi/list/segment/${segmentId}`);
  }, []);

  useEffect(()=>{
    console.info('url: ', url);
  }, [url]);

  return (
    <PoiListPageComponent {...{url}}/>
  );
}

SegmentPoiListPage.propTypes = {};

SegmentPoiListPage.defaultProps = {};

export default SegmentPoiListPage;
