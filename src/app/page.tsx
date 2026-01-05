export default function Home() {
  const endpoints = [
    { method: "GET", path: "/api/companies", description: "Search enriched companies" },
    { method: "GET", path: "/api/companies/{domain}", description: "Get company by domain" },
    { method: "GET", path: "/api/companies/discovery", description: "Search discovery companies" },
    { method: "GET", path: "/api/companies/discovery/{domain}", description: "Get discovery company by domain" },
    { method: "GET", path: "/api/people", description: "Search enriched profiles" },
    { method: "GET", path: "/api/people/{slug}", description: "Get person with experience and education" },
    { method: "GET", path: "/api/people/{slug}/experience", description: "Get experience only" },
    { method: "GET", path: "/api/people/{slug}/education", description: "Get education only" },
    { method: "GET", path: "/api/people/discovery", description: "Search discovery people" },
    { method: "GET", path: "/api/people/discovery/{slug}", description: "Get discovery person by slug" },
    { method: "GET", path: "/api/people/by-past-company", description: "Find people by past employer" },
    { method: "GET", path: "/api/leads/{slug}", description: "Get leads matching company's ICP" },
    { method: "GET", path: "/api/workflows", description: "List workflows" },
    { method: "GET", path: "/api/workflows/{slug}", description: "Get workflow by slug" },
    { method: "GET", path: "/api/openapi", description: "OpenAPI specification" },
  ];

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif", maxWidth: "800px" }}>
      <h1 style={{ marginBottom: "0.5rem" }}>HQ Master Data API</h1>
      <p style={{ color: "#22c55e", fontWeight: 500, marginBottom: "2rem" }}>● Running</p>

      <section style={{ marginBottom: "2rem" }}>
        <a
          href="/api/openapi"
          style={{ color: "#3b82f6", textDecoration: "underline" }}
        >
          OpenAPI Specification →
        </a>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Endpoints</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e5e7eb", textAlign: "left" }}>
              <th style={{ padding: "0.5rem 0", width: "60px" }}>Method</th>
              <th style={{ padding: "0.5rem 0" }}>Path</th>
              <th style={{ padding: "0.5rem 0" }}>Description</th>
            </tr>
          </thead>
          <tbody>
            {endpoints.map((endpoint) => (
              <tr key={endpoint.path} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "0.5rem 0", fontFamily: "monospace", color: "#16a34a" }}>
                  {endpoint.method}
                </td>
                <td style={{ padding: "0.5rem 0", fontFamily: "monospace" }}>
                  {endpoint.path}
                </td>
                <td style={{ padding: "0.5rem 0", color: "#6b7280" }}>
                  {endpoint.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
