import { Badge, BlockStack, Button, Card, Divider, InlineGrid, InlineStack, Layout, OptionList, Page, Text, TextField } from '@shopify/polaris'
import React, { useEffect, useState } from 'react'
import Table from '../components/order/Table'
import "../assets/css/productPage.css";
import { SearchIcon, PlusIcon } from '@shopify/polaris-icons';
import { ModalFilter } from '../components/product/ModalFilter';
import { productTableHeadings } from '../utils/productTableHeadings';
// import { } from '../utils/productPage/product'
import { useDispatch, useSelector } from 'react-redux';
import { getbatchProducts } from '../components/product/helper/functions';
import { setProducts, setLoading, setQuery } from '../features/productSlice';
import FiltersOptions from '../components/product/filtersOptions';

function products() {

  const products = useSelector((state) => state.products);
  const { Query } = products;
  const vendors = [{ value: "", label: "Select Vendor" },{ value: "abc", label: "ABC" }];
  // const [Query, setQuery] = useState({ searchQuery: '', FilterCriteria: '' });


  const dispatch = useDispatch();


  useEffect(() => {
    (async () => {
      dispatch(setLoading(true));
      let response = await getbatchProducts();
      dispatch(setProducts(response.data));
      dispatch(setLoading(false));


    })()
  }, []);


  const HandleSearchQuery = (Query) => {

  };


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
          <Text variant='bodySm'>Syncronization will import products to your selected marketplace.</Text>
        </div>



      </div>
      <Divider borderColor="border-inverse" />
      <div className='productSync-wrapper'>
        <Card >
          <div style={{ marginBottom: "10px" }}>
            <Layout columns={2}>
              <Layout.Section variant='oneHalf'>
                <TextField placeholder={"Search Products"} value={Query.searchQuery} onChange={(value) => dispatch(setQuery({ ...Query, searchQuery: value }))} />
              </Layout.Section>
              <Layout.Section variant='oneThird'>
                <InlineGrid columns={2} gap={"100"}>
                  {/* <Button onClick={() => shopify.modal.show('Filter-products')} icon={PlusIcon}>Filter</Button> */}
                  <FiltersOptions data={vendors} label={""} />
                  <Button variant='primary' onClick={() => shopify.modal.show('Filter-products')} icon={SearchIcon}>Search</Button>
                </InlineGrid>
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