import React, { useEffect, useState, useCallback } from 'react';
import { Button, Select, Toast, Frame, LegacyCard } from "@shopify/polaris";
import { useDispatch, useSelector } from "react-redux";
import { setStartStoreData } from "../../features/dataSlice";


// as of now this component is used to change the type of the store 
function StoreSettings({ backButton }) {
    const [typeSelected, setTypeSelected] = useState('');      //the current type of the current store 
    const [showToast, setShowToast] = useState(false);         //state of toast
    const [toastContent, setToastContent] = useState('');      //toast message
    const [isError, setIsError] = useState(false);             //error sate for toast

    const dispatch = useDispatch();
    const storeData = useSelector((state) => state.data);

    const handleSelectChange = useCallback(
        (value) => setTypeSelected(value),
        [],
    );

    const handleConfirm = async () => {
        const apiUrl = '/api/connection/changeStoreType';  // this api first checks if the store has any existing connection,
                                                           // if no connection then it lets you change the type 
                                                           // if there is connection , it returns an error message 
    
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ type: typeSelected }),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                // Check if the error response has a message
                if (errorData && errorData.message) {
                    setToastContent(errorData.message);  // Display the error message from the API response
                } else {
                    setToastContent('Failed to update store type. Please try again.');
                }
                setIsError(true);
                setShowToast(true);
                return;  // Exit early if there is an error
            }
    
            const data = await response.json();
            dispatch(setStartStoreData({         // saving the updated data in redux
                id: data.updatedStore.id,
                storeName: data.updatedStore.storeName,
                key: data.updatedStore.key,
                type: data.updatedStore.type,
                newUser: false,
                intialLoading: false,
            }));
    
            setToastContent(`new store type: ${data.updatedStore.type}`);
            setIsError(false);
            setShowToast(true);
        } catch (error) {
            console.error('Error during API call:', error);
            setToastContent('Failed to update store type. Please try again.');
            setIsError(true);
            setShowToast(true);
        }
    };
    
    const options = [
        { label: 'source', value: 'source' },
        { label: 'destination', value: 'destination' },
    ];

    useEffect(() => {
        if (storeData.type === "source") {
            setTypeSelected("source");
        } else if (storeData.type === "destination") {
            setTypeSelected("destination");
        }
    }, [storeData]);

    const toggleToast = useCallback(() => setShowToast((show) => !show), []);

    return (
        <Frame>
            
            <div style={{ width: "100%" }}>
        
                <Button onClick={backButton}>Back</Button>

                <div style={{ marginTop: "10px", display: "flex", justifyContent: 'space-between', borderTop: "1px solid #ccc", borderBottom: "1px solid #ccc", height: "60px" }}>
                    <div style={{ marginTop: "10px", width: "50%" }}>Store type settings</div>
                    <div style={{ marginTop: "10px", width: "30%" }}>
                        <Select
                            options={options}
                            onChange={handleSelectChange}
                            value={typeSelected}
                        />
                    </div>
                </div>
               
                <div style={{ marginTop: "20px", display: 'flex', justifyContent: 'right' }}>
                    <Button onClick={handleConfirm} primary>Save</Button>
                </div>

                {showToast && (
                    <Toast content={toastContent} error={isError} onDismiss={toggleToast} />
                )}
            </div>
        </Frame>
    );
}

export default StoreSettings;
