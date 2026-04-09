import { Readable } from "node:stream";
import { readFile } from "node:fs/promises";
import path from "node:path";
import React from "react";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import type { drive_v3 } from "@/lib/drive/client";
import { uploadFile } from "@/lib/drive/client";
import type { Database } from "@/lib/supabase/database.types";
import {
  calculateProposal,
  getProposalSummary,
  type ProposalSummary,
} from "./proposal-service";
import type { SupabaseClient } from "@supabase/supabase-js";

type TypedSupabase = SupabaseClient<Database>;

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    color: "#111827",
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 16,
  },
  logo: {
    width: 140,
    height: 36,
    objectFit: "contain",
  },
  titleBlock: {
    alignItems: "flex-end",
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
  },
  subtitle: {
    fontSize: 10,
    color: "#4B5563",
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 8,
    color: "#111827",
  },
  infoGrid: {
    flexDirection: "row",
    gap: 16,
  },
  infoCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    padding: 10,
    gap: 4,
  },
  infoLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    color: "#6B7280",
  },
  infoValue: {
    fontSize: 10,
  },
  table: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    fontWeight: 700,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  cell: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 9,
  },
  disciplineCol: {
    flex: 2.2,
  },
  numberCol: {
    flex: 1,
    textAlign: "right",
  },
  totalsBox: {
    marginTop: 12,
    marginLeft: "auto",
    width: 240,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    padding: 12,
    gap: 6,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalLabel: {
    color: "#374151",
  },
  totalValue: {
    fontWeight: 700,
  },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 6,
    marginTop: 4,
  },
});

function formatCurrency(value: number | null | undefined) {
  const amount = typeof value === "number" ? value : 0;
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

async function loadLogoDataUri() {
  const logoPath = path.join(process.cwd(), "public/assets/logo/akrotes-logo.svg");
  const file = await readFile(logoPath, "utf8");
  return `data:image/svg+xml;utf8,${encodeURIComponent(file)}`;
}

async function loadProposalPdfData(
  supabase: TypedSupabase,
  proposalId: string
) {
  const summary = await getProposalSummary(supabase, proposalId);
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, name, description, currency, customers(*)")
    .eq("id", summary.proposal.project_id)
    .single();
  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("id, name, slug")
    .eq("id", summary.proposal.tenant_id)
    .single();

  if (projectError || !project) {
    throw new Error(projectError?.message ?? "Project not found.");
  }

  if (tenantError || !tenant) {
    throw new Error(tenantError?.message ?? "Tenant not found.");
  }

  return {
    summary,
    project,
    tenant,
    customer: project.customers,
  };
}

function ProposalPdfTemplate(props: {
  logoSrc: string;
  summary: ProposalSummary;
  tenant: { name: string; slug: string };
  project: { name: string; description: string | null; currency: string };
  customer: {
    name: string;
    contact_person: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
  } | null;
}): React.ReactElement<DocumentProps> {
  const { logoSrc, summary, tenant, project, customer } = props;

  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Image, { src: logoSrc, style: styles.logo }),
        React.createElement(
          View,
          { style: styles.titleBlock },
          React.createElement(Text, { style: styles.title }, "Teklif"),
          React.createElement(
            Text,
            { style: styles.subtitle },
            `${project.name} / ${summary.proposal.revision_code}`
          ),
          React.createElement(
            Text,
            { style: styles.subtitle },
            `Durum: ${summary.proposal.status}`
          )
        )
      ),
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, "Firma ve Musteri"),
        React.createElement(
          View,
          { style: styles.infoGrid },
          React.createElement(
            View,
            { style: styles.infoCard },
            React.createElement(Text, { style: styles.infoLabel }, "Firma"),
            React.createElement(Text, { style: styles.infoValue }, tenant.name),
            React.createElement(Text, { style: styles.infoValue }, project.name),
            React.createElement(
              Text,
              { style: styles.infoValue },
              project.description || tenant.slug
            )
          ),
          React.createElement(
            View,
            { style: styles.infoCard },
            React.createElement(Text, { style: styles.infoLabel }, "Musteri"),
            React.createElement(
              Text,
              { style: styles.infoValue },
              customer?.name ?? "Musteri bilgisi baglanmadi"
            ),
            React.createElement(
              Text,
              { style: styles.infoValue },
              customer?.contact_person ?? "-"
            ),
            React.createElement(
              Text,
              { style: styles.infoValue },
              customer?.email ?? customer?.phone ?? "-"
            ),
            React.createElement(
              Text,
              { style: styles.infoValue },
              customer?.address ?? "-"
            )
          )
        )
      ),
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, "Revizyon Bilgisi"),
        React.createElement(
          View,
          { style: styles.infoGrid },
          React.createElement(
            View,
            { style: styles.infoCard },
            React.createElement(Text, { style: styles.infoLabel }, "Revizyon"),
            React.createElement(Text, { style: styles.infoValue }, summary.proposal.revision_code),
            React.createElement(Text, { style: styles.infoLabel }, "Olusturma"),
            React.createElement(Text, { style: styles.infoValue }, formatDate(summary.proposal.created_at))
          ),
          React.createElement(
            View,
            { style: styles.infoCard },
            React.createElement(Text, { style: styles.infoLabel }, "Sunum"),
            React.createElement(
              Text,
              { style: styles.infoValue },
              formatDate(summary.proposal.submitted_at)
            ),
            React.createElement(Text, { style: styles.infoLabel }, "Para Birimi"),
            React.createElement(Text, { style: styles.infoValue }, project.currency)
          )
        )
      ),
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, "BOQ Ozet"),
        React.createElement(
          View,
          { style: styles.table },
          React.createElement(
            View,
            { style: styles.tableHeader },
            React.createElement(Text, { style: [styles.cell, styles.disciplineCol] }, "Disiplin"),
            React.createElement(Text, { style: [styles.cell, styles.numberCol] }, "Maliyet"),
            React.createElement(Text, { style: [styles.cell, styles.numberCol] }, "KDV"),
            React.createElement(Text, { style: [styles.cell, styles.numberCol] }, "Toplam")
          ),
          ...summary.disciplineSummary.map((line) =>
            React.createElement(
              View,
              { key: line.discipline, style: styles.row },
              React.createElement(
                Text,
                { style: [styles.cell, styles.disciplineCol] },
                line.discipline
              ),
              React.createElement(
                Text,
                { style: [styles.cell, styles.numberCol] },
                formatCurrency(line.cost)
              ),
              React.createElement(
                Text,
                { style: [styles.cell, styles.numberCol] },
                formatCurrency(line.vat)
              ),
              React.createElement(
                Text,
                { style: [styles.cell, styles.numberCol] },
                formatCurrency(line.total)
              )
            )
          )
        ),
        React.createElement(
          View,
          { style: styles.totalsBox },
          React.createElement(
            View,
            { style: styles.totalRow },
            React.createElement(Text, { style: styles.totalLabel }, "Toplam maliyet"),
            React.createElement(
              Text,
              { style: styles.totalValue },
              formatCurrency(summary.totals.totalCost)
            )
          ),
          React.createElement(
            View,
            { style: styles.totalRow },
            React.createElement(
              Text,
              { style: styles.totalLabel },
              `Marj (%${summary.totals.marginPercent})`
            ),
            React.createElement(
              Text,
              { style: styles.totalValue },
              formatCurrency(summary.totals.marginAmount)
            )
          ),
          React.createElement(
            View,
            { style: styles.totalRow },
            React.createElement(Text, { style: styles.totalLabel }, "Indirim"),
            React.createElement(
              Text,
              { style: styles.totalValue },
              formatCurrency(summary.totals.proposalDiscountAmount)
            )
          ),
          React.createElement(
            View,
            { style: styles.totalRow },
            React.createElement(Text, { style: styles.totalLabel }, "Ara toplam"),
            React.createElement(
              Text,
              { style: styles.totalValue },
              formatCurrency(summary.totals.totalPrice)
            )
          ),
          React.createElement(
            View,
            { style: styles.totalRow },
            React.createElement(Text, { style: styles.totalLabel }, "Toplam KDV"),
            React.createElement(
              Text,
              { style: styles.totalValue },
              formatCurrency(summary.totals.totalVat)
            )
          ),
          React.createElement(
            View,
            { style: [styles.totalRow, styles.grandTotal] },
            React.createElement(Text, { style: styles.totalLabel }, "Genel toplam"),
            React.createElement(
              Text,
              { style: styles.totalValue },
              formatCurrency(summary.totals.grandTotal)
            )
          )
        )
      )
    )
  );
}

async function streamToBuffer(stream: NodeJS.ReadableStream) {
  const chunks: Uint8Array[] = [];

  for await (const chunk of stream) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

function buildSubmittedPdfName(projectCode: string, revisionNo: number) {
  return `${projectCode}_REV-${String(revisionNo).padStart(2, "0")}_PROPOSAL_SUBMITTED.pdf`;
}

async function getProjectCode(
  supabase: TypedSupabase,
  projectId: string
) {
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("project_code")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    throw new Error(projectError?.message ?? "Project not found.");
  }
  return project.project_code;
}

export async function generateProposalPDF(
  supabase: TypedSupabase,
  proposalId: string
) {
  const [logoSrc, data] = await Promise.all([
    loadLogoDataUri(),
    loadProposalPdfData(supabase, proposalId),
  ]);

  const element = ProposalPdfTemplate({
    logoSrc,
    summary: data.summary,
    tenant: data.tenant,
    project: data.project,
    customer: data.customer,
  });

  const instance = pdf(element);
  const stream = await instance.toBuffer();

  return streamToBuffer(stream);
}

export async function uploadProposalPDF(
  supabase: TypedSupabase,
  driveClient: drive_v3.Drive,
  proposalId: string,
  pdfBuffer: Buffer
) {
  const summary = await calculateProposal(supabase, proposalId);
  const proposal = summary.proposal;
  const projectCode = await getProjectCode(supabase, proposal.project_id);
  const fileName = buildSubmittedPdfName(projectCode, proposal.revision_no);
  const revisionFolderId = proposal.drive_revision_folder_id;

  if (!revisionFolderId) {
    throw new Error("Proposal revision folder is missing.");
  }

  const { data: submittedFolderRow, error: folderError } = await supabase
    .from("drive_files")
    .select("drive_file_id")
    .eq("proposal_id", proposal.id)
    .eq("file_role", "folder")
    .ilike("revision_label", `%/06_Submitted`)
    .maybeSingle();

  if (folderError) {
    throw new Error(`Submitted folder lookup failed: ${folderError.message}`);
  }

  const parentId = submittedFolderRow?.drive_file_id ?? revisionFolderId;
  const uploaded = await uploadFile(
    driveClient,
    {
      name: fileName,
      mimeType: "application/pdf",
      body: Readable.from(pdfBuffer),
    },
    parentId
  );

  const { data: document, error: documentError } = await supabase
    .from("documents")
    .insert({
      tenant_id: proposal.tenant_id,
      project_id: proposal.project_id,
      proposal_id: proposal.id,
      title: `${proposal.revision_code} Proposal`,
      category: "other",
      storage_type: "drive",
      storage_path: `drive/${uploaded.id}`,
      original_filename: fileName,
      standard_filename: fileName,
      mime_type: "application/pdf",
      file_size: pdfBuffer.byteLength,
      metadata: {
        driveFileId: uploaded.id,
        webViewLink: uploaded.webViewLink ?? null,
        source: "proposal_submit",
      },
    })
    .select("id")
    .single();

  if (documentError || !document) {
    throw new Error(documentError?.message ?? "Proposal PDF document save failed.");
  }

  const { error: driveFileError } = await supabase.from("drive_files").insert({
    tenant_id: proposal.tenant_id,
    project_id: proposal.project_id,
    proposal_id: proposal.id,
    file_role: "proposal_pdf",
    document_type: "proposal",
    discipline: null,
    revision_label: proposal.revision_code,
    drive_file_id: uploaded.id,
    drive_parent_id: parentId,
    mime_type: "application/pdf",
    web_view_link: uploaded.webViewLink ?? null,
    size_bytes: pdfBuffer.byteLength,
  });

  if (driveFileError) {
    throw new Error(`Proposal PDF drive record save failed: ${driveFileError.message}`);
  }

  return {
    documentId: document.id,
    driveFileId: uploaded.id,
    fileName,
    webViewLink: uploaded.webViewLink ?? null,
  };
}
