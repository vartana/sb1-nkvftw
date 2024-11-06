export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
};

export type PurchaseOrderStatus = 'new' | 'pending' | 'approved' | 'rejected';

export type PurchaseOrder = {
  id: string;
  recipientEmail: string;
  status: PurchaseOrderStatus;
  companyName?: string;
  ein?: string;
  fullName?: string;
  address?: string;
  companyPhone?: string;
  directPhone?: string;
  files?: {
    ato?: File;
    tpt?: File;
    w9?: File;
    form5000a?: File;
  };
  rejectionComment?: string;
  createdAt: Date;
  updatedAt: Date;
  uniqueLink: string;
};