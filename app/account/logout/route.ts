import { GET as runCustomerLogout } from "@/app/api/auth/customer/logout/route";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  return runCustomerLogout(request);
}

export async function POST(request: NextRequest) {
  return runCustomerLogout(request);
}
