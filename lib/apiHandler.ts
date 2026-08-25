import { NextResponse } from "next/server";

export function withErrorHandling<Args extends unknown[]>(
  handler: (...args: Args) => Promise<NextResponse>
) {
  return async (...args: Args): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (err) {
      console.error(err);
      return NextResponse.json(
        { error: "Something went wrong, please try again" },
        { status: 500 }
      );
    }
  };
}
