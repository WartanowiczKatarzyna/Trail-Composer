import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button, Label, Col, Row, Container } from 'reactstrap';
import { useMsal, useAccount, useIsAuthenticated } from "@azure/msal-react";
import PropTypes from 'prop-types';
import styles from './POIDetails.module.css';

import App, { AppContext } from '../../../App.js';
import { getAuthHeader } from '../../../utils/auth/getAuthHeader.js';
import {useTcStore} from "../../../store/TcStore";
import SectionTitle from "../../../components/SectionTitle/SectionTitle";
import SectionButtons from "../../../components/SectionButtons/SectionButtons";

const PoiDetails = () => {
  const appData = useContext(AppContext);
  const { instance: pca, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});

  const { poiId } = useParams();
  const [localPoiId, setLocalPoiId] = useState(poiId);
  const [poi, setPoi] = useState(null);
  const [poiTypesNames, setPoiTypesNames] = useState([]);
  const [poiCountryName, setPoiCountryName] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [poiOwner, setPoiOwner] = useState('');

  const refreshPoiUserFiltered = useTcStore((state) => state.refreshPoiUserFiltered);
  const toggleSpinner = useTcStore((state) => state.toggleSpinner);

  const navigate = useNavigate();
  const isOwner = useIsAuthenticated(poiOwner);

  const fetchData = () => {
    toggleSpinner();
    fetch(`tc-api/poi/${localPoiId}`)
      .then(response => {
        toggleSpinner();
        if (response.status === 200)
          return response.json()
        else
          navigate('/error/page-not-found');
      })
      .then(data => {setPoi(data)})
      .catch(error => {
        console.log(error);
        toggleSpinner();
        navigate(-1);
      });
  }
  
  useEffect(() => {
      setLocalPoiId(poiId);
      fetchData();
  }, []);

  useEffect(() => {
    if (poi && appData)
      {
        setPoiOwner({localAccountId: poi.tcuserId});

        let country = appData.Countries.find(c => c.id === poi.countryId);
        setPoiCountryName(country.countryName);

        let types = poi.poiTypeIds.map(id => appData.POITypes.find(t => t.id === id).name);
        setPoiTypesNames(types.join(', '));
      }
    setImagePreview(poi && poi.photoId ? `tc-api/poi-photo/${poi.photoId}` : null);
  }, [poi, appData]);

  const deletePoi = async () => {
    const authorizationHeader = await getAuthHeader(pca, account);
    
    fetch(`tc-api/poi/${poi.id}`, {
      method: "DELETE",
      headers: {
        Authorization: authorizationHeader
      }})
      .then(response => {
        console.log(response.status);
        refreshPoiUserFiltered(pca, account, appData);
        navigate(-1);
      })
      .catch(error => {
        console.error('Error deleting POI:', error);
      });
  };

  const toEditPoi = () => {
    navigate(`/edit-poi/${localPoiId}`);
  };

  const toPrevPage = () => {
    navigate(-1);
  };
  
  return (
  <Container className={styles.PoiDetails}>
    <Row className={styles.SectionTitle}>
      <div className="d-flex justify-content-between">
        <SectionTitle>{poi ? poi.name : 'Ładuję...'}</SectionTitle>
        { isOwner && (<SectionButtons editHandler={toEditPoi} deleteHandler={deletePoi} />)}
      </div>
    </Row>
    <Row className='pt-2'>
      {poi && (<Col sm={4}>
        <Row className='mt-2'>{`Typy: ${poiTypesNames}`}</Row>
        <Row className='mt-2'>{`Kraj: ${poiCountryName}`}</Row>
        <Row className='mt-3'>{`Współrzędne geograficzne`}</Row>
        <Row className='mt-1'>
          <ul className='ms-4'>
            <li>{`szerokość: ${poi.latitude}`}</li>
            <li>{`długość: ${poi.longitude}`}</li>
          </ul>
        </Row>
        <Row className='mt-2'>{poi.description!==null && (`Opis:`)}</Row>
        <Row className='mt-1'>{poi.description!==null && `${poi.description}`}</Row>
      </Col>)}
      <Col sm={8} className='d-flex justify-content-center'>
        {!!imagePreview && ( <img src={imagePreview} alt="Preview" className={styles.Photo} /> )}
      </Col>
    </Row>
  </Container>  
  );
};

PoiDetails.propTypes = {};

PoiDetails.defaultProps = {};

export default PoiDetails;
