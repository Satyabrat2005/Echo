import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface Anchor {
  'question' : string,
  'lastAccessed' : Time,
  'response' : string,
  'priority' : bigint,
}
export interface EmergencyContact {
  'relationship' : string,
  'name' : string,
  'phone' : string,
}
export interface MemoryAnalytics {
  'mostCommonQuery' : string,
  'failedRecalls' : bigint,
  'totalQueries' : bigint,
  'successfulRecalls' : bigint,
}
export type Time = bigint;
export type UserRole = { 'Caregiver' : null } |
  { 'Admin' : null } |
  { 'Patient' : null };
export interface _SERVICE {
  'addEmergencyContact' : ActorMethod<[string, string, string], string>,
  'getAnalytics' : ActorMethod<[], MemoryAnalytics>,
  'getEmergencyContacts' : ActorMethod<[], Array<EmergencyContact>>,
  'getMemory' : ActorMethod<[string], string>,
  'listAnchors' : ActorMethod<[], Array<Anchor>>,
  'registerUser' : ActorMethod<[string, UserRole], string>,
  'removeAnchor' : ActorMethod<[string], string>,
  'setAnchor' : ActorMethod<[string, string], string>,
}
