import React, { useState, useEffect } from 'react';
import { FileText, Mail, CheckCircle, XCircle, Clock } from 'lucide-react';
import { api } from '../lib/api';
import type { PurchaseOrder } from '../types';

const statusIcons = {
  new: Clock,
  pending: Mail,
  approved: CheckCircle,
  rejected: XCircle,
};

const statusColors = {
  new: 'text-gray-600 bg-gray-100',
  pending: 'text-yellow-600 bg-yellow-100',
  approved: 'text-green-600 bg-green-100',
  rejected: 'text-red-600 bg-red-100',
};

export function PurchaseOrders() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [showRejectForm, setShowRejectForm] = useState<string | null>(null);
  const [rejectionComment, setRejectionComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPurchaseOrders();
  }, []);

  const loadPurchaseOrders = async () => {
    try {
      const data = await api.purchaseOrders.list();
      setPurchaseOrders(data);
    } catch (err) {
      setError('Failed to load purchase orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newPO = await api.purchaseOrders.create({ recipientEmail: email });
      setPurchaseOrders([...purchaseOrders, newPO]);
      setEmail('');
      setShowForm(false);
    } catch (err) {
      setError('Failed to create purchase order');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.purchaseOrders.update(id, { status: 'approved' });
      setPurchaseOrders(
        purchaseOrders.map((po) =>
          po.id === id ? { ...po, status: 'approved' } : po
        )
      );
    } catch (err) {
      setError('Failed to approve purchase order');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.purchaseOrders.update(id, {
        status: 'rejected',
        rejectionComment,
      });
      setPurchaseOrders(
        purchaseOrders.map((po) =>
          po.id === id
            ? { ...po, status: 'rejected', rejectionComment }
            : po
        )
      );
      setShowRejectForm(null);
      setRejectionComment('');
    } catch (err) {
      setError('Failed to reject purchase order');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Purchase Orders</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage and track purchase order requests
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            <FileText className="w-4 h-4 mr-2" />
            New Request
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {showForm && (
        <div className="mt-4 bg-white p-4 rounded-lg shadow">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Recipient Email
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </label>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Create Request
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                      Recipient
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Created
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {purchaseOrders.map((po) => {
                    const StatusIcon = statusIcons[po.status];
                    return (
                      <tr key={po.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                          {po.recipientEmail}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              statusColors[po.status]
                            }`}
                          >
                            <StatusIcon className="mr-1 h-4 w-4" />
                            {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(po.createdAt).toLocaleDateString()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          {po.status === 'pending' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleApprove(po.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => setShowRejectForm(po.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {showRejectForm === po.id && (
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
                              <div className="bg-white p-4 rounded-lg shadow-xl max-w-md w-full">
                                <h3 className="text-lg font-medium mb-4">
                                  Rejection Reason
                                </h3>
                                <textarea
                                  value={rejectionComment}
                                  onChange={(e) => setRejectionComment(e.target.value)}
                                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                  rows={3}
                                />
                                <div className="mt-4 flex justify-end space-x-2">
                                  <button
                                    onClick={() => setShowRejectForm(null)}
                                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleReject(po.id)}
                                    className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-500"
                                  >
                                    Confirm Rejection
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}