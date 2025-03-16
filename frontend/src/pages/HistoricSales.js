import SearchBar from '../utils/SearchBar'; // Import the SearchBar component

// Define the HistoricSales functional component, displays search for sold properties
const HistoricSales = () => {
   return (
       <SearchBar
           soldStatus="true" // Set soldStatus prop to "true" to filter for sold properties
           title="Search Sold Properties" // Set the title for the search bar
       />
   );
}

// Export the HistoricSales component
export default HistoricSales;