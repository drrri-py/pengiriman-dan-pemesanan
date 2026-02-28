import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './layout/Layout';
import Dashboard from './pages/Dashboard';
import ShipmentPage from './pages/ShipmentPage';
import ContractPage from './pages/ContractPage';
import FinanceDashboard from './pages/FinanceDashboard';
import InvoiceGenerator from './pages/InvoiceGenerator';
import DocumentViewer from './pages/DocumentViewer';
import SettingsPage from './pages/SettingsPage';
import TrucksPage from './pages/TrucksPage';
import UsersPage from './pages/UsersPage';

import LoginPage from './pages/LoginPage';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['Admin', 'Finance', 'Driver']}>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route
              path="shipments"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Driver']}>
                  <ShipmentPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="contracts"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <ContractPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="trucks"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <TrucksPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="invoices"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Finance']}>
                  <FinanceDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="invoices/generate"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Finance']}>
                  <InvoiceGenerator />
                </ProtectedRoute>
              }
            />

            <Route
              path="invoices/:id"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Finance']}>
                  <DocumentViewer />
                </ProtectedRoute>
              }
            />

            <Route
              path="settings"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="users"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
