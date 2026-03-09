import { copy } from "@/config/copy";
import { shopifyCustomerGraphQL } from "@/lib/shopify/customer/graphql";
import { NextRequest } from "next/server";

import { redirectToAccount, requireCustomerAccessToken } from "../../_auth";

const ADDRESS_CREATE_MUTATION = `
  mutation AddressCreate($address: CustomerAddressInput!, $defaultAddress: Boolean) {
    customerAddressCreate(address: $address, defaultAddress: $defaultAddress) {
      customerAddress {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

function getAddressPayload(formData: FormData) {
  return {
    firstName: String(formData.get("firstName") ?? "").trim() || null,
    lastName: String(formData.get("lastName") ?? "").trim() || null,
    address1: String(formData.get("address1") ?? "").trim() || null,
    address2: String(formData.get("address2") ?? "").trim() || null,
    city: String(formData.get("city") ?? "").trim() || null,
    zip: String(formData.get("zip") ?? "").trim() || null,
    territoryCode: String(formData.get("territoryCode") ?? "").trim() || null,
    zoneCode: String(formData.get("zoneCode") ?? "").trim() || null,
    phoneNumber: String(formData.get("phoneNumber") ?? "").trim() || null,
  };
}

export async function POST(request: NextRequest) {
  const session = await requireCustomerAccessToken(request);
  if (!session.ok) return session.response;

  const formData = await request.formData();
  const defaultAddress = String(formData.get("defaultAddress") ?? "") === "on";

  try {
    const result = await shopifyCustomerGraphQL<{
      customerAddressCreate?: {
        userErrors?: Array<{ message?: string }>;
      };
    }>(session.accessToken, ADDRESS_CREATE_MUTATION, {
      address: getAddressPayload(formData),
      defaultAddress,
    });

    const errorMessage = result.customerAddressCreate?.userErrors?.[0]?.message;
    const response = redirectToAccount(
      request,
      errorMessage ? { address_error: errorMessage } : { address_updated: "1" },
    );
    session.withAuthCookies(response);
    return response;
  } catch (error) {
    const response = redirectToAccount(request, {
      address_error:
        error instanceof Error ? error.message : copy.account.unknownError,
    });
    session.withAuthCookies(response);
    return response;
  }
}
