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

  const fetchData = async () => {
    const authorizationHeader = await getAuthHeader(pca, account);

    fetch(`tc-api/poi/list/filtered`,
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
        navigate('/');
      });
  }
  
  const refreshData = () => setData(() => flattenData(makeData(rowNumFaker.current), appData));
  const rerender = React.useReducer(() => ({}), {})[1];
  const showColumns = {
    'id': false
  };
  
  useEffect(() => {
    setTimeout(()=>{
      setNewUserPoiListFlag(true);
    }, 30000);
  },[])
  
  useEffect(() => {
    setShowTcSpinner(false);
  }, [newUserPoiListFlag, newOtherPoiListFlag]);

  useEffect(() => {
    console.log(appData);
    console.log(appData?.POITypes);
    console.log(appData?.Countries);
    setData(() => flattenData(makeData(rowNumFaker.current), appData));
  }, [appData]);

  const toggleTab = tab => {
    if(activeTab !== tab) setActiveTab(tab);
  }

  const searchUserPoi = (selectedCountries, minLatitude, maxLatitude, minLongitude, maxLongitude) => {
    console.info('searchUserPoi');
    console.info('selectedCountries: ', selectedCountries);
    console.info('minLatitude: ', minLatitude);
    console.info('maxLatitude: ', maxLatitude);
    console.info('minLongitude: ', minLongitude);
    console.info('maxLongitude: ', maxLongitude);

    setShowTcSpinner(true);
  }

  const searchOtherPoi = (selectedCountries, minLatitude, maxLatitude, minLongitude, maxLongitude) => {
    console.info('searchOtherPoi');
    console.info('selectedCountries: ', selectedCountries);
    console.info('minLatitude: ', minLatitude);
    console.info('maxLatitude: ', maxLatitude);
    console.info('minLongitude: ', minLongitude);
    console.info('maxLongitude: ', maxLongitude);

    setShowTcSpinner(true);
  }

  return (
    <>
      {showTcSpinner && <TcSpinner/>}
      <Modal isOpen={isOpen} toggle={toggle} fullscreen>
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
                      selectedCountries={[{id: 28, name: 'Portugalia'}]} 
                      minLatitude={1} 
                      maxLatitude={1} 
                      minLongitude={1} 
                      maxLongitude={1} 
                      newDataFlag={newUserPoiListFlag} 
                      search={searchUserPoi}
                    />
                  </Col>
                  <Col md="9" xl="10" fluid className={styles.ContentContainer}>
                    <PoiTable {...{data, onRowSelect, showColumns}}/>
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
                    <PoiTable {...{data, onRowSelect, showColumns}}/>
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
