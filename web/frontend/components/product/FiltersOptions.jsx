import { Select } from '@shopify/polaris';
import { useState, useCallback } from 'react';

export default function FiltersOptions({data, label, setValue, value}) {
    const [selected, setSelected] = useState('today');

    const handleSelectChange = useCallback(
        (value) => setValue({ ...value, status: value }),
        [],
    );

    const options = data;

    return (
        <Select
            label={label}
            options={options}
            onChange={handleSelectChange}
            value={selected}
        />
    );
}