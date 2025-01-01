import { Badge, BlockStack, Button, Card, Divider, InlineGrid, Layout, OptionList, Page, Text, TextField } from '@shopify/polaris'
import React, { useEffect } from 'react'
import Table from '../components/order/Table'
// import "../assets/css/productPage.css";
import { PlusIcon } from '@shopify/polaris-icons';
import { ModalFilter } from '../components/product/ModalFilter';
import { productTableHeadings } from '../utils/productTableHeadings';
// import { } from '../utils/productPage/product'
import { useSelector } from 'react-redux';

function products() {

  let {products,data} = useSelector((state) => state);
  

  useEffect(() => {

    
    console.log({products,data})

  },[]);

  // let ProductsData = [
  //   {
  //     id: '1020',
  //     order: '#1020',
  //     date: 'Jul 20 at 4:34pm',
  //     customer: 'Jaydon Stanton',
  //     total: '$969.44',
  //     paymentStatus: <Badge progress="complete">Paid</Badge>,
  //     fulfillmentStatus: <Badge progress="incomplete">Unfulfilled</Badge>,
  //   },
  //   {
  //     id: '1019',
  //     order: '#1019',
  //     date: 'Jul 20 at 3:46pm',
  //     customer: 'Ruben Westerfelt',
  //     total: '$701.19',
  //     paymentStatus: <Badge progress="partiallyComplete">Partially paid</Badge>,
  //     fulfillmentStatus: <Badge progress="incomplete">Unfulfilled</Badge>,
  //   },
  //   {
  //     id: '1018',
  //     order: '#1018',
  //     date: 'Jul 20 at 3.44pm',
  //     customer: 'Leo Carder',
  //     total: '$798.24',
  //     paymentStatus: <Badge progress="complete">Paid</Badge>,
  //     fulfillmentStatus: <Badge progress="incomplete">Unfulfilled</Badge>,
  //   },
  // ];

  let productHeadings = productTableHeadings;

  return (
    <Page>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: '10px'
        }}
      >
        <div>
          <Text variant="headingXl" as="h4">
            Product Syncronization
          </Text>
        </div>



      </div>
      <Divider borderColor="border-inverse" />
      <div className='productSync-wrapper'>
        <Card >
          <div style={{ marginBottom: "10px" }}>
            <Layout columns={2}>
              <Layout.Section variant='oneHalf'>
                <TextField placeholder={"Search Products"} />
              </Layout.Section>
              <Layout.Section variant='oneThird'>
                <BlockStack align='end' >
                  <Button onClick={() => shopify.modal.show('Filter-products')} icon={PlusIcon}>Filter</Button>
                </BlockStack>
              </Layout.Section>
            </Layout>
          </div>
          <Table TableData={products.value} Headings={productHeadings} />
        </Card>
      </div >
      <ModalFilter />
    </Page >
  )
}

export default products