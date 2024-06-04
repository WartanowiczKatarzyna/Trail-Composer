import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Col, Row, Container } from 'reactstrap';
import { useMsal, useAccount, useIsAuthenticated } from "@azure/msal-react";
import styles from './TrailDetails.module.css';

import { getAuthHeader } from '../../../utils/auth/getAuthHeader.js';
import {useTcStore} from "../../../store/TcStore";
import TCMap from "../../../components/TCMap/TCMap";
import SectionTitle from "../../../components/SectionTitle/SectionTitle";
import SectionButtons from "../../../components/SectionButtons/SectionButtons";
import MapModal from "../../../modals/MapModal/MapModal";

// artefact = trail

const TrailDetails = () => {
  const { instance: pca, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});

  const { trailId: artefactId} = useParams();

  const [artefact, setArtefact] = useState(null);
  const [pathLevelName, setPathLevelName] = useState('');
  const [pathTypesNames, setPathTypesNames] = useState('');
  const [countryNames, setCountryNames] = useState('');
  const [description, setDescription] = useState('');
  const [artefactName, setArtefactName] = useState('');
  const [gpxPreview, setGpxPreview] = useState(null);
  const [owner, setOwner] = useState({});
  const [username, setUsername] = useState('');
  const [distance, setDistance] = useState('');
  const [mapModal, setMapModal] = useState(false);
  const CountryNamesMap = useTcStore(state => state.CountryNamesMap);
  const pathLevels = useTcStore((state) => state.pathLevels);
  const pathTypes = useTcStore((state) => state.pathTypes);
  const refreshTrailUserFiltered = useTcStore((state) => state.refreshTrailUserFiltered);
  const spinnerON = useTcStore((state) => state.spinnerON);
  const spinnerOFF = useTcStore((state) => state.spinnerOFF);

  const navigate = useNavigate();
  const isOwner = useIsAuthenticated(owner);

  const toggleMapModal = () => setMapModal(m => (!m));

  useEffect(() => {
    spinnerON();
    fetch(`tc-api/trail/${artefactId}`)
      .then(response => {
        spinnerOFF();
        if (response.status === 200)
          return response.json()
        else
          navigate('/error/page-not-found');
      })
      .then(data => {
        setArtefact(data)})
      .catch(error => {
        console.log(error);
        spinnerOFF();
        navigate(-1);
      });
  }, [artefactId, spinnerON, spinnerOFF, navigate]);

  useEffect(() => {
    if (artefact && pathTypes.length && pathLevels.length && Array.from(CountryNamesMap).length) {
      setOwner({localAccountId: artefact.tcuserId});

      setCountryNames(artefact.countryIds.map( id => CountryNamesMap.get(id)).join(', '));

      const levelObj = pathLevels.find(l => l.id == artefact.levelId) || 'nieznany';
      setPathLevelName(levelObj.name);

      let type = artefact?.pathTypeIds?.map(id => pathTypes.find(t => t.id == id)?.name || 'nieznany');
      setPathTypesNames(type?.join(', ') || 'nieznany');

      setUsername(artefact.username);
      setDescription(artefact.description);
      setArtefactName(artefact.name);

      if( parseInt(artefactId) ) {
        setGpxPreview(artefact.segmentIds.map((id) => `tc-api/segment/gpx/${id}`));
      } else {
        setGpxPreview('');
      }
    }
  }, [ artefact, artefactId, pathTypes, pathLevels, CountryNamesMap ]);

  const deleteArtefact = async () => {
    const authorizationHeader = await getAuthHeader(pca, account);
    
    fetch(`tc-api/trail/${artefactId}`, {
      method: "DELETE",
      headers: {
        Authorization: authorizationHeader
      }})
      .then(response => {
        console.log(response.status);
        refreshTrailUserFiltered(pca, account);
        navigate(-1);
      })
      .catch(error => {
        console.error('Error deleting artefact:', error);
      });
  };

  const toEdit = () => {
    navigate(`/edit-trail/${artefactId}`);
  };

  const toPoiList = () => {
    navigate(`/list-poi/trail/${artefactId}`);
  };

  const toSegmentList = () => {
    navigate(`/list-segment/trail/${artefactId}`);
  };

  const gpxNotValidated = () => {
    spinnerOFF();
    setGpxPreview(null);
  };

  const gpxValidated = (boundingBox, distance) => {
    spinnerOFF();
    const distanceNumKm = Number.parseFloat(distance)/1000;
    if(distanceNumKm < 10) {
      setDistance(distanceNumKm.toFixed(1).toString());
    } else {
      setDistance(Math.round(distanceNumKm).toString());
    }
    console.info('boundingBox: ', boundingBox);
    console.info("distance:", distance);
  };

  const showGpx = () => {
    spinnerON();
    toggleMapModal();
  }

  const gpxNotValidatedModal = () => {
    spinnerOFF();
    setGpxPreview(null);
    toggleMapModal();
  };

  const gpxValidatedModal = (boundingBox, distance) => {
    spinnerOFF();
  };

  return (
    <Container className={styles.DetailsContainer}>
      <MapModal
        isOpen={mapModal}
        toggle={toggleMapModal}
        gpxArr={gpxPreview}
        type={'url'}
        gpxValidated={gpxValidatedModal}
        gpxNotValidated={gpxNotValidatedModal}
      />
      <Row className={styles.SectionTitle}>
        <div className="d-flex justify-content-between">
          <SectionTitle>{artefact ? artefactName : 'Ładuję...'}</SectionTitle>
          {isOwner && (<SectionButtons editHandler={toEdit} deleteHandler={deleteArtefact}/>)}
        </div>
      </Row>
      <Row className='pt-2'>
        {artefact && (<Col sm={4}>
          <Row className='mt-2'>{`Typy: ${pathTypesNames}`}</Row>
          <Row className='mt-2'>{`Poziom: ${pathLevelName}`}</Row>
          <Row className='mt-2'>{`Kraje: ${countryNames}`}</Row>
          <Row className='mt-2'>{`Długość: ${distance} km`}</Row>
          <Row className='mt-2'>{`Autor: ${username}`}</Row>
          <Row className='mt-5'>{description && (`Opis:`)}</Row>
          <Row className='mt-1'>{description && `${description}`}</Row>
          <div className={styles.Buttons + ' d-none d-sm-block pt-2'}>
            {gpxPreview && (<Button onClick={showGpx} className={`${styles.ButtonGroup} mt-3 pl-1 pr-1 pt-0 pb-0`}><i className="bi bi-eye fs-5"></i></Button>)}
            <Button onClick={toSegmentList} className={`${styles.ButtonGroup} mt-3`}>Odcinki</Button>
            <Button onClick={toPoiList} className={`${styles.ButtonGroup} mt-3`}>POI</Button>
          </div>
        </Col>)}
        <Col sm={8} className='d-flex justify-content-center'>
          {!!gpxPreview && (
            <div className={`mt-3 mt-sm-0 ${styles.MapContainer}`}>
              <TCMap gpxArr={gpxPreview} {...{gpxNotValidated, gpxValidated}} />
            </div>)}
        </Col>
      </Row>
      <div className={styles.Buttons + ' d-sm-none pt-3'}>
        {gpxPreview && (<Button onClick={showGpx} className={`${styles.ButtonGroup} mt-3 pl-1 pr-1 pt-0 pb-0`}><i className="bi bi-eye fs-5"></i></Button>)}
        <Button onClick={toSegmentList} className={`${styles.ButtonGroup} mt-3`}>Odcinki</Button>
        <Button onClick={toPoiList} className={`${styles.ButtonGroup} mt-3`}>POI</Button>
      </div>
    </Container>
  );
};

export default TrailDetails;
