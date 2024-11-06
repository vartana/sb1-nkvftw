import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { PrivateRoute } from './components/PrivateRoute';
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';
import { PurchaseOrders } from './pages/PurchaseOrders';
import { SubmitForm } from './pages/SubmitForm';
import { Login } from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/submit/:id" element={<SubmitForm />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="purchase-orders" element={<PurchaseOrders />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;