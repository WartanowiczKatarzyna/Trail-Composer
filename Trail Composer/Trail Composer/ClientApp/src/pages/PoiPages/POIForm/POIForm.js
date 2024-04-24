import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Form, FormGroup, Label, Input, FormFeedback, Col, Row, Container, FormText } from 'reactstrap';
import App, { AppContext } from '../../../App.js';
import Multiselect from 'multiselect-react-dropdown';
import { useMsal, useAccount, useMsalAuthentication, AuthenticatedTemplate } from "@azure/msal-react";
import { InteractionType } from '@azure/msal-browser';
import styles from './POIForm.module.css';
import { getAuthHeader } from '../../../utils/auth/getAuthHeader.js';
import BackArrow from '../../../components/BackArrow/BackArrow.js';
import { useTcStore } from "../../../store/TcStore";

const PoiForm = () => {
  const appData = useContext(AppContext);
  const { result, error } = useMsalAuthentication(InteractionType.Redirect, { scopes: ['openid', 'offline_access'] });
  const { instance: pca, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});
  const navigate = useNavigate();

  const { poiId } = useParams();
  const [localPoiId, setLocalPoiId] = useState(poiId);
  const [editMode, setEditMode] = useState(false);

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formErrorMessage, setFormErrorMessage] = useState('');
  const [selectedPOITypes, setSelectedPOITypes] = useState([]);
  const [selectedPOICountry, setSelectedPOICountry] = useState(29);
  const [poiName, setPoiName] = useState('');
  const [poiDescription, setPoiDescription] = useState('');
  const [poiLatitude, setPoiLatitude] = useState();
  const [poiLongitude, setPoiLongitude] = useState();
  const [imagePreview, setImagePreview] = useState(null);
  const [photoValue, setPhotoValue] = useState(null);

  let formData = useRef(new FormData());
  let photoId = useRef(0);
  const TCfileReader = useRef(null);

  const refreshPoiUserFiltered = useTcStore((state) => state.refreshPoiUserFiltered);
  const toggleSpinner = useTcStore((state) => state.toggleSpinner);

  useEffect(() => {
    TCfileReader.current = new FileReader();

    TCfileReader.current.onloadend = () => {
      setImagePreview(TCfileReader.current.result);
    }
  },[]);

  useEffect(() => {
    setLocalPoiId(poiId);

    if (!isNaN(Number.parseInt(localPoiId)))
      setEditMode(true);
    else
      setEditMode(false);

    const form = document.getElementById("POIForm");
    formData.current = new FormData(form);
    formData.current.set("CountryId", selectedPOICountry);

    if (editMode && localPoiId && appData) {
      const fetchData = async () => {
        try {
          toggleSpinner();
          const fetchedPoi = await fetch(`tc-api/poi/${localPoiId}`).then(response => response.json());
          toggleSpinner();

          setSelectedPOICountry(fetchedPoi.countryId);
          setPoiName(fetchedPoi.name);
          setPoiLatitude(fetchedPoi.latitude);
          setPoiLongitude(fetchedPoi.longitude);

          setImagePreview(fetchedPoi.photoId ? `tc-api/poi-photo/${fetchedPoi.photoId}` : null);

          let fetchedPoiTypes = appData.POITypes.filter(type => {
            const foundType = fetchedPoi.poiTypeIds.find((fetchedType) => fetchedType === type.id);
            return foundType;
          });
          setSelectedPOITypes(fetchedPoiTypes);
          
          if (fetchedPoi.description === null || fetchedPoi.description === "null"){
            setPoiDescription('');
            formData.current.set('Description', '');
          } else {
            setPoiDescription(fetchedPoi.description);
            formData.current.set('Description', fetchedPoi.description);
          }

          formData.current.set('Name', fetchedPoi.name);
          formData.current.set('CountryId', fetchedPoi.countryId);
          formData.current.set('Longitude', fetchedPoi.longitude);
          formData.current.set('Latitude', fetchedPoi.latitude);
          handlePoiTypes(fetchedPoiTypes);
          photoId.current = fetchedPoi.photoId;

          showFormData(formData.current, "starting editMode");
        } catch (error) {
          console.error('Error fetching poi:', error);
        }
      };

      fetchData();
    }
  }, [appData, editMode, localPoiId, poiId]);

  const validateInput = (name, value) => {
    const emptyMsg = 'Pole jest wymagane.';

    switch (name) {
      case "Name":
        if (value.trim() === '')
          return emptyMsg;
        break;
      case "PoiTypes":
        if (value.length < 1)
          return 'Wybierz co najmniej jedną opcję.';
        break;
      case "Description":
        // description is optional
        break;
      case "Latitude":
        if (value.trim() === '')
          return emptyMsg;
        if (value < -90 || value > 90) {
          return 'Wartość szerokości geograficznej jest nieprawidłowa.';
        }
        break;
      case "Longitude":
        if (value.trim() === '')
          return emptyMsg;
        if (value < -180 || value > 180) {
          return 'Wartość długości geograficznej jest nieprawidłowa.';
        }
        break;
      case "Photo":
        const fileValue = value;
        if(!fileValue || !fileValue.name)
          return ''; // photo is optional
        else if ( fileValue.type !== 'image/jpeg' )
          return 'Plik nie jest plikiem jpg typu image/jpeg.';
        else if( fileValue.size < 1 )
          return 'Plik jest zbyt mały. Rozmiar zdjęcia 0 bytes.';
        else if( fileValue.size > 1024 * 1024 * 10 )
          return 'Plik jest zbyt duży. Rozmiar zdjęcia przekracza 10 MB.';
        else
          return ''; // other cases are accepted
        break;
      default:
    }

    return ''; // No errors
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    switch (name) {
      case "Photo":
        const errors = validateInput(name, files[0]);
        if (files.length > 0 && !errors) {
          TCfileReader.current.readAsDataURL(files[0]);
        }
        if(value) {
          formData.current.set(name, files[0]);
          setFormErrors(formErrors=> ({ ...formErrors, [name]: errors }));
          setPhotoValue(value);
        } else {
          deletePhoto();
        }
        return;
      case "CountryId":
        setSelectedPOICountry(value);
        break;
      case "Name":
        setPoiName(value);
        break;
      case "Description":
        console.info("description value", value);
        setPoiDescription(value);
        break;
      case "Latitude":
        setPoiLatitude(value);
        break;
      case "Longitude":
        setPoiLongitude(value);
        break;
    }

    const errors = validateInput(name, value);
    formData.current.set(name, value);
    setFormErrors(formErrors => ({ ...formErrors, [name]: errors }));
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

    const authorizationHeader = await getAuthHeader(pca, account);

    let connString = 'tc-api/poi';
    let connMethod = 'POST'
    if (editMode) {
      connString = `tc-api/poi/${localPoiId}`;
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
      .then(response => response.json())
      .then(data => {
        if (data > -1) {
          console.log('AddPOI Form uploaded successfully:', data);
          if (editMode)
            console.log("edit POI")
          setFormErrorMessage('');
          refreshPoiUserFiltered(pca, account, appData);
        }
        else {
          setFormErrorMessage('Nie udało się zapisać POI.');
        }
        setSubmitting(false);
        toggleSpinner();
        if (editMode)
          //navigate(`/details-poi/${localPoiId}`); 
          navigate(-1);
        else
          navigate(`/details-poi/${data}`);
      })
      .catch(error => {
        console.error('Error uploading AddPOI form:', error);
        setFormErrorMessage('Nie udało się zapisać POI.');
        setSubmitting(false);
        toggleSpinner();
      });

  };

  const handleCancel = () => {
    navigate(-1);
  }

  // Callback when POITypes are selected or removed
  const handlePoiTypes = (selectedList) => {
    const name = "PoiTypes";
    setSelectedPOITypes(selectedList);

    formData.current.delete(name);
    if (selectedList.length === 0) {
      formData.current.set(name, '');
    }
    selectedList.forEach((option) => { formData.current.append(name, option.id); });

    const errors = validateInput(name, selectedList);
    setFormErrors(formErrors=> ({ ...formErrors, [name]: errors }));
  };

  const deletePhoto = () => {
    console.log("delete");
    setImagePreview(null);
    setPhotoValue('');
    formData.current.set("Photo", null);
    formData.current.set("deletePhoto", photoId.current);

    const errors = validateInput("Photo", '');
    setFormErrors(formErrors => ({ ...formErrors, ["Photo"]: errors }));

    showFormData(formData.current, "after deletePhoto");
  };

  const showFormData = (formDataArg, comment) => {
    console.log(comment);
    for (const pair of formDataArg.entries()) {
      console.log(`${pair[0]}, ${pair[1]}`);
    }
  };

  return (
    <div className={styles.PoiForm}>
      <Form id="POIForm" onSubmit={handleSubmit} encType="multipart/form-data">
        <Container>
          <Row className={styles.SectionTitle}>
            <Col sm={1} className="d-flex justify-content-start" >
              <BackArrow />
            </Col>
            <Col>
              {editMode ? 'Edytowanie POI' : 'Tworzenie POI'}
            </Col>
          </Row>

          <Row>
            <Col sm={6}>

              <FormGroup row>
                <Label for="POIname" sm={4} lg={3} className="text-end">Nazwa</Label>
                <Col sm={8} lg={9} >
                  <Input
                    name="Name"
                    id="POIname"
                    value={poiName}
                    onChange={handleInputChange}
                    invalid={!!formErrors.Name}
                    placeholder="wprowadź maksymalnie 50 liter"
                    maxLength="50"
                  />
                  <FormFeedback>{formErrors.Name}</FormFeedback>
                </Col>
              </FormGroup>

              <FormGroup row>
                <Label for="POIcountry" sm={4} lg={3} className="text-end">Kraj</Label>
                <Col sm={8} lg={9} >
                  <Input
                    name="CountryId"
                    id="POIcountry"
                    type="select"
                    onChange={handleInputChange}
                    invalid={!!formErrors.CountryId}
                    value={selectedPOICountry}
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
                <Label for="PoiTypes" sm={4} lg={3} className="text-end">Typ</Label>
                <Col sm={8} lg={9} >
                  {
                    !!appData &&
                    (<Multiselect
                      id="PoiTypes"
                      options={appData.POITypes}
                      selectedValues={selectedPOITypes}
                      onSelect={handlePoiTypes}
                      onRemove={handlePoiTypes}
                      displayValue="name"
                      showCheckbox
                      placeholder="wybierz"
                      className={!!formErrors.PoiTypes ? styles.MultiselectError : styles.Multiselect}
                    />)
                  }
                  <Input name="PoiTypes" invalid={!!formErrors.PoiTypes} className="d-none"></Input>
                  <FormFeedback>{formErrors.PoiTypes}</FormFeedback>
                </Col>
              </FormGroup>

              <FormGroup row>
                <Label for="POIDescription" sm={4} lg={3} className="text-end">Opis</Label>
                <Col sm={8} lg={9} >
                  <Input
                    type="textarea"
                    name="Description"
                    id="POIDescription"
                    value={poiDescription}
                    onChange={handleInputChange}
                    invalid={!!formErrors.Description}
                    placeholder="wprowadź maksymalnie 2048 znaki"
                    maxLength="2048"
                    className={styles.Description}
                  />
                  <FormFeedback>{formErrors.Description}</FormFeedback>
                </Col>
              </FormGroup>

              <Row className={styles.SectionTitle}>Współrzędne geograficzne - GPS</Row>

              <FormGroup row>
                <Label for="POILatitude" sm={4} lg={3} className="text-end">Szerokość</Label>
                <Col sm={8} lg={9} >
                  <Input
                    name="Latitude"
                    type="number"
                    id="POILatitude"
                    value={poiLatitude}
                    onChange={handleInputChange}
                    invalid={!!formErrors.Latitude}
                    placeholder="wprowadź liczbę dziesiętną"
                    min="-90"
                    max="90"
                    step="0.000001"
                  />
                  <FormFeedback>{formErrors.Latitude}</FormFeedback>
                </Col>
              </FormGroup>

              <FormGroup row>
                <Label for="POILongitude" sm={4} lg={3} className="text-end">Długość</Label>
                <Col sm={8} lg={9} >
                  <Input
                    name="Longitude"
                    type="number"
                    id="POILongitude"
                    value={poiLongitude}
                    onChange={handleInputChange}
                    invalid={!!formErrors.Longitude}
                    placeholder="wprowadź liczbę dziesiętną"
                    min="-180"
                    max="180"
                    step="0.000001"
                  />
                  <FormFeedback>{formErrors.Longitude}</FormFeedback>
                </Col>
              </FormGroup>

              <div className={styles.Buttons + ' d-none d-sm-block'}>
                <Button onClick={handleCancel}>
                  Anuluj
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Zapisuję...' : 'Zapisz'}
                </Button>
              </div>
            </Col>

            <Col sm={6} className='d-flex flex-column align-items-sm-center'>

              <FormGroup row>
                <Label for="POIPhoto" sm={4} lg={3} className="text-end">Zdjęcie</Label>
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
                      <FormFeedback>{formErrors.Photo}</FormFeedback>
                    </Col>
                    <Col sm={1}>
                      {imagePreview && (<div className="mt-2 mt-lg-0"><i role="button" onClick={deletePhoto} className="bi bi-trash fs-4"></i></div>)}
                    </Col>
                  </Row>
                </Col>
              </FormGroup>

              {
                !!imagePreview && (<img src={imagePreview} alt="Preview" className={styles.Photo} />)
              }

            </Col>
          </Row>

          <p className={styles.FormErrorMessage}>{formErrorMessage}</p>

          {/* Button group showed on narrowe screens */}
          <div className={styles.Buttons + ' d-sm-none'}>
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

PoiForm.propTypes = {};

PoiForm.defaultProps = {};

export default PoiForm;
