import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { SegmentTable } from '../../../components/tables/SegmentTable/SegmentTable.tsx';
import { flattenData } from '../../../components/tables/SegmentTable/flattenData.js';
import TcSpinner from '../../../components/TCSpinner/TCSpinner.js';

import { useTcStore } from "../../../store/TcStore";
import SectionTitle from "../../../components/SectionTitle/SectionTitle";

const TrailSegmentListPage = () => {
  const {trailId} = useParams();
  const CountryNamesMap = useTcStore(state => state.CountryNamesMap);
  const pathTypes = useTcStore(state => state.pathTypes);
  const pathLevels = useTcStore(state => state.pathLevels);
  const spinnerON = useTcStore(state => state.spinnerON);
  const spinnerOFF = useTcStore(state => state.spinnerOFF);

  const navigate = useNavigate();

  const [data, setData] = useState(null);

  const showColumns = {
    'id': false,
    'actions': false,
  }

  const fetchData = async () => {
    spinnerON();
    fetch(`tc-api/segment/list/trail/${trailId}`)
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
  }, [CountryNamesMap, pathTypes, pathLevels]);
  
  function onRowSelect(row) {
    navigate(`/details-segment/${row.id}`);
  }

  return (
    data ?
      <>
        <div className="ms-4"><SectionTitle>Lista odcinków trasy</SectionTitle></div>
        <SegmentTable {...{data, onRowSelect, showColumns}} />
      </>
      : <TcSpinner />
    );
};

export default TrailSegmentListPage;
