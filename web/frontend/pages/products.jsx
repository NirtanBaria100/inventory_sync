import { Badge, BlockStack, Button, Card, Divider, InlineGrid, InlineStack, Layout, OptionList, Page, Text, TextField } from '@shopify/polaris'
import React, { useEffect, useState } from 'react'
import "../assets/css/productPage.css";
import { SearchIcon, PlusIcon } from '@shopify/polaris-icons';
// import { ModalFilter } from '../components/product/ModalFilter';
import { productTableHeadings } from '../utils/productTableHeadings';
// import { } from '../utils/productPage/product'
import { useDispatch, useSelector } from 'react-redux';
import { getbatchProducts } from '../components/product/helper/functions';
import { setProducts, setLoading, setQuery, setVendors, setHasNextPage, setHasPreviousPage, setStartCursor, setEndCursor } from '../features/productSlice';
import FiltersOptions from '../components/product/filtersOptions';
import Table from '../components/product/Table';

function products() {

  const products = useSelector((state) => state.products);
  const { Query, loading, vendors } = products;


  const dispatch = useDispatch();


  useEffect(() => {
    (async () => {

      let res = await fetch("/api/products/vendors");
      let vendors = await res.json();

      console.log(vendors)
      dispatch(setVendors(vendors.vendors));
      // console.log({ vendors });


      dispatch(setLoading(true));
      let page = 1;
      let response = await getbatchProducts(page, Query);
      let pageInfo = response.Pageinfo;
      console.log({pageInfo})
      dispatch(setHasNextPage(pageInfo.hasNextPage));
      dispatch(setHasPreviousPage(pageInfo.hasPreviousPage));
      dispatch(setStartCursor(pageInfo.startCursor));
      dispatch(setEndCursor(pageInfo.endCursor));

      //it will set the products into the table
      dispatch(setProducts(response.data));
      dispatch(setLoading(false));


    })()
  }, []);


  const HandleSearchQuery = () => {
    (async () => {

      // if (Query.searchQuery == "" && Query.FilterCriteria == "")
      //   return shopify.toast.show("Please select criteria!", { isError: true });


      dispatch(setLoading(true));
      let page = 0;
      let response = await getbatchProducts(page, Query);
      dispatch(setProducts(response.data));
      dispatch(setLoading(false));


    })()

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
                  <FiltersOptions data={vendors}  />
                  <Button variant='primary'  loading={loading} onClick={() => HandleSearchQuery()} icon={SearchIcon}>Search</Button>
                </InlineGrid>
              </Layout.Section>
            </Layout>
          </div>
          <Table TableData={products.value} Headings={productHeadings} />
        </Card>
      </div >
      {/* <ModalFilter /> */}
    </Page >
  )
}

export default products