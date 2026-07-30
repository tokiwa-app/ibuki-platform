import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const projectType = searchParams.get("projectType");

    let query = supabase
      .from("projects")
      .select("*")
      .order("updated_at", {
        ascending: false,
      });

    if (projectType) {
      query = query.eq(
        "project_type",
        projectType,
      );
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json(data);

  } catch (e) {

    return NextResponse.json(
      {
        error:
          e instanceof Error
            ? e.message
            : "プロジェクト取得失敗",
      },
      {
        status: 500,
      },
    );
  }
}
