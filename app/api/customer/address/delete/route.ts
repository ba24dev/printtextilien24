import { copy } from "@/config/copy";
import { shopifyCustomerGraphQL } from "@/lib/shopify/customer/graphql";
import { NextRequest } from "next/server";

import { redirectToAccount, requireCustomerAccessToken } from "../../_auth";

const ADDRESS_DELETE_MUTATION = `
  mutation AddressDelete($addressId: ID!) {
    customerAddressDelete(addressId: $addressId) {
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
    const response = redirectToAccount(request, {
      address_error: copy.account.missingAddress,
    });
    await session.withAuthCookies(response);
    return response;
  }

  try {
    const result = await shopifyCustomerGraphQL<{
      customerAddressDelete?: {
        userErrors?: Array<{ message?: string }>;
      };
    }>(session.accessToken, ADDRESS_DELETE_MUTATION, {
      addressId,
    });

    const errorMessage = result.customerAddressDelete?.userErrors?.[0]?.message;
    const response = redirectToAccount(
      request,
      errorMessage ? { address_error: errorMessage } : { address_updated: "1" },
    );
    await session.withAuthCookies(response);
    return response;
  } catch (error) {
    const response = redirectToAccount(request, {
      address_error:
        error instanceof Error ? error.message : copy.account.unknownError,
    });
    await session.withAuthCookies(response);
    return response;
  }
}
