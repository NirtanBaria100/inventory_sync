import { React, useState, useCallback } from 'react'
import {
    Text,
    Button
} from '@shopify/polaris';
import { useDispatch, useSelector } from "react-redux";
import { setStartStoreData } from "../../features/dataSlice";
import { STORETYPE } from '../../utils/storeType';




function FirstTimeUser({ setNewUser }) {

    const dispatch = useDispatch();
    const storeData = useSelector((state) => state.data); 

    const handleConfirm = async () => {

        const apiUrl = '/api/shop';   // create a store api, 
                                      // this api asks if store is source or destination and then saves it and generates a key for it 

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ type: selectedOption }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setNewUser(false)                         //not a new user now, this state comes form the parent component 

            dispatch(setStartStoreData({              // setting the data in redux
                id: data.newStore.id,
                storeName: data.newStore.storeName,
                key: data.newStore.key,
                type: data.newStore.type,
                newUser:false,
                intialLoading:false
            }));

        } catch (error) {
            console.error('Error during API call:', error);
        }
    };



    const [selectedOption, setSelectedOption] = useState(null);   //the selected option, source or destination store 

    const handleSelection = (option) => {
        setSelectedOption(option);
    };

    return (
        // two buttons with images and text , and one confirm button below them 
        <div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    borderRadius: "10px",
                    boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.1)",
                    width: "50%",
                    left: "25%",
                    top: "10%",
                    backgroundColor: "white",
                    height: "300px",
                    position: "absolute",
                }}
            >

                <div style={{
                    position: "absolute",
                    top: "5%"
                }}>
                    Select the store type:
                </div>

                <button
                    onClick={() => handleSelection('Source')}
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "column",
                        borderRadius: "10px",
                        boxShadow: selectedOption === 'Source'
                            ? "0px 0px 10px rgba(0, 0, 0, 0.5)"
                            : "0px 0px 5px rgba(0, 0, 0, 0.1)",
                        width: "40%",
                        height: "60%",
                        position: "absolute",
                        left: "5%",
                        top: "15%",
                        backgroundColor: selectedOption === 'Source' ? '#F5F5F5' : 'white',
                    }}
                >


                    <img
                        src="https://img.icons8.com/?size=100&id=FQjuMXbb1Hlh&format=png&color=000000"  // image saved in assets folder 
                        style={{
                            width: "100%",
                            height: "80%",
                            objectFit: "contain",
                        }}
                    />

                    



                    <span style={{
                        marginTop: "10px",
                    }}>


                        <Text variant="bodyLg" as="p">
                            Source/Brand
                        </Text>

                    </span>

                </button>

                <button
                    onClick={() => handleSelection(STORETYPE.destination)}
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "column",
                        borderRadius: "10px",
                        boxShadow: selectedOption === STORETYPE.destination
                            ? "0px 0px 10px rgba(0, 0, 0, 0.5)"
                            : "0px 0px 5px rgba(0, 0, 0, 0.1)",
                        width: "40%",
                        height: "60%",
                        position: "absolute",
                        right: "5%",
                        top: "15%",
                        backgroundColor: selectedOption === STORETYPE.destination ? '#F5F5F5' : 'white',

                    }}
                >
                    <img
                        src="./brand-positioning.png"   //image saved in assets folder 
                        style={{
                            width: "100%",
                            height: "80%",
                            objectFit: "contain",
                        }}
                    />


                    <span style={{
                        marginTop: "10px",
                    }}>


                        <Text variant="bodyLg" as="p">
                            Destination/Marketplace
                        </Text>
                    </span>
                </button>


                <div style={{
                    marginTop: "200px"
                }}>


                    <Button
                        disabled={!selectedOption}
                        variant="primary"
                        onClick={handleConfirm}
                    >
                        Confirm
                    </Button>



                </div>

            </div>
        </div>
    );
}

export default FirstTimeUser