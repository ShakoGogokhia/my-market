import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from '@/translation';
import { toast } from 'sonner';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Header from "@/components/Header";
import Footer from "@/components/Footer";


export default function CurrentOrders() {
  const { t } = useTranslation(); 
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    setLoading(true);
    axios
      .get('/user/orders?status[]=pending&status[]=declined')
      .then((res) => setOrders(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  const handleCancel = async (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    if (order.status !== 'pending') {
      toast.warning(t('body.orders.cancelWarning')); 
      return;
    }

    try {
      await axios.delete(`/user/orders/${orderId}`);
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
      toast.success(t('body.orders.cancelSuccess', { id: orderId })); 
    } catch (err) {
      console.error('Cancel failed:', err.message);
      toast.error(t('body.orders.cancelError')); 
    }
  };

  const toggleExpand = (orderId) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  if (loading) return <p className="text-gray-500">{t('body.orders.loading')}</p>;
  if (error) return <p className="text-red-500 font-medium">{t('body.orders.error')} {error}</p>;

  return (
                <>
  <Header 
  />
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg mb-100">
      <Breadcrumb className="mb-10">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">{t('body.energy.backToProducts')}</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{t('body.nav.currentOrders')}</BreadcrumbPage>
          

        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
      <h2 className="text-xl sm:text-2xl font-bold text-green-700 mb-4 sm:mb-6">
        {t('body.orders.currentTitle')}
      </h2>

      {orders.length === 0 ? (
        <p className="text-gray-500">{t('body.orders.noOrders')}</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => (
            <li
              key={o.id}
              className="bg-green-50  border border-green-200  rounded-xl p-4 sm:p-5 transition hover:shadow-md"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="text-green-700  font-semibold text-lg mb-1">
                    {t('body.orders.order')} #{o.id} <span className="text-sm">({o.status})</span>
                  </div>
                  <div className="text-gray-700 ">
                    {t('body.orders.amount')}: {o.total_amount} ₾
                  </div>
                  <div className="text-gray-500  text-sm">
                    {t('body.orders.date')}: {new Date(o.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => toggleExpand(o.id)}
                    className="px-3 py-1 bg-green-700 text-white rounded-md text-sm hover:bg-green-800 transition w-full sm:w-auto"
                  >
                    {t('body.orders.details')}
                  </button>
                  <button
                    onClick={() => handleCancel(o.id)}
                    disabled={o.status !== 'pending'}
                    className={`px-3 py-1 text-white rounded-md text-sm transition w-full sm:w-auto ${
                      o.status !== 'pending'
                        ? 'bg-red-300 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {t('body.orders.cancel')}
                  </button>
                </div>
              </div>

              {expandedOrderId === o.id && (
                <div className="mt-4 text-sm text-gray-600 ">
                  <p>{t('body.orders.orderDetails')}:</p>
                  <ul className="list-disc list-inside">
                    <li>{t('body.orders.status')}: {o.status}</li>
                    <li>{t('body.orders.totalAmount')}: {o.total_amount} ₾</li>
                    <li>{t('body.orders.creationTime')}: {new Date(o.created_at).toLocaleString()}</li>
                  </ul>

                  <div className="mt-4">
                    <h4 className="font-semibold">{t('body.orders.orderItems')}</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full mt-2 text-sm">
                        <thead>
                          <tr>
                            <th className="px-4 py-2 text-left">{t('body.orders.productImage')}</th>
                            <th className="px-4 py-2 text-left">{t('body.orders.productName')}</th>
                            <th className="px-4 py-2 text-left">{t('body.orders.price')}</th>
                            <th className="px-4 py-2 text-left">{t('body.orders.quantity')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {o.order_items?.map((item) => (
                            <tr key={item.id}>
                              <td className="px-4 py-2">
                                <img
                                  src={item.product_image}
                                  alt={item.product_name}
                                  className="w-16 h-16 object-cover rounded"
                                />
                              </td>
                              <td className="px-4 py-2">{item.product_name}</td>
                              <td className="px-4 py-2">{item.product_price} ₾</td>
                              <td className="px-4 py-2">{item.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
              <Footer/>
    </>
  );
}
