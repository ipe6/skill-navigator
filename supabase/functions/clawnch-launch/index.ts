import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MOLTBOOK_API = "https://www.moltbook.com/api/v1";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { moltbook_key, token_name, token_symbol, wallet, description, image, submolt } = await req.json();

    // Validate required fields
    if (!moltbook_key) {
      return new Response(
        JSON.stringify({ success: false, error: "Moltbook API key is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!token_name || !token_symbol || !wallet || !description || !image) {
      return new Response(
        JSON.stringify({ success: false, error: "All token fields are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 1: Create the launch post on Moltbook
    const postContent = `Launching ${token_name} ($${token_symbol})! 🚀

!clawnch
\`\`\`json
{
  "name": "${token_name}",
  "symbol": "${token_symbol}",
  "wallet": "${wallet}",
  "description": "${description}",
  "image": "${image}"
}
\`\`\``;

    console.log("Creating Moltbook post...");
    
    const postResponse = await fetch(`${MOLTBOOK_API}/posts`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${moltbook_key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        submolt: submolt || "clawnch",
        title: `Launching ${token_name} ($${token_symbol})!`,
        content: postContent,
      }),
    });

    const postData = await postResponse.json();

    if (!postResponse.ok) {
      console.error("Moltbook post creation failed:", postData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: postData.error || "Failed to create Moltbook post",
          details: postData
        }),
        { status: postResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const postId = postData.post?.id;
    if (!postId) {
      return new Response(
        JSON.stringify({ success: false, error: "No post ID returned from Moltbook" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Post created with ID:", postId);

    // Step 2: Call Clawnch launch API
    console.log("Calling Clawnch launch API...");
    
    const launchResponse = await fetch("https://clawn.ch/api/launch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        moltbook_key,
        post_id: postId,
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
          post_id: postId,
          post_url: `https://www.moltbook.com/post/${postId}`
        }),
        { status: launchResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Token launched successfully:", launchData);

    return new Response(
      JSON.stringify(launchData),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Clawnch launch error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
