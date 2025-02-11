import {
    Button,
    Collapsible,
    Link,
    Card,
    BlockStack,
    Text
} from '@shopify/polaris';
import { useState, useCallback } from 'react';

export const CollapsibleSettingSection = () => {
    const [open, setOpen] = useState(true);

    const handleToggle = useCallback(() => setOpen((open) => !open), []);

    return (
        <div >
            <Card >
                <BlockStack >
                    <Button
                        onClick={handleToggle}
                        ariaExpanded={open}
                        ariaControls="basic-collapsible"
                    >
                        Select columnssds
                    </Button>
                    <Collapsible
                        open={open}
                        id="basic-collapsible"
                        transition={{ duration: '500ms', timingFunction: 'ease-in-out' }}
                        expandOnPrint
                    >
                        <Text >
                            <p>
                                Your mailing list lets you contact customers or visitors who
                                have shown an interest in your store. Reach out to them with
                                exclusive offers or updates about your products.
                            </p>
                            <Link url="#">Test link</Link>
                        </Text>
                    </Collapsible>
                </BlockStack>
            </Card>
        </div>
    );
}