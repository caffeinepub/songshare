import Map "mo:core/Map";
import Set "mo:core/Set";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type Song = {
    id : Nat;
    title : Text;
    artist : Text;
    genre : Text;
    link : Text;
    description : Text;
    likes : Nat;
    submittedBy : Principal;
    timestamp : Time.Time;
  };

  module Song {
    public func compareByTimestamp(s1 : Song, s2 : Song) : Order.Order {
      Int.compare(s2.timestamp, s1.timestamp);
    };
  };

  public type UserProfile = {
    name : Text;
  };

  let songs = Map.empty<Nat, Song>();
  var nextSongId = 0;
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Initialize the user system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func submitSong(title : Text, artist : Text, genre : Text, link : Text, description : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can submit songs");
    };

    let song : Song = {
      id = nextSongId;
      title;
      artist;
      genre;
      link;
      description;
      likes = 0;
      submittedBy = caller;
      timestamp = Time.now();
    };

    songs.add(nextSongId, song);
    nextSongId += 1;
  };

  public query func getAllSongs() : async [Song] {
    songs.values().toArray().sort(Song.compareByTimestamp);
  };

  public query func getSong(id : Nat) : async Song {
    switch (songs.get(id)) {
      case (null) { Runtime.trap("Song not found") };
      case (?song) { song };
    };
  };

  public shared ({ caller }) func likeSong(id : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can like songs");
    };

    switch (songs.get(id)) {
      case (null) { Runtime.trap("Song not found") };
      case (?song) {
        let updatedSong = { song with likes = song.likes + 1 };
        songs.add(id, updatedSong);
      };
    };
  };

  public shared ({ caller }) func deleteSong(id : Nat) : async () {
    switch (songs.get(id)) {
      case (null) { Runtime.trap("Song not found") };
      case (?song) {
        if (song.submittedBy != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the submitter can delete this song");
        };
        songs.remove(id);
      };
    };
  };

  public query func getGenres() : async [Text] {
    let genreSet = Set.empty<Text>();

    for (song in songs.values()) {
      genreSet.add(song.genre);
    };

    genreSet.toArray();
  };

  public query func getSongsByGenre(genre : Text) : async [Song] {
    songs.values().toArray().filter(
      func(song) {
        song.genre == genre;
      }
    );
  };

  public query func getTopSongs(count : Nat) : async [Song] {
    let sorted = songs.values().toArray().sort(
      func(s1, s2) {
        Nat.compare(s2.likes, s1.likes);
      }
    );

    let end = if (count > sorted.size()) {
      sorted.size();
    } else {
      count;
    };

    sorted.sliceToArray(0, end);
  };
};
