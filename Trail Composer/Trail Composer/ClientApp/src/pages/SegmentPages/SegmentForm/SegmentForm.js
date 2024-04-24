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
import MapModal from "../../../modals/MapModal/MapModal";

const SegmentForm = () => {
  const appData = useContext(AppContext);
  const { result, error } = useMsalAuthentication(InteractionType.Redirect, { scopes: ['openid', 'offline_access'] });
  const { instance: pca, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});
  const navigate = useNavigate();

  const { segmentId } = useParams();
  const [localSegmentId, setLocalSegmentId] = useState(segmentId);
  const [editMode, setEditMode] = useState(false);
  const [poiModal, setPoiModal] = useState(false);
  const [mapModal, setMapModal] = useState(false);

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formErrorMessage, setFormErrorMessage] = useState('');

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
          const fetchedSegment = await fetch(`tc-api/segment/${localSegmentId}`).then(response => response.json());

          setSelectedCountry(fetchedSegment.countryId);
          setSegmentName(fetchedSegment.name);
          setSegmentDescription(fetchedSegment.description);
          setSelectedSegmentLevel(fetchedSegment.level);

          let fetchedPathTypes = pathTypes.filter(type => {
            const foundType = fetchedSegment.pathTypes.find((fetchedType) => fetchedType === type.id);
            return foundType;
          });
          setSelectedTypes(fetchedPathTypes);

          await fetch(`tc-api/poi/list/segment/${localSegmentId}`)
            .then((response) => response.json())
            .then((fetchedPois) => flattenData(fetchedPois, appData))
            .then((fetchedPois) => setData([...fetchedPois]));

          //look at photo to how to implement gpxFile
          setGpxPreview([`tc-api/segment/gpx/${localSegmentId}`]);

          formData.current.set('Name', fetchedSegment.name);
          formData.current.set('CountryId', fetchedSegment.countryId);
          formData.current.set('Description', fetchedSegment.description);
          formData.current.set('Level', fetchedSegment.level);
          handlePathTypes(fetchedPathTypes);

          showFormData(formData.current, "starting editMode");
        } catch (error) {
          console.error('Error fetching poi:', error);
        }
      };

      fetchData();
    }
  }, [editMode, localSegmentId, appData, segmentId]);

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
      case "PathTypes":
        if (value.length < 1)
          return 'Wybierz co najmniej jedną opcję.';
        break;
      case "Level":
        break;
      case "Gpx":
        console.info("File[0]", value);
        console.info("File[0] value type", value.type);
        const fileValue = value;
        if (!fileValue || !fileValue.name)
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
      case "Level":
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
      connString = `tc-api/segment/${localSegmentId}`;
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
          if (response.status === 201) { // Created
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
            navigate(`/details-segment/${localSegmentId}`);
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
    const name = "PathTypes";
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

  const gpxValidated = (boudingBox, distance) => {
    toggleSpinner();
    console.info('boudingBox: ', boudingBox);
    console.info("distance:", distance);
  };

  return (
    <div className={styles.SegmentForm}>
      <PoiModal isOpen={poiModal} toggle={togglePoiModal} onRowSelect={onRowSelect} />
      <MapModal
        isOpen={mapModal}
        toggle={toggleMapModal}
        gpxArr={gpxPreview}
        type={editMode ? "url" : "gpx"}
        {...{ gpxNotValidated, gpxValidated }}
      />
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
                      <div class="mt-2 mt-lg-0">
                        {gpxFile && (<i role="button" onClick={deleteGpx} className="bi bi-trash fs-4"></i>)}
                        {gpxPreview && (<i role="button" onClick={showGpx} className="bi bi-binoculars fs-4 ms-2"></i>)}
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

SegmentForm.propTypes = {};

SegmentForm.defaultProps = {};

export default SegmentForm;
