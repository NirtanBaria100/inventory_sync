import {
    IndexTable,
    LegacyCard,
    useIndexResourceState,
    Text,
    Badge,
    useBreakpoints,
} from '@shopify/polaris';
import React from 'react';
import { useSelector } from 'react-redux';

export default function Table({ TableData, Headings }) {
    const { loading } = useSelector(state => state.products);
    const Data = TableData;
    const resourceName = {
        singular: 'Data',
        plural: 'Data',
    };

    const { selectedResources, allResourcesSelected, handleSelectionChange } =
        useIndexResourceState(Data);

    const rowMarkup = Data.map(
        (
            { id, title, vendor },
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
                        {index+1}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>{title}</IndexTable.Cell>
                <IndexTable.Cell>{vendor}</IndexTable.Cell>
                <IndexTable.Cell><Badge tone='success'>synced</Badge></IndexTable.Cell>
            </IndexTable.Row>
        ),
    );

    return (
        <LegacyCard>
            <IndexTable
                
                loading={loading}
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