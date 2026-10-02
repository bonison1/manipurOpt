// Path: app/membership/track/track-types.ts
// Shared (non-server-action) types for the unified tracker.
import type { TrackedApplication } from '../constants';
import type { RegType } from '@/app/register/config';

export type TrackKind = 'membership' | RegType;

/** Same shape TrackForm already renders, plus which form it came from. */
export type TrackedItem = TrackedApplication & { kind: TrackKind };

export type TrackResult = {
  ok: boolean;
  application?: TrackedItem;
  message?: string;
};

/** Registrations linked to a logged-in member's email (for one-click tracking). */
export type OwnRegistration = {
  referenceNo: string;
  email: string;
  title: string;
};