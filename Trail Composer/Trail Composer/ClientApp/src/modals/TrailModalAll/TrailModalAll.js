import React, { useState, useContext, useEffect, useRef } from 'react';
import { Col, Row, Container, Modal, ModalHeader, ModalBody, Badge } from 'reactstrap';
import PropTypes from 'prop-types';
import styles from './TrailModalAll.module.css';

import { AppContext } from '../../App.js';

import GeoSearch from '../../components/GeoSearch/GeoSearch.js';
import { TrailTable } from '../../components/tables/TrailTable/TrailTable.tsx';
import TcSpinner from '../../components/TCSpinner/TCSpinner.js';
import { useTcStore } from '../../store/TcStore.js';

const TrailModalAll = ({ isOpen, toggle, onRowSelect }) => {
  const appData = useContext(AppContext);

  const defaultTooManyMsg = useRef('Nie wszystkie dane zostały wczytane, zalecamy zawężenie zakresu wyszukiwania.');

  const [showTcSpinner, setShowTcSpinner] = useState(false);
  const showColumns = {
    'id': false,
    'actions': false
  };

  const allData = useTcStore((state) => state.TrailAllFiltered);
  const allSelectedCountries = useTcStore((state) => state.TrailAllFilteredSelectedCountries);
  const allMinLatitude = useTcStore((state) => state.TrailAllFilteredMinLatitude);
  const allMaxLatitude = useTcStore((state) => state.TrailAllFilteredMaxLatitude);
  const allMinLongitude = useTcStore((state) => state.TrailAllFilteredMinLongitude);
  const allMaxLongitude = useTcStore((state) => state.TrailAllFilteredMaxLongitude);
  const afterAllSearch = useTcStore((state) => state.TrailAllAfterSearch);
  const [newAllTrailListFlag, setNewAllTrailListFlag] = useState(false);
  const [allTooManyResultsMsg, setAllTooManyResultsMsg] = useState('');

  const fetchAllData = useTcStore((state) => state.fetchTrailAllFiltered);

  /**
   * change flag used to inform geoSearch that there's new userData
   * and check if they need to be informed about reaching search limit
   */
  useEffect(() => {
    setNewAllTrailListFlag((s) => !s);
    if (allData.length < 1000) {
      setAllTooManyResultsMsg('');
    } else {
      setAllTooManyResultsMsg(defaultTooManyMsg.current);
    }
    setShowTcSpinner(false);
  }, [allData]);

  /**
   * function passed to GeoSearch used to get the desired Trails created by all users
   * @param {*} selectedCountries 
   * @param {*} minLatitude 
   * @param {*} maxLatitude 
   * @param {*} minLongitude 
   * @param {*} maxLongitude 
   */
  const searchAllTrail = (selectedCountries, minLatitude, maxLatitude, minLongitude, maxLongitude) => {
    setShowTcSpinner(true);
    fetchAllData(selectedCountries, minLatitude, maxLatitude, minLongitude, maxLongitude, appData);
  };

  return (
    <>
      {showTcSpinner && <TcSpinner/>}
      <Modal isOpen={isOpen} toggle={toggle} fullscreen fade >
        <ModalHeader toggle={toggle} className={styles.ModalHeader}>Szukanie tras</ModalHeader>
        <ModalBody className={styles.ModalBody}>
          <Container fluid className={`${styles.Container}`}>
            <Row fluid noGutters>
              <Col md="3" xl="2" fluid>
                  <GeoSearch
                    selectedCountries={allSelectedCountries}
                    minLatitude={allMinLatitude}
                    maxLatitude={allMaxLatitude}
                    minLongitude={allMinLongitude}
                    maxLongitude={allMaxLongitude}
                    newDataFlag={newAllTrailListFlag}
                    tooManyResultsMsg={allTooManyResultsMsg}
                    search={searchAllTrail}
                    afterSearch={afterAllSearch}
                  />
              </Col>
              <Col md="9" xl="10" fluid>
                <div className={styles.TableContainer}>
                  { allData.length > 0 ?
                    <TrailTable {...{onRowSelect, showColumns}} data={allData}/> :
                    <Badge className={styles.Badge}>Brak danych</Badge>
                  }
                </div>
              </Col>
            </Row>
          </Container>
        </ModalBody>
      </Modal>
    </>
)
  ;
};

TrailModalAll.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  onRowSelect: PropTypes.func.isRequired

};

TrailModalAll.defaultProps = {
  isOpen: false,
  toggle: ()=>{},
  onRowSelect: ()=>{}
};

export default TrailModalAll;
