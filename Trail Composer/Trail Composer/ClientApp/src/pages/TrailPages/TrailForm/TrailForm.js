import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Form, FormGroup, Label, Input, FormFeedback, Col, Row, Container, FormText } from 'reactstrap';
import App, { AppContext } from '../../../App.js';
import Multiselect from 'multiselect-react-dropdown';
import { useMsal, useAccount, useMsalAuthentication, AuthenticatedTemplate } from "@azure/msal-react";
import { InteractionType } from '@azure/msal-browser';
import styles from './TrailForm.module.css';
import SegmentModal from '../../../modals/SegmentModal/SegmentModal'
import { getAuthHeader } from '../../../utils/auth/getAuthHeader.js';
import { SegmentTable } from '../../../components/tables/SegmentTable/SegmentTable.tsx';
import { moveUp, moveDown, addRow, deleteRow } from '../../../components/tables/rowActions.js';
import { flattenData } from '../../../components/tables/SegmentTable/flattenData.js';
import { useTcStore } from '../../../store/TcStore.js';
import MapModal from "../../../modals/MapModal/MapModal";
import PropTypes from 'prop-types';
import SectionTitle from "../../../components/SectionTitle/SectionTitle";

const TrailForm = ({editMode}) => {
  const { result, error } = useMsalAuthentication(InteractionType.Redirect, { scopes: ['openid', 'offline_access'] });
  const { instance: pca, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});
  const navigate = useNavigate();

  const { trailId } = useParams();
  const [segmentModal, setSegmentModal] = useState(false);
  const [mapModal, setMapModal] = useState(false);

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formErrorMessage, setFormErrorMessage] = useState('');

  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([{id: 29, name: 'Polska'}]);
  const [selectedTrailLevel, setSelectedTrailLevel] = useState(1);
  const [trailName, setTrailName] = useState('');
  const [trailDescription, setTrailDescription] = useState('');
  const [gpxPreview, setGpxPreview] = useState(null);
  const [countriesOptions, setCountriesOptions] = useState([]);
  const [storeReady, setStoreReady] = useState(false);

  const pathLevels = useTcStore((state) => state.pathLevels);
  const pathTypes = useTcStore((state) => state.pathTypes);
  const toggleSpinner = useTcStore((state) => state.toggleSpinner);
  const spinnerON = useTcStore((state) => state.spinnerON);
  const spinnerOFF = useTcStore((state) => state.spinnerOFF);
  const Countries = useTcStore(state => state.Countries);
  const CountryNamesMap = useTcStore(state => state.CountryNamesMap);
  const refreshTrailUserFiltered = useTcStore((state) => state.refreshTrailUserFiltered);

  let formData = useRef(new FormData());
  const blockClicks = useRef(false);

  const toggleSegmentModal = () => setSegmentModal(p => (!p));
  const toggleMapModal = () => setMapModal(m => (!m));

  // states needed for TrailTable
  const [data, setData] = useState([]);
  const showColumns = {
    'id': false,
    'username': false,
    'pathLength': false,
    'level': false,
    'country': false,
    'pathTypes': false
  }

  useEffect(() => {
    const multiselectOptions = Countries.length > 0 ? Countries.map( (option) =>
      ({id: option.id, name: option.countryName })) : [];
    setCountriesOptions(multiselectOptions);
  }, [Countries]);

  useEffect(() => {
    setStoreReady(Countries.length > 0 && Array.from(CountryNamesMap).length > 0 && pathTypes.length > 0 && pathLevels.length > 0);
  }, [Countries, CountryNamesMap, pathTypes, pathLevels]);

  useEffect(() => {

    const form = document.getElementById("TrailForm");
    formData.current = new FormData(form);
    handleCountries(selectedCountries);

    if (editMode && trailId && storeReady) {
      fetch(`tc-api/trail/${trailId}`).then(response => response.json()).then(trail => {
        setTrailName(trail.name);
        setSelectedTrailLevel(trail.levelId);

        const fetchedCountriesOptions = trail.countryIds.map( id => ({ id: id, name: CountryNamesMap.get(id) }));
        handleCountries(fetchedCountriesOptions);

        let fetchedPathTypes = pathTypes.filter(type => {
          const foundType = trail.pathTypeIds.find((fetchedTypeId) => fetchedTypeId == type.id);
          return foundType;
        });
        handlePathTypes(fetchedPathTypes);

        fetch(`tc-api/segment/list/trail/${trailId}`)
          .then((response) => response.json())
          .then((fetchedSegments) => flattenData(fetchedSegments, CountryNamesMap, pathTypes, pathLevels))
          .then((fetchedSegments) => {
            setData([...fetchedSegments]);
            updateGpxPreview(fetchedSegments);
            handleSegmentIds(fetchedSegments);
          });

        console.info("trail.description",trail.description === null ? 'przyszedl null' : 'przyszedl string');
        if (trail.description === null || trail.description === "null") {
          setTrailDescription('');
          formData.current.set('Description', '');
        } else {
          setTrailDescription(trail.description);
          formData.current.set('Description', trail.description);
        }

        formData.current.set('Name', trail.name);
        formData.current.set('LevelId', trail.levelId);

        showFormData(formData.current, "starting editMode");
      }).catch((error) => {
        console.error('Error fetching trail:', error);
      });
    }

  }, [editMode, trailId, storeReady]);

  useEffect(() => { console.info("table data", data) }, [data]);
  useEffect(() => { console.info("formErrors", formErrors) }, [formErrors]);

  const updateGpxPreview = (segments) => {
    let GpxPreviewArr = null;
    if(segments.length > 0) {
      GpxPreviewArr = segments.map((segment) => `tc-api/segment/gpx/${segment.id}`);
    }
    setGpxPreview(GpxPreviewArr);
  }

  const validateInput = (name, value) => {
    const emptyMsg = 'Pole jest wymagane.';
    const chooseOptionMsg = 'Wybierz co najmniej jedną opcję.';
    const addSegmentMsg = 'Dodaj co najmniej jeden odcinek';
    const tooManySegmentsMsg = 'Zbyt duża liczba odcinków';

    const checkArray = val => !Array.isArray(val) || (val.length === 1 && val[0] === '');

    switch (name) {
      case "Name":
        if (value.trim() === '')
          return emptyMsg;
        break;
      case "CountryIds":
        if(checkArray(value))
          return chooseOptionMsg;
        break;
      case "PathTypeIds":
        if (checkArray(value))
          return chooseOptionMsg;
        break;
      case "LevelId":
        break;
      case "Description":
        // description is optional
        break;
      case "SegmentIds":
        if(checkArray(value))
          return addSegmentMsg;
        if(value.length > 500)
          return tooManySegmentsMsg;
        break;
      default:
    }

    return ''; // No errors
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    let multiSelectCase = false;
    switch (name) {
      case "Name":
        setTrailName(value);
        break;
      case "LevelId":
        setSelectedTrailLevel(value);
        break;
      case "Description":
        setTrailDescription(value);
        break;
      default:
        multiSelectCase = true;
    }

    const errors = validateInput(name, value);
    if(!multiSelectCase) {
      formData.current.set(name, value);
    }
    setFormErrors(formErrors => ({ ...formErrors, [name]: errors }));
  };

  const handleCountries = (selectedList) => {
    const name = "CountryIds";
    setSelectedCountries([...selectedList]);

    formData.current.delete(name);
    if (selectedList.length === 0) {
      formData.current.set(name, '');
    } else {
      selectedList.forEach((option) => { formData.current.append(name, option.id); });
    }
    const errors = validateInput(name, formData.current.getAll(name));
    setFormErrors({ ...formErrors, [name]: errors });
  };

  // Callback when PathTypes are selected or removed
  const handlePathTypes = (selectedList) => {
    const name = "PathTypeIds";
    setSelectedTypes(selectedList);

    formData.current.delete(name);
    if (selectedList.length === 0) {
      formData.current.set(name, '');
    } else {
      selectedList.forEach((option) => { formData.current.append(name, option.id); });
    }

    const errors = validateInput(name, formData.current.getAll(name));
    setFormErrors(formErrors => ({ ...formErrors, [name]: errors }));
  };

  const handleSegmentIds = (segments) => {
    const name = "SegmentIds";
    formData.current.delete(name);
    if(segments.length === 0) {
      formData.current.set(name, '');
    } else {
      segments.forEach((segment) => { formData.current.append(name, segment.id); });
    }

    const errors = validateInput(name, formData.current.getAll(name));
    console.log('formData.current.getAll(name): ', formData.current.getAll(name));
    setFormErrors({ ...formErrors, [name]: errors });
    showFormData(formData.current, 'in handleSegmentsIds after loading segments');
  }

  const validateForm = () => {
    //debugger;
    const errors = {};
    const arrayFields = ['CountryIds', 'PathTypeIds', 'SegmentIds'];
    const doNotRepeatFields = [];
    formData.current.forEach((value, key) => {
      let valueToCheck = value;
      if(arrayFields.indexOf(key) !== -1) {
        if(doNotRepeatFields.indexOf(key) === -1) {
          doNotRepeatFields.push(key);
        } else {
          return;
        }
        valueToCheck = formData.current.getAll(key);
      }
      const fieldErrors = validateInput(key, valueToCheck);
      if (fieldErrors !== '') {
        errors[key] = fieldErrors;
      }
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return false;
    }
    return true;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if(!validateForm()) return;

    setFormErrors({});

    setSubmitting(true);

    showFormData(formData.current, "przed fetch");

    const authorizationHeader = await getAuthHeader(pca, account);

    let connString = 'tc-api/trail';
    let connMethod = 'POST';
    if (editMode) {
      connString = `tc-api/trail/${trailId}`;
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
            console.log('Trail created successfully');
            return response.json();
          } else {
            console.error('Unexpected response status:', response.status);
            setFormErrorMessage('Nie udało się zapisać odcinka.');
          }
        } else {
          console.error('Error uploading AddTrail form:', response.status);
          setFormErrorMessage('Nie udało się zapisać odcinka.');
        }
      })
      .then(responseData => {
        if (responseData > -1) {
          console.log('AddTrail Form uploaded successfully:', responseData);
          if (editMode)
            console.log("edit Trail")
          setFormErrorMessage('');
        }
        else {
          setFormErrorMessage('Nie udało się zapisać odcinka.');
          console.error("bla bla", responseData);
        }
        setSubmitting(false);
        toggleSpinner();
        if (responseData > -1){
          refreshTrailUserFiltered(pca, account);
          if (editMode)
            navigate(`/details-trail/${trailId}`);
          else
            navigate(`/details-trail/${responseData}`);
        }
      })
      .catch(error => {
        console.error('Error uploading AddTrail form:', error);
        setFormErrorMessage('Nie udało się zapisać odcinka.');
        setSubmitting(false);
        toggleSpinner();
      });

  };

  const handleCancel = () => {
    navigate(-1);
  }

  const showFormData = (formDataArg, comment) => {
    console.log(comment);
    for (const pair of formDataArg.entries()) {
      console.log(`${pair[0]}, ${pair[1]}`);
    }
  };

  // function for SegmentModal
  const onRowSelect = (row) => {
    if(blockClicks.current) return;
    blockClicks.current = true
    setTimeout(() => {
      blockClicks.current = false;
    }, 500);

    setData((d) => {
      const dataTmp = [...addRow(d, row)];
      updateGpxPreview(dataTmp);
      handleSegmentIds(dataTmp);
      return dataTmp;
    });

    setSegmentModal(false);
  };

  // functions for SegmentTable
  const onMoveUp = (row) => {
    console.info("before moveUp", JSON.stringify(data));
    setData((d) => [...moveUp(d, row)]);
  };

  const onMoveDown = (row) => {
    console.info("before moveDown", JSON.stringify(data));
    setData((d) => [...moveDown(d, row)]);
  };

  const onDelete = (row) => {
    setData((d) => {
      const dataTmp = [...deleteRow(d, row)];
      updateGpxPreview(dataTmp);
      handleSegmentIds(dataTmp);
      validateForm();
      return dataTmp;
    });

  };

  const showGpx = () => {
    toggleSpinner();
    toggleMapModal();
  }

  const gpxNotValidated = () => {
    toggleSpinner();
    setGpxPreview(null);
    toggleMapModal();
  };

  const gpxValidated = (boundingBox, distance) => {
    toggleSpinner();
  };

  return (
    <div className={styles.TrailForm}>
      <SegmentModal isOpen={segmentModal} toggle={toggleSegmentModal} onRowSelect={onRowSelect} />
      <MapModal
        isOpen={mapModal}
        toggle={toggleMapModal}
        gpxArr={gpxPreview}
        type={'url'}
        {...{ gpxNotValidated, gpxValidated }}
      />
      <Form id="TrailForm" onSubmit={handleSubmit} encType="multipart/form-data">
        <Container>
          <Row className={styles.SectionTitle}>
            <SectionTitle>{editMode ? 'Edytowanie trasy' : 'Tworzenie trasy'}</SectionTitle>
          </Row>
          <Row>
            <Col sm={12} xxl={6}>

              <FormGroup row>
                <Label for="TrailName" sm={4} lg={3} className="text-end">Nazwa</Label>
                <Col sm={8} lg={9} >
                  <Input
                    name="Name"
                    id="TrailName"
                    value={trailName}
                    onChange={handleInputChange}
                    invalid={!!formErrors.Name}
                    placeholder="wprowadź maksymalnie 50 liter"
                    maxLength="50"
                  />
                  <FormFeedback>{formErrors.Name}</FormFeedback>
                </Col>
              </FormGroup>

              <FormGroup row>
                <Label for="CountryIds" sm={4} lg={3} className="text-end">Kraje</Label>
                <Col sm={8} lg={9} >
                  {
                    storeReady &&
                    (<Multiselect
                      id="CountryIds"
                      options={countriesOptions}
                      selectedValues={selectedCountries}
                      onSelect={handleCountries}
                      onRemove={handleCountries}
                      displayValue="name"
                      showCheckbox
                      placeholder="wybierz"
                      className={!!formErrors.CountryIds ? styles.MultiselectError : styles.Multiselect}
                    />)
                  }
                  <Input name="CountryIds" invalid={!!formErrors.CountryIds} className="d-none"></Input>
                  <FormFeedback>{formErrors.CountryIds}</FormFeedback>
                </Col>
              </FormGroup>

              <FormGroup row>
                <Label for="PathTypeIds" sm={4} lg={3} className="text-end">Typ ścieżki</Label>
                <Col sm={8} lg={9} >
                  {
                    storeReady &&
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
                    value={selectedTrailLevel}
                  >
                    {
                      storeReady ?
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
                <Label for="TrailDescription" sm={4} lg={3} className="text-end">Opis</Label>
                <Col sm={8} lg={9} >
                  <Input
                    type="textarea"
                    name="Description"
                    id="TrailDescription"
                    value={trailDescription}
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
                <Button onClick={toggleSegmentModal} className={styles.SegmentModalButton}>
                  Dodaj odcinek
                </Button>
                {gpxPreview && (<i role="button" onClick={showGpx} className="bi bi-eye fs-2 ms-2 "></i>)}
              </div>
              <div className={`${styles.SegmentTable} ${!!formErrors.SegmentIds && styles.SegmentTableError}`}>
                <svg
                  className={`${styles.SegmentTableNoIcon} ${!!formErrors.SegmentIds && styles.SegmentTableErrorIcon}`}
                  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" fill="none" stroke="#dc3545">
                  <circle cx="6" cy="6" r="4.5"/>
                  <path stroke-linejoin="round" d="M5.8 3.6h.4L6 6.5z"/>
                  <circle cx="6" cy="8.2" r=".6" fill="#dc3545" stroke="none"/>
                </svg>
                <SegmentTable {...{data, showColumns, onMoveDown, onMoveUp, onDelete}} />
              </div>
              <Input name="SegmentIds" invalid={!!formErrors.SegmentIds} className="d-none"></Input>
              <FormFeedback>{formErrors.SegmentIds}</FormFeedback>

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

TrailForm.propTypes = {
  editMode : PropTypes.bool.isRequired
};

TrailForm.defaultProps = {};

export default TrailForm;
