import { useSearchProducts } from "@/hooks/useSearchProducts";
import SearchInput from "./SearchInput";
import SearchResults from "./SearchResults";

export default function Search() {
  const search = useSearchProducts();

  return (
    <>
      <SearchInput
        value={search.query}
        onChangeAction={search.setQuery}
        isLoading={search.isLoading}
        onClearAction={search.reset}
      />
      <SearchResults
        show={search.query.length >= 2}
        results={search.results}
        isLoading={search.isLoading}
        isError={search.isError}
        error={search.error}
        onSelectAction={search.reset}
      />
    </>
  );
}
