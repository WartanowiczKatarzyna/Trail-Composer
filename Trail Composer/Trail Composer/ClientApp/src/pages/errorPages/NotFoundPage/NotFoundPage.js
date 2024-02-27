import React from 'react';
import PropTypes from 'prop-types';
import styles from './NotFoundPage.module.css';

const NotFoundPage = () => (
  <div className={styles.NotFoundPage}>
    404 Nie ma takiej strony
  </div>
);

NotFoundPage.propTypes = {};

NotFoundPage.defaultProps = {};

export default NotFoundPage;
