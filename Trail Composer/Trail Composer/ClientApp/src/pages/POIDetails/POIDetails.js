import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Label, Col, Row, Container } from 'reactstrap';
import { useMsal, useAccount, useIsAuthenticated } from "@azure/msal-react";
import PropTypes from 'prop-types';
import styles from './POIDetails.module.css';

import App, { AppContext } from '../../App.js';

const PoiDetails = () => {
  const appData = useContext(AppContext);
  const { instance: pca, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});

  const { poiId } = useParams();
  const [localPoiId, setLocalPoiId] = useState(poiId);
  const [poi, setPoi] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [poiOwner, setPoiOwner] = useState('');

  const navigate = useNavigate();
  const isOwner = useIsAuthenticated(poiOwner);

  const fetchData = async () => {
    try{
      await fetch(`tc-api/poi/${localPoiId}`)
        .then(response => response.json())
        .then(data => {setPoi(data)}); 
    } catch (error) {
      console.error("Błąd przy ładowaniu POI", error);
    }
  }

  useEffect(() => {
    setLocalPoiId(poiId);
    fetchData();
  }, [poiId]);

  useEffect(() => {
    setImagePreview(poi && poi.photoId ? `tc-api/poi-photo/${poi.photoId}` : null);
    if (poi)
      setPoiOwner({localAccountId: poi.tcuserId});
    console.log(account);
    console.log(poi);
  }, [poi]);

  useEffect(() => {console.log(isOwner)}, [poiOwner]);

  const deletePoi = async () => {
    var request = {
      account: account,
      scopes:['openid', 'offline_access', pca.getConfiguration().auth.clientId]
    }
    var response = await pca.acquireTokenSilent(request);
    const authorizationHeader = `Bearer ${response.accessToken}`;
    
    fetch(`tc-api/poi/${poi.id}`, {
      method: "DELETE",
      headers: {
        Authorization: authorizationHeader
      }})
      .then(response => {
        console.log(response.status);
        navigate("/");
      })
      .catch(error => {
        console.error('Error deleting POI:', error);
      });
  };

  const toEditPoi = () => {
    navigate(`/edit-poi/${localPoiId}`);
  };
  
  return (
  <Container className={styles.PoiDetails}>
    <Row>
      <Col>{poi ? poi.name : 'Ładuję...'}</Col>
      {isOwner && (<Col sm={1}><i role="button" onClick={toEditPoi} class="bi bi-pen fs-4"></i></Col>)}
      {isOwner && (<Col sm={1}><i role="button" onClick={deletePoi} class="bi bi-trash fs-4"></i></Col>)}
    </Row>
    <Row>
      <Col sm={8}>
        {!!imagePreview && ( <img src={imagePreview} alt="Preview" className={styles.Photo} /> )}
      </Col>
      <Col sm={4}>
        <Row>{poi && (`Typy: ${poi.poiTypes}`)}</Row>
        <Row>{poi && (`Kraj: ${poi.countryId}`)}</Row>
        <Row>{poi && (`Współrzędne geograficzne`)}</Row>
        <Row>{poi && (`szerokość: ${poi.latitude}`)}</Row>
        <Row>{poi && (`długość: ${poi.longitude}`)}</Row>
        <Row>{poi && poi.description!=null && (`opis: ${poi.description}`)}</Row>
      </Col>
      
    </Row>
  </Container>  
  );
};

PoiDetails.propTypes = {};

PoiDetails.defaultProps = {};

export default PoiDetails;
