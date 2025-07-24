import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";

actor MemoryAssistant {
  // ====== TYPES ======
  type Anchor = {
    question : Text;
    response : Text;
    lastAccessed : Time.Time;
    priority : Nat;
  };

  type UserRole = {
    #Patient;
    #Caregiver;
    #Admin;
  };

  type UserProfile = {
    id : Principal;
    name : Text;
    role : UserRole;
    lastActive : Time.Time;
  };

  type EmergencyContact = {
    name : Text;
    phone : Text;
    relationship : Text;
  };

  type MemoryAnalytics = {
    totalQueries : Nat;
    successfulRecalls : Nat;
    failedRecalls : Nat;
    mostCommonQuery : Text;
  };

  // ====== STATE ======
  var anchors = HashMap.HashMap<Text, Anchor>(1, Text.equal, Text.hash);
  var users = HashMap.HashMap<Principal, UserProfile>(1, Principal.equal, Principal.hash);
  var emergencyContacts = Buffer.Buffer<EmergencyContact>(3);
  var analytics : MemoryAnalytics = {
    totalQueries = 0;
    successfulRecalls = 0;
    failedRecalls = 0;
    mostCommonQuery = "";
  };

  // ====== INITIALIZATION ======
  anchors.put("Who are you?", {
    question = "Who are you?";
    response = "I’m your Memory Assistant. You’re safe, and I’m here to help.";
    lastAccessed = Time.now();
    priority = 10;
  });

  anchors.put("Where am I?", {
    question = "Where am I?";
    response = "You’re at home, in your living room. It’s " # debug_show(Time.now()) # ".";
    lastAccessed = Time.now();
    priority = 9;
  });

  // ====== CORE FUNCTIONS ======
  public query func getMemory(q : Text) : async Text {
    analytics := {
      totalQueries = analytics.totalQueries + 1;
      successfulRecalls = analytics.successfulRecalls;
      failedRecalls = analytics.failedRecalls;
      mostCommonQuery = (if (Text.size(q) > Text.size(analytics.mostCommonQuery)) q else analytics.mostCommonQuery);
    };

    switch (anchors.get(q)) {
      case (?anchor) {
        anchors.put(q, {
          question = anchor.question;
          response = anchor.response;
          lastAccessed = Time.now();
          priority = anchor.priority + 1;
        });
        analytics := {
          totalQueries = analytics.totalQueries;
          successfulRecalls = analytics.successfulRecalls + 1;
          failedRecalls = analytics.failedRecalls;
          mostCommonQuery = analytics.mostCommonQuery;
        };
        anchor.response;
      };
      case null {
        analytics := {
          totalQueries = analytics.totalQueries;
          successfulRecalls = analytics.successfulRecalls;
          failedRecalls = analytics.failedRecalls + 1;
          mostCommonQuery = analytics.mostCommonQuery;
        };
        let similar = findSimilarMemory(q);
        if (Text.size(similar) > 0) {
          "Did you mean: '" # similar # "'?";
        } else {
          "I’m not sure, but you’re safe. Would you like me to remember this for next time?";
        }
      };
    };
  };

  func findSimilarMemory(q : Text) : Text {
    let queryWords = Text.split(q, #char ' ');
    var bestMatch : Text = "";
    var bestScore : Nat = 0;

    for ((key, anchor) in anchors.entries()) {
      let keyWords = Text.split(key, #char ' ');
      var score : Nat = 0;

      for (word1 in queryWords) {
        for (word2 in keyWords) {
          if (word1 == word2) score += 1;
        };
      };

      if (score > bestScore) {
        bestScore := score;
        bestMatch := key;
      };
    };

    bestMatch;
  };

  // ====== CAREGIVER & ADMIN FUNCTIONS ======
  public shared({ caller }) func setAnchor(q : Text, r : Text) : async Text {
    assert isCaregiverOrAdmin(caller);
    anchors.put(q, {
      question = q;
      response = r;
      lastAccessed = Time.now();
      priority = 5;
    });
    "Memory updated successfully!";
  };

  public shared({ caller }) func removeAnchor(q : Text) : async Text {
    assert isCaregiverOrAdmin(caller);
    ignore anchors.remove(q);
    "Memory removed.";
  };

  public query func listAnchors() : async [Anchor] {
    let unsorted : [Anchor] = Iter.toArray(anchors.vals());
    Array.sort<Anchor>(unsorted, func(a, b) {
      if (a.priority > b.priority) #less
      else if (a.priority < b.priority) #greater
      else #equal
    });
    return unsorted;
  };

  // ====== EMERGENCY PROTOCOLS ======
  public func addEmergencyContact(name : Text, phone : Text, relationship : Text) : async Text {
    emergencyContacts.add({ name; phone; relationship });
    "Emergency contact added!";
  };

  public query func getEmergencyContacts() : async [EmergencyContact] {
    Buffer.toArray(emergencyContacts);
  };

  // ====== USER MANAGEMENT ======
  public shared({ caller }) func registerUser(name : Text, role : UserRole) : async Text {
    users.put(caller, {
      id = caller;
      name = name;
      role = role;
      lastActive = Time.now();
    });
    "User registered!";
  };

  // ====== ANALYTICS ======
  public query func getAnalytics() : async MemoryAnalytics {
    analytics;
  };

  // ====== HELPER FUNCTIONS ======
  func isCaregiverOrAdmin(caller : Principal) : Bool {
    switch (users.get(caller)) {
      case (?user) user.role == #Caregiver or user.role == #Admin;
      case null false;
    };
  };
};
