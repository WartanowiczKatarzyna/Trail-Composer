import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Label, Col, Row, Container } from 'reactstrap';
import { useMsal, useAccount, useIsAuthenticated } from "@azure/msal-react";
import PropTypes from 'prop-types';
import styles from './PoiListPage.module.css';

import { PoiTable } from '../../components/tables/PoiTable/PoiTable.tsx';
import { moveUp, moveDown } from '../../components/tables/moveRow.js';

import App, { AppContext } from '../../App.js';

import { makeData } from "../../components/tables/PoiTable/makeData.ts";

const PoiListPage = () => {
  const appData = useContext(AppContext);
  const { instance: pca, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});

  const navigate = useNavigate();
  const rowNumFaker = useRef(10);

  function flattenData(freshData){
    return freshData.map(row => {
      return {
        id: row.id,
        name: row.name,
        username: row.username,
        longitude: row.longitude,
        latitude: row.latitude,
        countryId: row.countryId,
        subRows: row.subRows,
        country: appData?.CountryNamesMap?.get(row.countryId) || 'nieznany',
        poiTypeIds: row.poiTypeIds,
        poiTypes: row.poiTypeIds.map(poiTypeId => appData?.PoiTypesMap?.get(poiTypeId) || 'nieznany').join(', ')
      };
    });
  };

  const [data, setData] = React.useState(() => flattenData(makeData(rowNumFaker.current)));
  const refreshData = () => setData(() => flattenData(makeData(rowNumFaker.current)));
  const rerender = React.useReducer(() => ({}), {})[1];
  const hiddenColumns = {
    'id': false
  }

  useEffect(() => {

  }, []);

  useEffect(() => {
    console.log(appData);
    console.log(appData?.POITypes);
    console.log(appData?.Countries);
    setData(() => flattenData(makeData(rowNumFaker.current)));
  }, [appData]);

  
  function onMoveUp(row) {
    moveUp(data, row);
    setData(() => [...data]);
  }

  function onMoveDown(row) {
    moveDown(data, row);
    setData(() => [...data]);
  }

  const fetchData = () => {
  }

  function onDelete(row) {
    console.info("click onDelete", row);
  }
  function onEdit(row) {
    console.info("click onEdit", row);
  }
  function onRowSelect(row) {
    console.info("click onRowSelect", row);
  }

  useEffect(() => {
  }, []);
  
  return (
    <>
      <PoiTable {...{data, onDelete, onEdit, onRowSelect, onMoveUp, onMoveDown, hiddenColumns}}/>
      <hr/>
      <div>
        <button onClick={() => rerender()}>Force Rerender</button>
      </div>
      <div>
        <button onClick={() => refreshData()}>Refresh Data</button>
      </div>
    </>
)
  ;
};

PoiListPage.propTypes = {};

PoiListPage.defaultProps = {};

export default PoiListPage;
