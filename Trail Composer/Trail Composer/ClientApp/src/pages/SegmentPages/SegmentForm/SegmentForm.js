import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Form, FormGroup, Label, Input, FormFeedback, Col, Row, Container, FormText } from 'reactstrap';
import App, { AppContext } from '../../../App.js';
import Multiselect from 'multiselect-react-dropdown';
import { useMsal, useAccount, useMsalAuthentication, AuthenticatedTemplate } from "@azure/msal-react";
import { InteractionType } from '@azure/msal-browser';
import styles from './SegmentForm.module.css';
import PoiModal from '../../../modals/PoiModal/PoiModal'
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import {SegmentTable} from "../../../components/tables/SegmentTable/SegmentTable";
import { getAuthHeader } from '../../../utils/auth/getAuthHeader.js';
import TCMap from "../../../components/TCMap/TCMap";
import Teste from '../../../assets/gpx/teste.gpx';
import Demo from '../../../assets/gpx/demo.gpx';

const gpxUrls = [Teste, Demo];

const SegmentForm = () => {
  const appData = useContext(AppContext);
  const { result, error } = useMsalAuthentication(InteractionType.Redirect, {scopes:['openid', 'offline_access']});
  const { instance: pca, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});
  const navigate = useNavigate();

  const { segmentId } = useParams();
  const [localSegmentId, setLocalSegmentId] = useState(segmentId);
  const [editMode, setEditMode] = useState(false); 
  const [modal, setModal] = useState(false);

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formErrorMessage, setFormErrorMessage] = useState('');

  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(29);
  const [segmentLevel, setSegmentLevel] = useState(1);
  const [segmentName, setSegmentName] = useState('');
  const [segmentDescription, setSegmentDescription] = useState('');
  
  const [imagePreview, setImagePreview] = useState(null);
  const [photoValue, setPhotoValue] = useState(null);

  let formData = useRef(new FormData());
  let photoId = useRef(0);

  const toggleModal = () => setModal(!modal);

  useEffect(() => {
    setLocalSegmentId(segmentId);

    if (!isNaN(Number.parseInt(localSegmentId)))
      setEditMode(true);
    else
      setEditMode(false);

    const form = document.getElementById("SegmentForm");
    formData.current = new FormData(form);
    formData.current.set("CountryId", selectedCountry);
      
    if (editMode && localSegmentId && appData){
      const fetchData = async () => {
        try {
          /*
          const fetchedPoi = await fetch(`tc-api/poi/${localSegmentId}`).then(response => response.json());

          setSelectedPOICountry(fetchedPoi.countryId);
          setPoiName(fetchedPoi.name);
          setPoiDescription(fetchedPoi.description);
          setPoiLatitude(fetchedPoi.latitude);
          setPoiLongitude(fetchedPoi.longitude);

          setImagePreview(fetchedPoi.photoId ? `tc-api/poi-photo/${fetchedPoi.photoId}` : null);

          let fetchedPoiTypes = appData.POITypes.filter(type => {
            const foundType = fetchedPoi.poiTypes.find((fetchedType) => fetchedType === type.id);
            return foundType;
          });
          setSelectedPOITypes(fetchedPoiTypes);

          formData.current.set('Name', fetchedPoi.name);
          formData.current.set('CountryId', fetchedPoi.countryId);
          formData.current.set('Longitude', fetchedPoi.longitude);
          formData.current.set('Latitude', fetchedPoi.latitude);
          formData.current.set('Description', fetchedPoi.description);
          handlePoiTypes(fetchedPoiTypes);
          photoId.current=fetchedPoi.photoId;

          showFormData(formData.current, "starting editMode"); */
        } catch (error) {
          console.error('Error fetching poi:', error);
        }       
      };
      
      fetchData();
    }
  }, [editMode, localSegmentId, appData, segmentId]);

  const validateInput = (name, value) => {
    const emptyMsg = 'Pole jest wymagane.';

    switch(name) {
      case "Name":
        if (value.trim() === '')
          return emptyMsg;
        break;
      case "Description": 
        // description is optional
        break; 
        default:
    }

    return ''; // No errors
  };
  
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setImagePreview(reader.result);
      }

      // handling empty files
      if (files.length > 0) {
        reader.readAsDataURL(files[0]);
        const errors = validateInput(name, files[0]);
        formData.current.set(name, files[0]);
        setFormErrors({ ...formErrors, [name]: errors });
        setPhotoValue(null);
      }      
    } else {
      switch (name) {
        case "CountryId":
          setSelectedCountry(value);
          break;
        case "Name":
          setSegmentName(value);
          break;
        case "Description":
          setSegmentDescription(value);
          break;
      }
        
      const errors = validateInput(name, value);
      formData.current.set(name, value);
      setFormErrors({ ...formErrors, [name]: errors });
    }    
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    formData.current.forEach((value, key) => {
      const fieldErrors = validateInput(key, value);
      if (fieldErrors !== '') {
        errors[key] = fieldErrors;
      }
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    setSubmitting(true);

    showFormData(formData.current, "przed fetch");

    const authorizationHeader = getAuthHeader(pca, account);

    // TO-DO: after sending go back to prev page 
    let connString = 'tc-api/segment';
    let connMethod = 'POST'
    if (editMode) {
      connString = `tc-api/segment/${localSegmentId}`;
      connMethod = 'PUT';
    }
    fetch(connString, {
      method: connMethod,
      body: formData.current,
      headers: {
        Authorization: authorizationHeader
      }
    })
      .then(response => response.json())
      .then(data => {
        if (data > -1){
          console.log('AddSegment Form uploaded successfully:', data);
          if (editMode)
            console.log("edit Segment")
          setFormErrorMessage('');
        }          
        else {
          setFormErrorMessage('Nie udało się zapisać odcinka.');
        }
        setSubmitting(false);
        if(editMode)
          navigate(`/details-segment/${localSegmentId}`);  
        else
          navigate(`/details-segment/${data}`);
      })
      .catch(error => {
        console.error('Error uploading AddSegment form:', error);
        setFormErrorMessage('Nie udało się zapisać odcinka.');
        setSubmitting(false);
      });
    
  };

  // Callback when SegmentTypes are selected or removed
  const handlePoiTypes = (selectedList) => {
    const name = "SegmentTypes";
    setSelectedTypes(selectedList);

    formData.current.delete(name);
    if (selectedList.length === 0) {
      formData.current.set(name, '');
    }
    selectedList.forEach((option) => { formData.current.append(name, option.id); });

    const errors = validateInput(name, selectedList);
    setFormErrors({ ...formErrors, [name]: errors });    
  };

  const deletePhoto = () => {
    console.log("delete");
    setImagePreview(null);
    setPhotoValue('');
    formData.current.set("Photo", null);
    formData.current.set("deletePhoto", photoId.current);

    showFormData(formData.current, "after deletePhoto");
  }

  const showFormData = (formDataArg, comment) => {
    console.log(comment);
    for (const pair of formDataArg.entries()) {
      console.log(`${pair[0]}, ${pair[1]}`);
    }
  };

  const onRowSelect = (row) => {
    console.info("click onRowSelect", row);
  }

  return (
    <div className={styles.SegmentForm}>
      <PoiModal isOpen={modal} toggle={toggleModal} onRowSelect={onRowSelect}/>
      <Form id="SegmentForm" onSubmit={handleSubmit} encType="multipart/form-data">
        <Container>
          <Row className={styles.SectionTitle}>{editMode ? 'Edytowanie Odcinka' : 'Tworzenie Odcinka'}</Row>

          <Row>
            <Col sm={6}>

              <FormGroup row>
                <Label for="SegmentName" sm={4} lg={3}  className="text-end">Nazwa</Label>
                <Col sm={8} lg={9} >
                  <Input
                    name="Name"
                    id="SegmentName"
                    value={segmentName}
                    onChange={handleInputChange}
                    invalid={!!formErrors.Name}
                    placeholder="wprowadź maksymalnie 50 liter"
                    maxLength="50"
                  />
                  <FormFeedback>{formErrors.Name}</FormFeedback>
                </Col>            
              </FormGroup>

              <FormGroup row>
                <Label for="SegmentCountry" sm={4} lg={3}  className="text-end">Kraj</Label>
                <Col sm={8} lg={9} >
                  <Input
                    name="CountryId"
                    id="SegmentCountry"
                    type="select"
                    onChange={handleInputChange}
                    invalid={!!formErrors.CountryId}
                    value={selectedCountry}
                  >
                    {
                      appData ?
                      appData.Countries.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.countryName}
                          </option>
                        )) : null
                    }
                  </Input>
                  <FormFeedback>{formErrors.CountryId}</FormFeedback>
                </Col>
              </FormGroup> 
              
              <FormGroup row>
                <Label for="PathTypes" sm={4} lg={3}  className="text-end">Typ</Label>
                <Col sm={8} lg={9} >
                  {
                    !!appData &&
                      (<Multiselect
                        id="PathTypes"
                        options={appData.POITypes}
                        selectedValues={selectedTypes} 
                        onSelect={handlePoiTypes} 
                        onRemove={handlePoiTypes} 
                        displayValue="name" 
                        showCheckbox
                        placeholder="wybierz"
                        className={!!formErrors.PathTypes ? styles.MultiselectError : styles.Multiselect}
                      />)
                  }
                  <Input name="PathTypes" invalid={!!formErrors.PathTypes} className="d-none"></Input>
                  <FormFeedback>{formErrors.PathTypes}</FormFeedback>
                </Col>                
              </FormGroup>

              <FormGroup row>
                <Label for="SegmentDescription" sm={4} lg={3} className="text-end">Opis</Label>
                <Col sm={8} lg={9} >
                  <Input
                    type="textarea"
                    name="Description"
                    id="SegmentDescription"
                    value={segmentDescription}
                    onChange={handleInputChange}
                    invalid={!!formErrors.Description}
                    placeholder="wprowadź maksymalnie 2048 znaki"
                    maxLength="2048"
                    className={styles.Description}
                  />
                  <FormFeedback>{formErrors.Description}</FormFeedback>
                </Col>                
              </FormGroup>
              
              <div className={styles.Buttons + ' d-none d-sm-block'}>
                <Button>
                  Wyczyść
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Zapisuję...' : 'Zapisz'}
                </Button>
              </div>
            </Col>

            <Col sm={6} className='d-flex flex-column align-items-sm-center'>

              <div className={styles.Buttons + ' d-none d-sm-block'}>
                <Button onClick={toggleModal}>
                  Dodaj POI
                </Button>
              </div>
              
              <FormGroup row>
                <Label for="POIPhoto" sm={4} lg={3}  className="text-end">Zdjęcie</Label>
                <Col sm={8} lg={9} >
                  <Row>
                    <Col sm={11}>
                      <Input
                      type="file"
                      name="Photo"
                      id="POIPhoto"
                      value={photoValue}
                      onChange={handleInputChange}
                      invalid={!!formErrors.Photo}
                      accept=".jpg, .jpeg"
                      />
                    </Col>
                    <Col sm={1}>
                      {imagePreview && (<div class="mt-2 mt-lg-0"><i role="button" onClick={deletePhoto} class="bi bi-trash fs-4"></i></div>)}
                    </Col>
                  </Row>                
                  <FormFeedback>{formErrors.Photo}</FormFeedback>
                </Col>                
              </FormGroup>

              {
                //!!imagePreview && ( <img src={imagePreview} alt="Preview" className={styles.Photo} /> )
                <TCMap {...{ gpxUrls }} />
              }

            </Col>
          </Row>

          <p className={styles.FormErrorMessage}>{formErrorMessage}</p>

          <div className={styles.Buttons + ' d-sm-none'}>
            <Button>
              Anuluj
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Zapisuję...' : 'Zapisz'}
            </Button>
          </div>
        </Container>
      </Form>
    </div>
  );
};

SegmentForm.propTypes = {};

SegmentForm.defaultProps = {};

export default SegmentForm;
