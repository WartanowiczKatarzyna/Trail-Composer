import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Col, Row, Container, Modal, ModalHeader, ModalBody, Nav, NavItem, NavLink, TabContent, TabPane, Badge } from 'reactstrap';
import { useMsal, useAccount, useIsAuthenticated } from "@azure/msal-react";
import PropTypes from 'prop-types';
import styles from './PoiModal.module.css';

import { AppContext } from '../../App.js';

import GeoSearch from '../../components/GeoSearch/GeoSearch.js';
import { PoiTable } from '../../components/tables/PoiTable/PoiTable.tsx';
import TcSpinner from '../../components/TCSpinner/TCSpinner.js';
import { useTcStore } from '../../store/TcStore.js';

const PoiModal = ({ isOpen, toggle, onRowSelect }) => {    
  const appData = useContext(AppContext);
  const { instance: pca, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});

  const navigate = useNavigate();
  const rowNumFaker = useRef(1000);

  const [activeTab, setActiveTab] = useState('user');

  const [newUserPoiListFlag, setNewUserPoiListFlag] = useState(false);
  const [newOtherPoiListFlag, setNewOtherPoiListFlag] = useState(false);

  const defaultTooManyMsg = useRef('Nie wszystkie dane zostały wczytane, zalecamy zawężenie zakresu wyszukiwania.');
  const [userTooManyResultsMsg, setUserTooManyResultsMsg] = useState('');
  const [otherTooManyResultsMsg, setOtherTooManyResultsMsg] = useState('');

  const [showTcSpinner, setShowTcSpinner] = useState(false);

  const userData = useTcStore((state) => state.poiUserFiltered);
  const userSelectedCountries = useTcStore((state) => state.poiUserFilteredSelectedCountries);
  const userMinLatitude = useTcStore((state) => state.poiUserFilteredMinLatitude);
  const userMaxLatitude = useTcStore((state) => state.poiUserFilteredMaxLatitude);
  const userMinLongitude = useTcStore((state) => state.poiUserFilteredMinLongitude);
  const userMaxLongitude = useTcStore((state) => state.poiUserFilteredMaxLongitude);

  const otherData = useTcStore((state) => state.poiOtherFiltered);

  const fetchUserData = useTcStore((state) => state.fetchPoiUserFiltered);
  const fetchOtherData = useTcStore((state) => state.fetchPoiOtherFiltered);
  
  const showColumns = {
    'id': false
  };

  useEffect(() => {
    setNewUserPoiListFlag((s) => !s);
    if (userData.length < 1000) {
      setUserTooManyResultsMsg('');
    } else {
      setUserTooManyResultsMsg(defaultTooManyMsg.current);
    }
    setShowTcSpinner(false);
  }, [userData]);

  useEffect(() => {
    setNewOtherPoiListFlag((s) => !s);
    if (userData.length < 1000) {
      setOtherTooManyResultsMsg('');
    } else {
      setOtherTooManyResultsMsg(defaultTooManyMsg.current);
    }
    setShowTcSpinner(false);
  }, [otherData]);

  const toggleTab = tab => {
    if(activeTab !== tab) setActiveTab(tab);
  };

  const searchUserPoi = (selectedCountries, minLatitude, maxLatitude, minLongitude, maxLongitude) => {
    console.info('searchUserPoi');
    console.info('selectedCountries: ', selectedCountries);
    console.info('minLatitude: ', minLatitude);
    console.info('maxLatitude: ', maxLatitude);
    console.info('minLongitude: ', minLongitude);
    console.info('maxLongitude: ', maxLongitude);
    console.info('userData: ', userData);

    setShowTcSpinner(true);
    fetchUserData(selectedCountries, minLatitude, maxLatitude, minLongitude, maxLongitude, pca, account, appData);
  };

  const searchOtherPoi = (selectedCountries, minLatitude, maxLatitude, minLongitude, maxLongitude) => {
    console.info('searchOtherPoi');
    console.info('selectedCountries: ', selectedCountries);
    console.info('minLatitude: ', minLatitude);
    console.info('maxLatitude: ', maxLatitude);
    console.info('minLongitude: ', minLongitude);
    console.info('maxLongitude: ', maxLongitude);

    setShowTcSpinner(true);
    fetchOtherData(selectedCountries, minLatitude, maxLatitude, minLongitude, maxLongitude);
  };

  return (
    <>
      {showTcSpinner && <TcSpinner/>}
      <Modal isOpen={isOpen} toggle={toggle} fullscreen fade >
        <ModalHeader toggle={toggle}>Dodawanie POI</ModalHeader>
        <ModalBody>
          <Nav tabs>
            <NavItem>
              <NavLink
                className={ activeTab === 'user' ? 'active' : ''}
                onClick={() => toggleTab('user')}
              >
                Moje
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={ activeTab === 'other' ? 'active' : ''}
                onClick={() => toggleTab('other')}
              >
                Wszystkie
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={activeTab}>
            <TabPane tabId="user" className="pt-4 pb-5">
              <Container fluid className="p-0">
                <Row fluid noGutters>
                  <Col md="3" xl="2" fluid className={styles.MenuContainer}>
                    <GeoSearch 
                      selectedCountries={userSelectedCountries} 
                      minLatitude={userMinLatitude} 
                      maxLatitude={userMaxLatitude} 
                      minLongitude={userMinLongitude} 
                      maxLongitude={userMaxLongitude} 
                      newDataFlag={newUserPoiListFlag} 
                      tooManyResultsMsg={userTooManyResultsMsg}
                      search={searchUserPoi}
                    />
                  </Col>
                  <Col md="9" xl="10" fluid className={styles.ContentContainer}>
                    { userData.length > 0 ?
                      <PoiTable {...{onRowSelect, showColumns}} data={userData}/> :
                      <Badge color="warning" className={styles.Badge}>Brak danych</Badge>
                    }
                  </Col>
                </Row>
              </Container>
            </TabPane>
            <TabPane tabId="other" className="pt-4 pb-5">
              <Container fluid className="p-0">
                <Row fluid noGutters>
                  <Col md="3" xl="2" fluid className={styles.MenuContainer}>
                    <GeoSearch
                      selectedCountries={[]} 
                      minLatitude={2} 
                      maxLatitude={2} 
                      minLongitude={2} 
                      maxLongitude={2} 
                      newDataFlag={newOtherPoiListFlag} 
                      tooManyResultsMsg={otherTooManyResultsMsg}
                      search={searchOtherPoi}
                    />
                  </Col>
                  <Col md="9" xl="10" fluid className={styles.ContentContainer}>
                    { otherData.length > 0 ?
                      <PoiTable {...{onRowSelect, showColumns}} data={userData}/> :
                      <Badge color="warning" className={styles.Badge}>Brak danych</Badge>
                    }
                  </Col>
                </Row>
              </Container>
            </TabPane>
          </TabContent>
        </ModalBody>
      </Modal>
    </>
)
  ;
};

PoiModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  onRowSelect: PropTypes.func.isRequired

};

PoiModal.defaultProps = {
  isOpen: false,
  toggle: ()=>{},
  onRowSelect: ()=>{}
};

export default PoiModal;
