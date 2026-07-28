export interface Project {
  id: number;

  project_name: string;
  project_type: string;

  customer: string | null;
  company: string | null;

  status: string | null;
  priority: string | null;

  expected_start_date: string | null;
  expected_end_date: string | null;

  actual_start_date: string | null;
  actual_end_date: string | null;

  percent_complete: number;
  collect_progress: boolean;

  notes: string | null;
  is_active: boolean;

  created_at: string;
  updated_at: string;
}

export interface SaveProjectInput {
  id?: number;

  project_name: string;
  project_type: string;

  customer: string | null;
  company: string | null;

  status: string | null;
  priority: string | null;

  expected_start_date: string | null;
  expected_end_date: string | null;

  actual_start_date: string | null;
  actual_end_date: string | null;

  percent_complete: number;
  collect_progress: boolean;

  notes: string | null;
  is_active: boolean;
}
