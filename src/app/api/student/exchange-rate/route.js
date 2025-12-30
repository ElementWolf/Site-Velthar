import { NextResponse } from "next/server";
import { getExchangeRate } from "../../data-handler";

export async function GET(req) {
    return NextResponse.json({ rate: await getExchangeRate() });
}
