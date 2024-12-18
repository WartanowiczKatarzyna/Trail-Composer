import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Label, Col, Row, Container } from 'reactstrap';
import { useMsal, useAccount, useIsAuthenticated } from "@azure/msal-react";
import PropTypes from 'prop-types';
import styles from './UserPoiListPage.module.css';

import { PoiTable } from '../../../components/tables/PoiTable/PoiTable.tsx';
import { flattenData } from '../../../components/tables/PoiTable/flattenData.js';
import TcSpinner from '../../../components/TCSpinner/TCSpinner.js';

import { AppContext } from '../../../App.js';
import { getAuthHeader } from '../../../utils/auth/getAuthHeader.js';
import {useTcStore} from "../../../store/TcStore";
import SectionTitle from "../../../components/SectionTitle/SectionTitle";

const UserPoiListPage = () => {
  const appData = useContext(AppContext);
  const { instance: pca, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});

  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const refreshPoiUserFiltered = useTcStore((state) => state.refreshPoiUserFiltered);

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

  const showColumns = {
    'id': false,
    'username': false
  }

  useEffect(() => {
    fetchData();
  }, [account, appData]);
  
  async function onDelete(row) {
    const authorizationHeader = await getAuthHeader(pca, account);
    
    fetch(`tc-api/poi/${row.id}`, {
      method: "DELETE",
      headers: {
        Authorization: authorizationHeader
      }})
      .then(response => {
        console.log(response.status);
        fetchData();
        refreshPoiUserFiltered(pca, account, appData);
      })
      .catch(error => {
        console.error('Error deleting POI:', error);
      });
  }
  function onEdit(row) {
    navigate(`/edit-POI/${row.id}`);
  }
  function onRowSelect(row) {
    navigate(`/details-POI/${row.id}`);
  }

  useEffect(() => {
  }, []);
  
  return (
    data ?
      <>
        <div className="ms-4"><SectionTitle>Moje POI</SectionTitle></div>
        <PoiTable {...{data, onDelete, onEdit, onRowSelect, showColumns}} />
      </>
      : <TcSpinner />
    );
};

UserPoiListPage.propTypes = {};

UserPoiListPage.defaultProps = {};

export default UserPoiListPage;
