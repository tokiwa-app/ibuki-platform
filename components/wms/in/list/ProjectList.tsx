'use client';

interface Project {
  id: number;
  project_name: string;
  customer: string | null;
  expected_start_date: string | null;
}

interface ProjectListProps {
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
}: ProjectListProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: 12,
          borderBottom: "1px solid #ddd",
          fontSize: 14,
          fontWeight: "bold",
          backgroundColor: "#fafafa",
        }}
      >
        プロジェクト一覧
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
        }}
      >
        {loading && (
          <div style={{ padding: 12 }}>
            読込中...
          </div>
        )}

        {error && (
          <div
            style={{
              padding: 12,
              color: "#c62828",
            }}
          >
            {error}
          </div>
        )}

        {!loading &&
          projects.map((project) => {
            const selected =
              project.id === selectedId;

            return (
              <div
                key={project.id}
                onClick={() =>
                  onSelect(project.id)
                }
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "120px 140px 1fr",
                  gap: 8,
                  padding: "10px 12px",
                  borderBottom:
                    "1px solid #eee",
                  cursor: "pointer",
                  backgroundColor:
                    selected
                      ? "#e8f5e9"
                      : "#fff",
                }}
              >
                <div>
                  {project.expected_start_date ?? "-"}
                </div>

                <div>
                  {project.customer ?? "-"}
                </div>

                <div
                  style={{
                    fontWeight: "bold",
                  }}
                >
                  {project.project_name}
                </div>
              </div>
            );
          })}

        {!loading &&
          !error &&
          projects.length === 0 && (
            <div
              style={{
                padding: 12,
                color: "#777",
              }}
            >
              案件がありません
            </div>
          )}
      </div>
    </div>
  );
}
