import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Col,
  Row,
  Container,
  Modal,
  ModalHeader,
  ModalBody,
  Nav,
  NavItem,
  NavLink,
  TabContent, TabPane, Button
} from 'reactstrap';
import { useMsal, useAccount, useIsAuthenticated } from "@azure/msal-react";
import PropTypes from 'prop-types';
import styles from './PoiModal.module.css';

import { AppContext } from '../../App.js';

import { makeData } from '../../components/tables/PoiTable/makeData.ts'; 
import GeoSearch from '../../components/GeoSearch/GeoSearch.js';
import { PoiTable } from '../../components/tables/PoiTable/PoiTable.tsx';
import { flattenData } from '../../components/tables/PoiTable/flattenData.js';
import { getAuthHeader } from '../../utils/auth/getAuthHeader.js';
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

  const [data, setData] = React.useState(() => flattenData(makeData(rowNumFaker.current), appData));
  const [showTcSpinner, setShowTcSpinner] = useState(false);

  const userData = useTcStore((state) => state.poiUserFiltered);
  const userSelectedCountries = useTcStore((state) => state.poiUserFilteredSelectedCountries);
  const userMinLatitude = useTcStore((state) => state.poiUserFilteredMinLatitude);
  const userMaxLatitude = useTcStore((state) => state.poiUserFilteredMaxLatitude);
  const userMinLongitude = useTcStore((state) => state.poiUserFilteredMinLongitude);
  const userMaxLongitude = useTcStore((state) => state.poiUserFilteredMaxLongitude);

  const otherData = useTcStore((state) => state.poiOtherFiltered);

  const saveUserGeoSearchOptions = useTcStore((state) => state.savePoiUserGeoSearchOptions);
  const saveOtherGeoSearchOptions = useTcStore((state) => state.savePoiOtherGeoSearchOptions);
  const fetchUserData = useTcStore((state) => state.fetchPoiUserFiltered);
  const fetchOtherData = useTcStore((state) => state.fetchPoiOtherFiltered);
  
  const refreshData = () => setData(() => flattenData(makeData(rowNumFaker.current), appData));
  const rerender = React.useReducer(() => ({}), {})[1];
  const showColumns = {
    'id': false
  };
  
  useEffect(() => {
    setShowTcSpinner(false);
  }, [userData, otherData]);

  useEffect(() => {
    console.log(appData);
    console.log(appData?.POITypes);
    console.log(appData?.Countries);
    setData(() => flattenData(makeData(rowNumFaker.current), appData));
  }, [appData]);

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
      <Modal isOpen={isOpen} toggle={toggle} onClosed={saveUserGeoSearchOptions} fullscreen>
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
            <TabPane tabId="user" className="p-4">
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
                      search={searchUserPoi}
                    />
                  </Col>
                  <Col md="9" xl="10" fluid className={styles.ContentContainer}>
                    {userData.length>0 && <PoiTable {...{onRowSelect, showColumns}} data={userData}/>}
                  </Col>
                </Row>
              </Container>
            </TabPane>
            <TabPane tabId="other">
              <Container fluid className="p-4">
                <Row fluid noGutters>
                  <Col md="3" xl="2" fluid className={styles.MenuContainer}>
                    <GeoSearch
                      selectedCountries={[]} 
                      minLatitude={2} 
                      maxLatitude={2} 
                      minLongitude={2} 
                      maxLongitude={2} 
                      newDataFlag={newOtherPoiListFlag} 
                      search={searchOtherPoi}
                    />
                  </Col>
                  <Col md="9" xl="10" fluid className={styles.ContentContainer}>
                    {otherData.length>0 && <PoiTable {...{ onRowSelect, showColumns}} data={otherData}/>}
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
