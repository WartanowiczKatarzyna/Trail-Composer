import React, {useRef, useState} from 'react';
import PropTypes from 'prop-types';
import styles from './Header.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Link, useNavigate} from 'react-router-dom';
import { Navbar, NavbarBrand, Nav, NavLink, Button } from 'reactstrap';
import { AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";

import Logo from "../../assets/trails-composer-logo.png";
import { AzureADB2CButtons } from '../../components/AzureADB2CButtons/AzureADB2CButtons';
import TrailModal from "../../modals/TrailModal/TrailModal";
import TrailModalAll from "../../modals/TrailModalAll/TrailModalAll";

const Header = () => {
  const [trailModal, setTrailModal] = useState(false);
  const blockClicks = useRef(false);
  const navigate = useNavigate();

  const toggleTrailModal = () => setTrailModal(p => (!p));

  const onRowSelect = (row) => {
    if(blockClicks.current) return;
    blockClicks.current = true
    setTimeout(() => {
      blockClicks.current = false;
    }, 500);

    navigate(`/details-trail/${row.id}`);
    setTrailModal(false);
  };

  return (
    <>
      <AuthenticatedTemplate>
        <TrailModal isOpen={trailModal} toggle={toggleTrailModal} onRowSelect={onRowSelect} />
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <TrailModalAll isOpen={trailModal} toggle={toggleTrailModal} onRowSelect={onRowSelect} />
      </UnauthenticatedTemplate>
      <Navbar light expand="md" fixed="top" className={styles.header}>

        <Nav className="flex-row" navbar>
          <NavbarBrand href="/">
            <img
              src={Logo}
              alt="Logo"
              width="35"
              height="35"
            />
          </NavbarBrand>
          <NavLink tag={Link} className="text-dark">
            <Button size="sm" onClick={toggleTrailModal}>Znajdź trasy</Button>
          </NavLink>
        </Nav>

        <AzureADB2CButtons />

      </Navbar>
    </>

  );
};

Header.propTypes = {};

Header.defaultProps = {};

export default Header;
