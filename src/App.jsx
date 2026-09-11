import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { store, persistor } from './store';
import { SocketProvider } from './context/SocketContext';
import GlobalLoader from './components/GlobalLoader';
import ProtectedRoute from './components/ProtectedRoute';
import EmailVerificationGuard from './components/EmailVerificationGuard';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTopBtn from './components/ScrollToTopBtn';
import Home from './pages/Home';
import EdugarciaApp from './pages/EdugarciaApp';
import Workshop from './pages/Workshop';
import SignIn from './pages/SignIn';
import ForgotPassword from './pages/ForgotPassword';
import VerifyEmail from './pages/VerifyEmail';
import EmailVerified from './pages/EmailVerified';
import ReviewerWelcome from './pages/ReviewerWelcome';
import FAQ from './pages/FAQ';
import TermsAndConditions from './pages/TermsAndConditions';
import LegalNotice from './pages/LegalNotice';
import CookiesPolicy from './pages/CookiesPolicy';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ContactUs from './pages/ContactUs';
import Pricing from './pages/Pricing';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import Profile from './pages/Profile';
import SubscriptionHistory from './pages/SubscriptionHistory';
import ConnectedDevices from './pages/ConnectedDevices';
import Settings from './pages/Settings';
import TestimonialsPage from './pages/Testimonials';

// Helper component to scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-custom-bg font-sans selection:bg-custom-primary selection:text-black">
      <Navbar />
      {children}
      <Footer />
      <ScrollToTopBtn />
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SocketProvider>
          <GlobalLoader />
          <Router>
            <ScrollToTop />
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/edugarcia-app" element={<EdugarciaApp />} />
                <Route path="/workshop" element={<Workshop />} />
                <Route path="/login" element={<SignIn />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-email" element={<EmailVerificationGuard><VerifyEmail /></EmailVerificationGuard>} />
                <Route path="/email-verified" element={<EmailVerified />} />
                <Route path="/email-verified/:status" element={<EmailVerified />} />
                <Route path="/register" element={<Navigate to="/login" replace />} />
                <Route path="/reviewer-welcome" element={<ReviewerWelcome />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/terms" element={<TermsAndConditions />} />
                <Route path="/legal" element={<LegalNotice />} />
                <Route path="/cookies" element={<CookiesPolicy />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/payment-cancelled" element={<PaymentCancel />} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/subscription-history" element={<ProtectedRoute><SubscriptionHistory /></ProtectedRoute>} />
                <Route path="/devices" element={<ProtectedRoute><ConnectedDevices /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/testimonials" element={<TestimonialsPage />} />
              </Routes>
            </Layout>
          </Router>
        </SocketProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
