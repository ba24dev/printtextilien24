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

export async function POST(request: NextRequest) {
  const session = await requireCustomerAccessToken(request);
  if (!session.ok) return session.response;

  const formData = await request.formData();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const displayName = String(formData.get("displayName") ?? "").trim();

  try {
    const result = await shopifyCustomerGraphQL<{
      customerUpdate?: {
        userErrors?: Array<{ message?: string }>;
      };
    }>(session.accessToken, CUSTOMER_UPDATE_MUTATION, {
      customer: {
        firstName: firstName || null,
        lastName: lastName || null,
        displayName: displayName || null,
      },
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
