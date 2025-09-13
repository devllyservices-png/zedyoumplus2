import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import sharp from "sharp"

export const runtime = "nodejs"

type UploadResult = {
  url: string
  pathname: string
  contentType: string
  size: number
}

async function convertImageToPreferredFormat(input: Buffer, contentType: string): Promise<{ data: Buffer; contentType: string; extension: string }> {
  // Prefer AVIF, fallback to WebP
  const image = sharp(input, { failOn: "none" })
  const isLarge = input.byteLength > 1_500_000
  const quality = isLarge ? 65 : 75

  try {
    const avifBuffer = await image.avif({ quality }).toBuffer()
    return { data: avifBuffer, contentType: "image/avif", extension: "avif" }
  } catch {
    const webpBuffer = await sharp(input, { failOn: "none" }).webp({ quality }).toBuffer()
    return { data: webpBuffer, contentType: "image/webp", extension: "webp" }
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN
    if (!token) {
      console.error("/api/upload: Missing BLOB_READ_WRITE_TOKEN env var")
      return NextResponse.json(
        { error: "MISSING_TOKEN", message: "Server misconfiguration: BLOB_READ_WRITE_TOKEN is not set" },
        { status: 500 }
      )
    }

    console.log("/api/upload: Received request")
    const formData = await request.formData()
    console.log("/api/upload: formData loaded")
    const files: File[] = []
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        files.push(value)
      }
    }

    console.log(`/api/upload: files found = ${files.length}`)
    if (files.length === 0) {
      return NextResponse.json({ error: "NO_FILES", message: "No files provided" }, { status: 400 })
    }

    const uploaded: UploadResult[] = []
    for (const file of files) {
      console.log(`/api/upload: processing file name='${file.name}', type='${file.type}', size=${file.size}`)
      try {
        const arrayBuffer = await file.arrayBuffer()
        const inputBuffer = Buffer.from(arrayBuffer)

        const { data, contentType, extension } = await convertImageToPreferredFormat(inputBuffer, file.type || "image/jpeg")
        console.log(`/api/upload: converted -> type='${contentType}', bytes=${data.byteLength}`)

        const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_")
        const timestamp = Date.now()
        const pathname = `services/${timestamp}-${safeName}.${extension}`
        console.log(`/api/upload: uploading to blob '${pathname}'`)

        const { url } = await put(pathname, data, {
          access: "public",
          contentType,
          token,
        })

        console.log(`/api/upload: uploaded url='${url}'`)
        uploaded.push({ url, pathname, contentType, size: data.byteLength })
      } catch (innerError: any) {
        console.error("/api/upload: file failed", { name: file.name, message: innerError?.message, stack: innerError?.stack })
        throw innerError
      }
    }

    return NextResponse.json({ files: uploaded }, { status: 200 })
  } catch (error: any) {
    console.error("/api/upload error", { message: error?.message, stack: error?.stack })
    return NextResponse.json(
      { error: "UPLOAD_FAILED", message: error?.message ?? "Failed to upload images" },
      { status: 500 }
    )
  }
}


