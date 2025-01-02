export async function getbatchProducts(page = 1, filtercriteria, searchQuery) {
  try {
    const response = await fetch(`/api/products/batch/${page}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log({ data });
    // setTimeout(() => {

    return data; // Assuming the endpoint returns a `Data` key with the products.
    // }, 3000);
  } catch (error) {
    console.error("Error fetching batch products:", error);
    throw error; // Re-throw the error for further handling if needed.
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
