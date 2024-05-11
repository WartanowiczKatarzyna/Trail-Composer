import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMsal, useAccount, useIsAuthenticated } from "@azure/msal-react";
import styles from './UserPoiListPage.module.css';

import { SegmentTable } from '../../../components/tables/SegmentTable/SegmentTable.tsx';
import { flattenData } from '../../../components/tables/SegmentTable/flattenData.js';
import TcSpinner from '../../../components/TCSpinner/TCSpinner.js';

import { getAuthHeader } from '../../../utils/auth/getAuthHeader.js';
import { useTcStore } from "../../../store/TcStore";
import SectionTitle from "../../../components/SectionTitle/SectionTitle";

const UserSegmentListPage = () => {

  const CountryNamesMap = useTcStore(state => state.CountryNamesMap);
  const pathTypes = useTcStore(state => state.pathTypes);
  const pathLevels = useTcStore(state => state.pathLevels);
  const spinnerON = useTcStore(state => state.spinnerON);
  const spinnerOFF = useTcStore(state => state.spinnerOFF);

  const { instance: pca, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});

  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const refreshSegmentUserFiltered = useTcStore((state) => state.refreshSegmentUserFiltered);

  const showColumns = {
    'id': false,
  }

  const fetchData = async () => {
    spinnerON();
    const authorizationHeader = await getAuthHeader(pca, account);
    fetch(`tc-api/segment/list/user`,
      {
        method: "GET",
        headers: {
          Authorization: authorizationHeader
        }
      })
      .then(response => {
        if (response.status === 200)
          return response.json()
        else {
          spinnerOFF();
          navigate('/error/page-not-found');
        }
      })
      .then(data => {
        setData(flattenData(data, CountryNamesMap, pathTypes, pathLevels));
        spinnerOFF();
      })
      .catch(error => {
        spinnerOFF();
        console.log(error);
        navigate(-1);
      });
  }

  useEffect(() => {
    if(Array.from(CountryNamesMap).length && pathTypes.length &&  pathLevels.length) {
      fetchData();
    }
  }, [pca, account, CountryNamesMap, pathTypes, pathLevels]);
  
  async function onDelete(row) {
    const authorizationHeader = await getAuthHeader(pca, account);
    
    fetch(`tc-api/segment/${row.id}`, {
      method: "DELETE",
      headers: {
        Authorization: authorizationHeader
      }})
      .then(response => {
        console.log(response.status);
        fetchData();
        refreshSegmentUserFiltered(pca, account);
      })
      .catch(error => {
        console.error('Error deleting Segment:', error);
      });
  }
  function onEdit(row) {
    navigate(`/edit-segment/${row.id}`);
  }
  function onRowSelect(row) {
    navigate(`/details-segment/${row.id}`);
  }

  return (
    data ?
      <>
        <div className="ms-4"><SectionTitle>Moje Odcinki</SectionTitle></div>
        <SegmentTable {...{data, onDelete, onEdit, onRowSelect, showColumns}} />
      </>
      : <TcSpinner />
    );
};

export default UserSegmentListPage;
