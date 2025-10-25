import { NextRequest, NextResponse } from "next/server";
import { getSubscriptionPlans } from "@/server/queries/organization";
import {
  addOrganizationSubscription,
  AddOrganizationSubscriptionSchema,
} from "@/server/queries/subscriptions";

export async function GET() {
  try {
    const result = await getSubscriptionPlans();

    return NextResponse.json({
      success: true,
      data: result,
      message: "Subscriptions fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Failed to fetch questions",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = AddOrganizationSubscriptionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const result = await addOrganizationSubscription(validationResult.data);

    return NextResponse.json({
      success: true,
      data: result,
      message: "Subscriptions fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Failed to fetch questions",
      },
      { status: 500 }
    );
  }
}
