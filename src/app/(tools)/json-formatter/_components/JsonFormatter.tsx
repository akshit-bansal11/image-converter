"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Eraser,
  FileJson2,
  Minimize2,
  Wand2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SAMPLE_JSON = `{
  "name": "open-tools",
  "tool": "json-formatter",
  "features": ["pretty print", "minify", "validate"],
  "localFirst": true
}`;

export default function JsonFormatter() {
  const [input, setInput] = useState(SAMPLE_JSON);
  const [output, setOutput] = useState(() => formatJson(SAMPLE_JSON, "pretty"));
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const inputStats = useMemo(() => {
    const characters = input.length;
    const lines = input ? input.split(/\r?\n/).length : 0;

    return { characters, lines };
  }, [input]);

  const runFormat = (mode: "pretty" | "minify") => {
    try {
      const nextOutput = formatJson(input, mode);
      setOutput(nextOutput);
      setError(null);
    } catch (formatError) {
      setError(
        formatError instanceof Error
          ? formatError.message
          : "Unable to parse the JSON input.",
      );
      setOutput("");
    }
  };

  const copyOutput = async () => {
    if (!output) {
      return;
    }

    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="border-white/10 bg-card/70">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileJson2 className="size-5" />
              Input
            </CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              Paste JSON, validate it, then pretty print or minify it.
            </p>
          </div>
          <Badge variant="secondary">
            {inputStats.characters} chars · {inputStats.lines} lines
          </Badge>
        </CardHeader>
        <CardContent>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            spellCheck={false}
            className="min-h-[360px] w-full rounded-2xl border bg-background/70 p-4 font-mono text-sm outline-none transition focus:border-primary"
            placeholder='{"hello":"world"}'
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <Button onClick={() => runFormat("pretty")} className="gap-2">
              <Wand2 className="size-4" />
              Pretty Print
            </Button>
            <Button
              onClick={() => runFormat("minify")}
              variant="outline"
              className="gap-2"
            >
              <Minimize2 className="size-4" />
              Minify
            </Button>
            <Button
              onClick={() => {
                setInput(SAMPLE_JSON);
                setOutput(formatJson(SAMPLE_JSON, "pretty"));
                setError(null);
              }}
              variant="outline"
            >
              Load Sample
            </Button>
            <Button
              onClick={() => {
                setInput("");
                setOutput("");
                setError(null);
              }}
              variant="ghost"
              className="gap-2"
            >
              <Eraser className="size-4" />
              Clear
            </Button>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-card/70">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Output</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              Copy the formatted result when it looks right.
            </p>
          </div>
          <Button
            onClick={copyOutput}
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={!output}
          >
            {copied ? (
              <CheckCircle2 className="size-4" />
            ) : (
              <Copy className="size-4" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
        </CardHeader>
        <CardContent>
          <textarea
            value={output}
            readOnly
            spellCheck={false}
            className="min-h-[360px] w-full rounded-2xl border bg-background/70 p-4 font-mono text-sm text-emerald-200 outline-none"
            placeholder="Formatted JSON will appear here."
          />
        </CardContent>
      </Card>
    </div>
  );
}

function formatJson(input: string, mode: "pretty" | "minify") {
  const parsed = JSON.parse(input);
  return mode === "pretty"
    ? JSON.stringify(parsed, null, 2)
    : JSON.stringify(parsed);
}
