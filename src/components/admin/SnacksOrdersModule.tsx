"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Search,
    Filter,
    Calendar,
    Eye,
    Package,
    Truck,
    CheckCircle,
    XCircle,
    Loader2,
    X,
    User,
    Phone,
    Mail,
    MapPin,
    CreditCard,
    ArrowRight,
    Trash2,

    Download,
    Plus,
    Minus,
    ShoppingCart
} from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

const STATUSES = ["All", "Payment Confirmed", "Parcel Prepared", "Shipping", "Delivered", "Cancel", "Shadow"];

export default function SnacksOrdersModule() {
    const [orders, setOrders] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);
    const [search, setSearch] = useState("");
    const [pagination, setPagination] = useState({ total: 0, limit: 10, offset: 0 });
    const [statusFilter, setStatusFilter] = useState("Payment Confirmed");
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [fetchingDetailId, setFetchingDetailId] = useState<string | null>(null);
    const [showShippingModal, setShowShippingModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [shippingData, setShippingData] = useState({ courier: "", tracking: "" });
    const [cancelReason, setCancelReason] = useState("");

    // Create Order State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createFormData, setCreateFormData] = useState({
        customer: { name: "", mobile: "", email: "", address: "", city: "", state: "", pincode: "", country: "India" },
        items: [] as any[],
        paymentMethod: "UPI", // UPI, Cash
        utr: "",
        status: "Payment Confirmed",
        skipNotification: false
    });
    const [availableProducts, setAvailableProducts] = useState<any[]>([]);
    const [productSearch, setProductSearch] = useState("");
    const [creatingOrder, setCreatingOrder] = useState(false);

    // Coupon State
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [couponError, setCouponError] = useState("");
    const [validatingCoupon, setValidatingCoupon] = useState(false);

    // Dynamic Shipping State
    const [dynamicShipping, setDynamicShipping] = useState<number | null>(null);
    const [loadingShipping, setLoadingShipping] = useState(false);
    const [packageDimensions, setPackageDimensions] = useState<Record<string, { l: string, b: string, h: string, w: string }>>({});

    useEffect(() => {
        if ((showCreateModal || selectedOrder) && availableProducts.length === 0) {
            fetchProducts();
        }
    }, [showCreateModal, selectedOrder]);

    const autoSetDimensions = useCallback((shipment: any) => {
        if (!shipment || !availableProducts.length) return;

        const items = Array.isArray(shipment.items) ? shipment.items : [];
        let totalWeight = items.reduce((sum: number, item: any) => {
            return sum + (item.unit === "Kg" ? Number(item.quantity) : 0.1);
        }, 0);

        const itemIds = items.map((it: any) => it.id);

        let allTiers: any[] = [];
        availableProducts.filter(p => itemIds.includes(p.id)).forEach(p => {
            if (p.dimensionTiers && Array.isArray(p.dimensionTiers)) {
                allTiers = [...allTiers, ...p.dimensionTiers];
            }
        });

        if (allTiers.length > 0) {
            const sortedTiers = allTiers.sort((a, b) => a.weight - b.weight || (b.l * b.w * b.h) - (a.l * a.w * a.h));
            const bestTier = sortedTiers.find(t => t.weight >= totalWeight) || sortedTiers[sortedTiers.length - 1];

            if (bestTier) {
                setPackageDimensions(prev => ({
                    ...prev,
                    [shipment.id || "full"]: {
                        l: String(bestTier.l),
                        b: String(bestTier.w),
                        h: String(bestTier.h),
                        w: String(totalWeight)
                    }
                }));
            }
        }
    }, [availableProducts]);

    useEffect(() => {
        if (selectedOrder && availableProducts.length > 0) {
            if (selectedOrder.status === "Payment Confirmed" && !selectedOrder.shiprocketOrderId) {
                autoSetDimensions({ id: "full", items: selectedOrder.items });
            }
            if (selectedOrder.shipments) {
                selectedOrder.shipments.forEach((shipment: any) => {
                    if (shipment.status === "Payment Confirmed" && !shipment.shiprocketOrderId) {
                        autoSetDimensions(shipment);
                    }
                });
            }
        }
    }, [selectedOrder, availableProducts.length, autoSetDimensions]);

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/snacks/products?activeOnly=true");
            if (res.ok) {
                const data = await res.json();
                setAvailableProducts(data);
            }
        } catch (error) {
            console.error("Failed to fetch products", error);
        }
    };

    const handleAddItem = (product: any) => {
        const unit = product.offerPricePerPiece || product.pricePerPiece ? 'pack' : 'kg';
        const price = product.offerPricePerPiece || product.pricePerPiece || product.offerPricePerKg || product.pricePerKg;

        const newItem = {
            id: product.id,
            productId: product.id, // Explicitly add for commission logic
            name: product.name,
            imageUrl: product.imageUrl,
            quantity: 1,
            unit: unit,
            price: price,
            originalProduct: product
        };

        setCreateFormData(prev => ({
            ...prev,
            items: [...prev.items, newItem]
        }));
        setProductSearch(""); // Reset search
    };

    const handleRemoveItem = (index: number) => {
        setCreateFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleUpdateItemQuantity = (index: number, delta: number) => {
        setCreateFormData(prev => {
            const newItems = [...prev.items];
            const item = newItems[index];
            const newQty = Math.max(0.25, parseFloat((item.quantity + delta).toFixed(2))); // Min 0.25
            newItems[index] = { ...item, quantity: newQty };
            return { ...prev, items: newItems };
        });
    };

    const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const pin = e.target.value;
        setCreateFormData(prev => ({ ...prev, customer: { ...prev.customer, pincode: pin } }));

        if (pin.length === 6) {
            setLoadingShipping(true);
            try {
                // Fetch location data first
                const locationRes = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
                const locationData = await locationRes.json();

                if (locationData[0].Status === "Success") {
                    const postOffice = locationData[0].PostOffice[0];
                    setCreateFormData(prev => ({
                        ...prev,
                        customer: {
                            ...prev.customer,
                            city: postOffice.Block,
                            state: postOffice.State,
                            country: "India"
                        }
                    }));

                    // Calculate weight
                    const totalWeight = createFormData.items.reduce((sum, item) => {
                        return sum + (item.unit === "Kg" ? item.quantity : 0.1);
                    }, 0);

                    // Fetch dynamic shipping from Shiprocket
                    try {
                        const shippingRes = await fetch('/api/snacks/shipping', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                pincode: pin,
                                weight: totalWeight || 0.5 // Minimum 500g
                            })
                        });

                        if (shippingRes.ok) {
                            const shippingData = await shippingRes.json();
                            if (shippingData.available) {
                                setDynamicShipping(shippingData.shippingCost);
                            } else {
                                // Fallback to static if not available
                                setDynamicShipping(null);
                                console.warn("Shiprocket not available, using static rates");
                            }
                        }
                    } catch (shippingError) {
                        console.error("Shipping API failed, using static rates", shippingError);
                        setDynamicShipping(null);
                    }
                }
            } catch (error) {
                console.error("Pincode lookup failed", error);
            }
            setLoadingShipping(false);
        } else {
            // Reset shipping if pincode incomplete
            setDynamicShipping(null);
        }
    };

    // Shipping Rates Configuration (Mirrored from Checkout)
    const SHIPPING_RATES: Record<string, number> = {
        "Tamil Nadu": 40,
        "Kerala": 80,
        "Andhra Pradesh": 90,
        "Arunachal Pradesh": 90,
        "Assam": 90,
        "Bihar": 90,
        "Karnataka": 90,
        "Manipur": 90,
        "Chhattisgarh": 200,
        "Goa": 200,
        "Gujarat": 200,
        "Haryana": 200,
        "Himachal Pradesh": 200,
        "Jharkhand": 200,
        "Madhya Pradesh": 200,
        "Maharashtra": 200,
        "Meghalaya": 200,
        "Mizoram": 200,
        "Nagaland": 200,
        "Odisha": 200,
        "Punjab": 200,
        "Rajasthan": 200,
        "Sikkim": 200,
        "Telangana": 200,
        "Uttar Pradesh": 200,
        "Uttarakhand": 200,
        "West Bengal": 200,
        // Union Territories
        "Delhi": 200,
        "Chandigarh": 200,
        "Puducherry": 200,
        "Dadra and Nagar Haveli and Daman and Diu": 200,
        "Jammu and Kashmir": 200,
        "Ladakh": 200,
        "Lakshadweep": 200,
        "Andaman and Nicobar Islands": 200
    };

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        const formattedCode = couponCode.toUpperCase().trim();
        setValidatingCoupon(true);
        setCouponError("");
        try {
            const res = await fetch(`/api/coupons/validate?code=${formattedCode}`);
            const data = await res.json();
            if (res.ok && data.valid) {
                setAppliedCoupon(data);
                setCouponError("");
            } else {
                setCouponError(data.message || "Invalid coupon");
                setAppliedCoupon(null);
            }
        } catch (error) {
            setCouponError("Failed to validate coupon");
        } finally {
            setValidatingCoupon(false);
        }
    };

    const calculateTotal = () => {
        const subtotal = createFormData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Group Items by Vendor for Separate Shipments
        const vendorGroups: Record<string, number> = {};
        createFormData.items.forEach(item => {
            const vendorId = item.originalProduct?.vendorId || "admin";
            const weight = item.unit === "Kg" ? item.quantity : 0.1;
            vendorGroups[vendorId] = (vendorGroups[vendorId] || 0) + weight;
        });

        // Calculate Shipping per Vendor
        let shipping = 0;
        let ratePerKg = 200; // Fallback

        if (createFormData.customer.state) {
            const stateKey = Object.keys(SHIPPING_RATES).find(key =>
                key.toLowerCase() === createFormData.customer.state.toLowerCase()
            );
            if (stateKey) {
                ratePerKg = SHIPPING_RATES[stateKey];
            }
        }

        // Sum shipping costs for all unique vendors
        const uniqueVendors = Object.keys(vendorGroups);

        // Always calculate based on split shipments to ensure no loss
        if (uniqueVendors.length > 0) {
            uniqueVendors.forEach(vendorId => {
                const groupWeight = vendorGroups[vendorId];
                // (Weight * Rate) + 40 Packaging per vendor
                shipping += Math.ceil((ratePerKg * groupWeight) + 40);
            });
        }


        // Calculate Discount
        const discountAmount = appliedCoupon
            ? (appliedCoupon.type === 'affiliate'
                ? createFormData.items.reduce((acc, item) => {
                    const discountPercent = item.originalProduct?.affiliateDiscountPercent || 0;
                    return acc + Math.round((item.price * item.quantity) * (discountPercent / 100));
                }, 0)
                : (appliedCoupon.discountType === 'percentage'
                    ? Math.round(subtotal * (appliedCoupon.discountValue / 100))
                    : appliedCoupon.discountValue))
            : 0;

        const total = subtotal - discountAmount + shipping;

        return { subtotal, shipping, discountAmount, total };
    };

    const handleCreateSubmit = async () => {
        // Basic Validation
        if (!createFormData.customer.mobile || !createFormData.customer.name) {
            alert("Customer Name and Mobile are required");
            return;
        }

        if (createFormData.items.length === 0) {
            alert("Add at least one product");
            return;
        }

        const { subtotal, shipping, discountAmount, total } = calculateTotal();

        const payload = {
            customer: createFormData.customer,
            items: createFormData.items,
            totalAmount: total,
            subtotal: subtotal,
            shippingCost: shipping,
            discountAmount: discountAmount,
            couponCode: appliedCoupon?.code,
            paymentMethod: createFormData.paymentMethod,
            utr: createFormData.utr,
            status: createFormData.status,
            skipNotification: createFormData.skipNotification
        };

        try {
            const res = await fetch("/api/snacks/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
                alert(`Order Created Successfully! ID: ${data.orderId}`);
                setShowCreateModal(false);
                fetchOrders();
                // Reset Form
                setCreateFormData({
                    customer: { name: "", mobile: "", email: "", address: "", city: "", state: "", pincode: "", country: "India" },
                    items: [],
                    paymentMethod: "UPI",
                    utr: "",
                    status: "Payment Confirmed",
                    skipNotification: false
                });
            } else {
                alert(`Failed: ${data.error}`);
            }
        } catch (error) {
            console.error(error);
            alert("Network Error");
        } finally {
            setCreatingOrder(false);
        }
    };

    const fetchOrders = useCallback(async (offset = 0) => {
        setFetching(true);
        const params = new URLSearchParams();
        if (statusFilter !== "All") {
            const apiStatus = statusFilter === "Shadow" ? "Pending Verification" : statusFilter;
            params.append("status", apiStatus);
        }
        if (search) params.append("search", search);
        params.append("limit", "10");
        params.append("offset", offset.toString());
        params.append("lean", "true"); // Save bandwidth for list view

        const res = await fetch(`/api/snacks/orders?${params.toString()}`);
        if (res.ok) {
            const data = await res.json();
            setOrders(data.orders);
            setPagination(data.pagination);
        }
        setFetching(false);
    }, [statusFilter, search]);

    useEffect(() => {
        fetchOrders(0);
    }, [statusFilter]);

    const fetchOrderDetails = async (orderId: string) => {
        setFetchingDetailId(orderId);
        try {
            const res = await fetch(`/api/snacks/orders/${orderId}`);
            if (res.ok) {
                const data = await res.json();
                setSelectedOrder(data);
            }
        } catch (error) {
            console.error("Fetch order details error:", error);
        } finally {
            setFetchingDetailId(null);
        }
    };

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        if (newStatus === "Shipping") {
            setShowShippingModal(true);
            return;
        }
        if (newStatus === "Cancel") {
            setShowCancelModal(true);
            return;
        }
        await updateStatus(orderId, newStatus);
    };

    const handleDeleteOrder = async (orderId: string) => {
        if (!confirm("Are you sure? This will permanently delete the order from the database.")) return;

        const res = await fetch(`/api/snacks/orders/${orderId}`, {
            method: "DELETE",
        });

        if (res.ok) {
            setSelectedOrder(null);
            fetchOrders();
        } else {
            alert("Failed to delete order");
        }
    };

    const updateStatus = async (orderId: string, newStatus: string, extraData = {}) => {
        const res = await fetch(`/api/snacks/orders/${orderId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus, ...extraData }),
        });
        if (res.ok) {
            fetchOrders();
            if (selectedOrder && selectedOrder.id === orderId) {
                // Determine shipment ID and courier name to update local state optimistically or just fetch fresh
                const updated = { ...selectedOrder, status: newStatus, ...extraData };
                setSelectedOrder(updated);
            }
            setShowShippingModal(false);
            setShippingData({ courier: "", tracking: "" });
        }
    };

    const submitShipping = async () => {
        if (!selectedOrder) return;
        await updateStatus(selectedOrder.id, "Shipping", {
            shipmentId: shippingData.tracking,
            courierName: shippingData.courier
        });
    };

    const submitCancel = async () => {
        if (!selectedOrder) return;
        await updateStatus(selectedOrder.id, "Cancel", {
            cancelReason: cancelReason
        });
        setShowCancelModal(false);
        setCancelReason("");
    };

    const handleShipRocket = async (shipmentId?: string) => {
        if (!selectedOrder) return;
        if (!confirm("Create Shiprocket Order & AWB? This will book the shipment.")) return;

        try {
            const res = await fetch("/api/admin/ship", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: selectedOrder.id,
                    shipmentId: shipmentId
                }),
            });
            const data = await res.json();

            if (res.ok) {
                alert(`Success! AWB: ${data.awbCode || "Generated"}`);
                fetchOrderDetails(selectedOrder.id);
                fetchOrders();
            } else {
                alert(`Failed: ${data.error}`);
            }
        } catch (error) {
            console.error(error);
            alert("Network Error");
        }
    };

    const updateDimension = (shipmentId: string, field: string, value: string) => {
        setPackageDimensions(prev => ({
            ...prev,
            [shipmentId]: {
                ...(prev[shipmentId] || { l: "15", b: "15", h: "10", w: "0.5" }),
                [field]: value
            } as { l: string, b: string, h: string, w: string }
        }));
    };

    const handleUpdateShipmentStatus = async (shipmentId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/admin/shipments/${shipmentId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                if (selectedOrder) fetchOrderDetails(selectedOrder.id);
                fetchOrders();
            } else {
                alert("Failed to update shipment status");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleResetShipment = async () => {
        if (!selectedOrder) return;
        if (!confirm("Are you sure? This will clear the Shiprocket Order ID and allow you to book a new shipment. Use this ONLY if you have cancelled the previous shipment in Shiprocket.")) return;

        try {
            const res = await fetch(`/api/snacks/orders/${selectedOrder.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: "Payment Confirmed",
                    shiprocketOrderId: null,
                    shipmentId: null,
                    awbCode: null,
                    courierName: null
                }),
            });

            if (res.ok) {
                alert("Shipment data reset successfully.");
                fetchOrderDetails(selectedOrder.id);
                fetchOrders();
            } else {
                alert("Failed to reset shipment data.");
            }
        } catch (error) {
            console.error(error);
            alert("Network Error");
        }
    };

    const sendWhatsAppUpdate = () => {
        if (!selectedOrder) return;

        let message = `Hello ${selectedOrder.customerName}, your HM Snacks order *${selectedOrder.orderId}* is currently *${selectedOrder.status}*.`;

        if (selectedOrder.status === "Shipping") {
            message += `\n\nIt was shipped via *${selectedOrder.courierName || "Courier"}*.\nTracking ID: *${selectedOrder.shipmentId}*`;
            message += `\n\nTrack your order here: https://hariharanhub.com/business/hm-snacks/track?orderId=${selectedOrder.orderId}`;
        }

        if (selectedOrder.status === "Payment Confirmed") {
            message += `\n\nWe have received your payment of ₹${selectedOrder.totalAmount}. We will pack it shortly!`;
        }

        if (selectedOrder.status === "Cancel") {
            message += `\n\nUnfortunately, your order has been cancelled.\nReason: *${selectedOrder.cancelReason || "Not specified"}*`;
            message += `\n\nIf you have already paid, our team will process your refund shortly.`;
        }

        if (selectedOrder.status === "Delivered") {
            const firstItem = selectedOrder.items?.[0];
            message += `\n\nYour order has been delivered! Hope you loved the snacks. 😊`;
            if (firstItem) {
                message += `\n\n*Write a Review:* https://hariharanhub.com/business/hm-snacks?product=${firstItem.id || firstItem.productId}&review=true`;
            }
        }

        const encodedMsg = encodeURIComponent(message);
        window.open(`https://wa.me/${selectedOrder.customerMobile}?text=${encodedMsg}`, '_blank');
    };

    const exportToCSV = () => {
        if (orders.length === 0) return;

        const headers = ["Order ID", "Date", "Customer Name", "Mobile", "Amount (Total)", "Base Price (95%)", "GST (5%)", "Status", "Items"];

        const rows = orders.map(order => {
            const total = parseFloat(order.totalAmount || 0);
            const gst = (total * 5) / 105;
            const base = total - gst;

            return [
                order.orderId,
                new Date(order.createdAt).toLocaleDateString(),
                `"${order.customerName}"`,
                order.customerMobile,
                total.toFixed(2),
                base.toFixed(2),
                gst.toFixed(2),
                order.status,
                `"${(order.items || []).map((i: any) => `${i.name} (${i.quantity}${i.unit || 'Kg'})`).join(', ')}"`
            ];
        });

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `HM-Snacks-Orders-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Payment Confirmed": return "bg-blue-50 text-blue-600";
            case "Parcel Prepared": return "bg-amber-50 text-amber-600";
            case "Shipping": return "bg-indigo-50 text-indigo-600";
            case "Delivered": return "bg-emerald-50 text-emerald-600";
            case "Cancel": return "bg-rose-50 text-rose-600";
            case "Pending Verification": return "bg-purple-50 text-purple-600 animate-pulse";
            case "Shadow": return "bg-purple-50 text-purple-600";
            default: return "bg-gray-50 text-gray-600";
        }
    };

    // Helper to render items list
    const renderItemsRaw = (items: any[]) => (
        <div className="grid gap-4">
            {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-6 p-4 bg-white border border-gray-100 rounded-3xl hover:shadow-xl transition-all">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0">
                        {item.imageUrl ? (
                            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" unoptimized />
                        ) : (
                            <Package size={24} className="m-auto text-gray-200" />
                        )}
                    </div>
                    <div className="flex-grow">
                        <h5 className="font-black text-gray-900">{item.name}</h5>
                        <p className="text-xs font-bold text-gray-400">Qty: {item.quantity} {item.unit || 'Kg'}</p>
                    </div>
                    <div className="text-right">
                        <span className="text-lg font-black text-gray-900 italic">₹{Math.ceil((item.price || item.pricePerKg) * item.quantity)}</span>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Orders Tracking</h2>
                    <p className="text-gray-400 font-medium">Manage and track customer shipments.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative group flex-grow sm:min-w-[300px]">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-pink-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Order ID, Mobile, Name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && fetchOrders()}
                            className="w-full bg-gray-50 border-0 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-pink-500 transition-all font-bold"
                        />
                    </div>
                    <button
                        onClick={() => fetchOrders(0)}
                        className="bg-gray-900 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all"
                    >
                        Search
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-pink-500 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-pink-600 transition-all shadow-lg shadow-pink-200 flex items-center gap-2"
                    >
                        <Plus size={16} /> Create Order
                    </button>
                    <button
                        onClick={exportToCSV}
                        disabled={orders.length === 0}
                        className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 flex items-center gap-2 disabled:opacity-50"
                    >
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-2xl w-fit">
                {STATUSES.map(s => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-900"
                            }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-50">
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Order details</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Customer</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Amount</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-black text-gray-900 leading-none mb-1">{order.orderId}</span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900">{order.customerName}</span>
                                            <span className="text-xs text-gray-400">{order.customerMobile}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="font-black text-gray-900">₹{order.totalAmount}</span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button
                                            onClick={() => fetchOrderDetails(order.id)}
                                            disabled={fetchingDetailId === order.id}
                                            className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-pink-50 hover:text-pink-500 transition-all group-hover:scale-110 disabled:opacity-50"
                                        >
                                            {fetchingDetailId === order.id ? <Loader2 size={18} className="animate-spin" /> : <Eye size={18} />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {orders.length === 0 && !fetching && (
                    <div className="py-24 text-center">
                        <Package size={48} className="text-gray-100 mx-auto mb-4" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest">No matching orders found.</p>
                    </div>
                )}
                {fetching && (
                    <div className="py-24 flex justify-center">
                        <Loader2 size={32} className="text-pink-500 animate-spin" />
                    </div>
                )}

                {/* Pagination Controls */}
                {!fetching && pagination.total > pagination.limit && (
                    <div className="p-8 border-t border-gray-100 flex items-center justify-between bg-white">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Showing {pagination.offset + 1} - {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} orders
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => fetchOrders(pagination.offset - pagination.limit)}
                                disabled={pagination.offset === 0}
                                className="px-6 py-2 bg-gray-50 text-gray-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all disabled:opacity-20"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => fetchOrders(pagination.offset + pagination.limit)}
                                disabled={pagination.offset + pagination.limit >= pagination.total}
                                className="px-6 py-2 bg-gray-50 text-gray-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all disabled:opacity-20"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        onClick={() => setSelectedOrder(null)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        {/* Modal Header */}
                        <div className="p-4 md:p-12 border-b border-gray-100 flex justify-between items-center bg-[#fafafa]">
                            <div className="flex items-center gap-3 md:gap-6">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-pink-500 rounded-2xl md:rounded-3xl flex items-center justify-center text-white shadow-xl shadow-pink-200 flex-shrink-0">
                                    <Package size={24} className="md:w-8 md:h-8" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <h3 className="text-xl md:text-3xl font-black text-gray-900 tracking-tighter italic truncate">{selectedOrder.orderId}</h3>
                                    <div className="flex flex-wrap items-center gap-2 mt-0.5 md:mt-1">
                                        <span className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest ${getStatusColor(selectedOrder.status)}`}>
                                            {selectedOrder.status}
                                        </span>
                                        <span className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">• {new Date(selectedOrder.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={sendWhatsAppUpdate} className="p-3 md:p-4 bg-green-500 text-white hover:bg-green-600 rounded-xl md:rounded-2xl transition-all shadow-lg shadow-green-200 flex-shrink-0" title="Send WhatsApp Update">
                                    <Phone size={20} className="md:w-6 md:h-6" />
                                </button>
                                <button onClick={() => setSelectedOrder(null)} className="p-3 md:p-4 hover:bg-gray-200 rounded-xl md:rounded-2xl transition-all flex-shrink-0">
                                    <X size={20} className="text-gray-400 md:w-6 md:h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-grow overflow-y-auto p-4 md:p-12 space-y-8 md:space-y-12">
                            {/* Information Summary Bar */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 md:p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-pink-500 shadow-sm">
                                        <User size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-0.5">Recipient</span>
                                        <span className="font-black text-gray-900 truncate block text-lg">{selectedOrder.customerName}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 border-l-0 md:border-l border-gray-200 md:pl-10">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-green-500 shadow-sm">
                                        <Phone size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-0.5">Contact</span>
                                        <span className="font-black text-gray-900 truncate block text-lg">{selectedOrder.customerMobile}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 border-l-0 md:border-l border-gray-200 md:pl-10">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm">
                                        <MapPin size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-0.5">Location</span>
                                        <span className="font-bold text-gray-600 truncate block leading-tight">
                                            {selectedOrder.city}, {selectedOrder.state}<br />
                                            <span className="text-[10px] font-black font-mono">PIN: {selectedOrder.pincode}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Full Width Logistics & Items */}
                            <div className="space-y-10">
                                {(selectedOrder.shipments && selectedOrder.shipments.length > 0) ? (
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between px-2">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-4 py-1.5 rounded-full">Split Shipments ({selectedOrder.shipments.length})</h4>
                                            <div className="flex items-center gap-4">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Value</span>
                                                <span className="text-xl font-black text-gray-900 italic">₹{selectedOrder.totalAmount}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-8">
                                            {selectedOrder.shipments.map((shipment: any, idx: number) => (
                                                <div key={shipment.id || idx} className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-100">

                                                    {/* Vendor & Status Column */}
                                                    <div className="p-8 md:w-1/3 bg-[#fafafa] space-y-6">
                                                        <div className="space-y-1">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Vendor</span>
                                                            <h5 className="text-xl font-black text-gray-900 tracking-tight">{shipment.vendorName || "Active Business (Admin)"}</h5>
                                                        </div>

                                                        <div className="space-y-3">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Processing Status</span>
                                                            <select
                                                                value={shipment.status}
                                                                onChange={(e) => handleUpdateShipmentStatus(shipment.id, e.target.value)}
                                                                className={`w-full px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 border-transparent focus:ring-0 shadow-sm cursor-pointer transition-all ${getStatusColor(shipment.status)}`}
                                                            >
                                                                {STATUSES.filter(s => s !== "All" && s !== "Shadow").map(s => (
                                                                    <option key={s} value={s}>{s}</option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        {/* Shipment Actions */}
                                                        <div className="pt-4 border-t border-gray-200">
                                                            {shipment.shiprocketOrderId ? (
                                                                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <CheckCircle size={14} className="text-emerald-500" />
                                                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Shiprocket Active</span>
                                                                    </div>
                                                                    <div className="text-xs font-black text-emerald-900 font-mono">AWB: {shipment.awbCode}</div>
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-4">
                                                                    {/* Vendor Confirmed Badge */}
                                                                    {(shipment as any).vendorConfirmedDimensions && (
                                                                        <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <CheckCircle size={12} className="text-emerald-500" />
                                                                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Vendor Confirmed</span>
                                                                            </div>
                                                                            <div className="text-[8px] text-emerald-700 font-medium">
                                                                                {new Date((shipment as any).vendorConfirmedAt).toLocaleString()}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <div className="space-y-1">
                                                                            <label className="text-[8px] font-black uppercase text-gray-400 ml-1">L x B (cm)</label>
                                                                            <div className="flex gap-1">
                                                                                <input type="number" placeholder="L" value={packageDimensions[shipment.id]?.l || (shipment as any).vendorConfirmedDimensions?.l || ""} onChange={(e) => updateDimension(shipment.id, 'l', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-bold" />
                                                                                <input type="number" placeholder="B" value={packageDimensions[shipment.id]?.b || (shipment as any).vendorConfirmedDimensions?.w || ""} onChange={(e) => updateDimension(shipment.id, 'b', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-bold" />
                                                                            </div>
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <label className="text-[8px] font-black uppercase text-gray-400 ml-1">H x W (cm/kg)</label>
                                                                            <div className="flex gap-1">
                                                                                <input type="number" placeholder="H" value={packageDimensions[shipment.id]?.h || (shipment as any).vendorConfirmedDimensions?.h || ""} onChange={(e) => updateDimension(shipment.id, 'h', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-bold" />
                                                                                <input type="number" placeholder="W" value={packageDimensions[shipment.id]?.w || (shipment as any).vendorConfirmedDimensions?.weight || ""} onChange={(e) => updateDimension(shipment.id, 'w', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-bold" />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handleShipRocket(shipment.id)}
                                                                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                                                                    >
                                                                        <Truck size={14} /> Ship via Shiprocket
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Items List Column */}
                                                    <div className="p-8 flex-grow space-y-6">
                                                        <div className="flex items-center gap-2">
                                                            <Package size={14} className="text-gray-400" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Included Items</span>
                                                        </div>
                                                        {renderItemsRaw(shipment.items)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="p-8 bg-gray-50 rounded-[2.5rem] space-y-6 border border-gray-100">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 w-fit px-4 py-1.5 rounded-full">Logistics Details</h4>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center py-2 border-b border-gray-200/50">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment ID</span>
                                                    <span className="text-xs font-black text-gray-900 font-mono tracking-tight">{selectedOrder.paymentId || "PENDING"}</span>
                                                </div>
                                                <div className="flex justify-between items-center py-2 border-b border-gray-200/50">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Courier</span>
                                                    <span className="text-xs font-black text-gray-900">{selectedOrder.courierName || "UNASSIGNED"}</span>
                                                </div>
                                                <div className="flex justify-between items-center py-2">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tracking Info</span>
                                                    <span className="text-xs font-black text-gray-900 font-mono">{selectedOrder.shipmentId || "UNASSIGNED"}</span>
                                                </div>
                                            </div>

                                            {/* Legacy Shiprocket Section */}
                                            {selectedOrder.shiprocketOrderId ? (
                                                <div className="pt-4 border-t border-indigo-100 space-y-4">
                                                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-indigo-50">
                                                        <span className="text-[10px] font-black uppercase text-indigo-500">SR ID: {selectedOrder.shiprocketOrderId}</span>
                                                        <span className="text-[10px] font-black font-mono text-gray-900">AWB: {selectedOrder.awbCode}</span>
                                                    </div>
                                                    <button onClick={handleResetShipment} className="w-full py-2 bg-rose-50 text-rose-500 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-rose-100 transition-all border border-rose-100">
                                                        Reset Shipment
                                                    </button>
                                                </div>
                                            ) : (
                                                selectedOrder.status === "Payment Confirmed" && (
                                                    <div className="pt-4 border-t border-gray-100 space-y-4">
                                                        <div className="grid grid-cols-4 gap-2">
                                                            {(['l', 'b', 'h', 'w'] as const).map(dim => (
                                                                <div key={dim}>
                                                                    <label className="text-[7px] font-black uppercase text-gray-400 ml-1">{dim === 'w' ? 'Wt' : dim.toUpperCase()} (cm/kg)</label>
                                                                    <input type="number" placeholder={dim === 'w' ? "0.5" : "15"} value={packageDimensions["full"]?.[dim] || ""} onChange={(e) => updateDimension("full", dim, e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 text-[10px] font-bold" />
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <button onClick={() => handleShipRocket()} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                                                            Generate Shipping Label
                                                        </button>
                                                    </div>
                                                )
                                            )}
                                        </div>

                                        <div className="p-8 bg-gray-900 text-white rounded-[2.5rem] flex flex-col justify-between">
                                            <div className="space-y-6">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Financial Summary</span>
                                                    <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black text-emerald-400 border border-white/10 uppercase tracking-widest">{selectedOrder.paymentMethod}</span>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block">Total Revenue</span>
                                                    <span className="text-5xl font-black italic tracking-tighter text-white">₹{selectedOrder.totalAmount}</span>
                                                </div>
                                            </div>
                                            <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Order Verified</span>
                                                <CheckCircle size={20} className="text-emerald-500" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Order Items (Only show here if NOT split, or show ALL as summary?) - Legacy shows all here */}
                            {!(selectedOrder.shipments && selectedOrder.shipments.length > 0) && (
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Items Purchased</h4>
                                    {renderItemsRaw(selectedOrder.items)}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer - Status Actions */}
                        <div className="p-4 md:p-8 bg-[#fafafa] border-t border-gray-100 flex flex-wrap gap-2 md:gap-3 items-center">
                            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 md:gap-3 flex-grow">
                                {STATUSES.filter(s => s !== "All").map(s => (
                                    <button
                                        key={s}
                                        onClick={() => handleUpdateStatus(selectedOrder.id, s)}
                                        className={`px-3 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all ${selectedOrder.status === s
                                            ? "bg-gray-900 text-white shadow-xl scale-[1.02] md:scale-105"
                                            : "bg-white text-gray-400 border border-gray-200 hover:border-gray-900 hover:text-gray-900"
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => handleDeleteOrder(selectedOrder.id)}
                                className="p-3 md:p-4 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl md:rounded-2xl transition-all border border-rose-100 ml-auto flex-shrink-0"
                                title="Delete Order"
                            >
                                <Trash2 size={20} className="md:w-6 md:h-6" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Shipping Details Modal */}
            {showShippingModal && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95">
                        <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                            <Truck className="text-pink-500" /> Shipping Details
                        </h3>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Courier Partner Name</label>
                                <input
                                    value={shippingData.courier}
                                    onChange={(e) => setShippingData({ ...shippingData, courier: e.target.value })}
                                    placeholder="e.g. DTDC, Professional, Shiprocket"
                                    className="w-full bg-gray-50 border-0 rounded-2xl p-4 font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Tracking / Awb Number</label>
                                <input
                                    value={shippingData.tracking}
                                    onChange={(e) => setShippingData({ ...shippingData, tracking: e.target.value })}
                                    placeholder="e.g. SHP-992838382"
                                    className="w-full bg-gray-50 border-0 rounded-2xl p-4 font-bold font-mono"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <button
                                    onClick={() => setShowShippingModal(false)}
                                    className="px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs text-gray-500 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitShipping}
                                    disabled={!shippingData.courier || !shippingData.tracking}
                                    className="px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs bg-gray-900 text-white hover:bg-pink-500 disabled:opacity-50 transition-all"
                                >
                                    Confirm Shipment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Cancel Reason Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95">
                        <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                            <XCircle className="text-rose-500" /> Cancel Order
                        </h3>
                        <p className="text-gray-500 font-medium mb-6 italic text-sm">Please provide a reason for cancelling this order. This will be visible to the customer in their WhatsApp update.</p>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Cancellation Reason</label>
                                <textarea
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    placeholder="e.g. Out of stock, Delivery area not covered, etc."
                                    rows={4}
                                    className="w-full bg-gray-50 border-0 rounded-2xl p-4 font-bold resize-none focus:ring-2 focus:ring-rose-500 transition-all font-sans"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <button
                                    onClick={() => {
                                        setShowCancelModal(false);
                                        setCancelReason("");
                                    }}
                                    className="px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs text-gray-500 hover:bg-gray-100"
                                >
                                    Dismiss
                                </button>
                                <button
                                    onClick={submitCancel}
                                    disabled={!cancelReason}
                                    className="px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-50 transition-all shadow-lg shadow-rose-200"
                                >
                                    Cancel Order
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* Create Order Modal */}
            {
                showCreateModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-end p-0 bg-black/30 backdrop-blur-sm">
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="bg-white h-full w-full max-w-2xl shadow-2xl overflow-y-auto flex flex-col"
                        >
                            <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                        <ShoppingCart className="text-pink-500" /> Create Manual Order
                                    </h3>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">For phone/whatsapp orders</p>
                                </div>
                                <button onClick={() => setShowCreateModal(false)} className="p-3 hover:bg-gray-200 rounded-xl transition-all">
                                    <X size={24} className="text-gray-400" />
                                </button>
                            </div>

                            <div className="p-6 md:p-8 space-y-8 flex-grow">
                                {/* Customer Details */}
                                <section className="space-y-4">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Customer Details</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            placeholder="Name *"
                                            value={createFormData.customer.name}
                                            onChange={e => setCreateFormData(prev => ({ ...prev, customer: { ...prev.customer, name: e.target.value } }))}
                                            className="w-full bg-gray-50 border-0 rounded-xl p-3 font-bold text-sm"
                                        />
                                        <input
                                            placeholder="Mobile *"
                                            value={createFormData.customer.mobile}
                                            onChange={e => setCreateFormData(prev => ({ ...prev, customer: { ...prev.customer, mobile: e.target.value } }))}
                                            className="w-full bg-gray-50 border-0 rounded-xl p-3 font-bold text-sm"
                                        />
                                    </div>
                                    <input
                                        placeholder="Address"
                                        value={createFormData.customer.address}
                                        onChange={e => setCreateFormData(prev => ({ ...prev, customer: { ...prev.customer, address: e.target.value } }))}
                                        className="w-full bg-gray-50 border-0 rounded-xl p-3 font-bold text-sm"
                                    />
                                    <div className="grid grid-cols-3 gap-4">
                                        <input
                                            placeholder="City"
                                            value={createFormData.customer.city}
                                            onChange={e => setCreateFormData(prev => ({ ...prev, customer: { ...prev.customer, city: e.target.value } }))}
                                            className="w-full bg-gray-50 border-0 rounded-xl p-3 font-bold text-sm"
                                        />
                                        <input
                                            placeholder="State"
                                            value={createFormData.customer.state}
                                            onChange={e => setCreateFormData(prev => ({ ...prev, customer: { ...prev.customer, state: e.target.value } }))}
                                            className="w-full bg-gray-50 border-0 rounded-xl p-3 font-bold text-sm"
                                        />
                                        <div className="relative">
                                            <input
                                                placeholder="Pincode"
                                                maxLength={6}
                                                value={createFormData.customer.pincode}
                                                onChange={handlePincodeChange}
                                                className="w-full bg-gray-50 border-0 rounded-xl p-3 font-bold text-sm"
                                            />
                                            {loadingShipping && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-pink-500" size={16} />}
                                        </div>
                                    </div>
                                </section>

                                {/* Products */}
                                <section className="space-y-4">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Products</h4>

                                    {/* Product Search/Add */}
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            placeholder="Search to add product..."
                                            value={productSearch}
                                            onChange={e => setProductSearch(e.target.value)}
                                            className="w-full bg-gray-50 border-0 rounded-xl py-3 pl-10 pr-4 font-bold text-sm focus:ring-2 focus:ring-pink-500"
                                        />
                                        {productSearch && (
                                            <div className="absolute z-10 w-full bg-white mt-2 rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto">
                                                {availableProducts
                                                    .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                                                    .map(product => (
                                                        <div
                                                            key={product.id}
                                                            onClick={() => handleAddItem(product)}
                                                            className="p-3 hover:bg-pink-50 cursor-pointer flex justify-between items-center transition-colors"
                                                        >
                                                            <span className="font-bold text-gray-800 text-sm">{product.name}</span>
                                                            <span className="text-xs font-black text-pink-500">₹{product.offerPricePerPiece || product.pricePerPiece || product.offerPricePerKg || product.pricePerKg}</span>
                                                        </div>
                                                    ))}
                                                {availableProducts.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).length === 0 && (
                                                    <div className="p-3 text-center text-xs text-gray-400">No products found</div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Items List */}
                                    <div className="space-y-3">
                                        {createFormData.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                <div className="flex-grow">
                                                    <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">₹{item.price} / {item.unit}</p>
                                                </div>
                                                <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
                                                    <button onClick={() => handleUpdateItemQuantity(idx, -0.25)} className="p-1 hover:bg-gray-100 rounded"><Minus size={14} /></button>
                                                    <span className="w-8 text-center font-black text-sm">{item.quantity}</span>
                                                    <button onClick={() => handleUpdateItemQuantity(idx, 0.25)} className="p-1 hover:bg-gray-100 rounded"><Plus size={14} /></button>
                                                </div>
                                                <div className="font-black text-gray-900 w-16 text-right">₹{Math.ceil(item.price * item.quantity)}</div>
                                                <button onClick={() => handleRemoveItem(idx)} className="text-gray-400 hover:text-rose-500"><X size={16} /></button>
                                            </div>
                                        ))}
                                        {createFormData.items.length === 0 && (
                                            <div className="text-center py-8 text-gray-300 font-bold text-xs uppercase tracking-widest dashed border border-gray-200 rounded-xl">
                                                Cart is empty
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Payment & Status</h4>
                                    <div className="bg-gray-900 text-white p-6 rounded-2xl space-y-2">
                                        <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            <span>Subtotal</span>
                                            <span>₹{Math.ceil(calculateTotal().subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            <span>Shipping ({createFormData.customer.state || "India"})</span>
                                            <span>₹{calculateTotal().shipping}</span>
                                        </div>
                                        {appliedCoupon && (
                                            <div className="flex justify-between items-center text-xs font-bold text-emerald-400 uppercase tracking-widest">
                                                <span>Discount ({appliedCoupon.code})</span>
                                                <span>-₹{calculateTotal().discountAmount}</span>
                                            </div>
                                        )}
                                        <div className="border-t border-gray-700 my-2 pt-2 flex justify-between items-center">
                                            <span className="font-bold text-sm uppercase tracking-widest text-white">Total Amount</span>
                                            <span className="font-black text-3xl">₹{Math.ceil(calculateTotal().total)}</span>
                                        </div>

                                        {/* Coupon Input */}
                                        <div className="pt-4 flex gap-2">
                                            <input
                                                placeholder="Coupon Code"
                                                value={couponCode}
                                                disabled={!!appliedCoupon}
                                                onChange={e => setCouponCode(e.target.value)}
                                                className="w-full bg-gray-800 border-0 rounded-lg px-3 py-2 text-xs font-bold text-white placeholder-gray-500 uppercase"
                                            />
                                            {appliedCoupon ? (
                                                <button
                                                    onClick={() => {
                                                        setAppliedCoupon(null);
                                                        setCouponCode("");
                                                    }}
                                                    className="bg-red-500 text-white px-3 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-red-600"
                                                >
                                                    Remove
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleApplyCoupon}
                                                    disabled={!couponCode || validatingCoupon}
                                                    className="bg-emerald-500 text-white px-3 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 disabled:opacity-50"
                                                >
                                                    {validatingCoupon ? "..." : "Apply"}
                                                </button>
                                            )}
                                        </div>
                                        {couponError && <p className="text-red-400 text-[10px] font-bold mt-1">{couponError}</p>}
                                    </div>
                                    <div className="flex items-center gap-2 pt-2">
                                        <input
                                            type="checkbox"
                                            checked={createFormData.skipNotification}
                                            onChange={e => setCreateFormData(prev => ({ ...prev, skipNotification: e.target.checked }))}
                                            className="w-4 h-4 rounded text-pink-500 focus:ring-pink-500"
                                        />
                                        <span className="text-xs font-bold text-gray-500">Skip WhatsApp Notification (Silent Order)</span>
                                    </div>
                                </section>
                            </div>

                            <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-100">
                                <button
                                    onClick={handleCreateSubmit}
                                    disabled={creatingOrder}
                                    className="w-full bg-pink-500 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-pink-600 disabled:opacity-70 transition-all shadow-xl shadow-pink-200 flex justify-center items-center gap-2"
                                >
                                    {creatingOrder ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle size={20} />}
                                    Create Order
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )
            }
        </div >
    );
}



