import { Select } from '@shopify/polaris';
import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setQuery } from '../../features/productSlice';

export default function FiltersOptions({ data, label }) {
    const dispatch = useDispatch();
    const [selected, setSelected] = useState('today');
    const products = useSelector((state) => state.products);
    const { Query } = products;


    const handleSelectChange = useCallback(
        (value) => dispatch(setQuery({ ...Query, FilterCriteria: value })),
        [],
    );

    const options = data;

    return (
        <Select
            label={label}
            options={options}
            onChange={handleSelectChange}
            value={Query.FilterCriteria}
        />
    );
}