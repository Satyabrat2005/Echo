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
    query : Text;
    response : Text;
    lastAccessed : Time.Time;
    priority : Nat; // Higher = more important
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
  // Preload with default anchors
  anchors.put("Who are you?", {
    query = "Who are you?";
    response = "I’m your Memory Assistant. You’re safe, and I’m here to help.";
    lastAccessed = Time.now();
    priority = 10;
  });

  anchors.put("Where am I?", {
    query = "Where am I?";
    response = "You’re at home, in your living room. It’s " # (debug_show (Time.now())) # ".";
    lastAccessed = Time.now();
    priority = 9;
  });

  // ====== CORE FUNCTIONS ======
  // AI-enhanced response handling
  public query func getMemory(query : Text) : async Text {
    analytics := {
      totalQueries = analytics.totalQueries + 1;
      successfulRecalls = analytics.successfulRecalls;
      failedRecalls = analytics.failedRecalls;
      mostCommonQuery = if query.size() > analytics.mostCommonQuery.size() then query else analytics.mostCommonQuery;
    };

    switch (anchors.get(query)) {
      case (?anchor) {
        // Update last accessed time
        anchors.put(query, {
          query = anchor.query;
          response = anchor.response;
          lastAccessed = Time.now();
          priority = anchor.priority + 1; // Boost priority on access
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
        // AI Fallback: Try to find similar questions via fuzzy matching
        let similar = findSimilarMemory(query);
        if (similar.size() > 0) {
          "Did you mean: '" # similar # "'?";
        } else {
          "I’m not sure, but you’re safe. Would you like me to remember this for next time?";
        }
      };
    };
  };

  // Fuzzy search for similar memories
  func findSimilarMemory(query : Text) : Text {
    let queryWords = Text.split(query, #char ' ');
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
  // Set/update a memory anchor
  public shared({ caller }) func setAnchor(query : Text, response : Text) : async Text {
    assert isCaregiverOrAdmin(caller);
    anchors.put(query, {
      query = query;
      response = response;
      lastAccessed = Time.now();
      priority = 5; // Default priority
    });
    "Memory updated successfully!";
  };

  // Remove a memory anchor
  public shared({ caller }) func removeAnchor(query : Text) : async Text {
    assert isCaregiverOrAdmin(caller);
    ignore anchors.remove(query);
    "Memory removed.";
  };

  // List all anchors (sorted by priority)
  public query func listAnchors() : async [Anchor] {
    let buffer = Buffer.Buffer<Anchor>(anchors.size());
    for (anchor in anchors.vals()) {
      buffer.add(anchor);
    };
    Buffer.sort(buffer, func (a : Anchor, b : Anchor) : { #less; #equal; #greater } {
      if (a.priority > b.priority) #less
      else if (a.priority < b.priority) #greater
      else #equal
    });
    Buffer.toArray(buffer);
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