import React from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import { Typography } from "@mui/material";

export default function HeaderDevice(props: any) {
  // const [user, setUser] = useState(props.user)
  let kit = props.data;
  let location = props.location;
  return (
    <>
      <div
        style={{
          backgroundColor: "#ececee",
          display:'flex',
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", padding: 5 }}>
          <div
            style={{ display: "flex", marginRight: 10, gap: 5, marginLeft: 20 }}
          >
            <AccountCircleIcon />
            <Typography variant="subtitle2">{kit.name}</Typography>
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            <MyLocationIcon />
            <Typography variant="subtitle2">{location.city}</Typography>
          </div>
        </div>
        {/* <div style={{ display: "flex-end", marginRight: 10}}>
          <Typography variant="subtitle1">latest update : {kit.updated_at}</Typography>
        </div> */}
      </div>
    </>
  );
}
