import { Select } from '@shopify/polaris';
import { useDispatch, useSelector } from 'react-redux';
import { setQuery } from '../../features/productSlice';

export default function FiltersOptions({ data}) {
    const dispatch = useDispatch();
    const products = useSelector((state) => state.products);
    const { Query } = products;

    const options = data.map(item => ({ value: item, label: item }));

    return (    
        <Select
            options={options}
            placeholder={"Select Vendor"}
            onChange={value => dispatch(setQuery({ ...Query, FilterCriteria: value }))}
            value={Query.FilterCriteria}
        />
    );
}