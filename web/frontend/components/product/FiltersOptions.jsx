import { Select } from '@shopify/polaris';
import { useDispatch, useSelector } from 'react-redux';
import { setQuery } from '../../features/productSlice';

export default function FiltersOptions({ data }) {
    const dispatch = useDispatch();
    const products = useSelector((state) => state.products);
    const { Query } = products;
    let options = [];
    // Ensure unique keys by combining value and index
    options?.push({ value: "", label: "All vendors", key: "all-vendors" }); // Unique key for "All vendors"
    options = data?.map((item, index) => ({
        value: item,
        label: item,
        key: `${item}-${index}` // Combine value and index for uniqueness
    }));

    return (
        <Select
            options={options}
            placeholder={"Select Vendor"}
            onChange={value => dispatch(setQuery({ ...Query, FilterCriteria: value }))}
            value={Query.FilterCriteria}
        />
    );
}
