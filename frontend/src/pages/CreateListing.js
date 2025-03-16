import ListingForum from "../components/ListingForum"; // Import the ListingForum component

// Define the CreateListing functional component, this is for the create a liating page
export default function CreateListing() {
  return(
    <div> {/* Container div for the component */}
      <ListingForum/> {/* Renders the ListingForum component */}
    </div>
  );
}