import { shopifyCustomerGraphQL } from "@/lib/shopify/customer/graphql";
import { NextRequest } from "next/server";

import { redirectToAccount, requireCustomerAccessToken } from "../_auth";

const CUSTOMER_UPDATE_MUTATION = `
  mutation CustomerUpdate($customer: CustomerUpdateInput!) {
    customerUpdate(customer: $customer) {
      customer {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

function splitName(fullName: string): { firstName: string | null; lastName: string | null } {
  const value = fullName.trim();
  if (!value) return { firstName: null, lastName: null };
  const parts = value.split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: null };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

export async function POST(request: NextRequest) {
  const session = await requireCustomerAccessToken(request);
  if (!session.ok) return session.response;

  const formData = await request.formData();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const explicitFirstName = String(formData.get("firstName") ?? "").trim();
  const explicitLastName = String(formData.get("lastName") ?? "").trim();
  const explicitDisplayName = String(formData.get("displayName") ?? "").trim();

  const fromFullName = splitName(fullName);
  const firstName = explicitFirstName || fromFullName.firstName || "";
  const lastName = explicitLastName || fromFullName.lastName || "";
  const displayName = explicitDisplayName || fullName || "";

  const customerInput: Record<string, unknown> = {
    firstName: firstName || null,
    lastName: lastName || null,
    displayName: displayName || null,
  };
  if (email) {
    customerInput.emailAddress = email;
  }

  try {
    const result = await shopifyCustomerGraphQL<{
      customerUpdate?: {
        userErrors?: Array<{ message?: string }>;
      };
    }>(session.accessToken, CUSTOMER_UPDATE_MUTATION, {
      customer: customerInput,
    });

    const errorMessage = result.customerUpdate?.userErrors?.[0]?.message;
    const response = redirectToAccount(
      request,
      errorMessage ? { profile_error: errorMessage } : { profile_updated: "1" },
    );
    session.withAuthCookies(response);
    return response;
  } catch (error) {
    const response = redirectToAccount(request, {
      profile_error: error instanceof Error ? error.message : "Unbekannter Fehler",
    });
    session.withAuthCookies(response);
    return response;
  }
}
