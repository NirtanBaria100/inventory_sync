import {
    IndexTable,
    LegacyCard,
    useIndexResourceState,
    Text,
    Badge,
    useBreakpoints,
    Button,
    Icon,
    InlineStack,
} from '@shopify/polaris';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { handleImportProducts, handleOnNextEvent, handleOnPrevEvent } from './helper/functions';
import { PlusCircleIcon, DeleteIcon } from '@shopify/polaris-icons';

export default function Table({ TableData, Headings }) {
    const { Query, loading, hasNextPage, hasPreviousPage, startCursor, endCursor, value } = useSelector(state => state.products);
    const dispatch = useDispatch();
    const [syncDsyncButtonStatus, setSyncDsyncButtonStatus] = useState("");
    const [promotedBulkActions, setPromotedBulkActions] = useState([]);

    const Data = TableData;
    const resourceName = {
        singular: 'Data',
        plural: 'Data',
    };


    const { selectedResources, allResourcesSelected, handleSelectionChange } =
        useIndexResourceState(Data);



    useEffect(() => {
        let products = Data.filter(x => selectedResources.includes(x.id));
        let syncProductsCount = products.filter(x => x.status === true);
        let notSyncProductsCount = products.filter(x => x.status === false);



        if (notSyncProductsCount.length > 0 && syncProductsCount.length > 0) {
            console.log("Condition true")
            setPromotedBulkActions([
                {
                    content: 'Sync',
                    icon: PlusCircleIcon,
                    onAction: () => handleImportProducts(selectedResources, value),
                },
                {
                    content: 'Desync',
                    icon: PlusCircleIcon,
                    onAction: () => handleImportProducts(selectedResources, value),
                }
            ]);
        } else if (syncProductsCount.length > 0) {
            setPromotedBulkActions([
                {
                    content: 'Desync',
                    icon: PlusCircleIcon,
                    onAction: () => handleImportProducts(selectedResources, value),
                }
            ]);
        }
        else if (notSyncProductsCount.length > 0) {
            setPromotedBulkActions([
                {
                    content: 'Sync',
                    icon: PlusCircleIcon,
                    onAction: () => handleImportProducts(selectedResources, value),
                }
            ]);
        }
    }, [selectedResources, Data, value]);


    const rowMarkup = Data.map(
        (
            { id, title, vendor, status },
            index,
        ) => (
            <IndexTable.Row
                id={id}
                key={id}
                selected={selectedResources.includes(id)}
                position={index}
            // onNavigation={(value) => ToggleSyncButton(value)}
            // disabled={syncDsyncButtonStatus != "" && syncDsyncButtonStatus ? !status : status}

            >
                <IndexTable.Cell>
                    <Text variant="bodyMd" fontWeight="bold" as="span">
                        {index + 1}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>{title}</IndexTable.Cell>
                <IndexTable.Cell>{vendor}</IndexTable.Cell>
                <IndexTable.Cell><InlineStack><Badge tone={status ? 'success' : "info-strong"}>  {status ? "Already synced" : "Not synced"}</Badge></InlineStack></IndexTable.Cell>
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
                promotedBulkActions={promotedBulkActions}

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