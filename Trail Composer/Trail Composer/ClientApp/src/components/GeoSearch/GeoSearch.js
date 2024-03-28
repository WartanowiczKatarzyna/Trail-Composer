import { useState, useEffect, useContext, useRef } from 'react';
import { Button, Form, FormGroup, Label, Input, FormFeedback, Row, Container } from 'reactstrap';
import { AppContext } from '../../App.js';
import Multiselect from 'multiselect-react-dropdown';
import styles from './GeoSearch.module.css';
import PropTypes from 'prop-types';

const GeoSearch = ({selectedCountries, minLatitude, maxLatitude, 
  minLongitude, maxLongitude, newDataFlag, search, tooManyResultsMsg}) => {
  const appData = useContext(AppContext);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [geoSearchChanged, setGeoSearchChanged] = useState(false);
  const [formErrorMessage, setFormErrorMessage] = useState('');
  const [countriesOptions, setCountriesOptions] = useState([]);

  const [selectedCountriesLocal, setSelectedCountriesLocal] = useState([]);
  const [minLatitudeLocal, setMinLatitudeLocal] = useState(-89);
  const [maxLatitudeLocal, setMaxLatitudeLocal] = useState(89);
  const [minLongitudeLocal, setMinLongitudeLocal] = useState(-179);
  const [maxLongitudeLocal, setMaxLongitudeLocal] = useState(179);

  let formData = useRef(new FormData());

  useEffect(() => {
    const form = document.getElementById("GeoSearch");
    formData.current = new FormData(form);

    updateGeoSearchChanged();
    
    setMinLatitudeLocal(minLatitude);
    setMaxLatitudeLocal(maxLatitude);
    setMinLongitudeLocal(minLongitude);
    setMaxLongitudeLocal(maxLongitude);

    handleCountries(selectedCountries);
    formData.current.set("minLatitude", minLatitude);
    formData.current.set("maxLatitude", maxLatitude);
    formData.current.set("minLongitude", minLongitude);
    formData.current.set("maxLongitude", maxLongitude);
  }, [selectedCountries, minLatitude, maxLatitude, minLongitude, maxLongitude]);

  useEffect(() => {
    updateGeoSearchChanged();
  }, [selectedCountriesLocal, minLatitudeLocal, maxLatitudeLocal, minLongitudeLocal, maxLongitudeLocal]);

  useEffect(() => {
    setSubmitting(false);
    
    /* Po przyjściu danych FormErrorMsg i FormError są puste,
      tooManyResultMsg pełni funkcję informacyjną
     */
    if (tooManyResultsMsg.length > 0)
    {
      setFormErrorMessage(tooManyResultsMsg);
    }     
  }, [newDataFlag]);
  
  useEffect(() => {
    const multiselectOptions = appData ? appData.Countries.map(
      (option) => ({ id: option.id, name: option.countryName })) : [];
    setCountriesOptions(multiselectOptions);
  }, [appData]);

  const validateInput = (name, value) => {
    debugger;
    const emptyMsg = 'Pole jest wymagane.';

    switch(name) {
      case "countryIds":
        break;
      case "minLatitude":
      case "maxLatitude":
        if (value.trim() === '')
          return emptyMsg;
        if (value < -90 || value > 90) {
          return 'Wartość szerokości geograficznej jest nieprawidłowa.';
        }
        break;
      case "minLongitude":
      case "maxLongitude":
        if (value.trim() === '')
          return emptyMsg;
        if (value < -180 || value > 180) {
            return 'Wartość długości geograficznej jest nieprawidłowa.';
        }
        break;
        default:
    }

    return ''; // No errors
  };
  
  const handleInputChange = (e) => {
    //debugger;
    const { name, value } = e.target;

    switch (name) {
      case "minLatitude":
        setMinLatitudeLocal(value);
        break;
      case "maxLatitude":
        setMaxLatitudeLocal(value);
        break;
      case "minLongitude":
        setMinLongitudeLocal(value);
        break;
      case "maxLongitude":
        setMaxLongitudeLocal(value);
        break;
      default:
        break;
    }
        
      const errors = validateInput(name, value);
      formData.current.set(name, value);
      setFormErrors({ ...formErrors, [name]: errors });
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
    setFormErrorMessage('');

    setSubmitting(true);

    showFormData(formData.current, "przed search");

    search(selectedCountriesLocal, minLatitudeLocal, maxLatitudeLocal, minLongitudeLocal, maxLongitudeLocal);
  };

  // Callback when Countries are selected or removed
  const handleCountries = (selectedList) => {
    const name = "countryIds";
    setSelectedCountriesLocal([...selectedList]);

    formData.current.delete(name);
    if (selectedList.length === 0) {
      formData.current.set(name, '');
    }
    selectedList.forEach((option) => { formData.current.append(name, option.id); });

    const errors = validateInput(name, selectedList);
    setFormErrors({ ...formErrors, [name]: errors });    
  };

  const areCoordinatesIdetical = () => (
    Math.abs(minLatitudeLocal - minLatitude) +
    Math.abs(maxLatitudeLocal - maxLatitude) +
    Math.abs(minLongitudeLocal - minLongitude) +
    Math.abs(minLongitudeLocal - minLongitude) < 0.0001
  );

  const areSelectedCountriesIdentical = () => {
    const arr1 = selectedCountries.map(country => country.id);
    const arr2 = selectedCountriesLocal.map(country => country.id);
   
    if (arr1.length !== arr2.length) {
        return false; // Arrays are not identical
    }
   
    arr1.sort((a, b) => a - b);
    arr2.sort((a, b) => a - b);
   
    for (let i = 0; i < arr1.length; i++) {
        // Compare each element
        if (arr1[i] !== arr2[i]) {
            return false; // Arrays are not identical
        }
    }

    // If all elements are the same, arrays are identical
    return true;
  };

  const isGeoSearchIdentical = () => (areCoordinatesIdetical() && areSelectedCountriesIdentical());

  const updateGeoSearchChanged = () => {
    if (isGeoSearchIdentical()){
      setGeoSearchChanged(false);
    } else {
      setGeoSearchChanged(true);
    }
  };
  
  const showFormData = (formDataArg, comment) => {
    console.log(comment);
    for (const pair of formDataArg.entries()) {
      console.log(`${pair[0]}, ${pair[1]}`);
    }
  };

  return (
    <div className={styles.GeoSearch}>
      <Form id="GeoSearch" onSubmit={handleSubmit} encType="multipart/form-data">
        <Container>
          <FormGroup>
            <Label for="countryIds" className="text-start">Kraje</Label>
            {
              !!appData &&
              (<Multiselect
                id="countryIds"
                options={countriesOptions}
                selectedValues={selectedCountriesLocal}
                onSelect={handleCountries}
                onRemove={handleCountries}
                displayValue="name"
                showCheckbox
                placeholder="wybierz"
                className={!!formErrors.countryIds ? styles.MultiselectError : styles.Multiselect}
              />)
            }
            <Input name="countryIds" invalid={!!formErrors.countryIds} className="d-none"></Input>
            <FormFeedback>{formErrors.countryIds}</FormFeedback>
          </FormGroup>
          <Row className={styles.SectionTitle}>Współrzędne geograficzne</Row>
          <FormGroup>
            <Label for="minLatitude" className="text-start">Minimalna Szerokość</Label>
            <Input
              name="minLatitude"
              type="number"
              id="minLatitude"
              value={minLatitudeLocal}
              onChange={handleInputChange}
              invalid={!!formErrors.minLatitude}
              placeholder = "wprowadź liczbę dziesiętną"
              min="-90"
              max="90"
              step="0.000001"
            />
            <FormFeedback>{formErrors.minLatitude}</FormFeedback>
          </FormGroup>
          <FormGroup>
            <Label for="maxLatitude" className="text-start">Maksymalna Szerokość</Label>
            <Input
              name="maxLatitude"
              type="number"
              id="maxLatitude"
              value={maxLatitudeLocal}
              onChange={handleInputChange}
              invalid={!!formErrors.maxLatitude}
              placeholder = "wprowadź liczbę dziesiętną"
              min="-90"
              max="90"
              step="0.000001"
            />
            <FormFeedback>{formErrors.maxLatitude}</FormFeedback>
          </FormGroup>
          <FormGroup>
            <Label for="minLongitude" className="text-start">Minimalna Długość</Label>
            <Input
              name="minLongitude"
              type="number"
              id="minLongitude"
              value={minLongitudeLocal}
              onChange={handleInputChange}
              invalid={!!formErrors.minLongitude}
              placeholder = "wprowadź liczbę dziesiętną"
              min="-180"
              max="180"
              step="0.000001"
            />
            <FormFeedback>{formErrors.minLongitude}</FormFeedback>
          </FormGroup>
          <FormGroup>
            <Label for="maxLongitude" className="text-start">Maksymalna Długość</Label>
            <Input
              name="maxLongitude"
              type="number"
              id="maxLongitude"
              value={maxLongitudeLocal}
              onChange={handleInputChange}
              invalid={!!formErrors.maxLongitude}
              placeholder = "wprowadź liczbę dziesiętną"
              min="-180"
              max="180"
              step="0.000001"
            />
            <FormFeedback>{formErrors.maxLongitude}</FormFeedback>
          </FormGroup>
          <div className={styles.Buttons}>
            <Button type="submit" disabled={submitting && geoSearchChanged}>
              {submitting ? 'Szukam...' : geoSearchChanged ? 'Szukaj' : 'Zmień dane'}
            </Button>
          </div>
          <p className={styles.FormErrorMessage}>{formErrorMessage}</p>
        </Container>
      </Form>
    </div>
  );
};

GeoSearch.propTypes = {
  selectedCountries: PropTypes.array,
  minLatitude: PropTypes.number,
  maxLatitude: PropTypes.number,
  minLongitude: PropTypes.number,
  maxLongitude: PropTypes.number,
  search: PropTypes.func,
  newDataFlag: PropTypes.number,
  tooManyResultsMsg: PropTypes.string
};

GeoSearch.defaultProps = {
  selectedCountries: [],
  minLatitude: -90,
  maxLatitude: 90,
  minLongitude: -180,
  maxLongitude: 180,
  search: () => {},
  newDataFlag: 0,
  tooManyResultsMsg: ''
};

export default GeoSearch;
