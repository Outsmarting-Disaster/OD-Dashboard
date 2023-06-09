// import MiniPlot from "./MiniPlot.js";
import {
  FaBatteryEmpty,
  FaBatteryFull,
  FaBatteryHalf,
  FaBatteryQuarter,
  FaBatteryThreeQuarters,
  FaCloud,
  FaFlask,
  FaLightbulb,
  FaRegQuestionCircle,
  FaSun,
  FaThermometerEmpty,
  FaThermometerFull,
  FaThermometerHalf,
  FaThermometerQuarter,
  FaThermometerThreeQuarters,
  FaTint,
  FaVolumeDown,
  FaVolumeUp,
  FaWifi,
} from "react-icons/fa";

import { Typography } from "@mui/material";

export function Card(props: any) {
  const getBgColor = (id: any, value: any) => {
    //const ratio = value < 100 ? value/100 : 1;
    //return { backgroundColor: `rgb(${ratioToRGB(ratio).join(',')})` };

    // Some sensors should give green when value is high like BAT, but others the opposite, like dB, or even mid range (temp)
    // Lower  is better: noise (db), all PMs
    // Medium is better: temp, pressure, humid, solar, wifi?, co
    // Higher is better: bat?

    //humid
    if (id === 5 || id === 13 || id === 56) {
      return evaluateColor(
        value,
        16,
        90,
        "red",
        "forestgreen",
        "cornflowerblue"
      );
    }
    // solar panel | light sensor
    if (id === 6 || id === 11 || id === 14 || id === 18) {
      return evaluateColor(value, 150, 270, "grey", "orange", "yellow");
    }
    // loudness
    if (id === 7 || id === 53) {
      return evaluateColor(
        value,
        36,
        70,
        "cornflowerblue",
        "forestgreen",
        "red"
      );
    }
    //wifi
    if (id === 8 || id === 9 || id === 21) {
      return evaluateColor(
        value,
        0,
        100,
        "cornflowerblue",
        "forestgreen",
        "red"
      );
    }
    // temp
    if (id === 12 || id === 55) {
      return evaluateColor(
        value,
        18,
        27,
        "cornflowerblue",
        "forestgreen",
        "red"
      );
    }
    //bat
    if (id === 17 || id === 10) {
      return evaluateColor(value, 15, 85, "red", "yellow", "forestgreen");
    }
    //no2
    if (id === 15) {
      return evaluateColor(
        value,
        3300,
        3615,
        "cornflowerblue",
        "forestgreen",
        "red"
      );
    }
    // pressure
    if (id === 58) {
      return evaluateColor(
        value,
        101,
        103,
        "cornflowerblue",
        "forestgreen",
        "red"
      );
    }
    // co
    if (id === 16) {
      return evaluateColor(value, 390, 425, "orange", "forestgreen", "red");
    }
    // pm 1
    if (id === 89) {
      return evaluateColor(value, 20, 50, "forestgreen", "orange", "red");
    }
    // pm 2.5
    if (id === 87) {
      return evaluateColor(value, 20, 50, "forestgreen", "orange", "red");
    }
    // pm 10
    if (id === 88) {
      return evaluateColor(value, 35, 100, "forestgreen", "orange", "red");
    }

    // if no id matches
    return "";
  };

  // Gets 2 thresholds, low and high. For temperature example: (value,16,27,'blue','green','red')
  // values below 16 are cold (blue), above 27 (red), between: green
  // Returns a valid CSS color code like  'orange','#ccc' or 'rgb(255,255,243,0.5)'
  const evaluateColor = (
    value: any,
    low: any,
    high: any,
    colorLow: any,
    colorMiddle: any,
    colorHigh: any
  ) => {
    if (value < low) {
      return colorLow;
    }
    if (value > high) {
      return colorHigh;
    }
    return colorMiddle;
  };

  const getIcon = (id: any, value: any) => {
    // Each id is a sensor https://api.smartcitizen.me/v0/sensors
    // humidity
    if (id === 5 || id === 13 || id === 56) {
      return <FaTint />;
    }
    if (id === 6 || id === 11 || id === 18) {
      return <FaSun />;
    }
    if (id === 7 || id === 53) {
      if (value <= 30) {
        return <FaVolumeDown />;
      }
      if (value > 30) {
        return <FaVolumeUp />;
      }
    }
    if (id === 8 || id === 9 || id === 21) {
      return <FaWifi />;
    }
    //Temp
    if (id === 12 || id === 55) {
      if (value <= 0) {
        return <FaThermometerEmpty />;
      }
      if (value > 0 && value <= 15) {
        return <FaThermometerQuarter />;
      }
      if (value > 15 && value <= 30) {
        return <FaThermometerHalf />;
      }
      if (value > 30 && value <= 40) {
        return <FaThermometerThreeQuarters />;
      }
      if (value > 40) {
        return <FaThermometerFull />;
      }
    }
    if (id === 14) {
      return <FaLightbulb />;
    }

    if (id === 15) {
      return <FaFlask />;
    }
    //  Air Pollution ug/m3
    if (id === 16 || id === 87 || id === 88 || id === 89) {
      return <FaCloud />;
    }
    if (id === 17 || id === 10) {
      if (value <= 10) {
        return <FaBatteryEmpty />;
      }
      if (value > 10 && value <= 45) {
        return <FaBatteryQuarter />;
      }
      if (value > 45 && value <= 65) {
        return <FaBatteryHalf />;
      }
      if (value > 65 && value <= 90) {
        return <FaBatteryThreeQuarters />;
      }
      if (value > 90) {
        return <FaBatteryFull />;
      }
    }
    return <FaRegQuestionCircle />;
  };

  let item = props.data;
  const nameARRAY = item.name.split("-");

  return (
    <div
      role="button"
      style={{
        display: "inline-block",
        margin: "0 10px 0 20px",
        width: "100px",
        height: "80px",
        userSelect: "none",
        cursor: "pointer",
        paddingRight: 10,
        paddingLeft: 10,
      }}
      tabIndex={0}
      className="card"
    >
      <div key={item["id"]}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            color: getBgColor(item.id, item.value),
          }}
          onClick={() => props.changeSelectedSensor(item.id)}
        >
          {props.showName && (
            <p style={{ color: "grey", margin: 2, textAlign: "center" }}>
              {item.description}
            </p>
          )}

          <h3 style={{ alignItems: "center" }}>
            {getIcon(item.id, item.value)}
          </h3>
          <div
            style={{
              display: "flex",
              textAlign: "center",
              alignItems: "center",
              gap: 5,
            }}
          >
            <h1 className="d-inline">{Math.round(item.value * 100) / 100}</h1>
            <h5 className="d-inline"> {item.unit}</h5>
          </div>
        </div>
        <div style={{ alignItems: "center", textAlign: "center" }}>
          {nameARRAY[1] ? (
            <>
              <Typography variant="caption">{nameARRAY[1]}</Typography>
            </>
          ) : (
            <>
              <Typography variant="caption">{nameARRAY[0]}</Typography>
            </>
          )}
        </div>
        {/* {showMiniPlot && (
          <MiniPlot x={this.props.x} y={this.props.y} />
        )} */}
      </div>
    </div>
  );
}
