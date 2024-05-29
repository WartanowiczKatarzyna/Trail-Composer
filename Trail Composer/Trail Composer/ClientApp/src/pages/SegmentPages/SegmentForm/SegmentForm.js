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
import MapModal from "../../../modals/MapModal/MapModal";
import PropTypes from 'prop-types';
import SectionTitle from "../../../components/SectionTitle/SectionTitle";
import {geoRefFloatToIntStr} from "../../../utils/geoRef";

const SegmentForm = ({editMode}) => {
  const appData = useContext(AppContext);
  const { result, error } = useMsalAuthentication(InteractionType.Redirect, { scopes: ['openid', 'offline_access'] });
  const { instance: pca, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});
  const navigate = useNavigate();

  const { segmentId } = useParams();
  const [poiModal, setPoiModal] = useState(false);
  const [mapModal, setMapModal] = useState(false);

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formErrorMessage, setFormErrorMessage] = useState('');
  const [gpxType, setGpxType] = useState('gpx');

  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(29);
  const [selectedSegmentLevel, setSelectedSegmentLevel] = useState(1);
  const [segmentName, setSegmentName] = useState('');
  const [segmentDescription, setSegmentDescription] = useState('');
  const [gpxFile, setGpxFile] = useState(null);
  const [gpxPreview, setGpxPreview] = useState(null);

  const pathLevels = useTcStore((state) => state.pathLevels);
  const pathTypes = useTcStore((state) => state.pathTypes);
  const toggleSpinner = useTcStore((state) => state.toggleSpinner);

  let formData = useRef(new FormData());

  const gpxValidationNegative = useRef(false);
  const TCfileReader = useRef(null);
  const blockClicks = useRef(false);
  const togglePoiModal = () => setPoiModal(p => (!p));
  const toggleMapModal = () => setMapModal(m => (!m));

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
    TCfileReader.current = new FileReader();

    TCfileReader.current.onloadend = () => {
      setGpxPreview(() => {
        toggleMapModal();
        return [TCfileReader.current.result];
      });
    }
  }, []);

  useEffect(() => {

    const form = document.getElementById("SegmentForm");
    formData.current = new FormData(form);
    formData.current.set("CountryId", selectedCountry);

    if (editMode && segmentId && appData) {
      setGpxType('url');

      const fetchData = async () => {
        try {
          const fetchedSegment = await fetch(`tc-api/segment/${segmentId}`).then(response => response.json());

          setSelectedCountry(fetchedSegment.countryId);
          setSegmentName(fetchedSegment.name);
          setSelectedSegmentLevel(fetchedSegment.levelId);


          let fetchedPathTypes = pathTypes.filter(type => {
            const foundType = fetchedSegment.pathTypeIds.find((fetchedTypeId) => fetchedTypeId == type.id);
            return foundType;
          });
          setSelectedTypes(fetchedPathTypes);

          await fetch(`tc-api/poi/list/segment/${segmentId}`)
            .then((response) => response.json())
            .then((fetchedPois) => flattenData(fetchedPois, appData))
            .then((fetchedPois) => setData([...fetchedPois]));

          setGpxPreview([`tc-api/segment/gpx/${segmentId}`]);

          console.info("fetchedSegment.description",fetchedSegment.description === null ? 'przyszedl null' : 'przyszedl string');
          if (fetchedSegment.description === null || fetchedSegment.description === "null") {
            setSegmentDescription('');
            formData.current.set('Description', '');
          } else {
            setSegmentDescription(fetchedSegment.description);
            formData.current.set('Description', fetchedSegment.description);
          }

          formData.current.set('Name', fetchedSegment.name);
          formData.current.set('CountryId', fetchedSegment.countryId);
          formData.current.set('LevelId', fetchedSegment.levelId);
          formData.current.set('Gpx', '');

          const pathLengthNum = parseInt(fetchedSegment?.pathLength);
          const pathLengthNumChecked = Number.isNaN(pathLengthNum) ? 0 : pathLengthNum;
          formData.current.set('PathLength', pathLengthNumChecked.toString());
          handlePathTypes(fetchedPathTypes);

          showFormData(formData.current, "starting editMode");
        } catch (error) {
          console.error('Error fetching segment:', error);
        }
      };

      fetchData();
    }
  }, [editMode, segmentId, appData]);

  useEffect(() => { console.info("gpx file", gpxFile) }, [gpxFile]);
  useEffect(() => { console.info("table data", data) }, [data]);
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
      case "PathTypeIds":
        if (value.length < 1)
          return 'Wybierz co najmniej jedną opcję.';
        break;
      case "LevelId":
        break;
      case "Gpx":
        const fileValue = value;
        if (editMode && (!fileValue || !fileValue.name))
          return '';
        else if (!fileValue || !fileValue.name)
          return emptyMsg  // Gpx file is required
        else if (!fileValue.name.match(/.*\.gpx/))
          return 'Plik ma rozszerzenie inne niż gpx.';
        else if (fileValue.size > 1024 * 1024 * 10)
          return 'Rozmiar pliku zbyt duży. Rozmiar gpx przekracza 10 MB.';
        else if (fileValue.size < 1)
          return 'Rozmiar pliku zbyt mały. Rozmiar gpx 0 bytes.';
        else if (gpxValidationNegative.current)
          return 'Nie powidło się parsowanie pliku gpx.';
        else
          return ''; // other cases are accepted
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

    switch (name) {
      case "Gpx":
        gpxValidationNegative.current = false;
        const errors = validateInput(name, files[0]);
        if (gpxType === 'url')
          setGpxType('gpx');
        if (files.length > 0) {
          if (!errors) {
            toggleSpinner();
            TCfileReader.current.readAsText(files[0]);
          }
        } else {
          setGpxPreview(null);
        }
        formData.current.set(name, files[0]);
        setFormErrors(formErrors => ({ ...formErrors, [name]: errors }));
        setGpxFile(value);
        return;
      case "CountryId":
        setSelectedCountry(value);
        break;
      case "Name":
        setSegmentName(value);
        break;
      case "LevelId":
        setSelectedSegmentLevel(value);
        break;
      case "Description":
        setSegmentDescription(value);
        break;
    }

    const errors = validateInput(name, value);
    formData.current.set(name, value);
    setFormErrors(formErrors => ({ ...formErrors, [name]: errors }));
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

    const authorizationHeader = await getAuthHeader(pca, account);

    let connString = 'tc-api/segment';
    let connMethod = 'POST';
    if (editMode) {
      connString = `tc-api/segment/${segmentId}`;
      connMethod = 'PUT';
    }
    toggleSpinner();
    fetch(connString, {
      method: connMethod,
      body: formData.current,
      headers: {
        Authorization: authorizationHeader
      }
    })
      .then(response => {
        if (response.ok) {
          if (response.status === 201 || response.status === 200) {
            console.log('Segment created successfully');
            return response.json();
          } else {
            console.error('Unexpected response status:', response.status);
            setFormErrorMessage('Nie udało się zapisać odcinka.');
          }
        } else {
          console.error('Error uploading AddSegment form:', response.status);
          setFormErrorMessage('Nie udało się zapisać odcinka.');
        }
      })
      .then(responseData => {
        if (responseData > -1) {
          console.log('AddSegment Form uploaded successfully:', responseData);
          if (editMode)
            console.log("edit Segment")
          setFormErrorMessage('');
          if (editMode)
            navigate(`/details-segment/${segmentId}`);
          else
            navigate(`/details-segment/${responseData}`);
        }
        else {
          setFormErrorMessage('Nie udało się zapisać odcinka.');
          console.error("bla bla", responseData);
        }
        setSubmitting(false);
        toggleSpinner();
      })
      .catch(error => {
        console.error('Error uploading AddSegment form:', error);
        setFormErrorMessage('Nie udało się zapisać odcinka.');
        setSubmitting(false);
        toggleSpinner();
      });

  };

  const handleCancel = () => {
    navigate(-1);
  }

  // Callback when PathTypes are selected or removed
  const handlePathTypes = (selectedList) => {
    const name = "PathTypeIds";
    setSelectedTypes(selectedList);

    formData.current.delete(name);
    if (selectedList.length === 0) {
      formData.current.set(name, '');
    }
    selectedList.forEach((option) => { formData.current.append(name, option.id); });

    const errors = validateInput(name, selectedList);
    setFormErrors(formErrors => ({ ...formErrors, [name]: errors }));
  };

  const deleteGpx = () => {
    console.log("deleteGpx");
    const name = "Gpx";
    const value = '';

    setGpxFile(value);
    setGpxPreview(null);

    gpxValidationNegative.current = false;
    const errors = validateInput(name, value);
    formData.current.set(name, value);
    setFormErrors(formErrors => ({ ...formErrors, [name]: errors }));
  };

  const showGpx = () => {
    toggleSpinner();
    toggleMapModal();
  }

  const showFormData = (formDataArg, comment) => {
    console.log(comment);
    for (const pair of formDataArg.entries()) {
      console.log(`${pair[0]}, ${pair[1]}`);
    }
  };

  // functions for PoiModal
  const onRowSelect = (row) => {
    if(blockClicks.current) return;
    blockClicks.current = true
    setTimeout(() => {
      blockClicks.current = false;
    }, 500);

    setData((d) => [...addRow(d, row)]);
    setPoiModal(false);
  };

  // functions for PoiTable
  const onMoveUp = (row) => {
    console.info("before moveUp", JSON.stringify(data));
    setData((d) => [...moveUp(d, row)]);
  };

  const onMoveDown = (row) => {
    console.info("before moveDown", JSON.stringify(data));
    setData((d) => [...moveDown(d, row)]);
  };

  const onDelete = (row) => {
    setData((d) => [...deleteRow(d, row)]);
  };

  const gpxNotValidated = () => {
    gpxValidationNegative.current = true;
    const name = "Gpx";
    const value = {};
    const errors = validateInput(name, value);
    formData.current.set(name, value);
    setFormErrors(formErrors => ({ ...formErrors, [name]: errors }));
    toggleSpinner();
    setGpxPreview(null);
    toggleMapModal();
  };

  const gpxValidated = (boundingBox, distance) => {
    toggleSpinner();
    formData.current.set('PathLength', Math.round(distance).toString()); // rounded to 1 meter
    const { lat: maxLatitude, lng: maxLongitude } = boundingBox.getNorthEast();
    const { lat: minLatitude, lng: minLongitude } = boundingBox.getSouthWest();
    formData.current.set('MaxLatitude', geoRefFloatToIntStr(maxLatitude));
    formData.current.set('MaxLongitude', geoRefFloatToIntStr(maxLongitude));
    formData.current.set('MinLatitude', geoRefFloatToIntStr(minLatitude));
    formData.current.set('MinLongitude', geoRefFloatToIntStr(minLongitude));

    console.info('boudingBox: ', boundingBox);
    console.info('maxLatitude: ', geoRefFloatToIntStr(maxLatitude));
    console.info('maxLongitude: ', geoRefFloatToIntStr(maxLongitude));
    console.info('minLatitude: ', geoRefFloatToIntStr(minLatitude));
    console.info('minLongitude: ', geoRefFloatToIntStr(minLongitude));
    console.info("distance rounded to meters [m]:", Math.round(distance));
  };

  return (
    <div className={styles.SegmentForm}>
      <PoiModal isOpen={poiModal} toggle={togglePoiModal} onRowSelect={onRowSelect} />
      <MapModal
        isOpen={mapModal}
        toggle={toggleMapModal}
        gpxArr={gpxPreview}
        type={gpxType}
        {...{ gpxNotValidated, gpxValidated }}
      />
      <Form id="SegmentForm" onSubmit={handleSubmit} encType="multipart/form-data">
        <Container>
          <Row className={styles.SectionTitle}>
            <SectionTitle>{editMode ? 'Edytowanie odcinka' : 'Tworzenie odcinka'}</SectionTitle>
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
                <Label for="PathTypeIds" sm={4} lg={3} className="text-end">Typ ścieżki</Label>
                <Col sm={8} lg={9} >
                  {
                    !!appData &&
                    (<Multiselect
                      id="PathTypeIds"
                      options={pathTypes}
                      selectedValues={selectedTypes}
                      onSelect={handlePathTypes}
                      onRemove={handlePathTypes}
                      displayValue="name"
                      showCheckbox
                      placeholder="wybierz"
                      className={!!formErrors.PathTypeIds ? styles.MultiselectError : styles.Multiselect}
                    />)
                  }
                  <Input name="PathTypeIds" invalid={!!formErrors.PathTypeIds} className="d-none"></Input>
                  <FormFeedback>{formErrors.PathTypeIds}</FormFeedback>
                </Col>
              </FormGroup>

              <FormGroup row>
                <Label for="PathLevel" sm={4} lg={3} className="text-end">Poziom trudności</Label>
                <Col sm={8} lg={9} >
                  <Input
                    name="LevelId"
                    id="LevelId"
                    type="select"
                    onChange={handleInputChange}
                    invalid={!!formErrors.LevelId}
                    value={selectedSegmentLevel}
                  >
                    {
                      pathLevels ?
                        pathLevels.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.name}
                          </option>
                        )) : null
                    }
                  </Input>
                  <FormFeedback>{formErrors.LevelId}</FormFeedback>
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
                      <div class="mt-2 mt-lg-0">
                        {gpxFile && (<i role="button" onClick={deleteGpx} className="bi bi-trash fs-4"></i>)}
                        {gpxPreview && (<i role="button" onClick={showGpx} className="bi bi-eye fs-4 ms-2"></i>)}
                      </div>
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
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Zapisuję...' : 'Zapisz'}
                </Button>
              </div>
            </Col>

            <Col sm={12} xxl={6} className='d-flex flex-column align-items-sm-start'>
              <div>
                <Button onClick={togglePoiModal} className={styles.PoiModalButton}>
                  Dodaj POI
                </Button>
              </div>
              <PoiTable {...{ data, showColumns, onMoveDown, onMoveUp, onDelete }} />
            </Col>
          </Row>

          <p className={styles.FormErrorMessage}>{formErrorMessage}</p>

          <div className={styles.Buttons + ' d-xxl-none'}>
            <Button onClick={handleCancel}>
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

SegmentForm.propTypes = {
  editMode : PropTypes.bool.isRequired
};

SegmentForm.defaultProps = {};

export default SegmentForm;
