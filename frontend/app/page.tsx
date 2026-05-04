"use client"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  AIRobot,
  BookIllustration,
  WordBubble,
  SparkleIcon,
  MagicWand,
} from "@/components/illustrations"
import {
  Upload,
  Sparkles,
  ArrowRight,
  RotateCcw,
  FileDown,
  FileText,
  X,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  PenLine,
} from "lucide-react"
import { cn } from "@/lib/utils"

const FILE_FORMATS = [
  { label: "PDF", ext: ".pdf", color: "text-red-600 bg-red-50 border-red-200" },
  { label: "Word", ext: ".docx", color: "text-blue-600 bg-blue-50 border-blue-200" },
  { label: "Excel", ext: ".xlsx", color: "text-green-600 bg-green-50 border-green-200" },
  { label: "TXT", ext: ".txt", color: "text-gray-600 bg-gray-50 border-gray-200" },
  { label: "MD", ext: ".md", color: "text-purple-600 bg-purple-50 border-purple-200" },
] as const

const SAMPLE_DIALOGUES = `When you find that one person who connects you to the world, you become someone different, someone better.
当你找到你在这个世上的羁绊你就变了变得更好 00:08
When that person is taken from you...
而当这个人从你身边被夺走 00:21
what do you become then?
那你又会变得怎样 00:27
Whatever he wanna do, you know?
管他想怎么样 00:36
Where'd you get that, in a cereal box?
哪弄来的买麦片送的吗 00:42
You wanna see a real gun?
想见识一下真家伙吗 00:44
Forget you.
算了吧 00:47
You didn't bring enough for the whole group.
你带的酒不够大家喝啊 01:18
I have to teach you about sharing.
我得教教你学会分享 01:21
I'll need a statement from the bum.
给那个流浪汉录口供 02:03
Which hospital did they take him to?
他们带他去了哪家医院 02:05
He declined treatment.
他不肯接受治疗 02:06
We got video on it, though.
但我们拿到了监控录像 02:07
You know, you could have done me a favor and let those guys land a couple more punches.
你要是多揍那些小子几拳也算是帮我忙了 02:13
Question for you.
问你个问题 02:34
Looking at that tape, I'd say you spent some time in the service.
从录像来看我觉得你是当过兵的人 02:36
But you don't learn how to fight like that in the regular army.
但在常规部队可练不出这身手 02:41
So what were you, special forces?
那你是特种部队的吗 02:45
I'm Carter. You didn't give us a name.
我是卡特你没说你的名字 02:51
You know, it's funny.
真有意思 02:57
Seems like the only time you need a name now is when you're in trouble.
只有在你有麻烦的时候别人才会问起你的名字 02:58
So am I in trouble?
这么说我是有麻烦了吗 03:03
You're the one living on the street.
露宿街头的可是你 03:08
Yeah, making that transition back can be tough.
这种转变是很不容易 03:13
Some guys I knew got a little lost, needed a little help adjusting.
我认识一些人他们感到迷茫需要人来帮他们适应社会 03:18
You need some help?
你需要帮助吗 03:24
I know exactly everything about you, Mr. Reese.
你的事我全都知道里瑟先生 05:42
I know about the work you used to do for the government.
我知道你从前为政府做的工作 05:45
I know about the doubts you came to have about that work.
我知道你对此产生了疑虑 05:49
I know you've spent the last couple of months trying to drink yourself to death.
我知道你过去的两个月里想把自己浸死在酒精里 05:58
So you see, knowledge is not my problem.
所以说搜集信息对我不成问题 06:07
And you can call me Mr. Finch.
你可以叫我芬奇先生 06:19
I don't think you need a psychiatrist or a support group, pills...
我觉得你不需要心理医生互助小组或是药物 06:28
What do I need?
那我需要什么 06:33
You need a purpose.
你需要一个目标 06:34
More specifically, you need a job.
具体点说你需要一份工作 06:38
Someone is murdered in New York city every 18 hours.
每十八个小时纽约就会有一个人遇害 06:56
I've got a list.
我有张名单 07:23
A list of people who are about to be involved in very bad situations.
名单上的人都将被牵连到某种危险情况中 07:26
Most of them are just ordinary people like her.
他们大多只是普通人 07:36`

const SAMPLE_WORDS = `connect
whole
let
service
owe
role
police
trust
private
lead
search
machine
track
disappear
security
scene
client
print
either
probably
purpose
ordinary
involved
figure
victim
perpetrator
former
doubt
contemplate
efficient
specific
murder
kidnap
homeless
identify
nationwide
adjust
transition`

function highlightHtml(text: string): string {
  return text
    .replace(
      /==\*\*(.+?)\*\*==/g,
      '<mark class="bg-yellow-200 dark:bg-yellow-900/60 px-0.5 rounded font-semibold">$1</mark>',
    )
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>")
}

function parseTable(markdown: string) {
  const lines = markdown.split("\n")
  const rows: { left: string; right: string }[] = []
  let inTable = false

  for (const line of lines) {
    const t = line.trim()
    if (!t.startsWith("|") || !t.endsWith("|")) {
      if (inTable) break
      continue
    }
    if (t.includes("---")) continue
    if (t.includes("台词") && t.includes("单词")) continue
    inTable = true

    const parts = t.split("|").filter(Boolean)
    if (parts.length >= 2) {
      rows.push({ left: parts[0].trim(), right: parts.slice(1).join(" | ").trim() })
    }
  }
  return rows
}

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase()
  if (ext === "pdf") return "PDF"
  if (ext === "docx" || ext === "doc") return "W"
  if (ext === "xlsx" || ext === "xls") return "E"
  return "T"
}

const extColor: Record<string, string> = {
  pdf: "text-red-500 bg-red-50",
  docx: "text-blue-500 bg-blue-50",
  doc: "text-blue-500 bg-blue-50",
  xlsx: "text-green-500 bg-green-50",
  xls: "text-green-500 bg-green-50",
  txt: "text-gray-500 bg-gray-50",
  md: "text-purple-500 bg-purple-50",
}

interface UploadedFile {
  name: string
  content: string
  lineCount: number
}

export default function VocabForge() {
  const [script, setScript] = useState("")
  const [wordList, setWordList] = useState("")
  const [uploadedScript, setUploadedScript] = useState<UploadedFile | null>(null)
  const [uploadedWords, setUploadedWords] = useState<UploadedFile | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<"script" | "words" | null>(null)
  const [markdown, setMarkdown] = useState("")
  const [pairCount, setPairCount] = useState(0)
  const [matchCount, setMatchCount] = useState(0)
  const [error, setError] = useState("")
  const [inputCollapsed, setInputCollapsed] = useState(false)
  const [editing, setEditing] = useState<"script" | "words" | null>(null)

  const tableRows = useMemo(() => (markdown ? parseTable(markdown) : []), [markdown])

  const activeScript = uploadedScript?.content ?? script
  const activeWordList = uploadedWords?.content ?? wordList

  const downloadTitle = useMemo(() => {
    const name = uploadedScript?.name ?? ""
    const base = name.replace(/\.[^.]+$/, "").trim()
    return base || "学习笔记"
  }, [uploadedScript])

  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "")
  const fileBase = `VocabForge${downloadTitle}${dateStr}`

  const loadSample = () => {
    setScript(SAMPLE_DIALOGUES)
    setWordList(SAMPLE_WORDS)
    setUploadedScript(null)
    setUploadedWords(null)
    setMarkdown("")
    setError("")
    setInputCollapsed(false)
    setEditing(null)
  }

  const handleGenerate = async () => {
    if (!activeScript.trim() || !activeWordList.trim()) return
    setIsGenerating(true)
    setError("")
    setMarkdown("")

    try {
      const vocab = activeWordList.split(/[\n,，\s]+/).filter(Boolean)
      const res = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dialogues: activeScript,
          vocab,
          title: "学习笔记",
        }),
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setMarkdown(data.markdown ?? "")
        setPairCount(data.pair_count ?? 0)
        setMatchCount(data.match_count ?? 0)
      }
    } catch {
      setError("后端连接失败，请确认服务已启动（端口 8000）")
    } finally {
      setIsGenerating(false)
    }
  }

  const doUpload = useCallback(
    (type: "script" | "words") => {
      const input = document.createElement("input")
      input.type = "file"
      input.accept = ".pdf,.docx,.doc,.xlsx,.xls,.txt,.md"
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) return

        setUploadProgress(type)
        setError("")

        const ext = file.name.split(".").pop()?.toLowerCase()
        let content = ""

        if (ext === "txt" || ext === "md") {
          content = await file.text()
        } else {
          const formData = new FormData()
          formData.append("file", file)
          try {
            const res = await fetch("/api/extract-file", {
              method: "POST",
              body: formData,
            })
            const data = await res.json()
            if (data.error) {
              setError(data.error)
              setUploadProgress(null)
              return
            }
            content = data.text ?? ""
          } catch {
            setError("文件上传失败，请确认后端已启动")
            setUploadProgress(null)
            return
          }
        }

        const uploaded: UploadedFile = {
          name: file.name,
          content,
          lineCount: content.split("\n").filter(Boolean).length,
        }

        if (type === "script") {
          setUploadedScript(uploaded)
          setScript("")
        } else {
          setUploadedWords(uploaded)
          setWordList("")
        }
        setUploadProgress(null)
      }
      input.click()
    },
    [],
  )

  const clearContent = useCallback((type: "script" | "words") => {
    if (type === "script") {
      setUploadedScript(null)
      setScript("")
    } else {
      setUploadedWords(null)
      setWordList("")
    }
  }, [])

  const handleReset = () => {
    setScript("")
    setWordList("")
    setUploadedScript(null)
    setUploadedWords(null)
    setMarkdown("")
    setError("")
    setPairCount(0)
    setMatchCount(0)
    setInputCollapsed(false)
    setEditing(null)
  }

  const handleDownloadPDF = () => {
    const orig = document.title
    document.title = fileBase
    window.print()
    document.title = orig
  }

  const handleDownloadMarkdown = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${fileBase}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const hasResults = tableRows.length > 0

  // ── Input card component (always compact) ──

  const InputCard = ({
    type,
    label,
    icon: iconNode,
    placeholder,
  }: {
    type: "script" | "words"
    label: string
    icon: React.ReactNode
    placeholder: string
  }) => {
    const uploaded = type === "script" ? uploadedScript : uploadedWords
    const value = type === "script" ? script : wordList
    const setValue = type === "script" ? setScript : setWordList
    const uploading = uploadProgress === type
    const isEditing = editing === type
    const hasContent = (uploaded?.content ?? value).trim().length > 0
    const lineCount = (uploaded?.content ?? value).split("\n").filter(Boolean).length

    return (
      <div className="bg-card rounded-2xl p-4 shadow-sm border border-border/50">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {iconNode}
            <span className="text-sm font-medium text-foreground">{label}</span>
          </div>
          <Button
            onClick={() => doUpload(type)}
            disabled={uploading}
            variant="outline"
            size="sm"
            className="h-7 text-[11px] gap-1 rounded-lg border-border/60"
          >
            <Upload className="w-3 h-3" />
            上传文件
          </Button>
        </div>

        {/* Uploading */}
        {uploading && (
          <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
            解析文件中...
          </div>
        )}

        {/* Editing state: show textarea */}
        {isEditing && !uploading && (
          <div className="space-y-2">
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className="bg-input/50 border-0 rounded-xl resize-none text-sm text-foreground min-h-[120px] focus-visible:ring-1"
              autoFocus
            />
            <button
              onClick={() => setEditing(null)}
              className="text-xs text-primary/70 hover:text-primary"
            >
              ✓ 完成编辑
            </button>
          </div>
        )}

        {/* Content badge (when not editing) */}
        {!isEditing && !uploading && (
          <div className="flex items-center justify-between rounded-xl bg-secondary/30 border border-border/40">
            {hasContent ? (
              <>
                <div className="flex items-center gap-2 min-w-0 px-3 py-2">
                  {uploaded ? (
                    <span
                      className={cn(
                        "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0",
                        extColor[uploaded.name.split(".").pop() ?? ""] ?? "text-primary bg-primary/10",
                      )}
                    >
                      {getFileIcon(uploaded.name)}
                    </span>
                  ) : (
                    <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 bg-accent/10 text-accent">
                      TXT
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground truncate">
                    {uploaded ? uploaded.name : `已粘贴`}
                    <span className="ml-1">· {lineCount} 行</span>
                  </span>
                </div>
                <div className="flex items-center gap-0.5 pr-1">
                  <button
                    onClick={() => setEditing(type)}
                    className="p-1.5 rounded-lg hover:bg-secondary/60 transition-colors"
                    title="编辑"
                  >
                    <PenLine className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => clearContent(type)}
                    className="p-1.5 rounded-lg hover:bg-secondary/60 transition-colors"
                    title="清除"
                  >
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => setEditing(type)}
                className="w-full text-left px-3 py-2 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
              >
                点击粘贴或上传文件...
              </button>
            )}
          </div>
        )}

        {/* Format badges — hide when results occupy narrow sidebar */}
        {!hasResults && (
          <div className="flex items-center gap-1.5 mt-2">
            {FILE_FORMATS.map((fmt) => (
              <span
                key={fmt.ext}
                className={cn(
                  "inline-block px-2 py-0.5 text-[10px] font-medium rounded-md border",
                  fmt.color,
                )}
              >
                {fmt.label}
              </span>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-white overflow-hidden relative">
      {/* 装饰元素 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden print:hidden">
        <div className="absolute top-20 left-10 opacity-20">
          <WordBubble className="w-16 h-12 animate-float text-primary" />
        </div>
        <div className="absolute top-40 right-20 opacity-15">
          <BookIllustration className="w-20 h-20 animate-float-slow" />
        </div>
        <div className="absolute bottom-32 left-[15%] opacity-15">
          <SparkleIcon className="w-8 h-8 text-accent animate-wiggle" />
        </div>
        <div className="absolute top-1/3 right-[10%] opacity-10">
          <SparkleIcon className="w-6 h-6 text-primary animate-wiggle delay-200" />
        </div>
        <div className="absolute bottom-20 right-[20%] opacity-20">
          <MagicWand className="w-14 h-14 animate-float delay-300" />
        </div>
      </div>

      {/* 打印样式 */}
      <style jsx global>{`
        @media print {
          body { background: white !important; color: black !important; }
          @page { margin: 0.8cm; size: A4; }
          @page {
            @bottom-center {
              content: "— " counter(page) " / " counter(pages) " —";
              font-size: 7pt; color: #999; font-family: sans-serif;
            }
          }
          .print\\:hidden { display: none !important; }
          .bg-card, [class*="bg-card"] {
            background: white !important;
            border: 0.5px solid #ccc !important;
            break-inside: avoid;
            padding: 3px 6px !important;
            border-radius: 2px !important;
            box-shadow: none !important;
          }
          .shadow-sm, .shadow-md, .shadow-lg { box-shadow: none !important; }
          .text-muted-foreground { color: #444 !important; }
          mark { background: #fff3cd !important; padding: 0 1px; }
          header, footer { display: none !important; }
          .lg\\:grid-cols-\\[260px_1fr\\] { display: block !important; }
          .md\\:grid-cols-2 { grid-template-columns: 1fr 1fr !important; gap: 6px !important; }
          .max-w-6xl { max-width: 100% !important; padding: 0 0.3cm !important; }
          .text-lg { font-size: 9.5pt !important; }
          .text-base { font-size: 8.5pt !important; }
          .text-sm { font-size: 8pt !important; }
          .text-xs { font-size: 7.5pt !important; }
          .leading-relaxed { line-height: 1.25 !important; }
          .space-y-2 > :not([hidden]) ~ :not([hidden]) { margin-top: 3px !important; }
          .gap-4 { gap: 4px !important; }
          .p-5 { padding: 3px 6px !important; }
          .p-4 { padding: 3px 6px !important; }
          .p-4 { padding: 3px 6px !important; }
        }
      `}</style>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <header className="text-center mb-8 md:mb-12 print:hidden">
          <div className="inline-flex items-center gap-3 mb-4">
            <AIRobot className="w-16 h-16 md:w-20 md:h-20 animate-wiggle" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-3 tracking-tight">
            VocabForge
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl">
            台词遇见单词，记忆自然发生
          </p>
        </header>

        {/* 错误提示 */}
        {error && (
          <div className="max-w-3xl mx-auto mb-4 print:hidden">
            <div className="flex items-center gap-2 p-3 text-destructive bg-destructive/5 rounded-xl border border-destructive/20">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* 主内容区 */}
        <div
          className={cn(
            "grid gap-5 transition-all duration-500",
            hasResults
              ? "lg:grid-cols-[260px_1fr]"
              : "lg:grid-cols-1 max-w-2xl mx-auto",
          )}
        >
          {/* ===== 左侧：输入区 ===== */}
          <div
            className={cn(
              "transition-all duration-500 print:hidden",
              hasResults && "lg:sticky lg:top-4 lg:self-start",
            )}
          >
            {/* 折叠切换 */}
            {hasResults && (
              <button
                onClick={() => setInputCollapsed(!inputCollapsed)}
                className="w-full flex items-center justify-between px-3 py-2 mb-2 bg-card rounded-xl border border-border/50 hover:bg-secondary/30 transition-colors"
              >
                <span className="text-xs font-medium text-foreground">输入区</span>
                {inputCollapsed ? (
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                ) : (
                  <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </button>
            )}

            {/* 加载示例 */}
            {!hasResults && (
              <button
                onClick={loadSample}
                className="w-full flex items-center gap-3 px-5 py-4 mb-4 bg-gradient-to-r from-accent/8 to-primary/8 border border-accent/20 rounded-2xl hover:from-accent/15 hover:to-primary/15 transition-colors group"
              >
                <span className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
                  <FlaskConical className="w-5 h-5 text-accent" />
                </span>
                <div className="text-left">
                  <div className="text-foreground font-medium">加载示例数据</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    填入疑犯追踪 S01E01 台词 + 40+ 单词，点击"生成关联"查看效果
                  </div>
                </div>
              </button>
            )}

            {/* 输入卡片 */}
            {!inputCollapsed && (
              <div className={cn("space-y-3", hasResults && "mb-3")}>
                <InputCard
                  type="script"
                  label="台词本"
                  icon={<BookIllustration className="w-7 h-7" />}
                  placeholder={'粘贴中英文台词...\n每行一对，如:\n"Life is like a box of chocolates."\n"生活就像一盒巧克力。"'}
                />
                <InputCard
                  type="words"
                  label="单词列表"
                  icon={<WordBubble className="w-7 h-5" />}
                  placeholder="每行一个单词，如:\nwatch\ntrust\nprivate"
                />
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-2 mt-3">
              <Button
                onClick={handleGenerate}
                disabled={!activeScript.trim() || !activeWordList.trim() || isGenerating}
                className={cn(
                  "bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium shadow-md shadow-primary/20 disabled:opacity-50 transition-all",
                  "flex-1 h-11 text-sm gap-1.5",
                )}
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    生成关联
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
              {hasResults && (
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="rounded-xl h-11 px-3 border-border/50 hover:bg-secondary/50 text-foreground"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* ===== 右侧：结果区 ===== */}
          {hasResults && (
            <div className="space-y-3 min-w-0">
              {/* 结果标题 + 下载按钮 */}
              <div className="flex items-center justify-between print:mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <SparkleIcon className="w-5 h-5 text-accent shrink-0" />
                  <span className="text-lg font-semibold text-foreground">学习笔记</span>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {pairCount} 组 · {matchCount} 词
                  </span>
                </div>
                <div className="flex items-center gap-1.5 print:hidden shrink-0">
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-foreground bg-card border border-border/50 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    下载 PDF
                  </button>
                  <button
                    onClick={handleDownloadMarkdown}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-foreground bg-card border border-border/50 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    下载 MD
                  </button>
                </div>
              </div>

              {/* 对白行 */}
              <div className="space-y-2">
                {tableRows.map((row, i) => {
                  const leftParts = row.left.split(/<br>\s*/)
                  const enText = leftParts[0] ?? ""
                  const cnText = leftParts.slice(1).join("<br>")

                  const wordEntries = row.right
                    ? row.right.split(/<br>\s*<br>\s*/).filter(Boolean)
                    : []

                  return (
                    <div
                      key={i}
                      className="bg-card rounded-2xl p-5 shadow-sm border border-border/50 animate-slide-up opacity-0"
                      style={{
                        animationDelay: `${i * 30}ms`,
                        animationFillMode: "forwards",
                      }}
                    >
                      <div
                        className={cn(
                          "grid gap-4",
                          wordEntries.length > 0
                            ? "md:grid-cols-2"
                            : "md:grid-cols-1",
                        )}
                      >
                        {/* 左侧：台词 */}
                        <div className="space-y-1.5">
                          <div
                            className="text-foreground text-lg leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: highlightHtml(enText) }}
                          />
                          {cnText && (
                            <div
                              className="text-muted-foreground text-base leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: highlightHtml(cnText) }}
                            />
                          )}
                        </div>

                        {/* 右侧：单词 */}
                        {wordEntries.length > 0 && (
                          <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-border/30 md:pl-3 pt-2 md:pt-0">
                            {wordEntries.map((entry, j) => (
                              <div
                                key={j}
                                className="text-base leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: highlightHtml(entry.trim()) }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 空状态 */}
          {!hasResults && !isGenerating && (
            <div className="hidden lg:flex flex-col items-center justify-center py-16 text-center print:hidden">
              <AIRobot className="w-32 h-32 mb-6 opacity-30 animate-float" />
              <p className="text-muted-foreground/60 text-lg">
                输入台词和单词
                <br />
                让 AI 为你建立深刻关联
              </p>
            </div>
          )}
        </div>

        <footer className="text-center mt-12 text-sm text-muted-foreground/40 print:hidden">
          <p>用 AI 让单词记忆变得有趣</p>
        </footer>
      </div>
    </main>
  )
}
