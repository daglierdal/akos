"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DocumentFilter = "all" | "cizim" | "sartname" | "teklif" | "musteri";

interface ProjectPanelProps {
  projectId: string | null;
}

interface ProjectPanelData {
  project: {
    id: string;
    name: string;
    budget: number | null;
    currency: string;
    status: string;
    description: string | null;
    updatedAt: string;
  };
  code: string | null;
  customer: string | null;
  documents: Array<{
    id: string;
    title: string | null;
    category: string | null;
    originalFilename: string | null;
    proposalId: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: string;
    updatedAt: string;
  }>;
  activeProposal: {
    id: string;
    revisionCode: string;
    status: string;
    updatedAt: string;
  } | null;
  activities: Array<{
    id: string;
    type: "project" | "proposal" | "document";
    title: string;
    date: string;
  }>;
}

const FILTER_LABELS: Record<DocumentFilter, string> = {
  all: "Tum",
  cizim: "Cizim",
  sartname: "Sartname",
  teklif: "Teklif",
  musteri: "Musteri",
};

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function matchesDocumentFilter(
  filter: DocumentFilter,
  document: ProjectPanelData["documents"][number],
) {
  if (filter === "all") {
    return true;
  }

  if (filter === "cizim") {
    return document.category === "drawing";
  }

  if (filter === "sartname") {
    return document.category === "spec";
  }

  if (filter === "teklif") {
    return Boolean(document.proposalId);
  }

  const metadata = document.metadata ?? {};
  return Boolean(metadata.customerName || metadata.isClientDocument || document.category === "contract");
}

export function ProjectPanel({ projectId }: ProjectPanelProps) {
  const [data, setData] = useState<ProjectPanelData | null>(null);
  const [filter, setFilter] = useState<DocumentFilter>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setData(null);
      setError(null);
      return;
    }

    let cancelled = false;

    async function loadProjectPanel() {
      setIsLoading(true);

      try {
        const supabase = createClient();
        const [
          { data: project, error: projectError },
          { data: proposals, error: proposalsError },
          { data: documents, error: documentsError },
        ] = await Promise.all([
          supabase
            .from("projects")
            .select("id, name, budget, currency, status, description, updated_at")
            .eq("id", projectId)
            .single(),
          supabase
            .from("proposals")
            .select("id, revision_code, status, updated_at, created_at")
            .eq("project_id", projectId)
            .order("revision_no", { ascending: false })
            .limit(10),
          supabase
            .from("documents")
            .select(
              "id, title, category, original_filename, proposal_id, metadata, created_at, updated_at",
            )
            .eq("project_id", projectId)
            .order("updated_at", { ascending: false })
            .limit(50),
        ]);

        const firstError = projectError ?? proposalsError ?? documentsError;
        if (firstError) {
          throw new Error(firstError.message);
        }

        if (!project) {
          throw new Error("Project not found.");
        }

        const { data: rootFolder, error: rootError } = await (supabase as any)
          .from("drive_files")
          .select("project_code, metadata")
          .eq("project_name", project.name)
          .eq("is_folder", true)
          .is("parent_external_file_id", null)
          .maybeSingle();

        if (rootError) {
          throw new Error(rootError.message);
        }

        const rootMetadata = (rootFolder?.metadata ?? null) as Record<string, unknown> | null;
        const activities = [
          {
            id: project.id,
            type: "project" as const,
            title: `${project.name} / ${project.status}`,
            date: project.updated_at,
          },
          ...(proposals ?? []).map((proposal) => ({
            id: proposal.id,
            type: "proposal" as const,
            title: `${proposal.revision_code} / ${proposal.status}`,
            date: proposal.updated_at ?? proposal.created_at,
          })),
          ...(documents ?? []).map((document) => ({
            id: document.id,
            type: "document" as const,
            title:
              document.title?.trim() ||
              document.original_filename?.trim() ||
              "Dokuman",
            date: document.updated_at ?? document.created_at,
          })),
        ]
          .sort((left, right) => right.date.localeCompare(left.date))
          .slice(0, 8);

        if (!cancelled) {
          setData({
            project: {
              id: project.id,
              name: project.name,
              budget: project.budget === null ? null : Number(project.budget),
              currency: project.currency,
              status: project.status,
              description: project.description,
              updatedAt: project.updated_at,
            },
            code: (rootFolder?.project_code as string | null | undefined) ?? null,
            customer: (rootMetadata?.customerName as string | null | undefined) ?? null,
            documents: (documents ?? []).map((document) => ({
              id: document.id,
              title: document.title,
              category: document.category,
              originalFilename: document.original_filename,
              proposalId: document.proposal_id,
              metadata: (document.metadata ?? null) as Record<string, unknown> | null,
              createdAt: document.created_at,
              updatedAt: document.updated_at,
            })),
            activeProposal: proposals?.[0]
              ? {
                  id: proposals[0].id,
                  revisionCode: proposals[0].revision_code,
                  status: proposals[0].status,
                  updatedAt: proposals[0].updated_at,
                }
              : null,
            activities,
          });
          setError(null);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Proje paneli yuklenemedi.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadProjectPanel();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const filteredDocuments = useMemo(
    () => data?.documents.filter((document) => matchesDocumentFilter(filter, document)) ?? [],
    [data, filter],
  );

  if (!projectId) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Proje Paneli</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Proje secildiginde bilgiler burada gorunecek.
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Proje Paneli</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Proje verileri yukleniyor.
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Proje Paneli</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Proje verisi bulunamadi.</p>
            {error ? <p className="text-destructive">{error}</p> : null}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle>{data.project.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {data.customer ?? "Musteri bilgisi yok"}
              </p>
            </div>
            <Badge variant="secondary">{data.project.status}</Badge>
          </div>
          <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <p>Kod: {data.code ?? "Uretilmedi"}</p>
            <p>
              Butce:{" "}
              {data.project.budget === null
                ? "Belirtilmedi"
                : formatCurrency(data.project.budget, data.project.currency)}
            </p>
            <p>Son guncelleme: {formatDateTime(data.project.updatedAt)}</p>
            <p>Durum: {data.project.status}</p>
          </div>
          {data.project.description ? (
            <p className="text-sm text-muted-foreground">{data.project.description}</p>
          ) : null}
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dokumanlar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(FILTER_LABELS) as DocumentFilter[]).map((item) => (
              <Button
                key={item}
                variant={filter === item ? "secondary" : "outline"}
                size="sm"
                onClick={() => setFilter(item)}
              >
                {FILTER_LABELS[item]}
              </Button>
            ))}
          </div>
          <div className="space-y-2">
            {filteredDocuments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Bu filtre icin dokuman bulunmuyor.
              </p>
            ) : (
              filteredDocuments.slice(0, 12).map((document) => (
                <div
                  key={document.id}
                  className="rounded-lg border px-3 py-2 text-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">
                      {document.title ?? document.originalFilename ?? "Dokuman"}
                    </p>
                    <Badge variant="outline">{document.category ?? "other"}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDateTime(document.updatedAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aktif Teklif</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {data.activeProposal ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{data.activeProposal.revisionCode}</p>
                <Badge variant="secondary">{data.activeProposal.status}</Badge>
              </div>
              <p className="text-muted-foreground">
                Son guncelleme: {formatDateTime(data.activeProposal.updatedAt)}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">Aktif teklif revizyonu yok.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Son Aktiviteler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aktivite bulunmuyor.</p>
          ) : (
            data.activities.map((activity) => (
              <div
                key={`${activity.type}-${activity.id}`}
                className="rounded-lg border px-3 py-2 text-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{activity.title}</p>
                  <Badge variant="outline">{activity.type}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDateTime(activity.date)}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
