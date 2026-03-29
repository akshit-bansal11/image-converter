"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Copy,
  Download,
  File,
  Folder,
  FolderOpen,
  FolderTree,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/feedback/Badge";
import { Button } from "@/components/ui/interaction/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/layout/Card";
import { Input } from "@/components/ui/form/Input";

interface GitTreeEntry {
  path: string;
  type: "blob" | "tree";
  sha: string;
}

interface GitTreeResponse {
  tree: GitTreeEntry[];
}

type NodeType = "file" | "folder";

interface TreeNode {
  name: string;
  path: string;
  type: NodeType;
  children: TreeNode[];
}

interface RepoIdentity {
  owner: string;
  repo: string;
}

const TOKEN_STORAGE_KEY = "git_scaffold_token";

function parseRepoIdentity(input: string): RepoIdentity | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  const urlMatch = trimmed.match(
    /^https?:\/\/github\.com\/([^/]+)\/([^/#?]+)(?:[/?#].*)?$/i,
  );
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2].replace(/\.git$/i, "") };
  }

  const shortMatch = trimmed.match(/^([^/\s]+)\/([^/\s]+)$/);
  if (shortMatch) {
    return { owner: shortMatch[1], repo: shortMatch[2].replace(/\.git$/i, "") };
  }

  return null;
}

function buildTree(entries: GitTreeEntry[]): TreeNode {
  const root: TreeNode = {
    name: "root",
    path: "",
    type: "folder",
    children: [],
  };

  for (const entry of entries) {
    const segments = entry.path.split("/").filter(Boolean);
    let cursor = root;

    segments.forEach((segment, index) => {
      const isLast = index === segments.length - 1;
      const nextPath = cursor.path ? `${cursor.path}/${segment}` : segment;
      const type: NodeType =
        isLast && entry.type === "blob" ? "file" : "folder";

      let child = cursor.children.find((node) => node.name === segment);
      if (!child) {
        child = {
          name: segment,
          path: nextPath,
          type,
          children: [],
        };
        cursor.children.push(child);
      }

      if (isLast && type === "file") {
        child.type = "file";
      }

      cursor = child;
    });
  }

  const sortNode = (node: TreeNode) => {
    node.children.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "folder" ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    node.children.forEach(sortNode);
  };

  sortNode(root);
  return root;
}

function countNodes(root: TreeNode): { files: number; folders: number } {
  let files = 0;
  let folders = 0;

  const walk = (node: TreeNode) => {
    if (node.path) {
      if (node.type === "file") {
        files += 1;
      } else {
        folders += 1;
      }
    }

    node.children.forEach(walk);
  };

  walk(root);
  return { files, folders };
}

function treeToAscii(root: TreeNode): string {
  const lines: string[] = [];

  const walk = (nodes: TreeNode[], prefix: string) => {
    nodes.forEach((node, index) => {
      const isLast = index === nodes.length - 1;
      const connector = isLast ? "└──" : "├──";
      lines.push(
        `${prefix}${connector} ${node.name}${node.type === "folder" ? "/" : ""}`,
      );
      if (node.type === "folder" && node.children.length > 0) {
        const childPrefix = `${prefix}${isLast ? "    " : "│   "}`;
        walk(node.children, childPrefix);
      }
    });
  };

  lines.push(".");
  walk(root.children, "");
  return lines.join("\n");
}

function TreeNodeItem({
  node,
  collapsed,
  onToggle,
}: {
  node: TreeNode;
  collapsed: Set<string>;
  onToggle: (path: string) => void;
}) {
  const isFolder = node.type === "folder";
  const isCollapsed = collapsed.has(node.path);

  return (
    <li className="text-sm">
      <button
        type="button"
        className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-left transition-colors ${
          isFolder ? "hover:bg-white/5" : ""
        }`}
        onClick={() => {
          if (isFolder) {
            onToggle(node.path);
          }
        }}
      >
        {isFolder ? (
          isCollapsed ? (
            <Folder className="size-4 text-amber-300" />
          ) : (
            <FolderOpen className="size-4 text-amber-300" />
          )
        ) : (
          <File className="size-4 text-sky-300" />
        )}
        <span className="truncate">{node.name}</span>
      </button>

      {isFolder && !isCollapsed && node.children.length > 0 ? (
        <ul className="ml-4 border-l border-white/10 pl-2">
          {node.children.map((child) => (
            <TreeNodeItem
              key={child.path}
              node={child}
              collapsed={collapsed}
              onToggle={onToggle}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export default function GitScaffoldTool() {
  const [repoInput, setRepoInput] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [treeRoot, setTreeRoot] = useState<TreeNode | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      setTokenInput(token);
    }
  }, []);

  const togglePath = useCallback((path: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const loadTree = useCallback(async () => {
    const parsed = parseRepoIdentity(repoInput);
    if (!parsed) {
      setErrorMessage(
        "Invalid repository input. Use https://github.com/owner/repo or owner/repo.",
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setCopied(false);

    try {
      if (tokenInput.trim()) {
        window.localStorage.setItem(TOKEN_STORAGE_KEY, tokenInput.trim());
      } else {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      }

      const headers: Record<string, string> = {
        Accept: "application/vnd.github+json",
      };

      if (tokenInput.trim()) {
        headers.Authorization = `Bearer ${tokenInput.trim()}`;
      }

      const endpoint = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/git/trees/HEAD?recursive=1`;
      const response = await fetch(endpoint, { headers });

      if (!response.ok) {
        if (response.status === 403) {
          setErrorMessage(
            "GitHub API rate limit reached (403). Add a personal access token to continue.",
          );
          return;
        }

        if (response.status === 404) {
          setErrorMessage(
            "Repository not found or tree endpoint is unavailable for this branch.",
          );
          return;
        }

        setErrorMessage(
          `GitHub request failed with status ${response.status}.`,
        );
        return;
      }

      const payload = (await response.json()) as GitTreeResponse;
      const filtered = payload.tree.filter(
        (entry) => entry.type === "blob" || entry.type === "tree",
      );
      const root = buildTree(filtered);
      setTreeRoot(root);
      setCollapsed(new Set());
    } catch {
      setErrorMessage(
        "Unable to fetch repository tree. Check your network connection and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [repoInput, tokenInput]);

  const nodeCounts = useMemo(() => {
    if (!treeRoot) {
      return { files: 0, folders: 0 };
    }
    return countNodes(treeRoot);
  }, [treeRoot]);

  const asciiTree = useMemo(() => {
    if (!treeRoot) {
      return "";
    }
    return treeToAscii(treeRoot);
  }, [treeRoot]);

  const copyAscii = useCallback(async () => {
    if (!asciiTree) {
      return;
    }

    await navigator.clipboard.writeText(asciiTree);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [asciiTree]);

  const downloadAscii = useCallback(() => {
    if (!asciiTree) {
      return;
    }

    const blob = new Blob([`\`\`\`\n${asciiTree}\n\`\`\``], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "repository-tree.md";
    link.click();
    URL.revokeObjectURL(url);
  }, [asciiTree]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Repository URL or owner/repo
            </label>
            <Input
              value={repoInput}
              onChange={(event) => setRepoInput(event.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void loadTree();
              }}
              placeholder="https://github.com/owner/repo or owner/repo"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Personal access token (optional)
            </label>
            <Input
              value={tokenInput}
              onChange={(event) => setTokenInput(event.target.value)}
              placeholder="ghp_xxx"
              type="password"
              disabled={isLoading}
            />
          </div>

          <Button
            onClick={() => void loadTree()}
            disabled={isLoading || !repoInput.trim()}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            {isLoading ? "Fetching..." : "Fetch tree"}
          </Button>

          {errorMessage ? (
            <div className="rounded-lg border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </div>
          ) : null}

          {treeRoot ? (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Badge
                variant="outline"
                className="border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
              >
                {nodeCounts.folders} folders
              </Badge>
              <Badge
                variant="outline"
                className="border-blue-500/20 bg-blue-500/10 text-blue-300"
              >
                {nodeCounts.files} files
              </Badge>
              <div className="ml-auto flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => void copyAscii()}
                >
                  <Copy className="size-4" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
                <Button variant="secondary" size="sm" onClick={downloadAscii}>
                  <Download className="size-4" />
                  Download
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {treeRoot ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Directory structure</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[70vh] overflow-auto p-4">
            <ul className="space-y-1 text-sm font-mono">
              {treeRoot.children.map((node) => (
                <TreeNodeItem
                  key={node.path}
                  node={node}
                  collapsed={collapsed}
                  onToggle={togglePath}
                />
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}