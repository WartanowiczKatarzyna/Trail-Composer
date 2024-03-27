import { useState, useEffect, useContext, useRef } from 'react';
import { Button, Form, FormGroup, Label, Input, FormFeedback, Row, Container } from 'reactstrap';
import { AppContext } from '../../App.js';
import Multiselect from 'multiselect-react-dropdown';
import styles from './GeoSearch.module.css';
import PropTypes from 'prop-types';

const GeoSearch = ({selectedCountries, minLatitude, maxLatitude, 
  minLongitude, maxLongitude, newDataFlag, search}) => {
  const appData = useContext(AppContext);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
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
    setSubmitting(false);
  }, [newDataFlag]);
  
  useEffect(() => {
    const multiselectOptions = appData ? appData.Countries.map(
      (option) => ({ id: option.id, name: option.countryName })) : [];
    setCountriesOptions(multiselectOptions);
  }, [appData]);

  const validateInput = (name, value) => {
    const emptyMsg = 'Pole jest wymagane.';

    switch(name) {
      case "Countries":
        if (value.length < 1)
          return 'Wybierz co najmniej jedną opcję.';
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
    setFormErrorMessage('test');
    setFormErrors({});

    setSubmitting(true);

    showFormData(formData.current, "przed fetch");

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
            <Label for="Countries" className="text-start">Kraje</Label>
            {
              !!appData &&
              (<Multiselect
                id="Countries"
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
            <Button>
              Anuluj
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Szukam...' : 'Szukaj'}
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
  newDataFlag: PropTypes.number
};

GeoSearch.defaultProps = {
  selectedCountries: [{id: 27, name: 'Norwegia'}],
  minLatitude: -90,
  maxLatitude: 90,
  minLongitude: -180,
  maxLongitude: 180,
  search: () => {},
  newDataFlag: 0
};

export default GeoSearch;
