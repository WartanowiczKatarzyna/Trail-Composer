import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Label, Col, Row, Container } from 'reactstrap';
import { useMsal, useAccount, useIsAuthenticated } from "@azure/msal-react";
import PropTypes from 'prop-types';
import styles from './UserPoiListPage.module.css';

import { PoiTable } from '../../../components/tables/PoiTable/PoiTable.tsx';
import { flattenData } from '../../../components/tables/PoiTable/flattenData.js';

import { AppContext } from '../../../App.js';

import { makeData } from "../../../components/tables/PoiTable/makeData.ts";
import { getAuthHeader } from '../../../components/auth/getAuthHeader.js';

const UserPoiListPage = () => {
  const appData = useContext(AppContext);
  const { instance: pca, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});

  const navigate = useNavigate();
  const rowNumFaker = useRef(10);

  const fetchData = async () => {
    const authorizationHeader = await getAuthHeader(pca, account);

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
        setData(flattenData(data, appData));
      })
      .catch(error => {
        console.log(error);
        navigate(-1);
      });
  }

  const [data, setData] = React.useState(() => flattenData(makeData(rowNumFaker.current), appData));
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
    setData(() => flattenData(makeData(rowNumFaker.current), appData));
  }, [appData]);
  
  function onDelete(row) {
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
