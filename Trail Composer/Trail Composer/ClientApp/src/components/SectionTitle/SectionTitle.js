import React from 'react';
import styles from './SectionTitle.module.css';
import BackArrow from "../BackArrow/BackArrow";

const SectionTitle = ({ children }) => {
  return (
    <>
      <div className={`${styles.SectionTitleContainer} d-flex align-items-center d-inline-block`}>
        <BackArrow/>
        <span  className={`${styles.SectionTitle} ms-5 d-inline-block`}>{children}</span>
      </div>
    </>

  );
}

export default SectionTitle;
