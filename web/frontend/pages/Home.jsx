import { React, useState, useEffect } from 'react';
import FirstTimeUser from '../components/Home/FirstTimeUser';
import { useDispatch, useSelector } from "react-redux";
import { setStartStoreData } from "../features/dataSlice";
import HomeDashbaord from "../components/Home/HomeDashboard"
import { BlockStack, Card, InlineStack, Layout, Page, Spinner, } from "@shopify/polaris";
import Stores from '../components/stores/store';


function Home() {
    const [newUser, setNewUser] = useState(true);           // new user state, if true means new user
    const [loading, setLoading] = useState(true);           //intial loader state

    const dispatch = useDispatch();
    const storeData = useSelector((state) => state.data);

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



    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                {/* <h2>Loading...</h2> */}
                <Spinner accessibilityLabel="Spinner example" size="large" />
            </div>
        );
    }


    return (
        <Page  title='Sync Bridge'>
            {newUser ? <FirstTimeUser setNewUser={setNewUser} /> : ( //new user then we load this component or else load homedashboard component
                <>

                    <HomeDashbaord />
                    <Layout >
                        <Layout.Section variant='oneThird' >

                            <BlockStack gap={"100"}>
                                <Card >
                                    Order Count
                                </Card>
                                <Card >
                                    Product Count

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
