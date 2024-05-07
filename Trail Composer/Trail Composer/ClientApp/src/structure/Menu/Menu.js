import React from 'react';
import PropTypes from 'prop-types';
import styles from './Menu.module.css';
import { Nav, NavLink, UncontrolledAccordion, AccordionHeader, AccordionBody } from 'reactstrap';
import { Link } from 'react-router-dom';

const Menu = () => (
  <Nav vertical className={styles.Menu}>

    <UncontrolledAccordion defaultOpen={['1', '2', '3']} stayOpen>

      <AccordionHeader targetId='1' className={styles.SectionHeader}> Trasy </AccordionHeader>
      <AccordionBody accordionId='1'>
        <NavLink tag={Link} className={styles.NavLink} to="/">Nowa trasa</NavLink>
        <NavLink tag={Link} className={styles.NavLink} to="/">Moje trasy</NavLink>
      </AccordionBody>

      <AccordionHeader targetId='2' className={styles.SectionHeader}> Odcinki </AccordionHeader>
      <AccordionBody accordionId='2'>
        <NavLink tag={Link} className={styles.NavLink} to="/add-segment">Nowy odcinek</NavLink>
        <NavLink tag={Link} className={styles.NavLink} to="/list-segment/user">Moje odcinki</NavLink>
      </AccordionBody>

      <AccordionHeader targetId='3' className={styles.SectionHeader}> POI </AccordionHeader>
      <AccordionBody accordionId='3'>
        <NavLink tag={Link} className={styles.NavLink} to="/add-poi">Nowe POI</NavLink>
        <NavLink tag={Link} className={styles.NavLink} to="/list-poi/user">Moje POI</NavLink>
      </AccordionBody>

    </UncontrolledAccordion>

  </Nav>
);

Menu.propTypes = {};

Menu.defaultProps = {};

export default Menu;
