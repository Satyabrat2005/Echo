import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";

actor MemoryAssistant {
  // Memory anchors: query -> response
  var anchors = HashMap.HashMap<Text, Text>(1, Text.equal, Text.hash);

  // Preload with some default anchors
  anchors.put("Who is this?", "That’s your daughter, Ananya.");
  anchors.put("Where am I?", "You are at home, in the living room.");

  // Query method for patient
  public query func getMemory(query: Text): async Text {
    switch (anchors.get(query)) {
      case (?response) response;
      case null "I'm not sure, but you're safe.";
    }
  }

  // Caregiver can set/update anchors
  public func setAnchor(query: Text, response: Text): async Text {
    anchors.put(query, response);
    "Anchor set!"
  }

  // List all anchors (for caregiver dashboard)
  public query func listAnchors(): async [(Text, Text)] {
    anchors.entries();
  }
} 