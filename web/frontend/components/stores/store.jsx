import { SearchIcon } from '@shopify/polaris-icons';
import { React, useState, useCallback, useMemo, useEffect } from 'react';
import { Link, Page, Text, Divider, Button, Autocomplete, Icon, LegacyCard, DataTable, TextField, Frame, IndexTable, Badge, useBreakpoints, Spinner, InlineStack, Card, } from "@shopify/polaris";
import ConnectStore from '../stores/ConnectStore';
import DisconnectStore from '../stores/DisconnectStore';
import { useSelector } from "react-redux";
import { STORETYPE } from '../../utils/storeType';

function Stores() {

    const resourceName = {
        singular: 'store',
        plural: 'stores',
    };

    const [showConnectStore, setShowConnectStore] = useState(false);               // the state of the component which shows connect new store 
    const [showDisconnectStore, setShowDisconnectStore] = useState(false);         // the state of the component which shows dissconnect new store 
    const [rows, setRows] = useState([]);                                          // this the data of the table 
    const [loading, setLoading] = useState(true);                                  //intial loader state
    const [connectButtonEnabled, setconnectButtonEnabled] = useState(true);        // state to show if connect button should be enabled or not 
    const [rowMarkup1, setRowMarkup1] = useState([]);                              //this the updated data of the table which is filtered according to the index table 
    const [selectedRowId, setSelectedRowId] = useState('');                        // when row is clicked the row id is saved here
    const [storeName, setStoreName] = useState('');                                // when row is clicked the store name is saved here

    //as of now we can only connect one destiantion store to a brand store , thats why the connectButtonEnabled is set to false if there is a existing connection 

    const handleConnectionSuccess = () => {
        setShowConnectStore(false);
        setShowDisconnectStore(false);
        getStoreDetails();
    };

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

    useEffect(() => {
        if (rows.length > 0) {
            const newRowMarkup = rows.map(({ id, storeName, status }, index) => (     // mapping function , was given on polaris 
                <IndexTable.Row
                    id={id}
                    key={id}
                    position={index}
                    onClick={() => {
                        setSelectedRowId(id);
                        setStoreName(storeName);
                        handleButtonClick1();
                    }}
                >
                    <IndexTable.Cell>
                        <Text variant="bodyMd" as="span">
                            {storeName}
                        </Text>
                    </IndexTable.Cell>
                    <IndexTable.Cell alignment="start"><Badge tone='success'>
                        {status}
                    </Badge></IndexTable.Cell>
                    <IndexTable.Cell>
                        <InlineStack>
                            <input type="checkbox" checked={true} hidden="hidden" id="username" />
                            <label class="switch" for="username"></label>
                        </InlineStack>
                    </IndexTable.Cell>
                </IndexTable.Row>
            ));
            setRowMarkup1(newRowMarkup);
        }
    }, [rows]);

    const storeData = useSelector((state) => state.data);
    const breakpoints = useBreakpoints();

    const handleButtonClick = () => {
        setShowConnectStore((prev) => !prev);
    };

    const handleButtonClick1 = () => {
        setShowDisconnectStore((prev) => !prev);
    };

    useEffect(() => {
        getStoreDetails();
    }, [storeData]);

    if (loading) {    //inital laoder
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                {/* <h2>Loading...</h2> */}
                <Spinner accessibilityLabel="Spinner example" size="large" />
            </div>
        );
    }

    return (
        <Frame>

            <Card>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: '10px'
                    }}
                >
                    <div>
                        <Text variant="headingMd" as="h4">
                            {storeData.type == STORETYPE.destination ? "Connected Brands" : "Connected Marketplaces"}
                        </Text>
                    </div>
                    {storeData.type === STORETYPE.source && (
                        <Button
                            // disabled={showConnectStore || !connectButtonEnabled}
                            variant="primary"
                            onClick={handleButtonClick}
                        >
                            Connect new store
                        </Button>
                    )}
                </div>
                <Divider borderColor="border-inverse" />

                <div style={{ marginTop: "10px", display: 'flex', flexDirection: "column", alignItems: 'center', }}>
                    <div style={{ width: '100%' }}>
                        {!showConnectStore && !showDisconnectStore && (
                            // showing the table in this condition  
                            <LegacyCard>
                                {rows.length > 0 ? (
                                    <IndexTable
                                        condensed={breakpoints.smDown}
                                        resourceName={resourceName}
                                        itemCount={rowMarkup1.length}
                                        headings={[
                                            { title: 'Store Name' },
                                            { title: 'Status' },
                                            { title: 'Action' },
                                        ]}
                                        selectable={false}
                                    >
                                        {rowMarkup1}
                                    </IndexTable>
                                ) : (
                                    <div style={{ padding: '16px', textAlign: 'center' }}>
                                        No stores connected
                                    </div>
                                )}
                            </LegacyCard>
                        )}
                    </div>

                    {showConnectStore && (
                        // showing the connect new store component 
                        // <div style={{
                        //     display: "flex",
                        //     alignItems: "center",
                        //     flexDirection: "column",
                        //     borderRadius: "10px",
                        //     boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)",
                        //     width: "40%",
                        //     backgroundColor: "white",
                        //     height: "130px",
                        //     marginTop: "10px"
                        // }}>
                        <ConnectStore onButtonClick={handleButtonClick} onConnectionSuccess={handleConnectionSuccess} />
                        // </div>
                    )}

                    {showDisconnectStore && (
                        // showing the disconnect store component
                        // <div style={{
                        //     display: "flex",
                        //     alignItems: "center",
                        //     flexDirection: "column",
                        //     borderRadius: "10px",
                        //     boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)",
                        //     width: "40%",
                        //     backgroundColor: "white",
                        //     height: "130px",
                        //     marginTop: "10px"
                        // }}>
                        <DisconnectStore
                            onButtonClick={handleButtonClick1}
                            onConnectionSuccess={handleConnectionSuccess}
                            rowId={selectedRowId}
                            storeName={storeName}
                        />
                        // </div>
                    )}
                </div>
            </Card>
        </Frame>

    );
}

export default Stores;
