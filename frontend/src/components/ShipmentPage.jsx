import React, { useState, useEffect } from 'react';
import { shipmentService } from '../services/api';

// @ts-ignore
const API_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000';

const ShipmentPage = () => {
    // State definitions
    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for a simplistic "Create Shipment" form
    const [newShipment, setNewShipment] = useState({
        contract_id: 1,
        truck_id: 1,
        driver_id: 1,
        tgl_pengiriman: new Date().toISOString().split('T')[0],
        supply_point: 'IT Balongan', // matches backend default
        tujuan_pengiriman: '',
        volume_kl: 0.0,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // UseEffect to fetch data on component mount
    useEffect(() => {
        fetchShipments();
    }, []);

    const fetchShipments = async () => {
        try {
            setLoading(true);
            setError(null);
            // Calls the /api/shipments/ GET endpoint
            const data = await shipmentService.getAll();
            setShipments(data);
        } catch (err) {
            // Axios error payload handling
            const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch shipments';
            setError(errorMessage);
            console.error('Error fetching shipments:', err);
        } finally {
            // Regardless of success or failure, turn off the loading tracker
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewShipment(prev => ({
            ...prev,
            // Special logic for numbers
            [name]: ['contract_id', 'truck_id', 'driver_id'].includes(name)
                ? parseInt(value, 10)
                : name === 'volume_kl'
                    ? parseFloat(value)
                    : value
        }));
    };

    const handleCreateShipment = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            setError(null);

            // Calls the /api/shipments/ POST endpoint
            await shipmentService.create(newShipment);

            alert('Shipment created successfully!');

            // Refresh the shipment list
            await fetchShipments();

            // Reset parts of the form
            setNewShipment(prev => ({
                ...prev,
                tujuan_pengiriman: '',
                volume_kl: 0.0
            }));
        } catch (err) {
            const errorMessage = err.response?.data?.detail || err.message || 'Error creating shipment';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerify = async (shipmentId) => {
        try {
            setIsSubmitting(true);
            setError(null);
            await shipmentService.verify(shipmentId);
            // Refresh list to show updated status
            await fetchShipments();
        } catch (err) {
            const errorMessage = err.response?.data?.detail || err.message || 'Error verifying shipment';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Operasional Pengiriman (Shipments)</h1>

            {/* Global Error Banner */}
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            )}

            {/* Form Card */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4">Buat Pengiriman Baru</h2>
                <form onSubmit={handleCreateShipment} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Contract ID</label>
                            <input
                                type="number" name="contract_id"
                                value={newShipment.contract_id} onChange={handleInputChange}
                                className="w-full border p-2 rounded" required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Truck ID</label>
                            <input
                                type="number" name="truck_id"
                                value={newShipment.truck_id} onChange={handleInputChange}
                                className="w-full border p-2 rounded" required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Tujuan Pengiriman</label>
                            <input
                                type="text" name="tujuan_pengiriman"
                                value={newShipment.tujuan_pengiriman} onChange={handleInputChange}
                                className="w-full border p-2 rounded" required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Volume (KL)</label>
                            <input
                                type="number" step="0.1" name="volume_kl"
                                value={newShipment.volume_kl} onChange={handleInputChange}
                                className="w-full border p-2 rounded" required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Tanggal Pengiriman</label>
                            <input
                                type="date" name="tgl_pengiriman"
                                value={newShipment.tgl_pengiriman} onChange={handleInputChange}
                                className="w-full border p-2 rounded" required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? 'Submitting...' : 'Save Shipment'}
                    </button>
                </form>
            </div>

            {/* Data Table */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Daftar Pengiriman</h2>
                    <button
                        onClick={fetchShipments}
                        disabled={loading}
                        className="text-blue-600 hover:underline text-sm font-medium"
                    >
                        {loading ? 'Refreshing...' : 'Refresh Data'}
                    </button>
                </div>

                {/* Loading State Spinner / Message */}
                {loading ? (
                    <div className="py-12 flex justify-center text-gray-500">
                        <p>Loading API data from backend...</p>
                    </div>
                ) : shipments.length === 0 ? (
                    <div className="py-8 text-center text-gray-500 border rounded bg-gray-50">
                        Belum ada data pengoperasian.
                    </div>
                ) : (
                    <div className="overflow-x-auto border border-gray-200 rounded-md">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100 border-b border-gray-200">
                                    <th className="p-3 text-sm font-semibold text-gray-600">ID</th>
                                    <th className="p-3 text-sm font-semibold text-gray-600">Tanggal</th>
                                    <th className="p-3 text-sm font-semibold text-gray-600">Tujuan</th>
                                    <th className="p-3 text-sm font-semibold text-gray-600">Volume KL</th>
                                    <th className="p-3 text-sm font-semibold text-gray-600">Status</th>
                                    <th className="p-3 text-sm font-semibold text-gray-600">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shipments.map((item) => (
                                    <tr key={item.shipment_id} className="border-b transition hover:bg-gray-50">
                                        <td className="p-3 text-sm text-gray-800">#{item.shipment_id}</td>
                                        <td className="p-3 text-sm text-gray-800">{item.tgl_pengiriman}</td>
                                        <td className="p-3 text-sm text-gray-800">{item.tujuan_pengiriman || '-'}</td>
                                        <td className="p-3 text-sm text-gray-800">{item.volume_kl} KL</td>
                                        <td className="p-3 text-sm">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold
                        ${item.status_verifikasi === 'verified'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-yellow-100 text-yellow-700'}`
                                            }>
                                                {item.status_verifikasi.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-3 text-sm">
                                            {item.bukti_surat_jalan && (
                                                <a
                                                    href={`${API_URL}${item.bukti_surat_jalan}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500 hover:text-blue-700 underline text-xs mr-3 font-medium"
                                                >
                                                    View Proof
                                                </a>
                                            )}
                                            {item.status_verifikasi === 'pending' && (
                                                <button
                                                    onClick={() => handleVerify(item.shipment_id)}
                                                    disabled={isSubmitting}
                                                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs transition inline-block mt-1"
                                                >
                                                    Verify Status
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShipmentPage;
