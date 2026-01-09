import { notFound } from "next/navigation";
import Link from "next/link";
import { getEndpointBySlug, endpointDocs } from "@/lib/endpoint-docs";

export function generateStaticParams() {
  return endpointDocs.map((endpoint) => ({
    slug: endpoint.slug,
  }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EndpointPage({ params }: PageProps) {
  const { slug } = await params;
  const endpoint = getEndpointBySlug(slug);

  if (!endpoint) {
    notFound();
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif", maxWidth: "800px" }}>
      <Link
        href="/"
        style={{ color: "#3b82f6", textDecoration: "none", fontSize: "0.875rem" }}
      >
        &larr; Back to endpoints
      </Link>

      <header style={{ marginTop: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <span
            style={{
              fontFamily: "monospace",
              fontWeight: 600,
              color: "#16a34a",
              fontSize: "0.875rem",
            }}
          >
            {endpoint.method}
          </span>
          <code style={{ fontFamily: "monospace", fontSize: "1.125rem" }}>{endpoint.path}</code>
        </div>
        <p style={{ color: "#d1d5db", lineHeight: 1.6, margin: 0 }}>{endpoint.description}</p>
      </header>

      {/* Expected Inputs */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", color: "#22c55e" }}>
          Expected Inputs
        </h2>

        {endpoint.pathParams.length > 0 && (
          <div style={{ marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem", color: "#9ca3af" }}>
              Path Parameters
            </h3>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e5e7eb", textAlign: "left" }}>
                  <th style={{ padding: "0.5rem 0", fontWeight: 500 }}>Name</th>
                  <th style={{ padding: "0.5rem 0", fontWeight: 500 }}>Type</th>
                  <th style={{ padding: "0.5rem 0", fontWeight: 500 }}>Description</th>
                </tr>
              </thead>
              <tbody>
                {endpoint.pathParams.map((param) => (
                  <tr key={param.name} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "0.5rem 0" }}>
                      <code style={{ fontFamily: "monospace", color: "#7c3aed" }}>{param.name}</code>
                      <span style={{ marginLeft: "0.5rem", color: "#dc2626", fontSize: "0.75rem" }}>required</span>
                    </td>
                    <td style={{ padding: "0.5rem 0", color: "#9ca3af" }}>{param.type}</td>
                    <td style={{ padding: "0.5rem 0", color: "#d1d5db" }}>
                      {param.description}
                      <span style={{ marginLeft: "0.5rem", color: "#d1d5db", fontSize: "0.75rem" }}>
                        e.g., {param.example}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {endpoint.queryParams.length > 0 ? (
          <div>
            <h3 style={{ fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem", color: "#9ca3af" }}>
              Query Parameters
            </h3>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e5e7eb", textAlign: "left" }}>
                  <th style={{ padding: "0.5rem 0", fontWeight: 500 }}>Name</th>
                  <th style={{ padding: "0.5rem 0", fontWeight: 500 }}>Type</th>
                  <th style={{ padding: "0.5rem 0", fontWeight: 500 }}>Required</th>
                  <th style={{ padding: "0.5rem 0", fontWeight: 500 }}>Description</th>
                </tr>
              </thead>
              <tbody>
                {endpoint.queryParams.map((param) => (
                  <tr key={param.name} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "0.5rem 0" }}>
                      <code style={{ fontFamily: "monospace", color: "#7c3aed" }}>{param.name}</code>
                    </td>
                    <td style={{ padding: "0.5rem 0", color: "#9ca3af" }}>{param.type}</td>
                    <td style={{ padding: "0.5rem 0", color: param.required ? "#dc2626" : "#6b7280" }}>
                      {param.required ? "Yes" : "No"}
                    </td>
                    <td style={{ padding: "0.5rem 0", color: "#d1d5db" }}>{param.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : endpoint.pathParams.length === 0 ? (
          <p style={{ color: "#9ca3af", fontSize: "0.875rem", margin: 0 }}>
            This endpoint has no input parameters.
          </p>
        ) : null}
      </section>

      {/* Example Request */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem", color: "#22c55e" }}>
          Example Request
        </h2>
        <pre
          style={{
            background: "#1f2937",
            color: "#f3f4f6",
            padding: "1rem",
            borderRadius: "0.375rem",
            fontFamily: "monospace",
            fontSize: "0.875rem",
            overflow: "auto",
            margin: 0,
          }}
        >
          {endpoint.exampleRequest}
        </pre>
      </section>

      {/* Response Shape */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem", color: "#22c55e" }}>
          Response Shape
        </h2>
        <p style={{ color: "#9ca3af", fontSize: "0.875rem", marginBottom: "0.75rem" }}>
          {endpoint.responseType === "paginated"
            ? "Returns a paginated response with data array and pagination metadata."
            : endpoint.responseType === "list"
            ? "Returns an array of records."
            : "Returns a single object."}
        </p>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e5e7eb", textAlign: "left" }}>
              <th style={{ padding: "0.5rem 0", fontWeight: 500 }}>Field</th>
              <th style={{ padding: "0.5rem 0", fontWeight: 500 }}>Type</th>
              <th style={{ padding: "0.5rem 0", fontWeight: 500 }}>Description</th>
            </tr>
          </thead>
          <tbody>
            {endpoint.responseFields.map((field) => (
              <tr key={field.name} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "0.5rem 0" }}>
                  <code style={{ fontFamily: "monospace", color: "#7c3aed" }}>{field.name}</code>
                </td>
                <td style={{ padding: "0.5rem 0", color: "#9ca3af" }}>{field.type}</td>
                <td style={{ padding: "0.5rem 0", color: "#d1d5db" }}>{field.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Intended Use */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem", color: "#22c55e" }}>
          Intended Use
        </h2>
        <p style={{ color: "#d1d5db", lineHeight: 1.6, margin: 0 }}>{endpoint.intendedUse}</p>
      </section>
    </main>
  );
}
