import { Routes, Route } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import './App.css';
import Home from './pages/Home';
import CoursesList from './pages/Courses/List'; 
import CourseDetail from './pages/Courses/Detail';
import Checkout from './pages/Checkout';
import Enrolled from './pages/Enrolled';
import Learn from './pages/Learn';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminIndex from './pages/admin/Index';
import Verifications from './pages/admin/Verifications';
import ContentAdmin from './pages/admin/Content';
import RequireAdmin from './components/RequireAdmin';
import Account from './pages/Account';
import Header from './components/Header';
import Footer from './components/Footer';
import RouteTracker from './components/RouteTracker';
import Contact from './pages/Contact';
import About from './pages/Company/About';
import Careers from './pages/Company/Careers';
import Terms from './pages/Legal/Terms';
import Policy from './pages/Legal/Policy';
import Resources from './pages/Learn/Resources';
import FAQ from './pages/Learn/FAQ';
import Apply from './pages/Apply';
import NotFound from "./pages/404";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      {/* Router is already provided ABOVE in index.tsx */}
      <ScrollToTop />
      <Header />
      <Box pb={16} flex="1" w="100%">
        <RouteTracker />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<CoursesList />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/learn/:id" element={<Learn />} />
          <Route path="/enrolled" element={<Enrolled />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/account" element={<Account />} />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminIndex />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/verifications"
            element={
              <RequireAdmin>
                <Verifications />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/content"
            element={
              <RequireAdmin>
                <ContentAdmin />
              </RequireAdmin>
            }
          />
          <Route path="/learn/resources" element={<Resources />} />
          <Route path="/learn/faq" element={<FAQ />} />
          <Route path="/legal/policy" element={<Policy />} />
          <Route path="/legal/terms" element={<Terms />} />
          <Route path="/company/about" element={<About />} />
          <Route path="/company/careers" element={<Careers />} />
          <Route path="/apply/:id" element={<Apply />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>
      <Footer />
    </Box>
  );
}

export default App;
