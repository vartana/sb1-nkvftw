import { create } from 'zustand';
import { User, PurchaseOrder } from '../types';

interface AppState {
  users: User[];
  purchaseOrders: PurchaseOrder[];
  addUser: (user: User) => void;
  createPurchaseOrder: (recipientEmail: string) => void;
  updatePurchaseOrder: (id: string, data: Partial<PurchaseOrder>) => void;
}

export const useStore = create<AppState>((set) => ({
  users: [],
  purchaseOrders: [],
  addUser: (user) =>
    set((state) => ({ users: [...state.users, user] })),
  createPurchaseOrder: (recipientEmail) =>
    set((state) => ({
      purchaseOrders: [
        ...state.purchaseOrders,
        {
          id: crypto.randomUUID(),
          recipientEmail,
          status: 'new',
          createdAt: new Date(),
          updatedAt: new Date(),
          uniqueLink: `${window.location.origin}/submit/${crypto.randomUUID()}`,
        },
      ],
    })),
  updatePurchaseOrder: (id, data) =>
    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((po) =>
        po.id === id ? { ...po, ...data, updatedAt: new Date() } : po
      ),
    })),
}));