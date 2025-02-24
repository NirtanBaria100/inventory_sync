import { Modal, TitleBar, useAppBridge } from '@shopify/app-bridge-react';
import { Card, InlineStack, Text } from '@shopify/polaris';

export function ConfirmationModal({ title, modalId, onConfirm, message, ActionText, tone }) {
    const shopify = useAppBridge();

    return (
        <>
            <Modal id={modalId}>

                <div style={{padding:"15px"}}>

                    <Text >{message}</Text>
                </div>
                <TitleBar title={title}>
                    <button
                        variant="primary"
                        tone={tone}
                        onClick={() => onConfirm(true)}
                    >
                        {ActionText}
                    </button>
                    <button onClick={() => shopify.modal.hide(modalId)}>Cancel</button>
                </TitleBar>
            </Modal>
        </>
    );
}
