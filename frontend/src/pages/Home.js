import React from 'react';
import { Box } from '@mui/material';
import SearchBar from '../utils/SearchBar';
import RecentlyListed from '../components/cards/RecentlyListed';
import EndingSoon from '../components/cards/EndingSoon';
import InfoBar from '../components/InfoBar';

const Home = () => {
    return (
        <Box>
            <SearchBar soldStatus="false" title="Find Your New Property" />
            <InfoBar />
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 2,
                }}
            >
                <Box sx={{ flex: 1 }}>
                    <RecentlyListed />
                </Box>
                <Box sx={{ flex: 1 }}>
                    <EndingSoon />
                </Box>
            </Box>
        </Box>
    );
};

export default Home;