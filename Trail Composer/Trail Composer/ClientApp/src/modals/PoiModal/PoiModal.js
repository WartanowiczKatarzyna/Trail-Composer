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
  TabContent, TabPane
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

const PoiModal = ({ isOpen, toggle, onRowSelect }) => {
  const appData = useContext(AppContext);
  const { instance: pca, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});

  const navigate = useNavigate();
  const rowNumFaker = useRef(1000);

  const [activeTab, setActiveTab] = useState('user');

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

  const [data, setData] = React.useState(() => flattenData(makeData(rowNumFaker.current), appData));
  const refreshData = () => setData(() => flattenData(makeData(rowNumFaker.current), appData));
  const rerender = React.useReducer(() => ({}), {})[1];
  const showColumns = {
    'id': false
  }

  useEffect(() => {
    //fetchData();
  }, [account, appData]);

  useEffect(() => {
    console.log(appData);
    console.log(appData?.POITypes);
    console.log(appData?.Countries);
    setData(() => flattenData(makeData(rowNumFaker.current), appData));
  }, [appData]);

  const toggleTab = tab => {
    if(activeTab !== tab) setActiveTab(tab);
  }

  return (
    <>
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
                      //selectedCountries={[{id: 30, name: 'Portugalia'}]} 
                      //minLatitude={1} 
                      //maxLatitude={1} 
                      //minLongitude={1} 
                      //maxLongitude={1} 
                      //newDataFlag={1} 
                      //search={()=>{}}
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
                      newDataFlag={2} 
                      search={()=>{}}
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
