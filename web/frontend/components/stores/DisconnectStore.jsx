import { React, useState, useCallback } from 'react';
import {
    Text,
    Button,
    TextField,
    Spinner,
    Toast,
    Frame
} from '@shopify/polaris';
import { useSelector } from "react-redux";
import { STORETYPE } from '../../utils/storeType';

// component to dissconnect a store 
function DisconnectStore({ onButtonClick, onConnectionSuccess, rowId, storeName }) {

    const [loading, setLoading] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');
    const [active, setActive] = useState(false);

    const storeData = useSelector((state) => state.data);



    const toggleActive = useCallback(() => setActive((active) => !active), []);

    const handleConfirm = async () => {
        setLoading(true);
        // setResponseMessage('');
        const apiUrl = '/api/connection/removeConnection';  // api to remove connection

        try {
            if (storeData.type === STORETYPE.source) {  // api need both the source store and destiantion store id
                var sourceId = storeData.id
                var destinationId = rowId
            } else if (storeData.type === STORETYPE.destination) {
                var sourceId = rowId
                var destinationId = storeData.id
            }

            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sourceStoreId: parseInt(sourceId, 10),
                    destinationStoreId: parseInt(destinationId, 10),
                }),
            });

            const data = await response.json();

            if (response.status === 400) {
                throw new Error(data.error);
            } else if (!response.ok) {
                throw new Error('An error occurred, Please try again later');
            }

            console.log('Connection removed', data);
            setResponseMessage(data.message);

            setTimeout(() => {
                onConnectionSuccess();  // this function is called from the parent and it closes this component and reloads the store component
            }, 2000);                // set timeout so that the user can see the toast message and then it automatically reloads. 
        } catch (error) {
            console.error('Error during API call:', error);
            setResponseMessage(`${error.message}`);
            setTimeout(() => {
                onConnectionSuccess();   //calling this so it reloads 
            }, 1000);
        } finally {
            setLoading(false);
            setActive(true);
        }
    };


    const toastMarkup = active ? (
        <Toast content={responseMessage} onDismiss={toggleActive} duration={5000} />
    ) : null;

    return (
        <div style={{
            padding: "20px",
            width: "90%"
        }}>



            <Text variant="headingSm" as="h6">
                Disconnect store: <br></br> {storeName}
            </Text>


            <div style={{ marginTop: "15px", display: "flex", justifyContent: 'flex-end', gap: '10px', marginBottom: "20px" }}>

                <Button
                    variant="primary"
                    tone="critical"
                    onClick={onButtonClick}
                    disabled={loading}
                >
                    cancel
                </Button>

                <Button
                    disabled={loading}
                    variant="primary"
                    onClick={handleConfirm}
                >
                    {loading ? <Spinner size="small" /> : 'confirm'}
                </Button>
            </div>

            {/* <Frame>   */}
            {toastMarkup}
            {/* </Frame> */}

        </div>
    );
}

export default DisconnectStore;
