import React from 'react';
import PropTypes from 'prop-types';
import styles from './Footer.module.css';
import { Link } from 'react-router-dom';
import { Navbar, Nav, NavLink } from 'reactstrap';

const Footer = () => (
  <footer>
    <Nav fill>
      <NavLink tag={Link} className={styles.FooterLink} to="/">Kontakt</NavLink>
      <NavLink tag={Link} className={styles.FooterLink} to="/">Polityka prywatności</NavLink>
      <NavLink tag={Link} className={styles.FooterLink} to="/">Regulamin</NavLink>
      <NavLink tag={Link} className={styles.FooterLink} to="/">Zasztrzeżenia prawne</NavLink>
      <NavLink tag={Link} className={styles.FooterLink} to="/">&#169; 2023 Katarzyna Wartanowicz</NavLink>
    </Nav>
  </footer>
);

Footer.propTypes = {};

Footer.defaultProps = {};

export default Footer;
