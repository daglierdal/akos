"use client"

import { useEffect, useState } from "react"
import { Maximize2, Minimize2, PanelRightClose, PanelRightOpen } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type SidePanelTab = "boq" | "proposal" | "project"

interface SidePanelProps {
  main: React.ReactNode
  boq: React.ReactNode
  proposal: React.ReactNode
  projectInfo: React.ReactNode
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const TAB_LABELS: Record<SidePanelTab, string> = {
  boq: "BOQ",
  proposal: "Teklif",
  project: "Proje bilgisi",
}

export function SidePanel({
  main,
  boq,
  proposal,
  projectInfo,
  defaultOpen = true,
  open,
  onOpenChange,
}: SidePanelProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const [isFullPanel, setIsFullPanel] = useState(false)
  const [activeTab, setActiveTab] = useState<SidePanelTab>("boq")
  const [panelWidth, setPanelWidth] = useState(50)
  const [isResizing, setIsResizing] = useState(false)
  const isOpen = open ?? internalOpen

  function setIsOpen(nextOpen: boolean) {
    setInternalOpen(nextOpen)
    onOpenChange?.(nextOpen)
  }

  useEffect(() => {
    if (!isResizing) {
      return
    }

    function handleMove(event: MouseEvent) {
      const nextWidth = ((window.innerWidth - event.clientX) / window.innerWidth) * 100
      setPanelWidth(Math.min(70, Math.max(30, Number(nextWidth.toFixed(1)))))
    }

    function handleUp() {
      setIsResizing(false)
    }

    window.addEventListener("mousemove", handleMove)
    window.addEventListener("mouseup", handleUp)

    return () => {
      window.removeEventListener("mousemove", handleMove)
      window.removeEventListener("mouseup", handleUp)
    }
  }, [isResizing])

  const panelContent =
    activeTab === "boq" ? boq : activeTab === "proposal" ? proposal : projectInfo

  return (
    <div className="flex h-full min-h-0 overflow-hidden">
      {!isFullPanel ? (
        <div
          className={cn("flex min-h-0 flex-col", !isOpen && "flex-1")}
          style={{ width: isOpen ? `${100 - panelWidth}%` : "100%" }}
        >
          {main}
        </div>
      ) : null}

      {isOpen ? (
        <>
          {!isFullPanel ? (
            <div
              className="w-1 cursor-col-resize bg-border/80 transition-colors hover:bg-primary/40"
              onMouseDown={() => setIsResizing(true)}
              aria-hidden="true"
            />
          ) : null}

          <aside
            className="flex min-h-0 flex-col border-l border-border bg-card"
            style={{ width: isFullPanel ? "100%" : `${panelWidth}%` }}
          >
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <div className="flex gap-2">
                {(Object.keys(TAB_LABELS) as SidePanelTab[]).map((tab) => (
                  <Button
                    key={tab}
                    variant={activeTab === tab ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab(tab)}
                  >
                    {TAB_LABELS[tab]}
                  </Button>
                ))}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setIsFullPanel((current) => !current)}
                  title={isFullPanel ? "Yarım ekran" : "Tam ekran"}
                >
                  {isFullPanel ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setIsOpen(false)}
                  title="Paneli kapat"
                >
                  <PanelRightClose className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">{panelContent}</div>
          </aside>
        </>
      ) : (
        <div className="flex items-start border-l border-border bg-card p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(true)}
            title="Paneli aç"
          >
            <PanelRightOpen className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
