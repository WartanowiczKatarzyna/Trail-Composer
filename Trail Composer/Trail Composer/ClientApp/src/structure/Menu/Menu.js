import React from 'react';
import PropTypes from 'prop-types';
import styles from './Menu.module.css';
import { Nav, NavLink, UncontrolledAccordion, AccordionHeader, AccordionBody } from 'reactstrap';
import { Link } from 'react-router-dom';
import { AuthenticatedTemplate } from '@azure/msal-react';

const Menu = () => (
  <Nav vertical className={styles.Menu}>

    <UncontrolledAccordion defaultOpen={['1', '2', '3']} stayOpen>

      <AccordionHeader targetId='1' className={styles.SectionHeader}> Trasy </AccordionHeader>
      <AccordionBody accordionId='1'>
        <NavLink tag={Link} className={styles.NavLink} to="/">Przeglądaj trasy</NavLink>
        <AuthenticatedTemplate>
          <NavLink tag={Link} className={styles.NavLink} to="/">Dodaj nową trasę</NavLink>
          <NavLink tag={Link} className={styles.NavLink} to="/">Modyfikuj moje trasy</NavLink>
        </AuthenticatedTemplate>
      </AccordionBody>

      <AccordionHeader targetId='2' className={styles.SectionHeader}> Odcinki </AccordionHeader>
      <AccordionBody accordionId='2'>
        <NavLink tag={Link} className={styles.NavLink} to="/">Przeglądaj odcinki</NavLink>
        <AuthenticatedTemplate>
          <NavLink tag={Link} className={styles.NavLink} to="/add-segment">Dodaj nowy odcinek</NavLink>
          <NavLink tag={Link} className={styles.NavLink} to="/">Modyfikuj moje odcinki</NavLink>
        </AuthenticatedTemplate>
      </AccordionBody>

      <AccordionHeader targetId='3' className={styles.SectionHeader}> POI </AccordionHeader>
      <AccordionBody accordionId='3'>
        <NavLink tag={Link} className={styles.NavLink} to="/list-poi/user">Przeglądaj POI</NavLink>
        <AuthenticatedTemplate>
          <NavLink tag={Link} className={styles.NavLink} to="/add-poi">Dodaj nowy POI</NavLink>
          <NavLink tag={Link} className={styles.NavLink} to="/">Modyfikuj moje POI</NavLink>
        </AuthenticatedTemplate>

      </AccordionBody>

    </UncontrolledAccordion>

  </Nav>
);

Menu.propTypes = {};

Menu.defaultProps = {};

export default Menu;
