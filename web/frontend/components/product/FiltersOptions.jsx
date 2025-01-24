import { Select } from '@shopify/polaris';
import { useDispatch, useSelector } from 'react-redux';
import { setQuery } from '../../features/productSlice';

export default function FiltersOptions({ data }) {
    const dispatch = useDispatch();
    const products = useSelector((state) => state.products);
    const { Query } = products;

    // Ensure unique keys by combining value and index
    const options = data.map((item, index) => ({ 
        value: item, 
        label: item, 
        key: `${item}-${index}` // Combine value and index for uniqueness
    }));
    options.push({ value: "", label: "All vendors", key: "all-vendors" }); // Unique key for "All vendors"

    return (
        <Select
            options={options}
            placeholder={"Search Vendor"}
            onChange={value => dispatch(setQuery({ ...Query, FilterCriteria: value }))}
            value={Query.FilterCriteria}
        />
    );
}
