import React from 'react';
import PropTypes from 'prop-types';
import styles from './SectionButtons.module.css';

const SectionButtons = ({ editHandler, deleteHandler }) => {
  return (
    <>
      <div className="d-flex justify-content-end">
        <div className="d-inline-block"><i role="button" onClick={editHandler} className="bi bi-pen fs-4 tc-activeIcon"></i></div>
        <div className="d-inline-block ms-2"><i role="button" onClick={deleteHandler} className="bi bi-trash fs-4 tc-activeIcon"></i>
        </div>
      </div>
    </>

  );
}

SectionButtons.propTypes = {
  editHandler: PropTypes.func.isRequired,
  deleteHandler: PropTypes.func.isRequired,
};

SectionButtons.defaultProps = {
  editHandler: () => {},
  deleteHandler: () => {},
};

export default SectionButtons;
