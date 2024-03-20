import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Label, Col, Row, Container } from 'reactstrap';
import { useMsal, useAccount, useIsAuthenticated } from "@azure/msal-react";
import PropTypes from 'prop-types';
import styles from './UserPoiListPage.module.css';

import { PoiTable } from '../../../components/tables/PoiTable/PoiTable.tsx';
import { moveUp, moveDown } from '../../../components/tables/moveRow.js';

import App, { AppContext } from '../../../App.js';

import { makeData } from "../../../components/tables/PoiTable/makeData.ts";

const UserPoiListPage = () => {
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

  const fetchData = async () => {
    var request = {
      account: account,
      scopes:['openid', 'offline_access', pca.getConfiguration().auth.clientId]
    }
    var response = await pca.acquireTokenSilent(request);
    const authorizationHeader = `Bearer ${response.accessToken}`;

    fetch(`tc-api/poi/list/user`,
      {
        method: "GET",
        headers: {
          Authorization: authorizationHeader
        }
      })
      .then(response => {
        if (response.status)
          return response.json()
        else
          navigate('/error/page-not-found');
      })
      .then(data => {
        console.log(data);
        setData(flattenData(data));
      })
      .catch(error => {
        console.log(error);
        navigate('/');
      });
  }

  const [data, setData] = React.useState(() => flattenData(makeData(rowNumFaker.current)));
  const refreshData = () => setData(() => flattenData(makeData(rowNumFaker.current)));
  const rerender = React.useReducer(() => ({}), {})[1];
  const showColumns = {
    'id': false,
    'username': false
  }

  useEffect(() => {
    fetchData();
  }, [account, appData]);

  useEffect(() => {
    console.log(appData);
    console.log(appData?.POITypes);
    console.log(appData?.Countries);
    setData(() => flattenData(makeData(rowNumFaker.current)));
  }, [appData]);
  
  function onDelete(row) {
    var request = {
      account: account,
      scopes:['openid', 'offline_access', pca.getConfiguration().auth.clientId]
    }
    var response = pca.acquireTokenSilent(request);
    const authorizationHeader = `Bearer ${response.accessToken}`;

    fetch(`tc-api/poi/${row.id}`, {
      method: "DELETE",
      headers: {
        Authorization: authorizationHeader
      }})
      .then(response => {
        console.log(response.status);
        navigate("/");
      })
      .catch(error => {
        console.error('Error deleting POI:', error);
      });
  }
  function onEdit(row) {
    navigate(`/edit-POI/${row.id}`);
  }
  //przerobić POI details na modal
  function onRowSelect(row) {
    navigate(`/details-POI/${row.id}`);
  }

  useEffect(() => {
  }, []);
  
  return (<PoiTable {...{data, onDelete, onEdit, onRowSelect, showColumns}} />);
};

UserPoiListPage.propTypes = {};

UserPoiListPage.defaultProps = {};

export default UserPoiListPage;
