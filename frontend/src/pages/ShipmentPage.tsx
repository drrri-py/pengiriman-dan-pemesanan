import React, { useState, useEffect, useCallback } from 'react';
import { shipmentService } from '../services/api';
import { Shipment } from '../types';
import { useAuth } from '../context/AuthContext';
import AdminShipmentView from '../components/AdminShipmentView';
import DriverShipmentView from '../components/DriverShipmentView';

export default function ShipmentPage() {
  const { user } = useAuth();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShipments = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      let data;
      if (user.role === 'Admin') {
        data = await shipmentService.getAll();
      } else if (user.role === 'Driver') {
        data = await shipmentService.getByDriver(user.id);
      } else {
        data = [];
      }
      setShipments(data);
    } catch (error) {
      console.error('Failed to fetch shipments:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user?.role === 'Admin') {
    return <AdminShipmentView shipments={shipments} onRefresh={fetchShipments} />;
  }

  if (user?.role === 'Driver') {
    return <DriverShipmentView shipments={shipments} onRefresh={fetchShipments} />;
  }

  return (
    <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
      <p className="text-slate-500 font-medium">You do not have permission to view this page.</p>
    </div>
  );
}
