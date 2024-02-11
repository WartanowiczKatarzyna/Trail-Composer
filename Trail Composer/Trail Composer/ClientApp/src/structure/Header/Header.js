import React from 'react';
import PropTypes from 'prop-types';
import styles from './Header.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import { Navbar, NavbarBrand, Nav, NavLink, Button } from 'reactstrap';
import { useIsAuthenticated, useMsalAuthentication } from "@azure/msal-react";
import { InteractionType } from '@azure/msal-browser';

import Logo from "../../assets/trails-composer-logo.png";
import { LoginButton } from './LoginButton';

//2nd navbar will change depending if the user is logged in or not
const Header = () => {
  const isAuthenticated = useIsAuthenticated();
  //const {login, result, error} = useMsalAuthentication(InteractionType.Popup);

  return (
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
        <NavLink tag={Link} className="text-dark" to="/">
          <Button size="sm">Znajdź trasy</Button>
        </NavLink>
      </Nav>

      <Nav className="flex-row" navbar>
        <NavLink tag={Link} className="text-dark" to="/">
          <Button size="sm">{isAuthenticated ? 'Konto' : 'Utwórz konto'}</Button>
        </NavLink>
        <NavLink tag={Link} className="text-dark" to="/">
          <LoginButton />
        </NavLink>
      </Nav>

    </Navbar>
  );
};

Header.propTypes = {};

Header.defaultProps = {};

export default Header;
