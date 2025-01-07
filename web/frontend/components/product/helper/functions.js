import {
  setEndCursor,
  setHasNextPage,
  setHasPreviousPage,
  setLoading,
  setProducts,
  setStartCursor,
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

export const handleImportProducts = async (selectedResources, products) => {
  console.log("Starting product import to marketplaces...");

  // Filter products based on selected resource IDs
  const filteredProducts = products.filter((item) =>
    selectedResources.includes(item.id)
  );
  console.log("Filtered Products:", filteredProducts);

  const URL = "/api/products/import";

  let payload = filteredProducts;

  let response = await fetch(URL, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    }
  });

  let result = await response.json();
  console.log({ result });

  // Optionally, return filtered products if required for further processing
  return filteredProducts;
};
