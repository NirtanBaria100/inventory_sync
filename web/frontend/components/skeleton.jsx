import {
    SkeletonPage,
    Layout,
    Card,
    SkeletonBodyText,
    Text,
    SkeletonDisplayText,
    InlineGrid,
    BlockStack,
    InlineStack,
    LegacyStack,
    Divider,
} from '@shopify/polaris';
import React from 'react';

export default function Skeleton() {
    return (
        <SkeletonPage >
            <InlineGrid gap={"100"} columns={3}>
                <Card >
                    <SkeletonDisplayText size="small" />
                    <SkeletonBodyText />
                </Card>
                <Card >
                    <SkeletonDisplayText size="small" />
                    <SkeletonBodyText />
                </Card>
                <Card >
                    <SkeletonDisplayText size="small" />
                    <SkeletonBodyText />
                </Card>
            </InlineGrid>

            <div style={{ marginBlock: "20px" }}>

                <Divider borderColor="border-inverse" />
            </div>

            <Layout  >
                <Layout.Section variant='oneThird' >

                    <BlockStack gap={"100"}>
                        <Card roundedAbove='md'>
                            <InlineStack align='space-between'>
                                <SkeletonDisplayText size="small" />
                                <SkeletonBodyText />

                            </InlineStack>
                            <LegacyStack vertical>

                                <SkeletonDisplayText size="small" />
                                <SkeletonBodyText />
                            </LegacyStack>
                        </Card>
                        <Card roundedAbove='md'>
                            <InlineStack align='space-between'>
                                <SkeletonDisplayText size="small" />
                                <SkeletonBodyText />
                            </InlineStack>
                            <LegacyStack vertical>

                                <SkeletonDisplayText size="small" />
                                <SkeletonBodyText />
                            </LegacyStack>
                        </Card>
                    </BlockStack>
                </Layout.Section>
                <Layout.Section variant='oneHalf'>
                    <Card >
                        <SkeletonDisplayText size="small" />
                        <SkeletonBodyText />
                    </Card>
                </Layout.Section>
            </Layout>
            {/* <Layout>
                <Layout.Section>
                    <Card>
                        <SkeletonBodyText />
                    </Card>
                    <Card>
                        <Text>
                            <SkeletonDisplayText size="small" />
                            <SkeletonBodyText />
                        </Text>
                    </Card>
                    <Card>
                        <Text>
                            <SkeletonDisplayText size="small" />
                            <SkeletonBodyText />
                        </Text>
                    </Card>
                </Layout.Section>
                <Layout.Section variant="oneThird">
                    <Card>
                        <Card>
                            <Text>
                                <SkeletonDisplayText size="small" />
                                <SkeletonBodyText lines={2} />
                            </Text>
                        </Card>
                        <Card>
                            <SkeletonBodyText lines={1} />
                        </Card>
                    </Card>
                    <Card subdued>
                        <Card>
                            <Text>
                                <SkeletonDisplayText size="small" />
                                <SkeletonBodyText lines={2} />
                            </Text>
                        </Card>
                        <Card>
                            <SkeletonBodyText lines={2} />
                        </Card>
                    </Card>
                </Layout.Section>
            </Layout> */}
        </SkeletonPage>
    );
}

