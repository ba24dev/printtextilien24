import { shopifyCustomerGraphQL } from "@/lib/shopify/customer/graphql";
import { NextRequest } from "next/server";

import { redirectToAccount, requireCustomerAccessToken } from "../../_auth";

const ADDRESS_DELETE_MUTATION = `
  mutation AddressDelete($id: ID!) {
    customerAddressDelete(id: $id) {
      deletedAddressId
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
  const addressId = String(formData.get("addressId") ?? "").trim();
  if (!addressId) {
    const response = redirectToAccount(request, { address_error: "Adresse fehlt." });
    session.withAuthCookies(response);
    return response;
  }

  try {
    const result = await shopifyCustomerGraphQL<{
      customerAddressDelete?: {
        userErrors?: Array<{ message?: string }>;
      };
    }>(session.accessToken, ADDRESS_DELETE_MUTATION, {
      id: addressId,
    });

    const errorMessage = result.customerAddressDelete?.userErrors?.[0]?.message;
    const response = redirectToAccount(
      request,
      errorMessage ? { address_error: errorMessage } : { address_updated: "1" },
    );
    session.withAuthCookies(response);
    return response;
  } catch (error) {
    const response = redirectToAccount(request, {
      address_error: error instanceof Error ? error.message : "Unbekannter Fehler",
    });
    session.withAuthCookies(response);
    return response;
  }
}
