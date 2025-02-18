import React, { useState, useCallback } from "react";
import { Text, Divider, LegacyCard, InlineStack, Card, InlineGrid, Icon, Layout, Banner } from "@shopify/polaris";
import InfoBox from './InfoBox';
import BodyBoxes from './BodyBoxes'
import { useSelector } from "react-redux";
import {
  KeyIcon
} from '@shopify/polaris-icons';


function HomeDashboard() {
  const storeData = useSelector((state) => state.data);

  return (
    <div>
      {/* Header Section */}


      <InlineGrid gap={"100"} columns={3}>

        <Card>
          <div style={{ display: "flex", justifyContent: 'center', alignItems: "center" }} >

            <div style={{ width: "20%" }}>

              <img src="https://img.icons8.com/?size=100&id=FQjuMXbb1Hlh&format=png&color=000000" style={{ height: "90%", width: "90%" }} alt="" />
            </div>
            <div style={{ width: "80%" }}>

              <InfoBox label="Store Type" value={storeData.type} showCopyButton={false} />
            </div>
          </div>
        </Card>
        <Card >
          <div style={{ display: "flex", justifyContent: "center" }} >

            <div style={{ width: "20%" }}>
              <img src="https://img.icons8.com/?size=100&id=oCZ9sz42Rek2&format=png&color=000000" style={{ height: "90%", width: "90%" }} alt="" />
            </div>
            <div style={{ width: "80%" }}>
              <InfoBox label="Connection Key" value={storeData.key} showCopyButton={true} />
            </div>
          </div>
        </Card >
        <Card >

          <div style={{ display: "flex" }} >

            <div style={{ width: "20%" }}>
              <img src="https://img.icons8.com/?size=100&id=WvVU1dgQ3c2f&format=png&color=000000" style={{ height: "90%", width: "90%" }} alt="" />
            </div>
            <div style={{ width: "80%", display: "block",alignSelf:"center" }}>

              <div style={{display:"flex",justifyContent:"space-between"}}>

                <Text variant="headingMd">Sync Mode: </Text>
                <input type="checkbox" checked={true} hidden="hidden" id="username" />
                <label class="switch" for="username"></label>

              </div>


            </div>
          </div>

        </Card>
      </InlineGrid >




      <div style={{ marginBlock: "20px" }}>

        <Divider borderColor="border-inverse" />
      </div>



      {/* Body Section */}
      <div style={{ marginTop: "10px", display: "flex", flexDirection: "column" }}>



        {/* only showing the store key if it is an destination store  */}
        {/* {storeData.type === 'destination' && ( */}


        {/* )} */}

        {/* <>

          <Text variant="headingMd">Order tracking</Text>
          <div
            style={{
              marginBlock: '20px'
            }}
          >
            <Divider borderColor="border-inverse" />

          </div>
          <Table />
        </> */}


        {/* not showing these anymore as, but uncomment and check do get an idea of the dashoard fields we need */}
        {/* <div style={{ display: "flex", width: "100%", justifyContent: 'space-evenly', height: "300px", padding: "20px" }} >
            <BodyBoxes label="Connected stores" value="5" />
            <BodyBoxes label="Synced products" value="500" />
            <BodyBoxes label="Orders" value="2" />
            <BodyBoxes label="Synced products sold" value="2" />
          </div> */}

      </div>
    </div >
  );
}

export default HomeDashboard;
