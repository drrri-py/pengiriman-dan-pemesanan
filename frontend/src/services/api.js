import axios from 'axios';

// 1. Base URL Configuration
// Sesuaikan dengan prefix FastAPI (`/api`) dan tambahkan trailing slash
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. Interceptors
// Attach JWT Bearer token from localStorage to every request
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Optional: Add global error handling (e.g., redirect to login on 401)
        if (error.response && error.response.status === 401) {
            console.error('Unauthorized response. Please login again.');
            // window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

// 3. Specific Service Functions

// Helper mapping dari bentuk API FastAPI ke bentuk yang dipakai UI React
const mapShipmentFromApi = (s) => ({
    id: String(s.shipment_id),
    date: s.tgl_pengiriman,
    truck: `Truck ${s.truck_id}`,
    driver: `Driver ${s.driver_id}`,
    driverId: String(s.driver_id),
    volume: s.volume_kl,
    destination: s.tujuan_pengiriman || '',
    status: s.status_verifikasi === 'verified' ? 'Verified' : 'Pending',
    proofUrl: s.bukti_surat_jalan || undefined,
});

const mapTruckFromApi = (t) => ({
    id: String(t.truck_id),
    plateNumber: t.plat_nomor,
    capacity: t.kapasitas_kl,
});

const mapInvoiceFromApi = (inv) => {
    const rawStatus = inv.status_pembayaran || 'unpaid';
    const status = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);

    return {
        id: String(inv.invoice_id),
        number: inv.no_invoice || `INV-${inv.invoice_id}`,
        date: inv.tgl_invoice,
        shipmentIds: [],
        totalAmount: Number(inv.dpp) || 0,
        status: status,
        clientName: 'PT Pertamina Patra Niaga',
        isTaxExempt: Boolean(inv.is_tax_exempt),
        nsfp: inv.no_faktur_pajak || undefined,
        supplyPoint: 'IT Balongan',
        destination: 'Multiple Destinations',
        unitPrice: Number(inv.total_kl_akumulasi) > 0 ? Number(inv.dpp) / Number(inv.total_kl_akumulasi) : 0,
        createdBy: 'System',
        createdAt: inv.tgl_invoice
    };
};

const getTodayISODate = () => new Date().toISOString().slice(0, 10);

const pickActiveContract = (contracts) => {
    if (!Array.isArray(contracts) || contracts.length === 0) return null;
    const today = getTodayISODate();
    const active = contracts.find((c) => c?.tgl_mulai <= today && today <= c?.tgl_selesai);
    if (active) return active;
    // fallback: kontrak dengan akhir paling jauh
    return contracts
        .slice()
        .sort((a, b) => String(b?.tgl_selesai || '').localeCompare(String(a?.tgl_selesai || '')))[0];
};

const getActiveContractCached = async () => {
    const cachedId = localStorage.getItem('active_contract_id');
    const cachedMin = localStorage.getItem('active_contract_min');
    const cachedMax = localStorage.getItem('active_contract_max');
    if (cachedId && cachedMin && cachedMax) {
        return { contract_id: Number(cachedId), tgl_mulai: cachedMin, tgl_selesai: cachedMax };
    }

    const response = await apiClient.get('contracts/');
    const contract = pickActiveContract(response.data);
    if (!contract) return null;

    localStorage.setItem('active_contract_id', String(contract.contract_id));
    localStorage.setItem('active_contract_min', String(contract.tgl_mulai));
    localStorage.setItem('active_contract_max', String(contract.tgl_selesai));
    return contract;
};

const clearActiveContractCache = () => {
    localStorage.removeItem('active_contract_id');
    localStorage.removeItem('active_contract_min');
    localStorage.removeItem('active_contract_max');
};

export const shipmentService = {
    // Fetch all shipments (untuk Admin/Finance)
    getAll: async () => {
        const response = await apiClient.get('shipments/');
        return response.data.map(mapShipmentFromApi);
    },

    // Create a new shipment dari form Driver
    // data: { date, truckId, driver, driverId, volume, destination, status, contractId? }
    create: async (data) => {
        const activeContract = await getActiveContractCached();
        const contractId = Number(data.contractId || activeContract?.contract_id);
        if (!contractId) {
            throw new Error('No active contract found. Please create/update contract first.');
        }

        const payload = {
            contract_id: contractId,
            truck_id: Number(data.truckId),
            driver_id: Number(data.driverId),
            tgl_pengiriman: data.date,
            tujuan_pengiriman: data.destination,
            volume_kl: data.volume,
            supply_point: 'IT Balongan',
            bukti_surat_jalan: null,
        };
        const response = await apiClient.post('shipments/', payload);
        return response.data;
    },

    // Verify a shipment (updates status via ShipmentUpdateStatus schema)
    verify: async (id) => {
        const response = await apiClient.patch(`shipments/${id}/status`, {
            status_verifikasi: 'verified',
        });
        return response.data;
    },

    // Upload delivery proof image
    uploadProof: async (id, file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post(`shipments/${id}/proof`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Fallback: fetch all lalu filter by driver_id
    getByDriver: async (driverId) => {
        const response = await apiClient.get('shipments/');
        return response.data
            .filter((s) => String(s.driver_id) === String(driverId))
            .map(mapShipmentFromApi);
    },

    // Truck fetch
    getTrucks: async () => {
        return await truckService.getAll();
    },

    // Update status
    updateStatus: async (id, status) => {
        const response = await apiClient.patch(`shipments/${id}/status`, {
            status_verifikasi: status.toLowerCase(),
        });
        return response.data;
    }
};

export const invoiceService = {
    // Generate a new invoice (Payload matches InvoiceCreate schema)
    // Supports the is_tax_exempt flag and parses decimals natively if configured
    generate: async (data) => {
        const response = await apiClient.post('finance/invoices/', data);
        return mapInvoiceFromApi(response.data);
    },

    // Get all invoices
    getAll: async () => {
        const response = await apiClient.get('finance/invoices/');
        return response.data.map(mapInvoiceFromApi);
    },

    // Get invoice by ID (Assuming the backend will have a GET /finance/invoices/{id} endpoint)
    getById: async (id) => {
        // Note: ensure this endpoint is available in your FastAPI billing router
        const response = await apiClient.get(`finance/invoices/${id}`);
        return mapInvoiceFromApi(response.data);
    },

    create: async (data) => {
        const response = await apiClient.post('finance/invoices/', data);
        return mapInvoiceFromApi(response.data);
    },

    updateStatus: async (id, status, user) => {
        // Assuming patch endpoint for invoice status
        const response = await apiClient.patch(`finance/invoices/${id}`, { status_pembayaran: status.toLowerCase() });
        return mapInvoiceFromApi(response.data);
    },

    void: async (id, user) => {
        const response = await apiClient.delete(`finance/invoices/${id}`);
        return response.data;
    },

    updateNSFP: async (id, nsfp, user) => {
        const response = await apiClient.patch(`finance/invoices/${id}`, { no_faktur_pajak: nsfp });
        return mapInvoiceFromApi(response.data);
    }
};

export const authService = {
    // Login to get the JWT token
    // Using URLSearchParams because FastAPI OAuth2PasswordRequestForm usually expects application/x-www-form-urlencoded
    login: async (credentials) => {
        const params = new URLSearchParams();
        params.append('username', credentials.username);
        params.append('password', credentials.password);

        // Backend FastAPI: prefix `/api` + `/login`
        const response = await apiClient.post('login', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return response.data;
    },

    // Fetch the active user's profile
    getProfile: async () => {
        // Disesuaikan jika nantinya ada endpoint khusus user, sementara ini biarkan
        const response = await apiClient.get('users/me'); // Or whatever the profile endpoint is
        return response.data;
    },
};

export const contractService = {
    getAll: async () => {
        const response = await apiClient.get('contracts/');
        return response.data;
    },
    getById: async (id) => {
        const response = await apiClient.get(`contracts/${id}`);
        return response.data;
    },
    create: async (data) => {
        const response = await apiClient.post('contracts/', data);
        clearActiveContractCache();
        return response.data;
    },
    update: async (id, data) => {
        const response = await apiClient.patch(`contracts/${id}`, data);
        clearActiveContractCache();
        return response.data;
    },
    delete: async (id) => {
        const response = await apiClient.delete(`contracts/${id}`);
        clearActiveContractCache();
        return response.data;
    }
};

export const clientService = {
    getAll: async () => {
        const response = await apiClient.get('clients/');
        return response.data;
    },
    create: async (data) => {
        const response = await apiClient.post('clients/', data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await apiClient.patch(`clients/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await apiClient.delete(`clients/${id}`);
        return response.data;
    },
};

export const truckService = {
    getAll: async () => {
        const response = await apiClient.get('trucks/');
        return response.data.map(mapTruckFromApi);
    },
    create: async (data) => {
        const response = await apiClient.post('trucks/', data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await apiClient.patch(`trucks/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await apiClient.delete(`trucks/${id}`);
        return response.data;
    },
};

export const adminUserService = {
    getAll: async () => {
        const response = await apiClient.get('users/');
        return response.data;
    },
    create: async (data) => {
        const response = await apiClient.post('users/', data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await apiClient.patch(`users/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await apiClient.delete(`users/${id}`);
        return response.data;
    },
};

export const contractMetaService = {
    getActive: async () => {
        return await getActiveContractCached();
    }
};

export const settingsService = {
    getProfile: async () => {
        // Backend users router: prefix `/api` + `/profile/`
        const response = await apiClient.get('profile/');
        const data = response.data;
        // Map ke bentuk CompanySettings untuk UI
        return {
            name: data.nama_perusahaan,
            address: data.alamat || '',
            npwp: data.npwp || '',
            bankAccount: data.bank_rekening || '',
            bankName: data.bank_nama || '',
        };
    },
    updateProfile: async (data) => {
        // Konversi dari CompanySettings ke OwnerProfileCreate
        const payload = {
            nama_perusahaan: data.name,
            alamat: data.address,
            npwp: data.npwp,
            email: null,
            bank_nama: data.bankName,
            bank_cabang: null,
            bank_rekening: data.bankAccount,
            bank_atas_nama: null,
        };
        const response = await apiClient.put('profile/', payload);
        return response.data;
    },
    get: async () => {
        const response = await apiClient.get('profile/');
        const data = response.data;
        return {
            name: data.nama_perusahaan,
            address: data.alamat || '',
            npwp: data.npwp || '',
            bankAccount: data.bank_rekening || '',
            bankName: data.bank_nama || '',
        };
    },
    update: async (data) => {
        const payload = {
            nama_perusahaan: data.name,
            alamat: data.address,
            npwp: data.npwp,
            email: null,
            bank_nama: data.bankName,
            bank_cabang: null,
            bank_rekening: data.bankAccount,
            bank_atas_nama: null,
        };
        const response = await apiClient.put('profile/', payload);
        return response.data;
    }
};

export default apiClient;
