/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Browse from './pages/Browse';
import MovieDetail from './pages/MovieDetail';
import TvDetail from './pages/TvDetail';
import TvShows from './pages/TvShows';
import Watch from './pages/Watch';
import Search from './pages/Search';
import Watchlist from './pages/Watchlist';
import History from './pages/History';
import Stats from './pages/Stats';
import Person from './pages/Person';
import { WatchlistProvider } from './context/WatchlistContext';

// Wrapper that conditionally renders sidebar layout
function AppRoutes() {
  const location = useLocation();
  const isWatchPage = location.pathname.startsWith('/watch/');

  if (isWatchPage) {
    return (
      <Routes>
        <Route path="/watch/:type/:id" element={<Watch />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/tv-shows" element={<TvShows />} />
        <Route path="/search" element={<Search />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/history" element={<History />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/tv/:id" element={<TvDetail />} />
        <Route path="/person/:id" element={<Person />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <WatchlistProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </WatchlistProvider>
  );
}
