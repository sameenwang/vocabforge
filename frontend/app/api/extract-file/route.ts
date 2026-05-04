import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file")
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "未找到文件" }, { status: 400 })
    }

    const backendForm = new FormData()
    backendForm.append("file", file, file.name)

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000"
    const res = await fetch(`${backendUrl}/api/extract-file`, {
      method: "POST",
      body: backendForm,
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "文件解析失败" }, { status: 500 })
  }
}
