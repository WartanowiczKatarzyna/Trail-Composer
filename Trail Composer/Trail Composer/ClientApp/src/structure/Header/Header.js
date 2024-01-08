import React from 'react';
import PropTypes from 'prop-types';
import styles from './Header.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import { Navbar, NavbarBrand, Nav, NavLink, Button } from 'reactstrap';

import Logo from "../../assets/trails-composer-logo.png";

//2nd navbar will change depending if the user is logged in or not
const Header = () => (
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
        <Button size="sm">Konto</Button>
      </NavLink>
      <NavLink tag={Link} className="text-dark" to="/">
        <Button size="sm">Wyloguj</Button>
      </NavLink>
    </Nav>

  </Navbar>
);

Header.propTypes = {};

Header.defaultProps = {};

export default Header;
