import Foundation
import Combine

class LeaderboardViewModel: ObservableObject {
    
    @Published var concerns: [Concern] = []
    @Published var selectedLevel: GeographicLevel = .state // Default level to show
    @Published var selectedLocationIdentifier: String = "DefaultState" // Placeholder - needs actual location selection logic
    
    @Published var isLoading: Bool = false
    @Published var errorMessage: String? = nil
    
    // Store the authenticated user's ID for voting context
    private var userId: UUID? 
    
    // Placeholder for the service that handles fetching and voting on concerns
    private let concernService = MockConcernService() // Reusing the mock service
    private var cancellables = Set<AnyCancellable>()

    init(userId: UUID?) {
        self.userId = userId
        // Initial fetch on creation, or could be triggered by the view
        fetchConcerns() 
    }
    
    func fetchConcerns() {
        isLoading = true
        errorMessage = nil
        
        concernService.fetchConcerns(level: selectedLevel, locationIdentifier: selectedLocationIdentifier)
            .receive(on: DispatchQueue.main)
            .sink(receiveCompletion: { [weak self] completion in
                self?.isLoading = false
                switch completion {
                case .failure(let error):
                    self?.errorMessage = "Failed to load concerns: \(error.localizedDescription)"
                case .finished:
                    break
                }
            }, receiveValue: { [weak self] fetchedConcerns in
                // Sort concerns by net votes descending
                self?.concerns = fetchedConcerns.sorted { $0.netVotes > $1.netVotes }
                print("Fetched and sorted \(fetchedConcerns.count) concerns for \(self?.selectedLevel.rawValue ?? ""): \(self?.selectedLocationIdentifier ?? "") (mock)")
            })
            .store(in: &cancellables)
    }
    
    // Function to change the leaderboard scope and refetch
    func changeLeaderboardScope(level: GeographicLevel, locationIdentifier: String) {
        self.selectedLevel = level
        self.selectedLocationIdentifier = locationIdentifier
        // Clear existing concerns while loading new ones
        self.concerns = [] 
        fetchConcerns()
    }

    // --- Voting Logic ---
    
    func upvoteConcern(concernId: UUID) {
        guard let userId = self.userId else {
            errorMessage = "You must be logged in to vote."
            return
        }
        
        // Prevent immediate multiple clicks (optional UI feedback)
        // isLoading = true // Or a specific voting loading state
        
        concernService.castVote(userId: userId, concernId: concernId, voteType: .upvote)
            .receive(on: DispatchQueue.main)
            .sink(receiveCompletion: { [weak self] completion in
                // self?.isLoading = false 
                switch completion {
                case .failure(let error):
                    self?.errorMessage = "Upvote failed: \(error.localizedDescription)"
                case .finished:
                    break
                }
            }, receiveValue: { [weak self] updatedConcern in
                // Update the specific concern in the local array
                self?.updateLocalConcern(updatedConcern)
                print("Upvoted concern \(concernId) successfully (mock)")
            })
            .store(in: &cancellables)
    }
    
    func downvoteConcern(concernId: UUID) {
         guard let userId = self.userId else {
            errorMessage = "You must be logged in to vote."
            return
        }
        
        // isLoading = true
        
        concernService.castVote(userId: userId, concernId: concernId, voteType: .downvote)
            .receive(on: DispatchQueue.main)
            .sink(receiveCompletion: { [weak self] completion in
                 // self?.isLoading = false
                switch completion {
                case .failure(let error):
                    self?.errorMessage = "Downvote failed: \(error.localizedDescription)"
                case .finished:
                    break
                }
            }, receiveValue: { [weak self] updatedConcern in
                // Update the specific concern in the local array
                self?.updateLocalConcern(updatedConcern)
                 print("Downvoted concern \(concernId) successfully (mock)")
            })
            .store(in: &cancellables)
    }
    
    // Helper to update a concern in the local array after a vote
    private func updateLocalConcern(_ updatedConcern: Concern) {
        if let index = concerns.firstIndex(where: { $0.id == updatedConcern.id }) {
            concerns[index] = updatedConcern
            // Re-sort after update to maintain order
            concerns.sort { $0.netVotes > $1.netVotes }
        }
    }
}

// MARK: - Extend Mock Concern Service for Fetching and Voting

// Extend the existing mock service to add fetching and voting simulation
extension MockConcernService {
    
    // Simulates fetching concerns for a specific level/location
    func fetchConcerns(level: GeographicLevel, locationIdentifier: String) -> Future<[Concern], Error> {
        return Future { promise in
            print("Mock Service: Fetching concerns for \(level.rawValue): \(locationIdentifier)...")
            // Simulate network delay
            DispatchQueue.global().asyncAfter(deadline: .now() + 1.0) {
                // Generate some mock concerns
                let mockConcerns = generateMockConcerns(level: level, locationIdentifier: locationIdentifier)
                print("Mock Service: Generated \(mockConcerns.count) mock concerns.")
                promise(.success(mockConcerns))
                // Simulate potential fetch error
                // promise(.failure(ConcernError.networkError("Failed to connect"))) 
            }
        }
    }
    
    // Simulates casting a vote and returning the updated concern
    func castVote(userId: UUID, concernId: UUID, voteType: Vote.VoteType) -> Future<Concern, Error> {
         return Future { promise in
             print("Mock Service: Casting \(voteType.rawValue) for concern \(concernId) by user \(userId)...")
             // Simulate network delay
             DispatchQueue.global().asyncAfter(deadline: .now() + 0.5) {
                 // In a real app, you'd find the concern, update its vote counts,
                 // record the vote, and return the updated concern.
                 // Here, we just create a dummy updated concern.
                 
                 // Simulate finding and updating a concern (highly simplified)
                 var dummyConcern = Concern(id: concernId, text: "Updated Concern Text", geographicLevel: .pincode, locationIdentifier: "12345")
                 
                 // Simulate vote update based on type
                 if voteType == .upvote {
                     dummyConcern.upvotes += 1 
                 } else {
                     dummyConcern.downvotes += 1
                 }
                 
                 // Simulate potential error
                 let success = Bool.random()
                 if success {
                      print("Mock Service: Vote cast successfully.")
                     promise(.success(dummyConcern))
                 } else {
                      print("Mock Service: Vote casting failed.")
                     promise(.failure(ConcernError.networkError("Vote failed")))
                 }
             }
         }
     }

    // Helper to generate mock data
    private func generateMockConcerns(level: GeographicLevel, locationIdentifier: String) -> [Concern] {
        var generated: [Concern] = []
        let count = Int.random(in: 5...15) // Generate a random number of concerns
        for i in 0..<count {
            let up = Int.random(in: 0...100)
            let down = Int.random(in: 0...50)
            var concern = Concern(
                authorName: Bool.random() ? "User \(i)" : nil, // Optional author name
                text: "This is mock concern #\(i+1) for \(level.rawValue) at \(locationIdentifier). It addresses issue \(UUID().uuidString.prefix(6)).",
                geographicLevel: level,
                locationIdentifier: locationIdentifier
            )
            concern.upvotes = up
            concern.downvotes = down
            generated.append(concern)
        }
        return generated
    }
}
