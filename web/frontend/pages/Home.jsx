import { React, useState, useEffect, useCallback } from 'react';
import FirstTimeUser from '../components/Home/FirstTimeUser';
import { useDispatch, useSelector } from "react-redux";
import HomeDashbaord from "../components/Home/HomeDashboard";
import {
    OrderIcon, ProductIcon, CaretDownIcon
} from '@shopify/polaris-icons';
import { Badge, Banner, BlockStack, Button, Card, Collapsible, InlineStack, Layout, LegacyCard, LegacyStack, Link, Page, Spinner, Text, TextContainer, } from "@shopify/polaris";
import Stores from '../components/stores/store';
import { STORETYPE } from '../utils/storeType';
import { setTotalProductSynced } from '../features/productSlice';


function Home() {
    const [newUser, setNewUser] = useState(true);           // new user state, if true means new user
    const [loading, setLoading] = useState(true);           //intial loader state
    const [connectedStores, SetConnectedStores] = useState([]);


    const dispatch = useDispatch();
    const { totalProductSynced, totalOrdersSynced } = useSelector((state) => state.products);
    const storeData = useSelector((state) => state.data);

    const [openOrderCollapsibile, setopenOrderCollapsibile] = useState(false);
    const [openProductCollapsible, setopenProductCollapsible] = useState(false);

    const handleToggleProductCollapsibile = useCallback(() => setopenProductCollapsible((openProductCollapsible) => !openProductCollapsible), []);
    const handleToggleOrderCollapsibile = useCallback(() => setopenOrderCollapsibile((openOrderCollapsibile) => !openOrderCollapsibile), []);

    useEffect(() => {
        (async () => {
            await getStoreDetails();
        })()

    }, [storeData]);

    // if no data inn redux object then means its a first time user 

    useEffect(() => {
        async function firstTimerUserCheck() {

            if (!storeData.intialLoading) {    // this intial loading is added so that if data hasnt been fetched in app.jsx ,user sees a loader
                if (storeData.newUser) {
                    setLoading(false);

                }
                if (!storeData.newUser) {
                    setNewUser(false);  // existing user 
                    setLoading(false);
                }

            }

        }

        firstTimerUserCheck();

    }, [storeData]);


    async function getProductCount(brand, marketplace) {
        try {
            const response = await fetch(`/api/products/count/${brand}/${marketplace}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(data)
            return data; // Assuming API returns { count: number }
        } catch (error) {
            console.error("Failed to fetch product count:", error);
            return null; // Return null in case of failure
        }
    }

    async function getStoreDetails() {
        setLoading(true);

        if (!storeData.intialLoading) { // Ensure data is fetched in app.jsx
            let url;
            if (storeData.type === STORETYPE.source) {
                url = "/api/connection/connectedDestinationStores"; // Source store fetching destination stores
            } else if (storeData.type === STORETYPE.destination) {
                url = "/api/connection/connectedSourceStores"; // Destination store fetching source stores
            }

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: storeData.id }),
                });

                if (response.status === 200) {
                    const data = await response.json();
                    let storeNames = [];

                    if (storeData.type === STORETYPE.source) {
                        storeNames = data?.destinationStore.map(store => store.storeName);
                    } else if (storeData.type === STORETYPE.destination) {
                        storeNames = data?.sourceStore.map(store => store.storeName);
                    }

                    // Wait for all getProductCount calls to resolve
                    const NamesWithProductCount = await Promise.all(
                        storeNames.map(async (shopName) => ({
                            shopName,
                            count: await getProductCount(shopName, storeData.storeName),
                        }))
                    );

                    dispatch(setTotalProductSynced(NamesWithProductCount));
                }
                else if (response.status === 404) {
                    SetConnectedStores([]); // Set empty if no stores found
                }

                setLoading(false);
            } catch (error) {
                console.error('Error during API call:', error);
                setLoading(false);
            }
        }
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                {/* <h2>Loading...</h2> */}
                <Spinner accessibilityLabel="Spinner example" size="large" />
            </div>
        );
    }


    return (
        <Page title='Sync Bridge'>
            {newUser ? <FirstTimeUser setNewUser={setNewUser} /> : ( //new user then we load this component or else load homedashboard component
                <>

                    <HomeDashbaord />
                    <Layout  >
                        <Layout.Section variant='oneThird' >

                            <BlockStack gap={"100"}>
                                <Card roundedAbove='md'>
                                    <InlineStack align='space-between'>
                                        <Text variant='headingSm' >Total Order Synced</Text>
                                        <Button
                                            onClick={handleToggleOrderCollapsibile}
                                            ariaExpanded={openOrderCollapsibile}
                                            ariaControls="order-collapsible"
                                            icon={CaretDownIcon}
                                        >
                                        </Button>
                                    </InlineStack>
                                    <LegacyStack vertical>

                                        <Collapsible
                                            open={openOrderCollapsibile}
                                            id="order-collapsible"
                                            transition={{ duration: '500ms', timingFunction: 'ease-in-out' }}
                                            expandOnPrint
                                        >
                                            <div style={{ marginTop: "20px" }}>

                                                <BlockStack gap={"300"}>


                                                    <Banner tone='info-strong'>Development In-process!</Banner>

                                                </BlockStack>

                                            </div>
                                        </Collapsible>
                                    </LegacyStack>
                                </Card>
                                <Card roundedAbove='md'>
                                    <InlineStack align='space-between'>
                                        <Text variant='headingSm' >Total Product Synced</Text>
                                        <Button
                                            onClick={handleToggleProductCollapsibile}
                                            ariaExpanded={openProductCollapsible}
                                            ariaControls="collapsible-order"
                                            icon={CaretDownIcon}
                                        >
                                        </Button>
                                    </InlineStack>
                                    <LegacyStack vertical>

                                        <Collapsible
                                            open={openProductCollapsible}
                                            id="collapsible-order"
                                            transition={{ duration: '500ms', timingFunction: 'ease-in-out' }}
                                            expandOnPrint
                                        >
                                            <div style={{ marginTop: "20px" }}>

                                                <BlockStack gap={"300"}>

                                                    {totalProductSynced ? <>
                                                        {totalProductSynced.map(marketplace => (
                                                            <InlineStack align='space-between'>

                                                                <Text variant='bodyMd' >{marketplace.shopName}</Text>
                                                                <Badge icon={ProductIcon} tone='success' size='medium'>
                                                                    {marketplace.count || 0}
                                                                </Badge>
                                                            </InlineStack>
                                                        ))}

                                                    </> :

                                                        (
                                                            <Text>No Product Syncronized Yet!</Text>
                                                        )
                                                    }
                                                </BlockStack>

                                            </div>
                                        </Collapsible>
                                    </LegacyStack>
                                </Card>
                            </BlockStack>
                        </Layout.Section>
                        <Layout.Section variant='oneHalf'>

                            <Stores />
                        </Layout.Section>
                    </Layout>
                </>
            )}
        </Page>
    );
}

export default Home;
