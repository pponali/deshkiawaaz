import Foundation

struct User: Identifiable, Codable {
    let id: UUID // Unique identifier for the user
    let mobileNumber: String // Primary identifier, verified via OTP
    // Add other user profile details as needed, e.g., name, location prefs
    
    // Example initializer
    init(id: UUID = UUID(), mobileNumber: String) {
        self.id = id
        self.mobileNumber = mobileNumber
    }
}
