import {
  Badge,
  Banner,
  BlockStack,
  Button,
  Card,
  Checkbox,
  Collapsible,
  Divider,
  Grid,
  InlineGrid,
  InlineStack,
  Layout,
  Page,
  ProgressBar,
  Select,
  Text,
  TextField
} from '@shopify/polaris';
import React, { useEffect, useState, useCallback, useRef } from 'react'; // Added useRef
import { SearchIcon, SettingsIcon } from '@shopify/polaris-icons';
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
import FiltersOptions from '../components/product/FiltersOptions';
import Table from '../components/product/Table';
import { jobStates } from '../utils/jobStates';
import '../assets/css/productPage.css';
import { productTableHeadingsDestination, productTableHeadingsSource } from '../utils/productTableHeadings';
import { jobMode } from '../utils/jobMode';
import { STORETYPE } from '../utils/storeType';

const Products = () => {
  const dispatch = useDispatch();
  let { Query, loading, vendors, value: productList } = useSelector((state) => state.products);
  const [isSyncing, setIsSyncing] = useState(false);
  const [open, setOpen] = useState(false);
  const [isFetchingColumnSettings, setIsFetchingColumnSettings] = useState(false);
  const [marketplace, setMarketplace] = useState("");
  const IntervalTimeDuration = 10000;
  const storeData = useSelector((state) => state.data);
  const [marketPlaces, setMarketplaces] = useState([]);
  // Use a ref to store the interval ID
  const intervalRef = useRef(null);

  //Depending on the type of store it will display the heading in the table
  let productTableHeadings = storeData.type == STORETYPE.destination ? productTableHeadingsDestination : productTableHeadingsSource

  const initialState = {
    Title: false,
    Description: false,
    Vendor: false,
    Tags: false,
    CustomType: false,
    Images: false,
    Status: false,
    PublishedOnStore: false,
    Variants: false,
    VariantDeletion: false,
    Metafields: false,
    Category: false,
    InventoryLevel: false,
    Price: false,
    CompareAtPrice: false,
    CostPerItem: false,
    HSCode: false,
    CountryRegion: false,
    TrackInventory: false,
    InventoryPolicy: false,
    Weight: false,
    WeightUnit: false,
    Taxable: false,
    Position: false,
    Options: false,
    SKU: false,
    Barcode: false,
  };

  const variantKeys = [
    "InventoryLevel",
    "Price",
    "CompareAtPrice",
    "CostPerItem",
    "HSCode",
    "CountryRegion",
    "TrackInventory",
    "Weight",
    "WeightUnit",
    "Taxable",
    "Position",
    "Options",
    "SKU",
    "Barcode",
  ];

  const productKeys = [
    "Title",
    "Description",
    "Vendor",
    "Tags",
    "CustomType",
    "Images",

    "Status",
    "PublishedOnStore",
    "Variants",
    "VariantDeletion",
    "Metafields",
    "Category",
  ];

  const [columnSelection, setColumnSelection] = useState(initialState);
  const [selectAllVariants, setSelectAllVariants] = useState(false);
  const [selectAllProducts, setSelectAllProducts] = useState(false);

  const handleCheckboxChange = (key) => {
    setColumnSelection((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectAll = (keys, isSelected, setSelectAll) => {
    const newState = { ...columnSelection };
    keys.forEach((key) => {
      newState[key] = !isSelected;
    });
    setColumnSelection(newState);
    setSelectAll(!isSelected);
  };

  const handleSaveColumns = async () => {
    try {
      setIsFetchingColumnSettings(true);
      const payload = { columns: columnSelection };
      const response = await fetch("/api/products/save-columns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setIsFetchingColumnSettings(false);
        shopify.toast.show("Setting saved successfully");
      } else {
        setIsFetchingColumnSettings(false);
        shopify.toast.show("Failed to save data", { isError: true });
      }
    } catch (error) {
      setIsFetchingColumnSettings(false);
      console.error("Error:", error);
    }
  };

  const handleToggle = useCallback(() => setOpen((open) => !open), []);
  const [syncInfo, setSyncInfo] = useState({
    Total: 0,
    Remaining: 0,
    Percentage: 0,
    State: '',
    mode: '',
    TotalMarketPlaces: '', RemainingMarketPlaces: ''
  });

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
          Percentage: (data.data.RemainingMarketPlaces / data.data.TotalMarketPlaces) * 100,
          State: data.data.State,
          mode: data.data.mode,
          TotalMarketPlaces: data.data.TotalMarketPlaces,
          RemainingMarketPlaces: data.data.RemainingMarketPlaces
        });
      } else {
        // Synchronization is complete
        setSyncInfo({
          Total: data.data.Total,
          Remaining: 0, // No remaining products
          Percentage: 100, // 100% complete
          State: jobStates.Finish,
          mode: data.data.mode,
          TotalMarketPlaces: data.data.TotalMarketPlaces, RemainingMarketPlaces: 0
        });
        setTimeout(() => {

          setIsSyncing(false);
        }, 2000);

        shopify.toast.show("Products Imported!");

        // Clear the interval
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    } else {
      setIsSyncing(false);
      console.error(data.message);
    }
  }, []);

  // Search handler
  const handleSearchQuery = async () => {
    dispatch(setLoading(true));
    let shopNames = storeData.type == STORETYPE.destination ? await getStoreDetails() : [];
    setMarketplaces(shopNames);
    const response = await getbatchProducts(0, Query, marketplace != "" ? [marketplace] : []);
    dispatch(setProducts(response.data));
    dispatch(setLoading(false));
  };

  async function getStoreDetails() {


    if (!storeData.intialLoading) { // Ensure data is fetched in app.jsx
      console.log("storeData initialize!")
      let url;
      if (storeData.type === STORETYPE.source) {
        url = "/api/connection/connectedDestinationStores"; // Source store fetching destination stores
      } else if (storeData.type === STORETYPE.destination) {
        url = "/api/connection/connectedSourceStores"; // Destination store fetching source stores
      }

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: storeData.id }),
        });

        if (response.status === 200) {
          const data = await response.json();
          let storeNames = [];

          if (storeData.type === STORETYPE.source) {
            storeNames = data?.destinationStore.map(store => store.storeName);
          } else if (storeData.type === STORETYPE.destination) {
            storeNames = data?.sourceStore.map(store => store.storeName);
          }

          return storeNames;
        }


        else if (response.status === 404) {
          return null;
        }


      } catch (error) {
        console.error('Error during API call:', error);

      }
    }
  }

  // Fetch vendor list and initial product data
  useEffect(() => {
    console.log({ storeData })
    console.log("Fetching vendors,marketplaces and products ")
    const fetchData = async () => {
      dispatch(setLoading(true));


      if (storeData.type === STORETYPE.source) {
        const vendorRes = await fetch("/api/products/vendors");
        const vendorData = await vendorRes.json();
        dispatch(setVendors(vendorData.vendors));
      }

      const page = 1;


      let shopNames = storeData.type == STORETYPE.destination ? await getStoreDetails() : [];
      setMarketplaces(shopNames);

      const response = await getbatchProducts(0, Query, marketplace != "" ? [marketplace] : shopNames);
      const { Pageinfo, data } = response;

      dispatch(setHasNextPage(Pageinfo.hasNextPage));
      dispatch(setHasPreviousPage(Pageinfo.hasPreviousPage));
      dispatch(setStartCursor(Pageinfo.startCursor));
      dispatch(setEndCursor(Pageinfo.endCursor));
      dispatch(setProducts(data));
      dispatch(setLoading(false));
    };


    fetchData()

  }, [storeData]);

  // Polling for sync updates
  useEffect(() => {




    if (!isSyncing) return;


    setSyncInfo({
      Total: 0,
      Remaining: 0,
      Percentage: 0,
      State: '',
      mode: '',
      TotalMarketPlaces: 0, RemainingMarketPlaces: 0
    });




    // Start the interval
    intervalRef.current = setInterval(updateProgressBar, IntervalTimeDuration);

    // Cleanup function to clear the interval
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);

        intervalRef.current = null;
      }
    };


  }, [isSyncing, updateProgressBar, IntervalTimeDuration]);

  // This useEffect is implemented for update sync info on first load
  useEffect(() => {
    if (storeData.type === STORETYPE.source) {


      (async () => {
        const response = await fetch('/api/products/sync-info');
        const data = await response.json();

        if (response.ok && data?.data) {
          if (data.data.State !== jobStates.Finish) {
            setIsSyncing(true);

          }
        } else {
          setIsSyncing(false);
        }
      })()

    }
  }, [])

  // Set the initial state of the column selection from database
  useEffect(() => {
    setIsFetchingColumnSettings(true)
    const fetchColumns = async () => {
      try {
        const response = await fetch("/api/products/get-columns", {
          headers: {
            "Content-Type": "application/json",
          }
        });
        const data = await response.json();
        if (response.ok) {
          setIsFetchingColumnSettings(false)
          if (data && data.columns) {
            return setColumnSelection(data.columns);
          }
        }
        setIsFetchingColumnSettings(false);
        return shopify.toast.show(data.message, { isError: true });

      } catch (error) {
        return setIsFetchingColumnSettings(false)
      }
    };

    fetchColumns();
  }, []);

  // Trigger search when productStatus changes or markplace
  useEffect(() => {
    handleSearchQuery();
  }, [Query.productStatus, marketplace]); // Runs every time productStatus changes

  const handleMarketplaceChange = useCallback((value) => setMarketplace(prev => value));

  return (
    <Page>
      <div className='header'>
        <Text variant="headingXl" as="h4">{storeData.type == STORETYPE.source ? "Product Synchronization" : "Imported Products"}</Text>
        <Text variant='bodySm'>{storeData.type == STORETYPE.source ? "Synchronization will import products to your selected marketplace." : "Products which are imported from other brands to this store."}</Text>
      </div>
      <div style={{ marginBlock: "20px" }}>
        <Divider borderColor="border-inverse" />
      </div>


      {storeData.type === STORETYPE.source && <>
        {(isSyncing && syncInfo.mode == jobMode.sync) && (
          <div style={{ marginBlock: "20px" }}>
            <Banner
              title={<strong>Syncing Status: <Badge tone={syncInfo.State === jobStates.Inprogress ? 'info' : syncInfo.State === jobStates.Finish ? 'success' : syncInfo.State === jobStates.Inqueue && 'enabled'}>
                {syncInfo.State}
              </Badge></strong>}
              tone="success"
            >
              <BlockStack gap={"200"}>
                <Text variant='headingSm'>Importing Products to Marketplace</Text>
                <ProgressBar progress={syncInfo.Percentage} animated size='medium' />
                <span>Marketplaces {syncInfo.RemainingMarketPlaces}/{syncInfo.TotalMarketPlaces}</span>
                <span>Products {syncInfo.Remaining}/{syncInfo.Total}</span>
              </BlockStack>
            </Banner>
          </div>
        )}


        {(isSyncing && syncInfo.mode == jobMode.unSync) && (
          <div style={{ marginBlock: "20px" }}>
            <Banner
              title={<strong>Un-sync Status: <Badge tone={syncInfo.State === jobStates.Inprogress ? 'info' : syncInfo.State === jobStates.Finish ? 'success' : syncInfo.State === jobStates.Inqueue && 'enabled'}>
                {syncInfo.State}
              </Badge></strong>}
              tone="info"
            >
              <BlockStack gap={"200"}>
                <Text variant='headingSm'>Bulk delete job process {syncInfo.State}</Text>
                <ProgressBar progress={syncInfo.Percentage} animated size='medium' />
                <span>Marketplaces {syncInfo.RemainingMarketPlaces}/{syncInfo.TotalMarketPlaces}</span>
                <span>Products {syncInfo.Remaining}/{syncInfo.Total}</span>
              </BlockStack>
            </Banner>
          </div>
        )}

      </>}


      <Card>
        {storeData.type === STORETYPE.source && <>
          <div style={{ marginBottom: "10px" }}>

            <Layout columns={2}>
              <Layout.Section variant='oneHalf'>

                <TextField
                  placeholder="Search Product Title"
                  value={Query.searchQuery}
                  onChange={(value) => dispatch(setQuery({ ...Query, searchQuery: value }))}
                />
              </Layout.Section>
              <Layout.Section variant='oneThird'>

                <InlineGrid columns={2} gap="100">

                  <FiltersOptions data={vendors} />


                  <InlineGrid columns={2} gap="100">
                    <Button
                      variant='primary'
                      loading={loading}
                      onClick={handleSearchQuery}
                      icon={SearchIcon}
                    >

                    </Button>


                    {storeData.type === STORETYPE.source && <>
                      <Button
                        ariaDescribedBy='Select Columns'
                        onClick={handleToggle}
                        ariaExpanded={open}
                        ariaControls="basic-collapsible"
                        icon={SettingsIcon}
                      >

                      </Button>
                    </>}

                  </InlineGrid>
                </InlineGrid>
              </Layout.Section>
            </Layout>

          </div>
        </>}


        {storeData.type == STORETYPE.destination &&
          <div style={{ marginBottom: "10px" }}>

            <Grid columns={{ lg: 3, md: 3, sm: 3 }} areas={{ lg: ['search search search search search button'], md: ['search search search search search button'], sm: ['search search search search search button'], xs: ['search search search search search button'] }}>


              <Grid.Cell area="search">

                <TextField
                  placeholder="Search Product Title"
                  value={Query.searchQuery}
                  onChange={(value) => dispatch(setQuery({ ...Query, searchQuery: value }))}
                />
              </Grid.Cell>


              <Grid.Cell area="button">

                <Button
                  variant='primary'
                  loading={loading}
                  onClick={handleSearchQuery}
                  icon={SearchIcon}
                >

                </Button>
              </Grid.Cell>


            </Grid>


          </div>

        }



        {storeData.type === STORETYPE.source && <>
          <div style={{ marginBlock: "20px" }}>
            {/* <Card > */}
            <BlockStack >
              <Divider borderWidth='025'></Divider>
              <Collapsible
                open={open}
                id="basic-collapsible"
                transition={{ duration: '500ms', timingFunction: 'ease-in-out' }}
                expandOnPrint

              >
                <div style={{ marginTop: "30px" }}>

                  <InlineStack gap={"100"} align='end'>
                    <Button variant='secondary' disabled={isFetchingColumnSettings} onClick={handleToggle}>Cancel</Button>
                    <Button variant='primary' loading={isFetchingColumnSettings} onClick={handleSaveColumns}>Save</Button>
                  </InlineStack>
                  <InlineGrid columns={2}>
                    <BlockStack gap="200">
                      <Text variant="headingMd">Variant Properties</Text>
                      <Checkbox
                        label="Select All"
                        checked={selectAllVariants}
                        onChange={() => handleSelectAll(variantKeys, selectAllVariants, setSelectAllVariants)}
                      />
                      {variantKeys.map((key, index) => (
                        <Checkbox key={index} label={key} checked={columnSelection[key]} onChange={() => handleCheckboxChange(key)} />
                      ))}
                    </BlockStack>

                    <BlockStack gap="200">
                      <Text variant="headingMd">Product Properties</Text>
                      <Checkbox
                        label="Select All"
                        checked={selectAllProducts}
                        onChange={() => handleSelectAll(productKeys, selectAllProducts, setSelectAllProducts)}
                      />
                      {productKeys.map((key, index) => (
                        <Checkbox key={index} label={key} checked={columnSelection[key]} onChange={() => handleCheckboxChange(key)} />
                      ))}
                    </BlockStack>


                  </InlineGrid>
                </div>
              </Collapsible>

            </BlockStack>
            {/* </Card> */}
          </div>
        </>}


        {storeData.type === STORETYPE.source && <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "end", gap: "20px", marginBlock: "10px" }}>



            <Text variant='bodyLg'>Filter:</Text>
            <Select options={[
              { label: "All", value: "" },
              { label: "Sync", value: "true" },
              { label: "UnSync", value: "false" }

            ]}
              disabled={loading}
              onChange={(value) => dispatch(setQuery({ ...Query, productStatus: value }))}
              value={Query.productStatus}

            />


          </div>
        </>



        }
        {storeData.type === STORETYPE.destination && <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "end", gap: "20px", marginBlock: "10px" }}>



            <Text variant='bodyLg'>Filter:</Text>
            <Select
              options={marketPlaces?.map(marketplace => ({ label: marketplace.replace('.myshopify.com', ""), value: marketplace }))}
              placeholder={"Select Marketplace"}
              onChange={handleMarketplaceChange}
              value={marketplace}
              disabled={loading}
            />


          </div>
        </>



        }


        <Table setIsSyncing={setIsSyncing} IsSyncing={isSyncing} TableData={productList} columnSelection={columnSelection} Headings={productTableHeadings} handleToggle={handleToggle} />
      </Card>
    </Page >
  );
};

export default Products;