import Foundation

struct Concern: Identifiable, Codable {
    let id: UUID
    let authorId: UUID? // Link to the User who posted, optional based on spec
    let authorName: String? // Optional author name provided at posting
    let text: String
    var upvotes: Int = 0
    var downvotes: Int = 0
    let createdAt: Date
    let geographicLevel: GeographicLevel // Enum to define the scope
    let locationIdentifier: String // e.g., Pincode, District Name, State Name

    // Calculated property for leaderboard sorting
    var netVotes: Int {
        upvotes - downvotes
    }

    // Example initializer
    init(id: UUID = UUID(), authorId: UUID? = nil, authorName: String? = nil, text: String, geographicLevel: GeographicLevel, locationIdentifier: String, createdAt: Date = Date()) {
        self.id = id
        self.authorId = authorId
        self.authorName = authorName
        self.text = text
        self.geographicLevel = geographicLevel
        self.locationIdentifier = locationIdentifier
        self.createdAt = createdAt
    }
}

// Enum to represent the different geographic levels for leaderboards
enum GeographicLevel: String, Codable, CaseIterable {
    case region = "Region"
    case village = "Village"
    case town = "Town"
    case city = "City"
    case pincode = "Pincode"
    case district = "District"
    case state = "State"
    case country = "Country"
}
