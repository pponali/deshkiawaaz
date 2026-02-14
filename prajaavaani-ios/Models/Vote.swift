import Foundation

struct Vote: Identifiable, Codable {
    let id: UUID
    let userId: UUID // User who voted
    let concernId: UUID // Concern being voted on
    let voteType: VoteType // Upvote or Downvote
    let timestamp: Date

    enum VoteType: String, Codable {
        case upvote
        case downvote
    }

    // Example initializer
    init(id: UUID = UUID(), userId: UUID, concernId: UUID, voteType: VoteType, timestamp: Date = Date()) {
        self.id = id
        self.userId = userId
        self.concernId = concernId
        self.voteType = voteType
        self.timestamp = timestamp
    }
}
