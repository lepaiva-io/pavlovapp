export interface Family { id: string; name: string; role?: string }
export interface Member {
  id: string; family_id: string; user_id: string | null; email: string | null;
  role: string; invited_at?: string; joined_at?: string | null
}
export interface Pet {
  id: string; family_id: string; name: string; species: string; breed: string | null;
  sex: string | null; birthdate_approx: string | null; adoption_date: string | null;
  microchip: string | null; sterilized: boolean | null; photo_url: string | null;
  clinic_name: string | null; status: string; notes: string | null;
  target_weight_kg: number | null; created_at?: string
}
export interface MedicalRecord {
  id: string; pet_id: string; category: string; title: string; description: string | null;
  event_date: string | null; next_due_date: string | null; vet_name: string | null;
  created_by: string | null; created_at?: string; done: boolean
}
export interface DailyLog {
  id: string; pet_id: string; log_date: string; meals: string | null; stool: string | null;
  mood: string | null; weight_kg: number | null; notes: string | null; created_by: string | null
}
export interface Reminder {
  id: string; pet_id: string; title: string; due_date: string | null; done: boolean;
  notes: string | null; created_by: string | null
}
export interface Contact {
  id: string; family_id: string; name: string; role: string; phone: string | null;
  email: string | null; notes: string | null
}
export interface SkillVideo { id: string; t: string }
export interface TrainingSkill {
  id: string; phase_order: number; phase_tag: string; phase_name: string;
  phase_period: string | null; phase_focus: string | null; skill_order: number;
  title: string; goal: string | null; steps: string[]; videos: SkillVideo[]; done_criteria: string | null
}
export interface SkillStatusRow { skill_id: string; status: string }
export interface SkillSessionRow { skill_id?: string; reps: number; session_date?: string; notes?: string | null }
export interface DailyEvent {
  id: string; pet_id: string; event_type: string; value: string | null; note: string | null;
  occurred_at: string; created_by: string | null
}

export type Status = 'pendiente' | 'en_progreso' | 'logrado'
