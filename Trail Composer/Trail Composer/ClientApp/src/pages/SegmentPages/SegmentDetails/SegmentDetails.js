import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Col, Row, Container } from 'reactstrap';
import { useMsal, useAccount, useIsAuthenticated } from "@azure/msal-react";
import styles from './SegmentDetails.module.css';

import { AppContext } from '../../../App.js';
import { getAuthHeader } from '../../../utils/auth/getAuthHeader.js';
import BackArrow from '../../../components/BackArrow/BackArrow.js';
import {useTcStore} from "../../../store/TcStore";
import TCMap from "../../../components/TCMap/TCMap";

// artefact = segment

const SegmentDetails = () => {
  const appData = useContext(AppContext);
  const { instance: pca, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});

  const { segmentId: artefactId} = useParams();

  const [artefact, SetArtefact] = useState(null);
  const [pathLevelName, setPathLevelName] = useState('');
  const [pathTypesNames, setPathTypesNames] = useState('');
  const [countryName, setCountryName] = useState('');
  const [description, setDescription] = useState('');
  const [artefactName, setArtefactName] = useState('');
  const [gpxPreview, setGpxPreview] = useState(null);
  const [owner, setOwner] = useState({});
  const [username, setUsername] = useState('');
  const [distance, setDistance] = useState('');
  const [downloadGpxUrl, setDownloadGpxUrl] = useState('');
  const pathLevels = useTcStore((state) => state.pathLevels);
  const pathTypes = useTcStore((state) => state.pathTypes);
  //const refreshsegmentUserFiltered = useTcStore((state) => state.refreshsegmentUserFiltered);
  const spinnerON = useTcStore((state) => state.spinnerON);
  const spinnerOFF = useTcStore((state) => state.spinnerOFF);

  const navigate = useNavigate();
  const isOwner = useIsAuthenticated(owner);

  useEffect(() => {
    spinnerON();
    fetch(`tc-api/segment/${artefactId}`)
      .then(response => {
        spinnerOFF();
        if (response.status === 200)
          return response.json()
        else
          navigate('/error/page-not-found');
      })
      .then(data => {
        SetArtefact(data)})
      .catch(error => {
        console.log(error);
        spinnerOFF();
        navigate(-1);
      });
  }, [artefactId, spinnerON, spinnerOFF, navigate]);

  useEffect(() => {
    if (artefact && appData) {
      setOwner({localAccountId: artefact.tcuserId});

      const country = appData.Countries.find(c => c.id === artefact.countryId);
      setCountryName(country.countryName);

      const levelObj = pathLevels.find(l => l.id === artefact.level);
      setPathLevelName(levelObj.level);

      let type = artefact.pathTypes.map(id => pathTypes.find(t => t.id === id).name);
      setPathTypesNames(type.join(', '));

      setUsername(artefact.username);
      setDescription(artefact.description);
      setArtefactName(artefact.name);

      if( artefactId ) {
        setGpxPreview(`tc-api/segment/gpx/${artefactId}`);
        setDownloadGpxUrl(`tc-api/segment/download-gpx/${artefactId}`);
      } else {
        setGpxPreview('');
        setDownloadGpxUrl('');
      }
    }

  }, [ artefact, artefactId, pathTypes, pathLevels, appData ]);

  const deleteArtefact = async () => {
    const authorizationHeader = await getAuthHeader(pca, account);
    
    fetch(`tc-api/segment/${artefactId}`, {
      method: "DELETE",
      headers: {
        Authorization: authorizationHeader
      }})
      .then(response => {
        console.log(response.status);
        //refreshsegmentUserFiltered(pca, account, appData);
        navigate(-1);
      })
      .catch(error => {
        console.error('Error deleting artefact:', error);
      });
  };

  const toEdit = () => {
    navigate(`/edit-segment/${artefactId}`);
  };

  const toPoiList = () => {
    navigate(`/list-poi/segment/${artefactId}`);
  };

  const gpxNotValidated = () => {
    spinnerOFF();
    setGpxPreview(null);
  };

  const gpxValidated = (boudingBox, distance) => {
    spinnerOFF();
    const distanceNumKm = Number.parseFloat(distance)/1000;
    if(distanceNumKm < 10) {
      setDistance(distanceNumKm.toFixed(1).toString());
    } else {
      setDistance(Math.round(distanceNumKm).toString());
    }
    console.info('boudingBox: ', boudingBox);
    console.info("distance:", distance);
  };

  return (
    <Container className={styles.DetailsContainer}>
      <Row className={styles.SectionTitle}>
        <Col sm={1} className="d-flex justify-content-start">
          <BackArrow/>
        </Col>
        <Col>{artefact ? artefactName : 'Ładuję...'}</Col>
        {isOwner &&
          (<Col sm={2} className="d-flex justify-content-end">
            <div className="d-inline-block"><i role="button" onClick={toEdit} className="bi bi-pen fs-4 tc-activeIcon"></i>
            </div>
            <div className="d-inline-block ms-2"><i role="button" onClick={deleteArtefact}
                                                    className="bi bi-trash fs-4 tc-activeIcon"></i></div>
          </Col>)}
      </Row>
      <Row className='pt-2'>
        {artefact && (<Col sm={4}>
          <Row className='mt-2'>{`Typy: ${pathTypesNames}`}</Row>
          <Row className='mt-2'>{`Poziom: ${pathLevelName}`}</Row>
          <Row className='mt-2'>{`Kraj: ${countryName}`}</Row>
          <Row className='mt-2'>{`Długość: ${distance} km`}</Row>
          <Row className='mt-2'>{`Autor: ${username}`}</Row>
          <Row className='mt-5'>{description && (`Opis:`)}</Row>
          <Row className='mt-1'>{description && `${description}`}</Row>
          <div className={styles.Buttons + ' d-none d-sm-block pt-2'}>
            <Button onClick={toPoiList} className="mt-3">POI</Button>
            <a href={downloadGpxUrl}><Button className="mt-3">Pobierz GPX</Button></a>
          </div>
        </Col>)}
        <Col sm={8} className='d-flex justify-content-center'>
          {!!gpxPreview && (
            <div className={styles.MapContainer}>
              <TCMap gpxArr={[gpxPreview]} {...{gpxNotValidated, gpxValidated}} />
            </div>)}
        </Col>
      </Row>
      <div className={styles.Buttons + ' d-sm-none pt-3'}>
        <Button onClick={toPoiList} >POI</Button>
        <a href={downloadGpxUrl} ><Button>Pobierz GPX</Button></a>
      </div>
    </Container>
  );
};

export default SegmentDetails;
