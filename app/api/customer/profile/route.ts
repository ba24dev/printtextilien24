import { copy } from "@/config/copy";
import { shopifyCustomerGraphQL } from "@/lib/shopify/customer/graphql";
import { NextRequest } from "next/server";

import { redirectToAccount, requireCustomerAccessToken } from "../_auth";

const CUSTOMER_UPDATE_MUTATION = `
  mutation CustomerUpdate($input: CustomerUpdateInput!) {
    customerUpdate(input: $input) {
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
  const explicitFirstName = String(formData.get("firstName") ?? "").trim();
  const explicitLastName = String(formData.get("lastName") ?? "").trim();

  const customerInput: Record<string, unknown> = {
    firstName: explicitFirstName || null,
    lastName: explicitLastName || null,
  };

  try {
    const result = await shopifyCustomerGraphQL<{
      customerUpdate?: {
        userErrors?: Array<{ message?: string }>;
      };
    }>(session.accessToken, CUSTOMER_UPDATE_MUTATION, {
      input: customerInput,
    });

    const errorMessage = result.customerUpdate?.userErrors?.[0]?.message;
    const response = redirectToAccount(
      request,
      errorMessage ? { profile_error: errorMessage } : { profile_updated: "1" },
    );
    await session.withAuthCookies(response);
    return response;
  } catch (error) {
    const response = redirectToAccount(request, {
      profile_error:
        error instanceof Error ? error.message : copy.account.unknownError,
    });
    await session.withAuthCookies(response);
    return response;
  }
}
