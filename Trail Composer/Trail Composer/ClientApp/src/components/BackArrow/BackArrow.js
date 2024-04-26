import React from 'react';
import PropTypes from 'prop-types';
import styles from './BackArrow.module.css';
import { useNavigate } from 'react-router-dom';

const BackArrow = () => {
  const navigate = useNavigate();
  
  const toPrevPage = () => {
    navigate(-1);
  };

  return (
  <div className="d-inline-block">
    <i role="button" onClick={toPrevPage} className="bi bi-arrow-left fs-4 tc-activeIcon"></i>
  </div>
);
}

BackArrow.propTypes = {};

BackArrow.defaultProps = {};

export default BackArrow;
