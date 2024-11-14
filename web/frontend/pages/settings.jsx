import { React, useEffect, useState } from 'react'
import { useSelector } from "react-redux";
import { Page, Frame, Divider, Text, Spinner } from "@shopify/polaris";
import SettingButton from '../components/settings/SettingButton';
import StoreSettings from '../components/settings/StoreSettings';


function settings() {
    const [loading, setLoading] = useState(true);                               //intial loader state
    const [showStoreSettings, setShowStoreSettings] = useState(false);          // state to show stoe setting component or not 

    const handleStoreSettingsButtonClick = () => {
        setShowStoreSettings(prevState => !prevState);
    };

    const storeData = useSelector((state) => state.data);

    useEffect(() => {

        if (!storeData.intialLoading) {     // if data not fetched in app.jsx then show loader
            setLoading(false)
        }

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
        <Frame>
            <Page>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        //   justifyContent: "center",
                        marginBottom: '10px'
                    }}
                >
                    <div>
                        <Text variant="headingXl" as="h4">
                            Settings
                        </Text>
                    </div>



                </div>
                <Divider borderColor="border-inverse" />


                <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
                    {showStoreSettings ? (
                        <StoreSettings backButton={handleStoreSettingsButtonClick} />
                    ) : (
                        <div style={{ display: "flex", justifyContent: "space-evenly", width: "100%" }}>
                            <SettingButton title="Store" onClick={handleStoreSettingsButtonClick} />
                            {/* product settigns have not been added yet, here we will add fields which need to be synced and which dont  */}
                            <SettingButton title="Product" onClick={() => console.log("product Settings button clicked")} />  
                             {/* other settings we might need to include   */}
                            <SettingButton title="Other" onClick={() => console.log("order Settings button clicked")} />
                        </div>
                    )}
                </div>
            </Page>
        </Frame>


    )
}

export default settings