import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";

actor MemoryAssistant {

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

  var anchors = HashMap.HashMap<Text, Anchor>(10, Text.equal, Text.hash);
  var users = HashMap.HashMap<Principal, UserProfile>(10, Principal.equal, Principal.hash);
  var emergencyContacts = Buffer.Buffer<EmergencyContact>(3);
  var analytics : MemoryAnalytics = {
    totalQueries = 0;
    successfulRecalls = 0;
    failedRecalls = 0;
    mostCommonQuery = "";
  };

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

  public query func getMemory(q : Text) : async Text {
    let updatedMostCommonQuery =
      if (Text.size(q) > Text.size(analytics.mostCommonQuery)) {
        q
      } else {
        analytics.mostCommonQuery
      };

    analytics := {
      totalQueries = analytics.totalQueries + 1;
      successfulRecalls = analytics.successfulRecalls;
      failedRecalls = analytics.failedRecalls;
      mostCommonQuery = updatedMostCommonQuery;
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

        anchor.response
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
          "Did you mean: '" # similar # "'?"
        } else {
          "I’m not sure, but you’re safe. Would you like me to remember this for next time?"
        }
      }
    }
  };

  func findSimilarMemory(query : Text) : Text {
    let queryWords = Text.split(query, #char ' ');
    var bestMatch : Text = "";
    var bestScore : Nat = 0;

    for ((key, anchor) in anchors.entries()) {
      let keyWords = Text.split(key, #char ' ');
      var score : Nat = 0;

      for (word1 in queryWords) {
        for (word2 in keyWords) {
          if (word1 == word2) {
            score += 1;
          }
        }
      }

      if (score > bestScore) {
        bestScore := score;
        bestMatch := key;
      }
    };
    bestMatch;
  };

  public shared({ caller }) func setAnchor(q : Text, r : Text) : async Text {
    assert isCaregiverOrAdmin(caller);
    anchors.put(q, {
      query = q;
      response = r;
      lastAccessed = Time.now();
      priority = 5;
    });
    "Memory updated successfully!"
  };

  public shared({ caller }) func removeAnchor(q : Text) : async Text {
    assert isCaregiverOrAdmin(caller);
    ignore anchors.remove(q);
    "Memory removed."
  };

  public query func listAnchors() : async [Anchor] {
    let buffer = Buffer.Buffer<Anchor>(anchors.size());
    for (anchor in anchors.vals()) {
      buffer.add(anchor);
    };
    Buffer.sort(buffer, func (a : Anchor, b : Anchor) : { #less; #equal; #greater } {
      if (a.priority > b.priority) { #less }
      else if (a.priority < b.priority) { #greater }
      else { #equal }
    });
    return Buffer.toArray(buffer);
  };

  public func addEmergencyContact(name : Text, phone : Text, relationship : Text) : async Text {
    emergencyContacts.add({ name; phone; relationship });
    "Emergency contact added!"
  };

  public query func getEmergencyContacts() : async [EmergencyContact] {
    Buffer.toArray(emergencyContacts)
  };

  public shared({ caller }) func registerUser(name : Text, role : UserRole) : async Text {
    users.put(caller, {
      id = caller;
      name = name;
      role = role;
      lastActive = Time.now();
    });
    "User registered!"
  };

  public query func getAnalytics() : async MemoryAnalytics {
    analytics
  };

  func isCaregiverOrAdmin(caller : Principal) : Bool {
    switch (users.get(caller)) {
      case (?user) { user.role == #Caregiver or user.role == #Admin };
      case null { false };
    }
  };

}
