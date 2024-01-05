import { Autocomplete, AutocompleteProps } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import type { loader as AutocompleteLoader } from '~/routes/api.autocomplete';

interface Props extends AutocompleteProps {
  formType: string;
}

export default function AsyncAutocomplete({
  formType,
  ...props
}: Props) {
  const descriptionSearch = useFetcher<typeof AutocompleteLoader>();
  const [value, setValue] = useState('');
  const [debouncedValue] = useDebouncedValue(value, 200);

  function search() {
    const searchParams = new URLSearchParams();
    searchParams.append('type', formType);
    searchParams.append('query', debouncedValue);
    descriptionSearch.load(`/api/autocomplete?${searchParams}`);
  }

  useEffect(() => {
    search();
  }, [formType, debouncedValue]);

  return <Autocomplete
    {...props}
    filter={(input) => input.options}
    data={descriptionSearch.data?.results ?? []}
    value={value}
    onChange={setValue}
  />
}
