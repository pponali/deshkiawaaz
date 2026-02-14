import Foundation
import Combine

class PostConcernViewModel: ObservableObject {
    
    @Published var concernText: String = ""
    @Published var authorName: String = "" // Optional author name
    @Published var selectedGeographicLevel: GeographicLevel = .pincode // Default level
    @Published var locationIdentifier: String = "" // e.g., the actual pincode, city name
    
    @Published var isPosting: Bool = false
    @Published var postSuccess: Bool = false
    @Published var errorMessage: String? = nil
    
    // Store the authenticated user's ID if needed
    private var authorId: UUID? 
    
    // Placeholder for the service that handles posting concerns
    private let concernService = MockConcernService()
    private var cancellables = Set<AnyCancellable>()

    // Initialize with the authenticated user's ID (optional based on spec)
    init(authorId: UUID?) {
        self.authorId = authorId
    }
    
    // Computed property to check if the form is valid for submission
    var isFormValid: Bool {
        !concernText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
        !locationIdentifier.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    func postConcern() {
        guard isFormValid else {
            errorMessage = "Please enter the concern text and location identifier."
            return
        }
        
        isPosting = true
        postSuccess = false
        errorMessage = nil
        
        let newConcern = Concern(
            authorId: self.authorId, // Pass the logged-in user's ID if available
            authorName: authorName.isEmpty ? nil : authorName, // Use nil if empty
            text: concernText,
            geographicLevel: selectedGeographicLevel,
            locationIdentifier: locationIdentifier
        )
        
        concernService.submitConcern(concern: newConcern)
            .receive(on: DispatchQueue.main)
            .sink(receiveCompletion: { [weak self] completion in
                self?.isPosting = false
                switch completion {
                case .failure(let error):
                    self?.errorMessage = "Failed to post concern: \(error.localizedDescription)"
                    self?.postSuccess = false
                case .finished:
                    break // Success is handled in receiveValue
                }
            }, receiveValue: { [weak self] success in
                if success {
                    self?.postSuccess = true
                    print("Concern posted successfully (mock)")
                    // Optionally reset form fields after successful post
                    self?.resetForm() 
                } else {
                    // Should be handled by error in completion, but being defensive
                    self?.errorMessage = "Failed to post concern (unknown reason)."
                    self?.postSuccess = false
                }
            })
            .store(in: &cancellables)
    }
    
    // Function to reset form fields
    func resetForm() {
        concernText = ""
        authorName = ""
        // Keep selectedGeographicLevel or reset as needed
        locationIdentifier = ""
        postSuccess = false // Reset success flag for next post
        errorMessage = nil
    }
}

// MARK: - Mock Concern Service (Replace with real API calls)

struct MockConcernService {
    
    // Simulates submitting a concern to the backend
    func submitConcern(concern: Concern) -> Future<Bool, Error> {
        return Future { promise in
            print("Mock Service: Submitting concern...")
            print("Concern Details: \(concern)")
            // Simulate network delay
            DispatchQueue.global().asyncAfter(deadline: .now() + 1.5) {
                // Simulate success/failure
                let success = Bool.random() // Randomly succeed or fail
                if success {
                    print("Mock Service: Concern submitted successfully.")
                    promise(.success(true))
                } else {
                    print("Mock Service: Concern submission failed.")
                    promise(.failure(ConcernError.submissionFailed))
                }
            }
        }
    }
}

// Custom Error types for Concerns
enum ConcernError: LocalizedError {
    case submissionFailed
    case networkError(String)
    
    var errorDescription: String? {
        switch self {
        case .submissionFailed:
            return "Could not submit your concern. Please try again."
        case .networkError(let message):
            return "Network error: \(message)"
        }
    }
}
