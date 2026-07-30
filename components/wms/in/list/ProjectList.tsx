'use client';

interface Project {
  id: number;
  project_name: string;
  customer: string | null;
  expected_start_date: string | null;
}

interface Props {
  projects: Project[];
  loading: boolean;
  error: string;
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export default function ProjectList({
  projects,
  loading,
  error,
  selectedId,
  onSelect,
}: Props) {
  return (
    <div
      style={{
        height: "100%",
        overflowY: "auto",
      }}
    >
      <h3
        style={{
          padding: 16,
          margin: 0,
        }}
      >
        入庫案件
      </h3>

      {loading && (
        <div style={{ padding: 16 }}>
          読込中...
        </div>
      )}

      {error && (
        <div
          style={{
            padding: 16,
            color: "#c62828",
          }}
        >
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        projects.map((project) => (
          <div
            key={project.id}
            onClick={() => onSelect(project.id)}
            style={{
              padding: 12,
              cursor: "pointer",
              backgroundColor:
                selectedId === project.id
                  ? "#e5e7eb"
                  : "#fff",
              borderBottom: "1px solid #eee",
            }}
          >
            <div
              style={{
                fontWeight: "bold",
              }}
            >
              {project.project_name}
            </div>

            <div
              style={{
                fontSize: 12,
                color: "#666",
                marginTop: 4,
              }}
            >
              {project.customer ?? "-"}
            </div>

            <div
              style={{
                fontSize: 12,
                color: "#999",
                marginTop: 2,
              }}
            >
              {project.expected_start_date
                ? new Date(
                    project.expected_start_date
                  ).toLocaleDateString("ja-JP")
                : "-"}
            </div>
          </div>
        ))}

      {!loading &&
        !error &&
        projects.length === 0 && (
          <div
            style={{
              padding: 16,
              color: "#777",
            }}
          >
            案件がありません
          </div>
        )}
    </div>
  );
}
