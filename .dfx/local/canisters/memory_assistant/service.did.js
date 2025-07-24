export const idlFactory = ({ IDL }) => {
  const MemoryAnalytics = IDL.Record({
    'mostCommonQuery' : IDL.Text,
    'failedRecalls' : IDL.Nat,
    'totalQueries' : IDL.Nat,
    'successfulRecalls' : IDL.Nat,
  });
  const EmergencyContact = IDL.Record({
    'relationship' : IDL.Text,
    'name' : IDL.Text,
    'phone' : IDL.Text,
  });
  const Time = IDL.Int;
  const Anchor = IDL.Record({
    'question' : IDL.Text,
    'lastAccessed' : Time,
    'response' : IDL.Text,
    'priority' : IDL.Nat,
  });
  const UserRole = IDL.Variant({
    'Caregiver' : IDL.Null,
    'Admin' : IDL.Null,
    'Patient' : IDL.Null,
  });
  return IDL.Service({
    'addEmergencyContact' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text],
        [IDL.Text],
        [],
      ),
    'getAnalytics' : IDL.Func([], [MemoryAnalytics], ['query']),
    'getEmergencyContacts' : IDL.Func(
        [],
        [IDL.Vec(EmergencyContact)],
        ['query'],
      ),
    'getMemory' : IDL.Func([IDL.Text], [IDL.Text], ['query']),
    'listAnchors' : IDL.Func([], [IDL.Vec(Anchor)], ['query']),
    'registerUser' : IDL.Func([IDL.Text, UserRole], [IDL.Text], []),
    'removeAnchor' : IDL.Func([IDL.Text], [IDL.Text], []),
    'setAnchor' : IDL.Func([IDL.Text, IDL.Text], [IDL.Text], []),
  });
};
export const init = ({ IDL }) => { return []; };
