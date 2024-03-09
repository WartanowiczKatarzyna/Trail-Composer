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

  function onDelete(row) {
    console.info("click onDelete", row);
  }
  function onEdit(row) {
    console.info("click onEdit", row);
  }
  function onRowSelect(row) {
    console.info("click onRowSelect", row);
  }

  useEffect(() => {
  }, []);
  
  return (
    <PoiTable {...{onDelete, onEdit, onRowSelect}}/>
  );
};

PoiListPage.propTypes = {};

PoiListPage.defaultProps = {};

export default PoiListPage;
