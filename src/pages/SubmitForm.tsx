import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
import { api } from '../lib/api';
import type { PurchaseOrder } from '../types';

export function SubmitForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    ein: '',
    fullName: '',
    address: '',
    companyPhone: '',
    directPhone: '',
    files: {
      ato: null as File | null,
      tpt: null as File | null,
      w9: null as File | null,
      form5000a: null as File | null,
    },
  });

  useEffect(() => {
    loadPurchaseOrder();
  }, [id]);

  const loadPurchaseOrder = async () => {
    try {
      const orders = await api.purchaseOrders.list();
      const order = orders.find((po: PurchaseOrder) => po.uniqueLink.includes(id!));
      if (order) {
        setPurchaseOrder(order);
        if (order.companyName) {
          setFormData({
            ...formData,
            companyName: order.companyName,
            ein: order.ein || '',
            fullName: order.fullName || '',
            address: order.address || '',
            companyPhone: order.companyPhone || '',
            directPhone: order.directPhone || '',
          });
        }
      }
    } catch (err) {
      setError('Failed to load purchase order');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseOrder) return;

    setSubmitting(true);
    try {
      // First update the purchase order details
      await api.purchaseOrders.update(purchaseOrder.id, {
        ...formData,
        status: 'pending',
      });

      // Then upload the files if any are present
      const filesToUpload = Object.entries(formData.files).filter(([, file]) => file);
      if (filesToUpload.length > 0) {
        await api.purchaseOrders.uploadFiles(
          purchaseOrder.id,
          Object.fromEntries(filesToUpload)
        );
      }

      // Redirect to success page
      navigate(`/submit/success`);
    } catch (err) {
      setError('Failed to submit purchase order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileType: keyof typeof formData.files
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        files: {
          ...prev.files,
          [fileType]: file,
        },
      }));
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!purchaseOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Invalid Link</h1>
          <p className="mt-2 text-gray-600">
            This purchase order request link is invalid or has expired.
          </p>
        </div>
      </div>
    );
  }

  if (purchaseOrder.status === 'approved') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-green-600">Approved</h1>
          <p className="mt-2 text-gray-600">
            This purchase order has been approved. No further action is needed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-8">
              Submit Purchase Order
            </h1>

            {error && (
              <div className="mb-6 rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {purchaseOrder.status === 'rejected' && (
              <div className="mb-6 rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Previous submission was rejected
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{purchaseOrder.rejectionComment}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Company Name
                    <input
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          companyName: e.target.value,
                        }))
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    EIN
                    <input
                      type="text"
                      required
                      value={formData.ein}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, ein: e.target.value }))
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          fullName: e.target.value,
                        }))
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Address
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Company Phone
                    <input
                      type="tel"
                      required
                      value={formData.companyPhone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          companyPhone: e.target.value,
                        }))
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Direct Contact Phone
                    <input
                      type="tel"
                      required
                      value={formData.directPhone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          directPhone: e.target.value,
                        }))
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-6">
                {(['ato', 'tpt', 'w9', 'form5000a'] as const).map((fileType) => (
                  <div key={fileType}>
                    <label className="block text-sm font-medium text-gray-700">
                      {fileType.toUpperCase()} Document
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500">
                              <span>Upload {fileType.toUpperCase()} file</span>
                              <input
                                type="file"
                                required
                                className="sr-only"
                                onChange={(e) => handleFileChange(e, fileType)}
                              />
                            </label>
                          </div>
                          {formData.files[fileType] && (
                            <p className="text-sm text-gray-500">
                              {formData.files[fileType]?.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Purchase Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}