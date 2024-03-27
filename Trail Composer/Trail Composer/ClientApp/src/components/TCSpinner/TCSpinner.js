import React from 'react';
import PropTypes from 'prop-types';
import styles from './TCSpinner.module.css';
import { Spinner } from 'reactstrap';

const TcSpinner = () => (
  <div className={styles.TcSpinner}>
    <Spinner 
      color="success" 
      style={{
        height: '3rem',
        width: '3rem'
      }}
    />
  </div>
);

TcSpinner.propTypes = {};

TcSpinner.defaultProps = {};

export default TcSpinner;
