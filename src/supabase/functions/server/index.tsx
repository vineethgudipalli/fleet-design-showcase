import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-1153dc8c/health", (c) => {
  return c.json({ status: "ok" });
});

// ==================== WORK ENDPOINTS ====================

// Get all work items
app.get("/make-server-1153dc8c/work", async (c) => {
  try {
    const works = await kv.getByPrefix("work:");
    const workList = works.map((item: any) => ({
      ...item.value,
      id: item.key.replace("work:", ""),
    }));
    
    // Sort by created_at descending
    workList.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    return c.json({ works: workList });
  } catch (error) {
    console.error("Error fetching work items:", error);
    return c.json({ error: "Failed to fetch work items" }, 500);
  }
});

// Get single work item by ID
app.get("/make-server-1153dc8c/work/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const work = await kv.get(`work:${id}`);
    
    if (!work) {
      return c.json({ error: "Work item not found" }, 404);
    }
    
    return c.json({ work: { ...work, id } });
  } catch (error) {
    console.error("Error fetching work item:", error);
    return c.json({ error: "Failed to fetch work item" }, 500);
  }
});

// Create new work item
app.post("/make-server-1153dc8c/work", async (c) => {
  try {
    const body = await c.req.json();
    const {
      title,
      figma_link,
      thumbnail_url,
      figma_file_id,
      embed_url,
      problem_summary,
      video_url,
      experience,
      persona,
      author_name,
      author_avatar,
    } = body;

    if (!title || !figma_link) {
      return c.json({ error: "Title and figma_link are required" }, 400);
    }

    const id = crypto.randomUUID();
    const workItem = {
      title,
      figma_link,
      thumbnail_url,
      figma_file_id,
      embed_url,
      problem_summary: problem_summary || "",
      video_url: video_url || null,
      experience: experience || "all",
      persona: persona || "all",
      author_name: author_name || "Unknown Author",
      author_avatar: author_avatar || null,
      status: "active",
      view_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await kv.set(`work:${id}`, workItem);
    
    return c.json({ work: { ...workItem, id } }, 201);
  } catch (error) {
    console.error("Error creating work item:", error);
    return c.json({ error: "Failed to create work item" }, 500);
  }
});

// Update work item
app.put("/make-server-1153dc8c/work/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    
    const existingWork = await kv.get(`work:${id}`);
    if (!existingWork) {
      return c.json({ error: "Work item not found" }, 404);
    }

    const updatedWork = {
      ...existingWork,
      ...body,
      updated_at: new Date().toISOString(),
    };

    await kv.set(`work:${id}`, updatedWork);
    
    return c.json({ work: { ...updatedWork, id } });
  } catch (error) {
    console.error("Error updating work item:", error);
    return c.json({ error: "Failed to update work item" }, 500);
  }
});

// Delete work item
app.delete("/make-server-1153dc8c/work/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    // Delete work item
    await kv.del(`work:${id}`);
    
    // Delete associated reactions
    const reactions = await kv.getByPrefix(`reaction:${id}:`);
    for (const reaction of reactions) {
      await kv.del(reaction.key);
    }
    
    // Delete associated comments
    const comments = await kv.getByPrefix(`comment:${id}:`);
    for (const comment of comments) {
      await kv.del(comment.key);
    }
    
    return c.json({ message: "Work item deleted successfully" });
  } catch (error) {
    console.error("Error deleting work item:", error);
    return c.json({ error: "Failed to delete work item" }, 500);
  }
});

// ==================== REACTIONS ENDPOINTS ====================

// Get reactions for a work item
app.get("/make-server-1153dc8c/work/:workId/reactions", async (c) => {
  try {
    const workId = c.req.param("workId");
    const reactions = await kv.getByPrefix(`reaction:${workId}:`);
    
    // Aggregate reactions by type
    const aggregated = {
      heart: { type: "heart", count: 0, userReacted: false },
      like: { type: "like", count: 0, userReacted: false },
      idea: { type: "idea", count: 0, userReacted: false },
    };
    
    reactions.forEach((item: any) => {
      const reactionType = item.value.reaction_type;
      if (aggregated[reactionType as keyof typeof aggregated]) {
        aggregated[reactionType as keyof typeof aggregated].count++;
      }
    });
    
    return c.json({ reactions: aggregated });
  } catch (error) {
    console.error("Error fetching reactions:", error);
    return c.json({ error: "Failed to fetch reactions" }, 500);
  }
});

// Toggle reaction (add or remove)
app.post("/make-server-1153dc8c/work/:workId/reactions", async (c) => {
  try {
    const workId = c.req.param("workId");
    const body = await c.req.json();
    const { reaction_type, user_id } = body;

    if (!reaction_type || !user_id) {
      return c.json({ error: "reaction_type and user_id are required" }, 400);
    }

    const reactionKey = `reaction:${workId}:${user_id}`;
    const existingReaction = await kv.get(reactionKey);

    if (existingReaction) {
      // If same reaction type, remove it (toggle off)
      if (existingReaction.reaction_type === reaction_type) {
        await kv.del(reactionKey);
        return c.json({ message: "Reaction removed", removed: true });
      } else {
        // Update to new reaction type
        await kv.set(reactionKey, {
          reaction_type,
          work_id: workId,
          user_id,
          created_at: new Date().toISOString(),
        });
        return c.json({ message: "Reaction updated", removed: false });
      }
    } else {
      // Add new reaction
      await kv.set(reactionKey, {
        reaction_type,
        work_id: workId,
        user_id,
        created_at: new Date().toISOString(),
      });
      return c.json({ message: "Reaction added", removed: false });
    }
  } catch (error) {
    console.error("Error toggling reaction:", error);
    return c.json({ error: "Failed to toggle reaction" }, 500);
  }
});

// ==================== COMMENTS ENDPOINTS ====================

// Get comments for a work item
app.get("/make-server-1153dc8c/work/:workId/comments", async (c) => {
  try {
    const workId = c.req.param("workId");
    const comments = await kv.getByPrefix(`comment:${workId}:`);
    
    const commentList = comments.map((item: any) => ({
      ...item.value,
      id: item.key.split(":")[2],
    }));
    
    // Sort by created_at ascending
    commentList.sort((a: any, b: any) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    return c.json({ comments: commentList });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return c.json({ error: "Failed to fetch comments" }, 500);
  }
});

// Add comment to work item
app.post("/make-server-1153dc8c/work/:workId/comments", async (c) => {
  try {
    const workId = c.req.param("workId");
    const body = await c.req.json();
    const { author, content } = body;

    if (!author || !content) {
      return c.json({ error: "author and content are required" }, 400);
    }

    const commentId = crypto.randomUUID();
    const comment = {
      author_name: author,
      content,
      work_id: workId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await kv.set(`comment:${workId}:${commentId}`, comment);
    
    return c.json({ comment: { ...comment, id: commentId } }, 201);
  } catch (error) {
    console.error("Error creating comment:", error);
    return c.json({ error: "Failed to create comment" }, 500);
  }
});

// ==================== ADMIN SETTINGS ENDPOINTS ====================

// Get Figma API token
app.get("/make-server-1153dc8c/settings/figma-token", async (c) => {
  try {
    const token = await kv.get("settings:figma_token");
    return c.json({ token: token || "" });
  } catch (error) {
    console.error("Error fetching Figma token:", error);
    return c.json({ error: "Failed to fetch Figma token" }, 500);
  }
});

// Set Figma API token
app.post("/make-server-1153dc8c/settings/figma-token", async (c) => {
  try {
    const body = await c.req.json();
    const { token } = body;

    await kv.set("settings:figma_token", token);
    
    return c.json({ message: "Figma token saved successfully" });
  } catch (error) {
    console.error("Error saving Figma token:", error);
    return c.json({ error: "Failed to save Figma token" }, 500);
  }
});

// ==================== FIGMA API PROXY ENDPOINTS ====================

// Get user's Figma files (requires token)
app.post("/make-server-1153dc8c/figma/user-files", async (c) => {
  try {
    const body = await c.req.json();
    const { token } = body;

    if (!token) {
      return c.json({ error: "Figma token is required" }, 400);
    }

    // Get user's files from Figma API
    const response = await fetch("https://api.figma.com/v1/files/recent", {
      headers: {
        "X-Figma-Token": token,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Figma API error:", response.status, errorText);
      return c.json({ error: "Failed to fetch files from Figma" }, response.status);
    }

    const data = await response.json();
    return c.json(data);
  } catch (error) {
    console.error("Error fetching Figma files:", error);
    return c.json({ error: "Failed to fetch Figma files" }, 500);
  }
});

// Get Figma file details
app.post("/make-server-1153dc8c/figma/file-details", async (c) => {
  try {
    const body = await c.req.json();
    const { token, fileKey } = body;

    if (!token || !fileKey) {
      return c.json({ error: "Token and fileKey are required" }, 400);
    }

    // Get file details
    const fileResponse = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
      headers: {
        "X-Figma-Token": token,
      },
    });

    if (!fileResponse.ok) {
      const errorText = await fileResponse.text();
      console.error("Figma API error:", fileResponse.status, errorText);
      return c.json({ error: "Failed to fetch file details from Figma" }, fileResponse.status);
    }

    const fileData = await fileResponse.json();

    // Get thumbnail
    const thumbnailResponse = await fetch(
      `https://api.figma.com/v1/images/${fileKey}?ids=${fileData.document.id}&format=png&scale=2`,
      {
        headers: {
          "X-Figma-Token": token,
        },
      }
    );

    let thumbnail = "";
    if (thumbnailResponse.ok) {
      const thumbnailData = await thumbnailResponse.json();
      thumbnail = thumbnailData.images[fileData.document.id] || "";
    }

    const result = {
      id: fileData.document.id,
      name: fileData.name,
      description: fileData.description || "",
      thumbnail,
      embedUrl: `https://www.figma.com/embed?embed_host=share&url=https://www.figma.com/file/${fileKey}`,
      lastModified: fileData.lastModified,
      version: fileData.version,
      fileKey: fileKey,
      author: fileData.creator?.handle || fileData.creator?.name || "Unknown Author",
    };

    return c.json(result);
  } catch (error) {
    console.error("Error fetching Figma file details:", error);
    return c.json({ error: "Failed to fetch file details" }, 500);
  }
});

Deno.serve(app.fetch);