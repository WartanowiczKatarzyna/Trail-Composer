import React from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Col } from 'reactstrap';
import styles from './PageLayout.module.css';
import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';

import Header from '../Header/Header'
import Menu from '../Menu/Menu'
import Footer from '../Footer/Footer'

import CookieConsent from "react-cookie-consent";

const PageLayout = ({ children }) => (
  <div>
    <Header />

    <Container fluid className="p-0">
      <Row fluid noGutters>
        <AuthenticatedTemplate>
          <Col md="3" xl="2" fluid className={styles.MenuContainer}> <Menu/> </Col>
          <Col md="9" xl="10" fluid className={styles.ContentContainer}> {children} </Col>
        </AuthenticatedTemplate>
        <UnauthenticatedTemplate>
        <Col md="12" xl="12" fluid className={styles.ContentContainer + ' ' + styles.ContentContainerUnauthorized}>
          <div className={styles.ContentSpacer}></div>
          {children}
        </Col>
        </UnauthenticatedTemplate>
      </Row>
    </Container>

    <Footer/>

    <CookieConsent
      buttonText="Wyrażam zgodę"
      debug={false}
      overlay={true}
      overlayStyle={{
        zIndex: "1031"
      }}
      buttonStyle = {{
         background: "var(--main-color)",
         color: "var(--light-grey)",
         borderRadius: "5px"
        }}
      style = {{
        color: "var(--light-grey)"
      }}
    >
    Ta strona wykorzystuje pliki cookies wyłącznie w celu zapewnienia prawidłowego działania poszczególnych jej funkcji, 
    w tym funkcji obsługujących konto użytkownika. Szczegółowe informacje są zawarte w polityce prywatności.
    </CookieConsent>
  </div>
);

PageLayout.propTypes = {};

PageLayout.defaultProps = {};

export default PageLayout;
