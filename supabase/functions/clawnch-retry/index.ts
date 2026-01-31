import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { moltbook_key, post_id } = await req.json();

    // Validate required fields
    if (!moltbook_key) {
      return new Response(
        JSON.stringify({ success: false, error: "Moltbook API key is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!post_id) {
      return new Response(
        JSON.stringify({ success: false, error: "Post ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call Clawnch launch API directly with existing post
    console.log("Retrying Clawnch launch with existing post:", post_id);
    
    const launchResponse = await fetch("https://clawn.ch/api/launch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        moltbook_key,
        post_id,
      }),
    });

    const launchData = await launchResponse.json();

    if (!launchResponse.ok) {
      console.error("Clawnch launch failed:", launchData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: launchData.error || "Failed to launch token",
          errors: launchData.errors,
          http_status: launchResponse.status,
          post_id: post_id,
          post_url: `https://www.moltbook.com/post/${post_id}`
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Token launched successfully:", launchData);

    return new Response(
      JSON.stringify(launchData),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Clawnch retry error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
