import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './PoiListPageComponent.module.css';
import { PoiTable } from '../tables/PoiTable/PoiTable';
import { Badge } from 'reactstrap';
import { flattenData } from '../tables/PoiTable/flattenData';
import { AppContext } from '../../App';

/**
 * 
 * @param {*} param0 
 * @returns component used to show list of poi belonging to either set segment or trail 
 * (or any other endpoint that doesn't require authorization)
 */
const PoiListPageComponent = ({url}) => {
  const appData = useContext(AppContext);

  const [data, setData] = useState([]);
  const showColumns = {
    'id': false,
    'actions': false,
    'latitude': false,
    'longitude': false
  };

  const fetchData = () => {
    fetch(url)
      .then(response => {
        if (response.status === 200)
          return response.json()
      })
      .then(responseData => { 
        setData(flattenData(responseData, appData)); 
      })
      .catch(error => {
        console.log(error);
      });
  };

  useEffect(()=>{
    fetchData();
  }, [url, appData]);

  useEffect(()=> {console.info('data: ', data);}, [data]);

  return (
    <div>
      {data.length > 0 ?
        <PoiTable {...{ data, showColumns }} /> :
        <Badge className={styles.Badge}>Brak danych</Badge>
      }
    </div>
  );
}

PoiListPageComponent.propTypes = {
  url: PropTypes.string
};

PoiListPageComponent.defaultProps = {
  url: ''
};

export default PoiListPageComponent;
