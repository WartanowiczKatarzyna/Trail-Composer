import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Col, Row, Container, Modal, ModalHeader, ModalBody, Nav, NavItem, NavLink, TabContent, TabPane, Badge } from 'reactstrap';
import { useMsal, useAccount, useIsAuthenticated } from "@azure/msal-react";
import PropTypes from 'prop-types';
import styles from './SegmentModal.module.css';

import { AppContext } from '../../App.js';

import GeoSearch from '../../components/GeoSearch/GeoSearch.js';
import { PoiTable } from '../../components/tables/PoiTable/PoiTable.tsx';
import TcSpinner from '../../components/TCSpinner/TCSpinner.js';
import { useTcStore } from '../../store/TcStore.js';

const SegmentModal = ({ isOpen, toggle, onRowSelect }) => {
  const appData = useContext(AppContext);
  const { instance: pca, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});

  const defaultTooManyMsg = useRef('Nie wszystkie dane zostały wczytane, zalecamy zawężenie zakresu wyszukiwania.');

  const [activeTab, setActiveTab] = useState('user');
  const [showTcSpinner, setShowTcSpinner] = useState(false);
  const showColumns = {
    'id': false,
    'actions': false
  };

// needed for 'user' tab: contains list of poi created by the current user
  const userData = useTcStore((state) => state.poiUserFiltered);
  const userSelectedCountries = useTcStore((state) => state.poiUserFilteredSelectedCountries);
  const userMinLatitude = useTcStore((state) => state.poiUserFilteredMinLatitude);
  const userMaxLatitude = useTcStore((state) => state.poiUserFilteredMaxLatitude);
  const userMinLongitude = useTcStore((state) => state.poiUserFilteredMinLongitude);
  const userMaxLongitude = useTcStore((state) => state.poiUserFilteredMaxLongitude);
  const afterUserSearch = useTcStore((state) => state.poiUserAfterSearch);
  const [newUserPoiListFlag, setNewUserPoiListFlag] = useState(false);
  const [userTooManyResultsMsg, setUserTooManyResultsMsg] = useState('');

  const fetchUserData = useTcStore((state) => state.fetchPoiUserFiltered);

  // needed for 'other' tab: contains list of poi other than the ones created by the current user
  const otherData = useTcStore((state) => state.poiOtherFiltered);
  const otherSelectedCountries = useTcStore((state) => state.poiOtherFilteredSelectedCountries);
  const otherMinLatitude = useTcStore((state) => state.poiOtherFilteredMinLatitude);
  const otherMaxLatitude = useTcStore((state) => state.poiOtherFilteredMaxLatitude);
  const otherMinLongitude = useTcStore((state) => state.poiOtherFilteredMinLongitude);
  const otherMaxLongitude = useTcStore((state) => state.poiOtherFilteredMaxLongitude);
  const afterOtherSearch = useTcStore((state) => state.poiOtherAfterSearch);
  const [newOtherPoiListFlag, setNewOtherPoiListFlag] = useState(false);
  const [otherTooManyResultsMsg, setOtherTooManyResultsMsg] = useState('');

  const fetchOtherData = useTcStore((state) => state.fetchPoiOtherFiltered);
  /**
   * change flag used to inform geoSearch that there's new userData
   * and check if they need to be informed about reaching search limit
   */
  useEffect(() => {
    setNewUserPoiListFlag((s) => !s);
    if (userData.length < 1000) {
      setUserTooManyResultsMsg('');
    } else {
      setUserTooManyResultsMsg(defaultTooManyMsg.current);
    }
    setShowTcSpinner(false);
  }, [userData]);

  /**
   * change flag used to inform geoSearch that there's new otherData
   * and check if they need to be informed about reaching search limit
   */
  useEffect(() => {
    setNewOtherPoiListFlag((s) => !s);
    if (userData.length < 1000) {
      setOtherTooManyResultsMsg('');
    } else {
      setOtherTooManyResultsMsg(defaultTooManyMsg.current);
    }
    setShowTcSpinner(false);
  }, [otherData]);

  /**
   * change active tab between 'Moje' and 'Inne'
   * @param {*} tab 
   */
  const toggleTab = tab => {
    if(activeTab !== tab) setActiveTab(tab);
  };

  /**
   * function passed to GeoSearch used to get the desired pois created by the current user
   * @param {*} selectedCountries 
   * @param {*} minLatitude 
   * @param {*} maxLatitude 
   * @param {*} minLongitude 
   * @param {*} maxLongitude 
   */
  const searchUserPoi = (selectedCountries, minLatitude, maxLatitude, minLongitude, maxLongitude) => {
    setShowTcSpinner(true);
    fetchUserData(selectedCountries, minLatitude, maxLatitude, minLongitude, maxLongitude, pca, account, appData);
  };

  /**
   * function passed to GeoSearch used to get the desired pois not created by the current user
   * @param {*} selectedCountries 
   * @param {*} minLatitude 
   * @param {*} maxLatitude 
   * @param {*} minLongitude 
   * @param {*} maxLongitude 
   */
  const searchOtherPoi = (selectedCountries, minLatitude, maxLatitude, minLongitude, maxLongitude) => {
    setShowTcSpinner(true);
    fetchOtherData(selectedCountries, minLatitude, maxLatitude, minLongitude, maxLongitude, pca, account, appData);
  };

  return (
    <>
      {showTcSpinner && <TcSpinner/>}
      <Modal isOpen={isOpen} toggle={toggle} fullscreen fade >
        <ModalHeader toggle={toggle} className={styles.ModalHeader}>Dodawanie odcinków</ModalHeader>
        <ModalBody className={styles.ModalBody}>
          <Nav tabs>
            <NavItem>
              <NavLink
                className={styles.TabNavLink + (activeTab === 'user' ? ' active' : '')}
                onClick={() => toggleTab('user')}
              >
                Moje
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={styles.TabNavLink + (activeTab === 'other' ? ' active' : '')}
                onClick={() => toggleTab('other')}
              >
                Inne
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={activeTab} className={styles.TabContent}>
            <TabPane tabId="user" className="pt-4 pb-3">
              <Container fluid className="pt-0 pb-0 pl-1 pr-1">
                <Row fluid noGutters>
                  <Col md="3" xl="2" fluid className={styles.SearchContainer}>
                    <GeoSearch 
                      selectedCountries={userSelectedCountries} 
                      minLatitude={userMinLatitude} 
                      maxLatitude={userMaxLatitude} 
                      minLongitude={userMinLongitude} 
                      maxLongitude={userMaxLongitude} 
                      newDataFlag={newUserPoiListFlag} 
                      tooManyResultsMsg={userTooManyResultsMsg}
                      search={searchUserPoi}
                      afterSearch={afterUserSearch}
                    />
                  </Col>
                  <Col md="9" xl="10" fluid>
                    <div className={styles.TableContainer}>
                      { userData.length > 0 ?
                        <PoiTable {...{onRowSelect, showColumns}} data={userData}/> :
                        <Badge className={styles.Badge}>Brak danych</Badge>
                      }
                    </div>
                  </Col>
                </Row>
              </Container>
            </TabPane>
            <TabPane tabId="other" className="pt-4 pb-3">
              <Container fluid className="pt-0 pb-0 pl-1 pr-1">
                <Row fluid noGutters>
                  <Col md="3" xl="2" fluid className={styles.SearchContainer}>
                    <GeoSearch
                      selectedCountries={otherSelectedCountries} 
                      minLatitude={otherMinLatitude} 
                      maxLatitude={otherMaxLatitude} 
                      minLongitude={otherMinLongitude} 
                      maxLongitude={otherMaxLongitude} 
                      newDataFlag={newOtherPoiListFlag} 
                      tooManyResultsMsg={otherTooManyResultsMsg}
                      search={searchOtherPoi}
                      afterSearch={afterOtherSearch}
                    />
                  </Col>
                  <Col md="9" xl="10" fluid>
                    <div className={styles.TableContainer}>
                      {otherData.length > 0 ?
                        <PoiTable {...{onRowSelect, showColumns}} data={otherData}/> :
                        <Badge className={styles.Badge}>Brak danych</Badge>
                      }
                    </div>
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

SegmentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  onRowSelect: PropTypes.func.isRequired

};

SegmentModal.defaultProps = {
  isOpen: false,
  toggle: ()=>{},
  onRowSelect: ()=>{}
};

export default SegmentModal;
