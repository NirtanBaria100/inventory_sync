import {
    IndexTable,
    LegacyCard,
    useIndexResourceState,
    Text,
    Badge,
    useBreakpoints,
} from '@shopify/polaris';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { handleImportProducts, handleOnNextEvent, handleOnPrevEvent } from './helper/functions';
import { PlusCircleIcon } from '@shopify/polaris-icons';

export default function Table({ TableData, Headings }) {
    const { Query, loading, hasNextPage, hasPreviousPage, startCursor, endCursor, value } = useSelector(state => state.products);
    const dispatch = useDispatch();
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
                        {index + 1}
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
                promotedBulkActions={[{
                    content: 'Import',
                    icon: PlusCircleIcon,
                    onAction: () => handleImportProducts(selectedResources, value),
                }]}

                onSelectionChange={handleSelectionChange}
                headings={Headings}
                pagination={{
                    hasNext: hasNextPage,
                    hasPrevious: hasPreviousPage,
                    onNext: () => handleOnNextEvent(dispatch, startCursor, endCursor, Query),
                    onPrevious: () => handleOnPrevEvent(dispatch, startCursor, endCursor, Query)
                }}
            >
                {rowMarkup}
            </IndexTable>
        </LegacyCard >
    );
}