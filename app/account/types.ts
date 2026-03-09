export type AccountAddress = {
  id?: string;
  firstName?: string | null;
  lastName?: string | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  zip?: string | null;
  territoryCode?: string | null;
  zoneCode?: string | null;
  formatted?: string[] | null;
  phoneNumber?: string | null;
};

export type AccountCustomer = {
  id?: string;
  displayName?: string | null;
  email?: string | null;
  phoneNumber?: { phoneNumber?: string | null } | null;
  imageUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  defaultAddress?: {
    id?: string;
    phoneNumber?: string | null;
  } | null;
  addresses?: {
    nodes?: AccountAddress[];
  } | null;
};

export type AccountOrder = {
  id: string;
  name: string;
  processedAt: string;
  statusPageUrl?: string | null;
  financialStatus?: string | null;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  totalPrice: {
    amount: string;
    currencyCode: string;
  };
  lineItems?: {
    nodes?: Array<{
      title: string;
      quantity: number;
    }>;
  };
};

export type AccountApiResponse = {
  customer?: AccountCustomer;
  orders?: {
    edges?: Array<{ node: AccountOrder }>;
  };
  error?: string;
};
