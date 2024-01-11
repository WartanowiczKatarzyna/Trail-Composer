import React, { Component } from 'react';

export class FetchPOI extends Component {
  static displayName = FetchPOI.name;

  constructor(props) {
    super(props);
    this.state = { poi: {}, loading: true };
    this.state = { photo: {}, loading: true };
  }

  componentDidMount() {
    this.populatePOIData();
  }

  static renderPOITable(poi) {
    const photoUrl = `tc-api/poi-photo/${poi.photoId}`;

    return (
      <table className="table table-striped" aria-labelledby="tableLabel">
        <thead>
          <tr>
            <th>id</th>
            <th>latitude</th>
            <th>longitude</th>
            <th>description</th>
            <th>photo</th>
          </tr>
        </thead>
        <tbody>
            <tr key={poi.id}>
              <td>{poi.id}</td>
              <td>{poi.latitude}</td>
              <td>{poi.longitude}</td>
              <td>{poi.description}</td>
            <td><a href={photoUrl} >{poi.photoId}</a></td>
            </tr>
        </tbody>
      </table>
    );
  }

  render() {
    let contents = this.state.loading
      ? <p><em>Loading...</em></p>
      : FetchPOI.renderPOITable(this.state.poi);

    return (
      <div>
        <h1 id="tableLabel">POI</h1>
        <p>This component demonstrates fetching data from the server.</p>
        {contents}
      </div>
    );
  }

  async populatePOIData() {
    const response = await fetch('tc-api/poi/35');
    const data = await response.json();

    this.setState({ poi: data, loading: false });
  }
}
