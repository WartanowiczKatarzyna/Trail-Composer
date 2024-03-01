import React from 'react';
import PropTypes from 'prop-types';
import styles from './Menu.module.css';
import { Nav, NavLink, UncontrolledAccordion, AccordionHeader, AccordionBody } from 'reactstrap';
import { Link } from 'react-router-dom';
import { AuthenticatedTemplate } from '@azure/msal-react';

const Menu = () => (
  <Nav vertical className={styles.Menu}>
    <UncontrolledAccordion defaultOpen={['1', '2', '3']} stayOpen>

      <AccordionHeader targetId='1' className={styles.SectionHeader}> Przeglądaj: </AccordionHeader>
      <AccordionBody accordionId='1'>
        <NavLink tag={Link} className={styles.NavLink} to="/">- Trasy</NavLink>
        <NavLink tag={Link} className={styles.NavLink} to="/">- Odcinki</NavLink>
        <NavLink tag={Link} className={styles.NavLink} to="/list-poi/user">- POI</NavLink>
      </AccordionBody>

    </UncontrolledAccordion>

    <AuthenticatedTemplate>
      <UncontrolledAccordion defaultOpen={['1', '2', '3']} stayOpen>

      <AccordionHeader targetId='1' className={styles.SectionHeader}> Trasy </AccordionHeader>
      <AccordionBody accordionId='1'>
        <NavLink tag={Link} className={styles.NavLink} to="/">- Dodaj nową</NavLink>
        <NavLink tag={Link} className={styles.NavLink} to="/">- Moje trasy</NavLink>
      </AccordionBody>

      <AccordionHeader targetId='2' className={styles.SectionHeader}> Odcinki </AccordionHeader>
      <AccordionBody accordionId='2'>
        <NavLink tag={Link} className={styles.NavLink} to="/">- Dodaj nowy</NavLink>
        <NavLink tag={Link} className={styles.NavLink} to="/">- Moje odcinki</NavLink>
      </AccordionBody>

      <AccordionHeader targetId='3' className={styles.SectionHeader}> POI </AccordionHeader>
      <AccordionBody accordionId='3'>
        <NavLink tag={Link} className={styles.NavLink} to="/add-poi">- Dodaj nowy</NavLink>
        <NavLink tag={Link} className={styles.NavLink} to="/">- Moje odcinki</NavLink>
      </AccordionBody>

      </UncontrolledAccordion>
    </AuthenticatedTemplate>
  </Nav>
);

Menu.propTypes = {};

Menu.defaultProps = {};

export default Menu;