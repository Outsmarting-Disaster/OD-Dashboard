import React, { Component } from 'react';
import DeviceResults from './DeviceResults';

class NearDevices extends Component{

  render(){
    return(
      <div className="row">
        <div className="col-12">
          <div id="geo">{this.props.userLat} {this.props.userLong}</div>
          <button className="btn btn-outline-primary m-1" onClick={this.props.getAll}>Get nearby Devices</button>
          <DeviceResults data={this.props.data} changeSelectedDevice={this.props.changeSelectedDevice}/>
        </div>
      </div>
    )
  }
}


export default NearDevices;
