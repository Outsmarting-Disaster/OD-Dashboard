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

import dataCities from "./.data/cities.json";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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
  const [labels, setLabels] = useState<any | null>();
  const [waveHeight, setWaveHeight] = useState<any | null>([]);
  const [wavePeriod, setWavePeriod] = useState<any | null>([]);

  const handleClick = (event: any) => {
    const feature = event.features[0];
    const clusterId = feature.properties.cluster_id;

    const mapboxSource = mapRef.current.getSource("device") as GeoJSONSource;

    mapboxSource.getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err) {
        console.log(err);
      }
      if (mapRef.current.getZoom() >= 1) {
        setMarkerVisible(true);
      }
      mapRef.current.easeTo({
        center: feature.geometry.coordinates,
        zoom,
        duration: 500,
      });
    });
  };

  const getDeviceInfo = (device: any) => {
    console.log("getDeviceInfo for selectedDevice...", device.name);
    return fetch(
      "https://marine-api.open-meteo.com/v1/marine?latitude=" +
        device.latitude +
        "&longitude=" +
        device.longitude +
        "&hourly=wave_height,wave_direction,wave_period"
    )
      .then((response) => response.json())
      .then((responseJson) => {
        // console.log(responseJson.hourly.wave_height);
        setLabels(responseJson.hourly.time);
        setWaveHeight(responseJson.hourly.wave_height);
        setWavePeriod(responseJson.hourly.wave_period);
        setHasData(true);
      })
      .catch((err) => {
        console.log(err);
        setOwner([]);
        setLabels([]);
        setWaveHeight([]);
        setWavePeriod([]);
      });
  };

  const data = {
    labels,
    datasets: [
      {
        label: "Wave Height (Meter)",
        data: waveHeight,
        borderColor: "rgba(27, 188, 155)",
        backgroundColor: "rgba(27, 188, 155, 0.5)",
      },
      // {
      //   label: "Dataset 1",
      //   data: wavePeriod,
      //   borderColor: "rgba(230, 74, 25)",
      //   backgroundColor: "rgba(230, 74, 25, 0.5)",
      // },
      // {
      //   label: "Wave Periodic",
      //   data: labelsTime.map(() => Math.random()),
      //   borderColor: "rgba(248, 168, 37)",
      //   backgroundColor: "rgba(248, 168, 37, 0.5)",
      // },
    ],
  };
  useEffect(() => {
    if (worldMapGeojson == null) {
      setWorldMapGeojson(dataCities);
    }
    // const interval = setInterval(() => {
    //   getDeviceInfo();
    // }, 60 * 1000);
    // return () => clearInterval(interval);
  }, [selectedDevice]);

  return (
    <>
      <NavBar />
      <div style={{ width: "100vw", height: "70vh", position: "relative" }}>
        <Map
          initialViewState={{
            longitude: 105.8479331,
            latitude: -5.9686535,
            zoom: 5,
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
              clusterMaxZoom={3}
              clusterRadius={50}
            >
              <Layer {...clusterLayer} />
              <Layer {...clusterCountLayer} />
              <Layer {...unclusteredPointLayer} />
            </Source>
          )}
          {markerVisible &&
            dataCities.map((device: any, index: any) => (
              <Marker
                key={`marker-${index}`}
                longitude={device.longitude}
                latitude={device.latitude}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setPopupInfo(device);
                  console.log(device.name);
                  // setSelectedDevice(device.id);
                  getDeviceInfo(device);
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
                  City: {popupInfo.city}
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
              // Header={<HeaderDevice data={theKit} location={theLocation} />}
              LeftArrow={LeftArrow}
              RightArrow={RightArrow}
            >
              {/* wave height */}
              {/* <Card data={waveHeight} /> */}
              <div></div>
            </ScrollMenu>
          </div>
          <div
            style={{
              display: "flex",
            }}
          >
            <div
              style={{
                maxHeight: "600px",
                width: "60%",
                background: "#ffff",
                padding: "12px 24px",
                margin: "20px",
                outline: "none",
                textAlign: "center",
              }}
            >
              <Line options={options1} data={data} />
            </div>
            <Typography
              style={{
                maxHeight: "600px",
                maxWidth: "40%",
                background: "#ffff",
                padding: "200px 24px",
                margin: "20px",
                outline: "none",
              }}
            >
              Wave height data on our website, is obtained through our Spotter
              metocean buoy. This cost-effective buoy gathers and sends
              real-time information about wave height, wind speed, sea surface
              temperature, and barometric pressure. This data is crucial for
              understanding marine conditions, enabling timely responses to
              potential risks, and enhancing safety measures for maritime
              activities and coastal communities. By utilizing Spotter buoy
              data, users can make informed decisions, optimize resource
              management, and mitigate disaster risks effectively.
            </Typography>
          </div>
          <div
            style={{
              display: "flex",
            }}
          >
            <Typography
              style={{
                maxHeight: "600px",
                maxWidth: "40%",
                background: "#ffff",
                padding: "200px 24px",
                margin: "20px",
                outline: "none",
              }}
            >
              Wave height data on our website, is obtained through our Spotter
              metocean buoy. This cost-effective buoy gathers and sends
              real-time information about wave height, wind speed, sea surface
              temperature, and barometric pressure. This data is crucial for
              understanding marine conditions, enabling timely responses to
              potential risks, and enhancing safety measures for maritime
              activities and coastal communities. By utilizing Spotter buoy
              data, users can make informed decisions, optimize resource
              management, and mitigate disaster risks effectively.
            </Typography>
            <div
              style={{
                maxHeight: "600px",
                width: "60%",
                background: "#ffff",
                padding: "12px 24px",
                margin: "20px",
                outline: "none",
                textAlign: "center",
              }}
            >
              <Line options={options2} data={data} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;

export const options1 = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: "Wave Height (Meter)",
    },
  },
};

export const options2 = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: "Wave Period (Second)",
    },
  },
};
