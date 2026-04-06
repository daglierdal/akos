import { tool } from "ai";
import type { ToolSet } from "ai";
import type { SupabaseClient } from "@supabase/supabase-js";
import { calculateProposal } from "./calculateProposal";
import { createProposal } from "./createProposal";
import { createProject } from "./createProject";
import { createDriveFolder } from "./createDriveFolder";
import { generateBOQFromDocs } from "./generateBOQFromDocs";
import { getDashboard } from "./getDashboard";
import { getMorningBriefing } from "./getMorningBriefing";
import { getProjectStatus } from "./getProjectStatus";
import { importBOQ } from "./importBOQ";
import { importPriceList } from "./importPriceList";
import { listDocuments } from "./listDocuments";
import { listProposals } from "./listProposals";
import { linkFileToProposal } from "./linkFileToProposal";
import { searchDocuments } from "./searchDocuments";
import { searchProjects } from "./searchProjects";
import { searchPrices } from "./searchPrices";
import { submitProposal } from "./submitProposal";
import { suggestPrices } from "./suggestPrices";
import {
  defineTool,
  type ToolContext,
  type ToolDefinition,
} from "./tool-definition";
import { uploadDocument } from "./uploadDocument";

export interface ToolsContext extends ToolContext {}
const registry = [
  createProposal,
  createProject,
  createDriveFolder,
  calculateProposal,
  getDashboard,
  getMorningBriefing,
  getProjectStatus,
  importBOQ,
  generateBOQFromDocs,
  listDocuments,
  listProposals,
  suggestPrices,
  searchPrices,
  importPriceList,
  linkFileToProposal,
  searchDocuments,
  searchProjects,
  submitProposal,
  uploadDocument,
] as const;

export function getTools(context: ToolsContext): ToolSet {
  return Object.fromEntries(
    registry.map((toolDefinition) => [
      toolDefinition.name,
      tool({
        description: toolDefinition.description,
        inputSchema: toolDefinition.parameters as never,
        execute: async (params: never) =>
          toolDefinition.execute(params, context),
      }),
    ])
  ) as ToolSet;
}

export {
  calculateProposal,
  createProposal,
  createProject,
  createDriveFolder,
  generateBOQFromDocs,
  getDashboard,
  getMorningBriefing,
  getProjectStatus,
  importBOQ,
  importPriceList,
  listDocuments,
  listProposals,
  linkFileToProposal,
  searchDocuments,
  searchProjects,
  searchPrices,
  submitProposal,
  suggestPrices,
  uploadDocument,
};
export { defineTool };
export type { ToolContext, ToolDefinition };
