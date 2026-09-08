export type VennRow = { combination: string; count: number };

const databaseLabels: Record<string, string> = {
  openalex: "OpenAlex",
  scopus: "Scopus",
  wos: "Web of Science",
};
const databaseOrder = ["openalex", "scopus", "wos"];

function countFor(rows: VennRow[], sources: string[]) {
  const combination = [...sources].sort().join("+");
  return rows.find((row) => row.combination === combination)?.count ?? 0;
}

function Value({ x, y, value }: { x: number; y: number; value: number }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      className="fill-slate-700 text-lg font-bold"
    >
      {value.toLocaleString("pt-BR")}
    </text>
  );
}

function ThreeSetVenn({ rows }: { rows: VennRow[] }) {
  const openalex = countFor(rows, ["openalex"]);
  const scopus = countFor(rows, ["scopus"]);
  const wos = countFor(rows, ["wos"]);
  const openalexScopus = countFor(rows, ["openalex", "scopus"]);
  const openalexWos = countFor(rows, ["openalex", "wos"]);
  const scopusWos = countFor(rows, ["scopus", "wos"]);
  const allDatabases = countFor(rows, ["openalex", "scopus", "wos"]);

  return (
    <svg
      viewBox="0 0 760 520"
      className="h-full w-full"
      role="img"
      aria-label="Diagrama de Venn de OpenAlex, Scopus e Web of Science"
    >
      <circle
        cx="380"
        cy="175"
        r="140"
        fill="#3b82f6"
        fillOpacity="0.35"
        stroke="#2563eb"
        strokeWidth="2"
      />
      <circle
        cx="260"
        cy="335"
        r="140"
        fill="#f59e0b"
        fillOpacity="0.35"
        stroke="#d97706"
        strokeWidth="2"
      />
      <circle
        cx="500"
        cy="335"
        r="140"
        fill="#10b981"
        fillOpacity="0.35"
        stroke="#059669"
        strokeWidth="2"
      />

      <text
        x="380"
        y="55"
        textAnchor="middle"
        className="fill-slate-700 text-base font-semibold"
      >
        OpenAlex
      </text>
      <text
        x="180"
        y="485"
        textAnchor="middle"
        className="fill-slate-700 text-base font-semibold"
      >
        Web of Science
      </text>
      <text
        x="580"
        y="485"
        textAnchor="middle"
        className="fill-slate-700 text-base font-semibold"
      >
        Scopus
      </text>

      <Value x={380} y={145} value={openalex} />
      <Value x={205} y={365} value={wos} />
      <Value x={555} y={365} value={scopus} />
      <Value x={300} y={255} value={openalexWos} />
      <Value x={460} y={255} value={openalexScopus} />
      <Value x={380} y={400} value={scopusWos} />
      <Value x={380} y={305} value={allDatabases} />
    </svg>
  );
}

function TwoSetVenn({ rows, sources }: { rows: VennRow[]; sources: string[] }) {
  const [first, second] = sources;
  const firstOnly = countFor(rows, [first]);
  const secondOnly = countFor(rows, [second]);
  const both = countFor(rows, [first, second]);

  return (
    <svg viewBox="0 0 760 420" className="h-full w-full" role="img">
      <circle
        cx="300"
        cy="210"
        r="150"
        fill="#3b82f6"
        fillOpacity="0.35"
        stroke="#2563eb"
        strokeWidth="2"
      />
      <circle
        cx="460"
        cy="210"
        r="150"
        fill="#10b981"
        fillOpacity="0.35"
        stroke="#059669"
        strokeWidth="2"
      />
      <text
        x="220"
        y="55"
        textAnchor="middle"
        className="fill-slate-700 text-base font-semibold"
      >
        {databaseLabels[first]}
      </text>
      <text
        x="540"
        y="55"
        textAnchor="middle"
        className="fill-slate-700 text-base font-semibold"
      >
        {databaseLabels[second]}
      </text>
      <Value x={235} y={220} value={firstOnly} />
      <Value x={525} y={220} value={secondOnly} />
      <Value x={380} y={220} value={both} />
    </svg>
  );
}

export function VennSection({ rows }: { rows: VennRow[] }) {
  const sources = databaseOrder.filter((source) =>
    rows.some((row) => row.combination.split("+").includes(source)),
  );

  return (
    <section className="rounded-xl border border-slate-200 bg-slate-100 p-5">
      <div className="h-[520px] w-full">
        {sources.length === 3 ? (
          <ThreeSetVenn rows={rows} />
        ) : (
          <TwoSetVenn rows={rows} sources={sources} />
        )}
      </div>
    </section>
  );
}
