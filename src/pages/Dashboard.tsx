import React from 'react';
import { useStore } from '../store';
import { BarChart, Users as UsersIcon, FileText } from 'lucide-react';

export function Dashboard() {
  const { users, purchaseOrders } = useStore();

  const stats = [
    {
      name: 'Total Users',
      value: users.length,
      icon: UsersIcon,
      change: '+4.75%',
      color: 'text-green-600',
    },
    {
      name: 'Purchase Orders',
      value: purchaseOrders.length,
      icon: FileText,
      change: '+54.02%',
      color: 'text-blue-600',
    },
    {
      name: 'Pending Approvals',
      value: purchaseOrders.filter((po) => po.status === 'pending').length,
      icon: BarChart,
      change: '-1.39%',
      color: 'text-yellow-600',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-12 shadow sm:px-6 sm:pt-6"
          >
            <dt>
              <div className={`absolute rounded-md p-3 ${item.color} bg-opacity-10`}>
                <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">
                {item.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
              <p
                className={`ml-2 flex items-baseline text-sm font-semibold ${
                  item.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {item.change}
              </p>
            </dd>
          </div>
        ))}
      </div>
    </div>
  );
}