import { Route, Routes } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import CreateTripPage from './pages/CreateTripPage';
import ExploreTravelersPage from './pages/ExploreTravelersPage';
import ExploreTripsPage from './pages/ExploreTripsPage';
import ChatPage from './pages/ChatPage';
import GroupPage from './pages/GroupPage';
import NotificationsPage from './pages/NotificationsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() { 
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path='/' element={<LandingPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/signup' element={<SignupPage />} />
      </Route>

      {/* Protected Dashboard Routes */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path='/dashboard' element={<DashboardPage />} />
        <Route path='/profile' element={<ProfilePage />} />
        <Route path='/trips/create' element={<CreateTripPage />} />
        <Route path='/trips/explore' element={<ExploreTripsPage />} />
        <Route path='/explore' element={<ExploreTravelersPage />} />
        <Route path='/chat' element={<ChatPage />} />
        <Route path='/groups' element={<GroupPage />} />
        <Route path='/notifications' element={<NotificationsPage />} />
      </Route>

      {/* Catch All */}
      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  ); 
}
