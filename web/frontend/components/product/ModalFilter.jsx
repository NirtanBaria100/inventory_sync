import { Modal, TitleBar, useAppBridge } from '@shopify/app-bridge-react';
import { BlockStack, Card, InlineGrid, InlineStack, Layout, Text } from '@shopify/polaris';
import FiltersOptions from './filtersOptions';
import { useState } from 'react';

export function ModalFilter() {
  const shopify = useAppBridge();

  const [filterCriteria, setfilterCriteria] = useState({
    vendor: "",
    status: ""
  })

  let vendors = [
    { label: 'Vendor', value: 'vendor' },
    { label: 'Sync Status', value: 'status' },
  ]
  let syncStatus = [
    { label: 'Vendor', value: 'vendor' },
    { label: 'Sync Status', value: 'status' },
  ]

  return (
    <>
      {/* <button onClick={() => shopify.modal.show('my-modal')}>Open Modal</button> */}
      <Modal id="Filter-products">


        <div style={{ padding: "10px" }}>


          <InlineGrid columns={2} gap={'200'}>
            <FiltersOptions data={vendors} label={"Vendors"} setValue={setfilterCriteria} value={filterCriteria} />
            {/* <FiltersOptions data={syncStatus} label={"Status"} setValue={setfilterCriteria} value={filterCriteria} /> */}
          </InlineGrid>
        </div>
        <TitleBar title="Filter">
          <button variant="primary">Done</button>
          <button onClick={() => shopify.modal.hide('Filter-products')}>Cancel</button>
        </TitleBar>
      </Modal>
    </>
  );
}
