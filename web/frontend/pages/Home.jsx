import { React, useState, useEffect } from 'react';
import FirstTimeUser from '../components/Home/FirstTimeUser';
import { useDispatch, useSelector } from "react-redux";
import { setStartStoreData } from "../features/dataSlice";
import HomeDashbaord from "../components/Home/HomeDashboard"
import { Spinner, } from "@shopify/polaris";


function Home() {
    const [newUser, setNewUser] = useState(true);           // new user state, if true means new user
    const [loading, setLoading] = useState(true);           //intial loader state

    const dispatch = useDispatch();
    const storeData = useSelector((state) => state.data);

   // if no data inn redux object then means its a first time user 

    useEffect(() => {
        async function firstTimerUserCheck() {

            if(!storeData.intialLoading) {    // this intial loading is added so that if data hasnt been fetched in app.jsx ,user sees a loader
                    if(storeData.newUser){
                    setLoading(false);

                    }
                    if(!storeData.newUser){
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
        <div>
            {newUser ? <FirstTimeUser setNewUser={setNewUser} /> : ( //new user then we load this component or else load homedashboard component
                <>
 
                    <HomeDashbaord />                                  
                </>
            )}
        </div>
    );
}

export default Home;
