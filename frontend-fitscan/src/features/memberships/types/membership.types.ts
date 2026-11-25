export interface MembershipPlan {
  id: string;
  name: string;
  duration_days: number;
  price: number | string;
  description?: string | null;
  features?: string[] | null;
  activeMembersCount?: number;
  is_popular?: boolean;
  is_multi_branch?: boolean;
  is_active?: boolean;
}
