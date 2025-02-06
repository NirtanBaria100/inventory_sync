import {
  setEndCursor,
  setHasNextPage,
  setHasPreviousPage,
  setLoading,
  setProducts,
  setStartCursor,
  updateProductStatus,
} from "../../../features/productSlice";

export async function getbatchProducts(page, Query) {
  const URL = `/api/products/batch`;

  const payload = {
    FilterCriteria: Query?.FilterCriteria,
    searchQuery: Query?.searchQuery,
    page: page,
    endCursor: Query?.endCursor,
    startCursor: Query?.startCursor,
    event: Query?.event,
  };

  try {
    const response = await fetch(URL, {
      method: "POST", // Use POST if the server expects data in the body
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Fetched batch products:", { data });
    return data; // Assuming the endpoint returns a valid JSON response
  } catch (error) {
    console.error("Error fetching batch products:", error, { payload });
    throw error;
  }
}

export async function debounce(func, delay) {
  let debounceTimer;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(context, args), delay);
  };
}

export const handleOnNextEvent = async (
  dispatch,
  startCursor,
  endCursor,
  Query
) => {
  console.log("working");

  dispatch(setLoading(true));
  let page = 1;
  let response = await getbatchProducts(page, {
    ...Query,
    startCursor,
    endCursor,
    event: "onNext",
  });
  let pageInfo = response.Pageinfo;
  console.log({ pageInfo });
  dispatch(setHasNextPage(pageInfo.hasNextPage));
  dispatch(setHasPreviousPage(pageInfo.hasPreviousPage));
  dispatch(setStartCursor(pageInfo.startCursor));
  dispatch(setEndCursor(pageInfo.endCursor));

  //it will set the products into the table
  dispatch(setProducts(response.data));
  dispatch(setLoading(false));
};

export const handleOnPrevEvent = async (
  dispatch,
  startCursor,
  endCursor,
  Query
) => {
  console.log("Going to previous page...");
  dispatch(setLoading(true));

  let page = 1;
  let response = await getbatchProducts(page, {
    ...Query,
    startCursor,
    endCursor,
    event: "onPrev",
  });
  let pageInfo = response.Pageinfo;

  dispatch(setHasNextPage(pageInfo.hasNextPage));
  dispatch(setHasPreviousPage(pageInfo.hasPreviousPage));
  dispatch(setStartCursor(pageInfo.startCursor));
  dispatch(setEndCursor(pageInfo.endCursor));

  //it will set the products into the table
  dispatch(setProducts(response.data));
  dispatch(setLoading(false));
};

export const handleSyncProducts = async (
  selectedResources,
  products,
  setIsSyncing,
  IsSyncing,
  id,
  dispatch
) => {
  console.log("Starting product import to marketplaces...");

  setIsSyncing(true);

  // Filter products based on selected resource IDs
  const filteredProducts = products.filter((item) =>
    selectedResources.includes(item.id)
  );

  // Filter products that are not synced
  const notSyncedProducts = filteredProducts.filter((x) => !x.status);

  // If no products need syncing, exit early
  if (notSyncedProducts.length === 0) {
    setIsSyncing(false);
    shopify.toast.show("No products to sync.");
    return;
  }

  const URL = "/api/products/sync";

  const payload = { products: notSyncedProducts, brandStoreId: id };

  try {
    const response = await fetch(URL, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    console.log("Response",response.ok)

    if (response.ok) {

  
      
      // Update product status in the store
      dispatch(
        updateProductStatus({
          productsIdsToUpdate: filteredProducts.map((product) => product.id),
          Status: true,
        })
      );

     
      shopify.toast.show(result.message || "Products imported successfully!");
    } else {
      // Handle error response
      shopify.toast.show(result.message || "Failed to import products.", {
        isError: true,
      });
    }
  } catch (error) {
    // Handle network or unexpected errors
    console.error("Error importing products:", error);
    shopify.toast.show("An error occurred while importing products.", {
      isError: true,
    });
  } 
};

export const handleUnSyncProducts = async (
  selectedResources,
  products,
  setIsSyncing,
  IsSyncing,
  id,
  dispatch
) => {
  shopify.toast.show("Unsync operation in process...");
  setIsSyncing(true);

  // Filter products based on selected resource IDs
  const filteredProducts = products.filter((item) =>
    selectedResources.includes(item.id)
  );
  console.log(filteredProducts);

  // Filter products that are  synced
  const SyncedProducts = filteredProducts.filter((x) => x.status);

  // If no products need un-syncing, exit early
  if (SyncedProducts.length === 0) {
    setIsSyncing(false);
    shopify.toast.show("No products to sync.");
    return;
  }

  const URL = "/api/products/unsync";
  const payload = { products: SyncedProducts, brandStoreId: id };

  try {
    const response = await fetch(URL, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (response.ok) {
      // Update product status in the store
      dispatch(
        updateProductStatus({
          productsIdsToUpdate: SyncedProducts.map((product) => product.id),
          Status: false,
        })
      );
      shopify.toast.show(
        result.message || "Products successfully desyncronized!"
      );
    } else {
      // Handle error response
      shopify.toast.show(result.message || "Failed to desyncronize products.", {
        isError: true,
      });
    }
  } catch (error) {
    shopify.toast.show("Error while desyncronize");
  } finally {
    setIsSyncing(false); // Ensure the loader is stopped
  }
};
