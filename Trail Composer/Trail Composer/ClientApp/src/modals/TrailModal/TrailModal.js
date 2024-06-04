import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Col, Row, Container, Modal, ModalHeader, ModalBody, Nav, NavItem, NavLink, TabContent, TabPane, Badge } from 'reactstrap';
import { useMsal, useAccount, useIsAuthenticated } from "@azure/msal-react";
import PropTypes from 'prop-types';
import styles from './TrailModal.module.css';

import { AppContext } from '../../App.js';

import GeoSearch from '../../components/GeoSearch/GeoSearch.js';
import { TrailTable } from '../../components/tables/TrailTable/TrailTable.tsx';
import TcSpinner from '../../components/TCSpinner/TCSpinner.js';
import { useTcStore } from '../../store/TcStore.js';

const TrailModal = ({ isOpen, toggle, onRowSelect }) => {
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

// needed for 'user' tab: contains list of Trails created by the current user
  const userData = useTcStore((state) => state.TrailUserFiltered);
  const userSelectedCountries = useTcStore((state) => state.TrailUserFilteredSelectedCountries);
  const userMinLatitude = useTcStore((state) => state.TrailUserFilteredMinLatitude);
  const userMaxLatitude = useTcStore((state) => state.TrailUserFilteredMaxLatitude);
  const userMinLongitude = useTcStore((state) => state.TrailUserFilteredMinLongitude);
  const userMaxLongitude = useTcStore((state) => state.TrailUserFilteredMaxLongitude);
  const afterUserSearch = useTcStore((state) => state.TrailUserAfterSearch);
  const [newUserTrailListFlag, setNewUserTrailListFlag] = useState(false);
  const [userTooManyResultsMsg, setUserTooManyResultsMsg] = useState('');

  const fetchUserData = useTcStore((state) => state.fetchTrailUserFiltered);

  // needed for 'other' tab: contains list of Trails other than the ones created by the current user
  const otherData = useTcStore((state) => state.TrailOtherFiltered);
  const otherSelectedCountries = useTcStore((state) => state.TrailOtherFilteredSelectedCountries);
  const otherMinLatitude = useTcStore((state) => state.TrailOtherFilteredMinLatitude);
  const otherMaxLatitude = useTcStore((state) => state.TrailOtherFilteredMaxLatitude);
  const otherMinLongitude = useTcStore((state) => state.TrailOtherFilteredMinLongitude);
  const otherMaxLongitude = useTcStore((state) => state.TrailOtherFilteredMaxLongitude);
  const afterOtherSearch = useTcStore((state) => state.TrailOtherAfterSearch);
  const [newOtherTrailListFlag, setNewOtherTrailListFlag] = useState(false);
  const [otherTooManyResultsMsg, setOtherTooManyResultsMsg] = useState('');

  const fetchOtherData = useTcStore((state) => state.fetchTrailOtherFiltered);
  /**
   * change flag used to inform geoSearch that there's new userData
   * and check if they need to be informed about reaching search limit
   */
  useEffect(() => {
    setNewUserTrailListFlag((s) => !s);
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
    setNewOtherTrailListFlag((s) => !s);
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
   * function passed to GeoSearch used to get the desired Trails created by the current user
   * @param {*} selectedCountries 
   * @param {*} minLatitude 
   * @param {*} maxLatitude 
   * @param {*} minLongitude 
   * @param {*} maxLongitude 
   */
  const searchUserTrail = (selectedCountries, minLatitude, maxLatitude, minLongitude, maxLongitude) => {
    setShowTcSpinner(true);
    fetchUserData(selectedCountries, minLatitude, maxLatitude, minLongitude, maxLongitude, pca, account, appData);
  };

  /**
   * function passed to GeoSearch used to get the desired Trails not created by the current user
   * @param {*} selectedCountries 
   * @param {*} minLatitude 
   * @param {*} maxLatitude 
   * @param {*} minLongitude 
   * @param {*} maxLongitude 
   */
  const searchOtherTrail = (selectedCountries, minLatitude, maxLatitude, minLongitude, maxLongitude) => {
    setShowTcSpinner(true);
    fetchOtherData(selectedCountries, minLatitude, maxLatitude, minLongitude, maxLongitude, pca, account, appData);
  };

  return (
    <>
      {showTcSpinner && <TcSpinner/>}
      <Modal isOpen={isOpen} toggle={toggle} fullscreen fade >
        <ModalHeader toggle={toggle} className={styles.ModalHeader}>Szukanie tras</ModalHeader>
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
                      newDataFlag={newUserTrailListFlag}
                      tooManyResultsMsg={userTooManyResultsMsg}
                      search={searchUserTrail}
                      afterSearch={afterUserSearch}
                    />
                  </Col>
                  <Col md="9" xl="10" fluid>
                    <div className={styles.TableContainer}>
                      { userData.length > 0 ?
                        <TrailTable {...{onRowSelect, showColumns}} data={userData}/> :
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
                      newDataFlag={newOtherTrailListFlag}
                      tooManyResultsMsg={otherTooManyResultsMsg}
                      search={searchOtherTrail}
                      afterSearch={afterOtherSearch}
                    />
                  </Col>
                  <Col md="9" xl="10" fluid>
                    <div className={styles.TableContainer}>
                      {otherData.length > 0 ?
                        <TrailTable {...{onRowSelect, showColumns}} data={otherData}/> :
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

TrailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  onRowSelect: PropTypes.func.isRequired

};

TrailModal.defaultProps = {
  isOpen: false,
  toggle: ()=>{},
  onRowSelect: ()=>{}
};

export default TrailModal;
