import React, { useState, useCallback } from "react";
import { Text, Divider, LegacyCard } from "@shopify/polaris";
import InfoBox from './InfoBox';
import BodyBoxes from './BodyBoxes'
import { useSelector } from "react-redux";


function HomeDashboard() {
  const storeData = useSelector((state) => state.data);

  return (
    <div>
      {/* Header Section */}
      <div
        style={{
          display: "flex",
          marginBottom: '10px'
        }}
      >
        <div>
          <Text variant="headingXl" as="h4">
            Inventory Sync Dashboard
          </Text>
        </div>

      </div>
      <Divider borderColor="border-inverse" />



      {/* Body Section */}
        <div style={{ marginTop: "10px" ,  display:"flex", flexDirection:"column" }}>

          <div style={{display:"flex" , width:"100%",  justifyContent: 'space-evenly' ,height: "120px" ,  padding: "20px"}}>


{/* only showing the store key if it is an destination store  */}
          {storeData.type === 'destination' && (
  <InfoBox label="Store key" value={storeData.key} showCopyButton={true} />
)}          <InfoBox label="Store type" value={storeData.type} showCopyButton={false} />

          </div>


{/* not showing these anymore as, but uncomment and check do get an idea of the dashoard fields we need */}
          {/* <div style={{ display: "flex", width: "100%", justifyContent: 'space-evenly', height: "300px", padding: "20px" }} >
            <BodyBoxes label="Connected stores" value="5" />
            <BodyBoxes label="Synced products" value="500" />
            <BodyBoxes label="Orders" value="2" />
            <BodyBoxes label="Synced products sold" value="2" />
          </div> */}

        </div>
    </div>
  );
}

export default HomeDashboard;
