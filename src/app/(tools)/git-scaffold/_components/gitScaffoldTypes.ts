export interface GitTreeEntry {
  path: string;
  type: "blob" | "tree";
  sha: string;
}

export interface GitTreeResponse {
  tree: GitTreeEntry[];
}

export type NodeType = "file" | "folder";

export interface TreeNode {
  name: string;
  path: string;
  type: NodeType;
  children: TreeNode[];
}

export interface RepoIdentity {
  owner: string;
  repo: string;
}
