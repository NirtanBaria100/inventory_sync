import { React, useState, useCallback } from 'react';
import {
    Text,
    Button,
    TextField,
    Spinner,
    Toast,
    Frame
} from '@shopify/polaris';

// component use to connect a new store 
function ConnectStore({ onButtonClick, onConnectionSuccess}) {

    const [key, setKey] = useState('');                              // the unique key of the store we want too connect with 
    const [loading, setLoading] = useState(false);                   //loader
    const [responseMessage, setResponseMessage] = useState('');      //response message
    const [active, setActive] = useState(false);                     //toast          

    const toggleActive = useCallback(() => setActive((active) => !active), []);

    const handleConfirm = async () => {
        setLoading(true);
        setResponseMessage('');
        const apiUrl = '/api/connection';   // this api makes the connection 

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ key: key }),
            });

            const data = await response.json();

            if (response.status === 400) {
                throw new Error(data.error);
            } else if (!response.ok) {
                throw new Error('An error occured, Please try again later');
            }

            
            console.log('connection made', data);
            setResponseMessage(`${data.message}`);
            setTimeout(() => {
                onConnectionSuccess();
            }, 1000);            
        } catch (error) {
            console.error('Error during API call:', error);
            setResponseMessage(`${error.message}`);
        } finally {
            setLoading(false);
            setActive(true);
        }
    };

    const handleChange = useCallback(
        (newValue) => setKey(newValue),
        [],
    );

    const toastMarkup = active ? (
        <Toast content={responseMessage} onDismiss={toggleActive} duration={5000} />
    ) : null;

    return (
        <div style={{
            padding: "20px",
            width: "90%"
        }}>



            <Text variant="headingSm" as="h6">
                Please enter the destination store key
            </Text>

            <div style={{ marginTop: "1px", width: "100%" }}>
                <TextField
                    value={key}
                    onChange={handleChange}
                    placeholder="Store key"
                    autoComplete="off"
                    disabled={loading}
                />
            </div>

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
                    disabled={key.trim() === '' || loading}
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

export default ConnectStore;
