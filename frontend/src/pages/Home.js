import SearchBar from '../utils/SearchBar';
import RecentlyListed from '../components/cards/RecentlyListed'
import EndingSoon from '../components/cards/EndingSoon'
const Home = () => {
    return ( 
        <div>

<SearchBar 
        soldStatus="false" 
        title="Find Your New Property" 
      />
       <RecentlyListed/>
       <EndingSoon/>

       </div>
     );
}
 
export default Home ;