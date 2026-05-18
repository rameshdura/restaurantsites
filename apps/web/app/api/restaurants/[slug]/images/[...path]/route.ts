import { NextRequest, NextResponse } from "next/server"
import fs from "node:fs/promises"
import path from "node:path"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; path: string[] }> }
) {
  const { slug, path: imagePathParts } = await params
  const imagePath = imagePathParts.join("/")

  try {
    // Construct the absolute path to the image in the restaurants directory
    const filePath = path.join(
      process.cwd(),
      "restaurants",
      slug,
      "images",
      imagePath
    )

    // Verify the file exists
    const fileBuffer = await fs.readFile(filePath)

    // Determine the content type based on extension
    const ext = path.extname(imagePath).toLowerCase()
    const contentType = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
      ".ico": "image/x-icon",
      ".pdf": "application/pdf",
    }[ext] || "application/octet-stream"

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error(`[Image API] Error serving image ${imagePath} for ${slug}:`, error)
    return new NextResponse("Image not found", { status: 404 })
  }
}
