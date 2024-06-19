import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './PoiListPageComponent.module.css';
import { PoiTable } from '../tables/PoiTable/PoiTable';
import { Badge } from 'reactstrap';
import { flattenData } from '../tables/PoiTable/flattenData';
import { AppContext } from '../../App';
import { useTcStore } from "../../store/TcStore";

/**
 * 
 * @param {*} param0 
 * @returns component used to show list of poi belonging to either set segment or trail 
 * (or any other endpoint that doesn't require authorization)
 */
const PoiListPageComponent = ({url}) => {
  const appData = useContext(AppContext);
  const spinnerON = useTcStore(state => state.spinnerON);
  const spinnerOFF = useTcStore(state => state.spinnerOFF);

  const [data, setData] = useState([]);
  const showColumns = {
    'id': false,
    'actions': false,
    'latitude': false,
    'longitude': false
  };

  const fetchData = () => {
    spinnerON();
    fetch(url)
      .then(response => {
        if (response.status === 200)
          return response.json()
      })
      .then(responseData => { 
        setData(flattenData(responseData, appData));
        spinnerOFF();
      })
      .catch(error => {
        spinnerOFF();
        console.log(error);
      });
  };

  useEffect(()=>{
    fetchData();
  }, [url, appData]);

  useEffect(()=> {console.info('data: ', data);}, [data]);

  function onRowSelect(row) {
    navigate(`/details-POI/${row.id}`);
  }

  return (
    <div>
      {data.length > 0 ?
        <PoiTable {...{ data, showColumns, onRowSelect }} /> :
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
