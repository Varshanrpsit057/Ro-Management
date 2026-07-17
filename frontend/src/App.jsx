import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicLayout from "./components/PublicLayout";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Landing from "./pages/Landing";
import ROProducts from "./pages/ROProducts";
import UPSProducts from "./pages/UPSProducts";
import CartPage from "./pages/CartPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import { AboutPage, ContactPage, BookServicePage } from "./pages/StaticPages";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import CustomerForm from "./pages/CustomerForm";
import CustomerDetail from "./pages/CustomerDetail";
import Products from "./pages/Products";
import ProductForm from "./pages/ProductForm";
import Notifications from "./pages/Notifications";
import ServiceHistory from "./pages/ServiceHistory";

export default function App() {
  return (
    <Routes>
      {/* Public store routes */}
      <Route path="/" element={<PublicLayout><Landing /></PublicLayout>} />
      <Route path="/ro-products" element={<PublicLayout><ROProducts /></PublicLayout>} />
      <Route path="/ups-products" element={<PublicLayout><UPSProducts /></PublicLayout>} />
      <Route path="/cart" element={<PublicLayout><CartPage /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
      <Route path="/book-service" element={<PublicLayout><BookServicePage /></PublicLayout>} />

      {/* Product detail page (public, no layout for immersive experience) */}
      <Route path="/product/:id" element={<PublicLayout><ProductDetailPage /></PublicLayout>} />

      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected admin routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/customers/new" element={<CustomerForm />} />
                <Route path="/customers/:id/edit" element={<CustomerForm />} />
                <Route path="/customers/:id" element={<CustomerDetail />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/new" element={<ProductForm />} />
                <Route path="/products/:id/edit" element={<ProductForm />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/systems/:id/history" element={<ServiceHistory />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
