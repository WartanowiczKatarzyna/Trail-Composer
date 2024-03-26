import { useState, useEffect, useContext, useRef } from 'react';
import { Button, Form, FormGroup, Label, Input, FormFeedback, Row, Container } from 'reactstrap';
import { AppContext } from '../../App.js';
import Multiselect from 'multiselect-react-dropdown';
import styles from './GeoSearch.module.css';

const GeoSearch = () => {
  const appData = useContext(AppContext);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formErrorMessage, setFormErrorMessage] = useState('');
  const [countriesOptions, setCountriesOptions] = useState([]);

  const [selectedCountries, setSelectedCountries] = useState([{id: 29, name: 'Polska'}]);
  const [minLatitude, setMinLatitude] = useState(-90);
  const [maxLatitude, setMaxLatitude] = useState(90);
  const [minLongitude, setMinLongitude] = useState(-180);
  const [maxLongitude, setMaxLongitude] = useState(180);

  let formData = useRef(new FormData());

  useEffect(() => {

    const form = document.getElementById("GeoSearch");
    formData.current = new FormData(form);
    const multiselectOptions = appData ? appData.Countries.map((option) => ({ id: option.id, name: option.countryName })) : [];
    setCountriesOptions(multiselectOptions);
    handleCountries(selectedCountries);
  }, [appData, selectedCountries]);

  const validateInput = (name, value) => {
    const emptyMsg = 'Pole jest wymagane.';

    switch(name ) {
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
    const { name, value } = e.target;

    switch (name) {
      case "minLatitude":
        setMinLatitude(value);
        break;
      case "maxLatitude":
        setMaxLatitude(value);
        break;
      case "minLongitude":
        setMinLongitude(value);
        break;
      case "maxLongitude":
        setMaxLongitude(value);
        break;
      default:
        break;
    }
        
      const errors = validateInput(name, value);
      formData.current.set(name, value);
      setFormErrors({ ...formErrors, [name]: errors });
  };

  // TO-DO: dodać fetch oraz wartości pól do propsów komponentu
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
  };

  // Callback when Countries are selected or removed
  const handleCountries = (selectedList) => {
    const name = "countryIds";
    setSelectedCountries(selectedList);

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
                selectedValues={selectedCountries}
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
              value={minLatitude}
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
              value={maxLatitude}
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
              value={minLongitude}
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
              value={maxLongitude}
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
              {submitting ? 'Filtruję...' : 'Filtruj'}
            </Button>
          </div>
          <p className={styles.FormErrorMessage}>{formErrorMessage}</p>
        </Container>
      </Form>
    </div>
  );
};

GeoSearch.propTypes = {};

GeoSearch.defaultProps = {};

export default GeoSearch;
