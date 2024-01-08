import React from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Col } from 'reactstrap';
import styles from './PageLayout.module.css';

import Header from '../Header/Header'
import Menu from '../Menu/Menu'
import Footer from '../Footer/Footer'

const PageLayout = ({ children }) => (
  <div>
    <Header />

    <Container fluid className="p-0">
      <Row fluid noGutters>
        <Col md="3" xl="2" fluid className={styles.MenuContainer}> <Menu/> </Col>
        <Col md="9" xl="10" fluid className={styles.ContentContainer}> {children} </Col>
      </Row>
    </Container>

    <Footer/>
  </div>
);

PageLayout.propTypes = {};

PageLayout.defaultProps = {};

export default PageLayout;