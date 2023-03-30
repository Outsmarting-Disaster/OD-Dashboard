import { Typography } from "@mui/material";
import GeoJSON from "geojson";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import type { GeoJSONSource } from "react-map-gl";
import Map, {
  FullscreenControl,
  GeolocateControl,
  Layer,
  Marker,
  NavigationControl,
  Popup,
  ScaleControl,
  Source,
} from "react-map-gl";
import "./App.css";
import {
  clusterCountLayer,
  clusterLayer,
  unclusteredPointLayer,
} from "./components/Layers";
import Pin from "./components/Pin";
import NavBar from "./layout/NavBar";
const TOKEN =
  "pk.eyJ1IjoiZmFuZGlsbGFkcCIsImEiOiJja2t2bGhtdW8xNWE1MnBsbXR5bTFyNm94In0.Cw8RqeLPToDY7XpQuI4cjw"; // Set your mapbox token here

import { ScrollMenu } from "react-horizontal-scrolling-menu";
import "react-horizontal-scrolling-menu/dist/styles.css";
import { LeftArrow, RightArrow } from "./components/Arrow";
import { Card } from "./components/Card";
import HeaderDevice from "./components/HeaderDevice";
import usePreventBodyScroll from "./components/UsePreventBodyScroll";
const elemPrefix = "test";
const getId = (index: number) => `${elemPrefix}${index}`;

const getItems = () =>
  Array(20)
    .fill(0)
    .map((_, ind) => ({ id: getId(ind) }));

function App() {
  const mapRef = useRef<any | null>(null);
  const [value, setValue] = useState(0);
  const [popupInfo, setPopupInfo] = useState<any>();
  const [markerVisible, setMarkerVisible] = useState(false);
  const [worldMapGeojson, setWorldMapGeojson] = useState<any | null>(null);
  const [items] = useState(getItems);
  const { disableScroll, enableScroll } = usePreventBodyScroll();

  // device state
  const [hasData, setHasData] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<any | null>();
  const [selectedSensor, setSelectedSensor] = useState<any | null>();
  const [selectedFromDate, setSelectedFromDate] = useState<any | null>();
  const [selectedToDate, setSelectedToDate] = useState<any | null>();
  const [owner, setOwner] = useState<any | null>();
  const [theData, setTheData] = useState<any | null>();
  const [theDevice, setTheDevice] = useState<any | null>();
  const [theKit, setTheKit] = useState<any | null>({});
  const [theSensors, setTheSensors] = useState<any | null>([]);
  const [theLocation, setTheLocation] = useState<any | null>({});
  const handleClick = (event: any) => {
    const feature = event.features[0];
    const clusterId = feature.properties.cluster_id;

    const mapboxSource = mapRef.current.getSource("device") as GeoJSONSource;

    mapboxSource.getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err) {
        console.log(err);
      }
      if (mapRef.current.getZoom() >= 3) {
        setMarkerVisible(true);
      }
      mapRef.current.easeTo({
        center: feature.geometry.coordinates,
        zoom,
        duration: 500,
      });
    });
  };

  const getWorldMap = () => {
    let theUrl = "https://api.smartcitizen.me/v0/devices/world_map";
    return fetch(theUrl)
      .then((response) => response.json())
      .then((responseJson) => {
        setWorldMapGeojson(responseJson);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const getDeviceInfo = () => {
    console.log("getDeviceInfo for selectedDevice...", selectedDevice);
    return fetch("https://api.smartcitizen.me/v0/devices/" + selectedDevice)
      .then((response) => response.json())
      .then((responseJson) => {
        setHasData(true);
        setOwner(responseJson.owner);
        setTheData(responseJson.data);
        setTheLocation(responseJson.data.location);
        setTheSensors(responseJson.data.sensors);
        setTheKit(responseJson.kit),
          () => {
            // TODO: now it is safe to get the readings
            //console.log('done, now get readings');
            getReadingsForAllSensors();
          };
      })
      .catch((err) => {
        console.log(err);
        setOwner([]);
        setTheData([]);
        setTheSensors([]);
        setTheKit([]);
      });
  };
  const getReadingsForAllSensors = () => {
    console.log(
      "get reading for ALL sensors, and jaming them into theSensors (without using state)"
    );
    let from_date = selectedFromDate.toISOString().slice(0, 10);
    let to_date = selectedToDate.toISOString().slice(0, 10);

    var device = selectedDevice;

    theSensors.forEach(function (sensor: any) {
      let xxx: any = [];
      let yyy: any = [];

      let url =
        "https://api.smartcitizen.me/v0/devices/" +
        device +
        "/readings?sensor_id=" +
        sensor.id +
        "&rollup=15m&from=" +
        from_date +
        "&to=" +
        to_date;
      return fetch(url)
        .then((response) => response.json())
        .then((responseJson) => {
          if (responseJson.readings) {
            // //console.log(responseJson.readings);
            // responseJson.readings.forEach(([x, y]) => {
            //   xxx.push(x);
            //   yyy.push(y);
            // });
            // TODO: here we are not using the correct method of adding the arrays to state object
            // sensor.x = xxx;
            // sensor.y = yyy;
            //that.setState({ theSensors: {x: xxx} })
            // that.setState((prevState) => ({
            //   //theSensors: [...prevState, xxx, yyy]
            // }));
          }
        })
        .catch((err) => {
          console.log(err);
        });
    });
  };

  useEffect(() => {
    if (worldMapGeojson == null) {
      getWorldMap();
    }
    const interval = setInterval(() => {
      getDeviceInfo();
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedDevice]);

  return (
    <>
      <NavBar />
      <div style={{ width: "100vw", height: "70vh", position: "relative" }}>
        <Map
          initialViewState={{
            longitude: 108.8493669,
            latitude: -2.4153123,
            zoom: 3,
          }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={TOKEN}
          interactiveLayerIds={[clusterLayer.id]}
          onClick={handleClick}
          ref={mapRef}
        >
          <GeolocateControl position="top-left" />
          <FullscreenControl position="top-left" />
          <NavigationControl position="top-left" />
          <ScaleControl />
          {worldMapGeojson && (
            <Source
              id="device"
              type="geojson"
              data={GeoJSON.parse(worldMapGeojson, {
                Point: ["latitude", "longitude"],
              })}
              cluster={true}
              clusterMaxZoom={16}
              clusterRadius={50}
            >
              <Layer {...clusterLayer} />
              <Layer {...clusterCountLayer} />
              <Layer {...unclusteredPointLayer} />
            </Source>
          )}
          {markerVisible &&
            worldMapGeojson.map((device: any, index: any) => (
              <Marker
                key={`marker-${index}`}
                longitude={device.longitude}
                latitude={device.latitude}
                anchor="bottom"
                onClick={(e) => {
                  // If we let the click event propagates to the map, it will immediately close the popup
                  // with `closeOnClick: true`
                  e.originalEvent.stopPropagation();
                  setPopupInfo(device);
                  setSelectedDevice(device.id);
                  getDeviceInfo();
                }}
              >
                <Pin />
              </Marker>
            ))}
          {popupInfo && (
            <Popup
              anchor="top"
              longitude={Number(popupInfo.longitude)}
              latitude={Number(popupInfo.latitude)}
              onClose={() => setPopupInfo(null)}
            >
              <div
                style={{
                  maxWidth: "320px",
                  background: "#fff",
                  padding: "12px 24px",
                  margin: "20px",
                  outline: "none",
                  textAlign: "center",
                }}
              >
                <Typography variant="subtitle2">{popupInfo.name}</Typography>
                <br />
                <Typography variant="subtitle2">
                  hardware ID : {popupInfo.id}
                </Typography>
              </div>
            </Popup>
          )}
        </Map>
      </div>
      {hasData && (
        <div style={{ backgroundColor: "#ffffff" }}>
          <div onMouseEnter={disableScroll} onMouseLeave={enableScroll}>
            <ScrollMenu
              Header={<HeaderDevice data={theKit} location={theLocation} />}
              LeftArrow={LeftArrow}
              RightArrow={RightArrow}
            >
              {theSensors.map((sensor: any) => (
                <Card data={sensor} />
              ))}
            </ScrollMenu>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
