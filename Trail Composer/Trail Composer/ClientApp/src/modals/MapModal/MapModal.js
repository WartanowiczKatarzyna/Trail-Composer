import React, {useState} from 'react';
import {Modal, ModalHeader, ModalBody, Spinner} from 'reactstrap';
import PropTypes from 'prop-types';
import styles from './MapModal.module.css';
import TCMap from "../../components/TCMap/TCMap";

const MapModal = ({ isOpen, toggle, gpxArr, type , gpxNotValidated, gpxValidated}) => {
  return (
    <>
      <Modal isOpen={isOpen} toggle={toggle} fullscreen fade >
        <ModalHeader toggle={toggle} className={styles.ModalHeader}>Mapa</ModalHeader>
        <ModalBody className={styles.ModalBody}>
          <TCMap {...{gpxArr, type, gpxNotValidated, gpxValidated}} />
        </ModalBody>
      </Modal>
    </>
  );
};

MapModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  gpxArr: PropTypes.arrayOf(PropTypes.string),
  type: PropTypes.string,
  gpxNotValidated: PropTypes.func,
  gpxValidated: PropTypes.func,
};

MapModal.defaultProps = {
  isOpen: false,
  toggle: ()=>{},
  gpxArr: [],
  type: 'url',
};

export default MapModal;
