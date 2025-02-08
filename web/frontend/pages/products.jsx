import {
  Badge,
  BlockStack,
  Button,
  Card,
  Divider,
  InlineGrid,
  Layout,
  Page,
  ProgressBar,
  Text,
  TextField
} from '@shopify/polaris';
import React, { useEffect, useState, useCallback } from 'react';
import { SearchIcon } from '@shopify/polaris-icons';
import { useDispatch, useSelector } from 'react-redux';
import { getbatchProducts } from '../components/product/helper/functions';
import {
  setProducts,
  setLoading,
  setQuery,
  setVendors,
  setHasNextPage,
  setHasPreviousPage,
  setStartCursor,
  setEndCursor
} from '../features/productSlice';
import FiltersOptions from '../components/product/filtersOptions';
import Table from '../components/product/Table';
import { jobStates } from '../utils/jobStates';
import '../assets/css/productPage.css';
import { productTableHeadings } from '../utils/productTableHeadings';

const Products = () => {
  const dispatch = useDispatch();
  const { Query, loading, vendors, value: productList } = useSelector((state) => state.products);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncInfo, setSyncInfo] = useState({
    Total: 0,
    Remaining: 0,
    Percentage: 0,
    State: ''
  });

  // Fetch vendor list and initial product data
  useEffect(() => {
    const fetchData = async () => {
      dispatch(setLoading(true));
      const vendorRes = await fetch("/api/products/vendors");
      const vendorData = await vendorRes.json();
      dispatch(setVendors(vendorData.vendors));

      const page = 1;
      const response = await getbatchProducts(page, Query);
      const { Pageinfo, data } = response;

      dispatch(setHasNextPage(Pageinfo.hasNextPage));
      dispatch(setHasPreviousPage(Pageinfo.hasPreviousPage));
      dispatch(setStartCursor(Pageinfo.startCursor));
      dispatch(setEndCursor(Pageinfo.endCursor));
      dispatch(setProducts(data));
      dispatch(setLoading(false));
    };

    
    fetchData();
  }, []);


  useEffect(()=>{
    updateProgressBar();
  },[])

  // Fetch sync progress data
  const updateProgressBar = useCallback(async () => {
    const response = await fetch('/api/products/sync-info');
    const data = await response.json();

    if (response.ok && data?.data) {
      if (data.data.State !== jobStates.Finish) {
        setIsSyncing(true);
        setSyncInfo({
          Total: data.data.Total,
          Remaining: data.data.Remaining,
          Percentage: (data.data.Remaining / data.data.Total) * 100,
          State: data.data.State
        });
      } else {
        setIsSyncing(false);
      }
    } else {
      setIsSyncing(false);
      console.error(data.message);
    }
  }, []);


  const clearSyncInfo = () => {
    setSyncInfo({
      Total: 0,
      Remaining: 0,
      Percentage: 0,
      State: ''
    });
  }
  // Polling for sync updates
  useEffect(() => {
    if (!isSyncing) return;


    clearSyncInfo();
    const intervalId = setInterval(updateProgressBar, 3000);
    return () => clearInterval(intervalId);
  }, [isSyncing, updateProgressBar]);

  // Search handler
  const handleSearchQuery = async () => {
    dispatch(setLoading(true));
    const response = await getbatchProducts(0, Query);
    dispatch(setProducts(response.data));
    dispatch(setLoading(false));
  };

  return (
    <Page>
      <div className='header'>
        <Text variant="headingXl" as="h4">Product Synchronization</Text>
        <Text variant='bodySm'>Synchronization will import products to your selected marketplace.</Text>
      </div>

      <div className='productSync-wrapper'>
        <BlockStack gap="200">
          <Divider borderColor="border-inverse" />
          {isSyncing && (
            <>
              <strong>Status:
                <Badge tone={syncInfo.State === jobStates.Inprogress ? 'info' : 'read-only'}>
                  {syncInfo.State}
                </Badge>
              </strong>
              <ProgressBar progress={syncInfo.Percentage} animated size='medium' />
              <span>Products Imported {syncInfo.Remaining}/{syncInfo.Total}</span>
            </>
          )}
        </BlockStack>
      </div>

      <Card>
        <div style={{ marginBottom: "10px" }}>
          <Layout columns={2}>
            <Layout.Section variant='oneHalf'>
              <TextField
                placeholder="Search Products"
                value={Query.searchQuery}
                onChange={(value) => dispatch(setQuery({ ...Query, searchQuery: value }))}
              />
            </Layout.Section>
            <Layout.Section variant='oneThird'>
              <InlineGrid columns={2} gap="100">
                <FiltersOptions data={vendors} />
                <Button
                  variant='primary'
                  loading={loading}
                  onClick={handleSearchQuery}
                  icon={SearchIcon}
                >
                  Search
                </Button>
              </InlineGrid>
            </Layout.Section>
          </Layout>
        </div>
        <Table setIsSyncing={setIsSyncing} IsSyncing={isSyncing} TableData={productList} Headings={productTableHeadings} />
      </Card>
    </Page>
  );
};

export default Products;
