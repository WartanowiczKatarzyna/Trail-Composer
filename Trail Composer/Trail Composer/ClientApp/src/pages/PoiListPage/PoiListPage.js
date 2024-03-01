import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Label, Col, Row, Container } from 'reactstrap';
import { useMsal, useAccount, useIsAuthenticated } from "@azure/msal-react";
import PropTypes from 'prop-types';
import styles from './PoiListPage.module.css';

import { PoiTable } from '../../components/tables/PoiTable/PoiTable.tsx';

import App, { AppContext } from '../../App.js';

const PoiListPage = () => {
  const appData = useContext(AppContext);
  const { instance: pca, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});

  const navigate = useNavigate();

  const fetchData = () => {
  }

  useEffect(() => {
  }, []);
  
  return (
    <PoiTable />
  );
};

PoiListPage.propTypes = {};

PoiListPage.defaultProps = {};

export default PoiListPage;
