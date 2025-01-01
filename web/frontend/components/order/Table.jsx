import {
    IndexTable,
    LegacyCard,
    useIndexResourceState,
    Text,
    Badge,
    useBreakpoints,
} from '@shopify/polaris';
import React from 'react';

export default function Table({ TableData, Headings }) {
    const Data = TableData;
    const resourceName = {
        singular: 'Data',
        plural: 'Data',
    };

    const { selectedResources, allResourcesSelected, handleSelectionChange } =
        useIndexResourceState(Data);

    const rowMarkup = Data.map(
        (
            { id, order, date, customer, total, paymentStatus, fulfillmentStatus },
            index,
        ) => (
            <IndexTable.Row
                id={id}
                key={id}
                selected={selectedResources.includes(id)}
                position={index}

            >
                <IndexTable.Cell>
                    <Text variant="bodyMd" fontWeight="bold" as="span">
                        {order}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>{date}</IndexTable.Cell>
                <IndexTable.Cell>{customer}</IndexTable.Cell>
                <IndexTable.Cell>{paymentStatus}</IndexTable.Cell>
                <IndexTable.Cell>{fulfillmentStatus}</IndexTable.Cell>
                <IndexTable.Cell>siar-development</IndexTable.Cell>
            </IndexTable.Row>
        ),
    );

    return (
        <LegacyCard>
            <IndexTable
                loading={false}
                condensed={useBreakpoints().smDown}
                resourceName={resourceName}
                itemCount={Data.length}
                selectedItemsCount={
                    allResourcesSelected ? 'All' : selectedResources.length
                }
                onSelectionChange={handleSelectionChange}
                headings={Headings}
                pagination={{
                    hasNext: true,
                    onNext: () => { },
                }}
            >
                {rowMarkup}
            </IndexTable>
        </LegacyCard>
    );
}