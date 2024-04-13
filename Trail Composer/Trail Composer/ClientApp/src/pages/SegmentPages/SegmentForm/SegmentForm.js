import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Form, FormGroup, Label, Input, FormFeedback, Col, Row, Container, FormText } from 'reactstrap';
import App, { AppContext } from '../../../App.js';
import Multiselect from 'multiselect-react-dropdown';
import { useMsal, useAccount, useMsalAuthentication, AuthenticatedTemplate } from "@azure/msal-react";
import { InteractionType } from '@azure/msal-browser';
import styles from './SegmentForm.module.css';
import PoiModal from '../../../modals/PoiModal/PoiModal'
import { getAuthHeader } from '../../../utils/auth/getAuthHeader.js';
import { PoiTable } from '../../../components/tables/PoiTable/PoiTable.tsx';
import { moveUp, moveDown, addRow, deleteRow } from '../../../components/tables/rowActions.js';
import { makeData } from '../../../components/tables/PoiTable/makeData.ts';
import { flattenData } from '../../../components/tables/PoiTable/flattenData.js';
import { useTcStore } from '../../../store/TcStore.js';
import BackArrow from '../../../components/BackArrow/BackArrow.js';

const SegmentForm = () => {
  const appData = useContext(AppContext);
  const { result, error } = useMsalAuthentication(InteractionType.Redirect, { scopes: ['openid', 'offline_access'] });
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
  const [selectedSegmentLevel, setSelectedSegmentLevel] = useState(1);
  const [segmentName, setSegmentName] = useState('');
  const [segmentDescription, setSegmentDescription] = useState('');
  const [gpxFile, setGpxFile] = useState(null);

  const pathLevels = useTcStore((state) => state.pathLevels);
  const pathTypes = useTcStore((state) => state.pathTypes);

  let formData = useRef(new FormData());

  const toggleModal = () => setModal(!modal);

  // states needed for PoiTable
  const [data, setData] = useState([]);
  const showColumns = {
    'id': false,
    'username': false,
    'latitude': false,
    'longitude': false,
    'country': false,
    'poiTypes': false
  }

  useEffect(() => {
    setLocalSegmentId(segmentId);

    if (!isNaN(Number.parseInt(localSegmentId)))
      setEditMode(true);
    else
      setEditMode(false);

    const form = document.getElementById("SegmentForm");
    formData.current = new FormData(form);
    formData.current.set("CountryId", selectedCountry);

    if (editMode && localSegmentId && appData) {
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

  useEffect(() => { console.info("gpx file", gpxFile) }, [gpxFile]);
  useEffect(() => { console.info("formErrors", formErrors) }, [formErrors]);

  const validateInput = (name, value) => {
    const emptyMsg = 'Pole jest wymagane.';

    switch (name) {
      case "Name":
        if (value.trim() === '')
          return emptyMsg;
        break;
      case "CountryId":
        break;
      case "PathTypes":
        if (value.length < 1)
          return 'Wybierz co najmniej jedną opcję.';
        break;
      case "Level":
        break;
      case "Gpx":
        if (!value || value.size < 1)
          return emptyMsg;
        break;
      case "Description":
        // description is optional
        break;
      case "PoiIds":
        break;
      default:
    }

    return ''; // No errors
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      const reader = new FileReader();

      if (files.length > 0) {
        reader.readAsDataURL(files[0]);
        const errors = validateInput(name, files[0]);
        formData.current.set(name, files[0]);
        setGpxFile(value);
        setFormErrors({ ...formErrors, [name]: errors });
      }
    } else {
      switch (name) {
        case "CountryId":
          setSelectedCountry(value);
          break;
        case "Name":
          setSegmentName(value);
          break;
        case "Level":
          setSelectedSegmentLevel(value);
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

    const poiIdsName = "PoiIds";
    formData.current.delete(poiIdsName);
    data.forEach((row) => { formData.current.append(poiIdsName, row.id); });

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
      .then(responseData => {
        if (responseData > -1) {
          console.log('AddSegment Form uploaded successfully:', responseData);
          if (editMode)
            console.log("edit Segment")
          setFormErrorMessage('');
        }
        else {
          setFormErrorMessage('Nie udało się zapisać odcinka.');
        }
        setSubmitting(false);
        if (editMode)
          navigate(`/details-segment/${localSegmentId}`);
        else
          navigate(`/details-segment/${responseData}`);
      })
      .catch(error => {
        console.error('Error uploading AddSegment form:', error);
        setFormErrorMessage('Nie udało się zapisać odcinka.');
        setSubmitting(false);
      });

  };

  // Callback when PathTypes are selected or removed
  const handlePathTypes = (selectedList) => {
    const name = "PathTypes";
    setSelectedTypes(selectedList);

    formData.current.delete(name);
    if (selectedList.length === 0) {
      formData.current.set(name, '');
    }
    selectedList.forEach((option) => { formData.current.append(name, option.id); });

    const errors = validateInput(name, selectedList);
    setFormErrors({ ...formErrors, [name]: errors });
  };

  const deleteGpx = () => {
    console.log("deleteGpx");
    const name = "Gpx";
    const value = '';

    setGpxFile(value);

    const errors = validateInput(name, value);
    formData.current.set(name, value);
    setFormErrors({ ...formErrors, [name]: errors });
  };

  const showFormData = (formDataArg, comment) => {
    console.log(comment);
    for (const pair of formDataArg.entries()) {
      console.log(`${pair[0]}, ${pair[1]}`);
    }
  };

  // functions for PoiModal
  const onRowSelect = (row) => {
    setData((d) => [...addRow(d, row)]);
    setModal(false);
  };

  // functions for PoiTable
  const onMoveUp = (row) => {
    //debugger;
    console.info("before moveUp", JSON.stringify(data));
    //moveUp(data, row);
    setData((d) => [...moveUp(d, row)]);
  };

  const onMoveDown = (row) => {
    //debugger;
    console.info("before moveDown", JSON.stringify(data));
    //moveDown(data, row);
    setData((d) => [...moveDown(d, row)]);
  };

  const onDelete = (row) => {
    setData((d) => [...deleteRow(d, row)]);
  };

  return (
    <div className={styles.SegmentForm}>
      <PoiModal isOpen={modal} toggle={toggleModal} onRowSelect={onRowSelect} />
      <Form id="SegmentForm" onSubmit={handleSubmit} encType="multipart/form-data">
        <Container>
          <Row className={styles.SectionTitle}>
            <Col sm={1} className="d-flex justify-content-start" >
              <BackArrow />
            </Col>
            <Col>
              {editMode ? 'Edytowanie odcinka' : 'Tworzenie odcinka'}
            </Col>
          </Row>

          <Row>
            <Col sm={12} xxl={6}>

              <FormGroup row>
                <Label for="SegmentName" sm={4} lg={3} className="text-end">Nazwa</Label>
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
                <Label for="SegmentCountry" sm={4} lg={3} className="text-end">Kraj</Label>
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
                <Label for="PathTypes" sm={4} lg={3} className="text-end">Typ ścieżki</Label>
                <Col sm={8} lg={9} >
                  {
                    !!appData &&
                    (<Multiselect
                      id="PathTypes"
                      options={pathTypes}
                      selectedValues={selectedTypes}
                      onSelect={handlePathTypes}
                      onRemove={handlePathTypes}
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
                <Label for="PathLevel" sm={4} lg={3} className="text-end">Poziom trudności</Label>
                <Col sm={8} lg={9} >
                  <Input
                    name="Level"
                    id="PathLevel"
                    type="select"
                    onChange={handleInputChange}
                    invalid={!!formErrors.Level}
                    value={selectedSegmentLevel}
                  >
                    {
                      pathLevels ?
                        pathLevels.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.level}
                          </option>
                        )) : null
                    }
                  </Input>
                  <FormFeedback>{formErrors.Level}</FormFeedback>
                </Col>
              </FormGroup>

              <FormGroup row>
                <Label for="GpxFile" sm={4} lg={3} className="text-end">Plik gpx</Label>
                <Col sm={8} lg={9} >
                  <Row>
                    <Col sm={10}>
                      <Input
                        type="file"
                        name="Gpx"
                        id="GpxFile"
                        value={gpxFile}
                        onChange={handleInputChange}
                        invalid={!!formErrors.Gpx}
                        accept=".gpx"
                      />
                      <FormFeedback>{formErrors.Gpx}</FormFeedback>
                    </Col>
                    <Col sm={2}>
                      {(<div class="mt-2 mt-lg-0"><i role="button" onClick={deleteGpx} className="bi bi-trash fs-4"></i></div>)}
                    </Col>
                  </Row>
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

              <div className={styles.Buttons + ' d-none d-xxl-block'}>
                <Button>
                  Wyczyść
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Zapisuję...' : 'Zapisz'}
                </Button>
              </div>
            </Col>

            <Col sm={12} xxl={6} className='d-flex flex-column align-items-sm-start'>
              <div>
                <Button onClick={toggleModal} className={styles.ModalButton}>
                  Dodaj POI
                </Button>
              </div>
              <PoiTable {...{ data, showColumns, onMoveDown, onMoveUp, onDelete }} />
            </Col>
          </Row>

          <p className={styles.FormErrorMessage}>{formErrorMessage}</p>

          <div className={styles.Buttons + ' d-xxl-none'}>
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
