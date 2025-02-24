import React, { useState, useEffect } from "react";
import { Text, Divider, Card, InlineGrid, Spinner } from "@shopify/polaris";
import InfoBox from './InfoBox';
import { useSelector } from "react-redux";
import { STORETYPE } from "../../utils/storeType";
import { ConfirmationModal } from "../stores/ConfirmationModal";

function HomeDashboard({ rows, setRows, setSyncAllState, SyncAllState }) {
  const storeData = useSelector((state) => state.data);

  const [SyncAllLoading, setSyncAllLoading] = useState(false);


  const handleChangeSyncAllMode = async (value) => {


    setSyncAllLoading(true)

    let status = value;
    let store = storeData;

    await UpdateStoreSyncStatus(status, store);

    if (rows.some(item => item.syncMode == true)) {
      setRows(prevRows =>
        prevRows.map(store =>
          ({ ...store, syncMode: !SyncAllState })
        )
      );
    }
    else {
      setRows(prevRows =>
        prevRows.map(store =>
          ({ ...store, syncMode: !SyncAllState })
        )
      );
    }
    setSyncAllLoading(false)
    setSyncAllState(value);  // Directly use 'value' instead of toggling
    shopify.modal.hide("Modal_UpdateSyncStatus");
  };

  async function UpdateStoreSyncStatus(status, store) {
    try {

      let id = store.id;
      let type = store.type
      const URL = `/api/connection/update/${id}/${type}/${status}`;
      let response = await fetch(URL);
      let result = await response.json();

      if (response.ok) {
        return shopify.toast.show(result.message);
      }
      else {
        return shopify.toast.show(result.message, { isError: true });
      }
    } catch (error) {
      console.log("Error while updating sync mode at UpdateStoreSyncStatus function:", error);
    }
  }

  // useEffect(() => {

  //   if (rows.some(item => item.syncMode == true)) {
  //     setSyncAllState(true);
  //   }
  //   else if ((rows.some(item => item.syncMode != true))) {
  //     setSyncAllState(false);
  //   }

  // }, [rows])

  async function getStoreDetails() {
    setLoading(true);

    if (!storeData.intialLoading) {     // data has been fetched in app.jsx
      let url;
      if (storeData.type === STORETYPE.source) {
        url = "/api/connection/connectedDestinationStores";   // we call this api if the current store is source
      } else if (storeData.type === STORETYPE.destination) {
        url = "/api/connection/connectedSourceStores";        // we call this api if the current store is destination
      }

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: storeData.id }),
        });

        if (response.status === 200) {
          const data = await response.json();


          if (storeData.type === STORETYPE.source) {
            setRows(data.destinationStore);
            setconnectButtonEnabled(false);
          } else if (storeData.type === STORETYPE.destination) {
            setRows(data.sourceStore); // filtered the data in the backend so not extracting everything here
          }
        }
        else if (response.status === 404) {
          setRows([])
          setconnectButtonEnabled(true);       // if 404 then enable the connect button and no rows
        }
        setLoading(false);
      } catch (error) {
        console.error('Error during API call:', error);
      }
    }
  }

  async function handleConfirmation(IsConfirm) {
    if(IsConfirm){
      handleChangeSyncAllMode(!SyncAllState);
    }
  }


  function OpenConfirmationModal() {
    shopify.modal.show("Modal_UpdateSyncStatus");
  }

  return (
    <div>
      {/* Header Section */}

      <ConfirmationModal title={"Updating Sync/Unsync status"} modalId={"Modal_UpdateSyncStatus"} onConfirm={handleConfirmation} message={`Do you want to ${SyncAllState == true ? "disable":"enable"} sync mode from all current active ${storeData.type == STORETYPE.destination ? "Marketplaces" : "Brands"} ?`} ActionText={"Yes"} tone={"Critical"} />
      <InlineGrid gap={"100"} columns={storeData.type == STORETYPE.destination ? 3 : 2}>

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

        {/* DISPLAY CONNECTION KEY ONLY IF THE STORE TYPE IS DESTINATION STORE */}
        {storeData.type == STORETYPE.destination && (
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
        )}

        <Card >

          <div style={{ display: "flex" }} >

            <div style={{ width: "20%" }}>
              <img src="https://img.icons8.com/?size=100&id=WvVU1dgQ3c2f&format=png&color=000000" style={{ height: "90%", width: "90%" }} alt="" />
            </div>
            <div style={{ width: "80%", display: "block", alignSelf: "center" }}>

              <div style={{ display: "flex", justifyContent: "space-between" }}>

                <Text variant="headingMd">Sync Mode: </Text>
                <input
                  onChange={e => OpenConfirmationModal(e.target.checked)}
                  type="checkbox"
                  checked={SyncAllState}
                  id="syncToggle"
                  style={{ display: "none" }}
                />

                {SyncAllLoading ?
                  <>
                    <Spinner size='small' />
                  </> : <>
                    <label className="switch" htmlFor={`syncToggle`}></label>
                  </>
                }

              </div>


            </div>
          </div>

        </Card>
      </InlineGrid >




      <div style={{ marginBlock: "20px" }}>

        <Divider borderColor="border-inverse" />
      </div>



    </div >
  );
}

export default HomeDashboard;
