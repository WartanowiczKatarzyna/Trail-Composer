import React, { Component } from 'react';
import styles from './TemplateName.module.css';

class TemplateName extends Component {
    constructor(props) {
        super(props);

        // Initial state
        this.state = {
            exampleState: '',
        };
    }

    componentDidMount() {
        // Perform any actions after the component is mounted
    }

    componentWillUnmount() {
        // Perform any cleanup before the component is unmounted
    }

    updateState = (newValue) => {
        this.setState({
            exampleState: newValue,
        });
    };

    render() {
        return (
            <div className={styles.container}>
                <h1>Hello, I am a class component!</h1>
                <p className={styles.stateText}>State: {this.state.exampleState}</p>
                <button className={styles.button} onClick={() => this.updateState('New Value')}>
                    Update State
                </button>
            </div>
        );
    }
}

export default TemplateName;
