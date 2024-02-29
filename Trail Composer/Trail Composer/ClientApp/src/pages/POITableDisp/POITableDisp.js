import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Label, Col, Row, Container } from 'reactstrap';
import { useMsal, useAccount, useIsAuthenticated } from "@azure/msal-react";
import PropTypes from 'prop-types';
import styles from './POITableDisp.module.css';

import { TableGrid } from '../../tanstack/tableGrid.tsx';

import App, { AppContext } from '../../App.js';

const PoiTableDisp = () => {
  const appData = useContext(AppContext);
  const { instance: pca, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});

  const navigate = useNavigate();

  const fetchData = () => {
  }

  useEffect(() => {
  }, []);
  
  return (
    <TableGrid />
  );
};

PoiTableDisp.propTypes = {};

PoiTableDisp.defaultProps = {};

export default PoiTableDisp;
