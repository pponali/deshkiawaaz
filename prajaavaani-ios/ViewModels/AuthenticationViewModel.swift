import Foundation
import Combine // For using @Published

class AuthenticationViewModel: ObservableObject {
    
    @Published var mobileNumber: String = ""
    @Published var otpCode: String = ""
    
    @Published var isOTPSent: Bool = false // To control UI flow (show OTP field)
    @Published var isAuthenticated: Bool = false // To indicate successful login
    @Published var errorMessage: String? = nil // To display errors to the user
    @Published var isLoading: Bool = false // To show loading indicators
    
    private var cancellables = Set<AnyCancellable>()
    
    // Placeholder for the actual authentication service
    // In a real app, this would interact with your backend API
    private let authService = MockAuthService()
    
    func sendOTP() {
        guard validateMobileNumber(mobileNumber) else {
            errorMessage = "Invalid mobile number format. Please enter a 10-digit number."
            return
        }
        
        isLoading = true
        errorMessage = nil
        
        authService.requestOTP(mobileNumber: mobileNumber)
            .receive(on: DispatchQueue.main) // Ensure UI updates on main thread
            .sink(receiveCompletion: { [weak self] completion in
                self?.isLoading = false
                switch completion {
                case .failure(let error):
                    self?.errorMessage = "Failed to send OTP: \(error.localizedDescription)"
                    self?.isOTPSent = false
                case .finished:
                    break
                }
            }, receiveValue: { [weak self] success in
                if success {
                    self?.isOTPSent = true
                    print("OTP Sent successfully (mock)")
                } else {
                    // This case might not happen with Combine PassthroughSubject<Bool, Error>
                    // but handling defensively. Error is handled in completion.
                     self?.errorMessage = "Failed to send OTP (unknown reason)."
                     self?.isOTPSent = false
                }
            })
            .store(in: &cancellables)
    }
    
    func verifyOTP() {
        guard !otpCode.isEmpty else {
            errorMessage = "Please enter the OTP code."
            return
        }
        
        isLoading = true
        errorMessage = nil
        
        authService.verifyOTP(mobileNumber: mobileNumber, otpCode: otpCode)
            .receive(on: DispatchQueue.main)
            .sink(receiveCompletion: { [weak self] completion in
                self?.isLoading = false
                switch completion {
                case .failure(let error):
                    self?.errorMessage = "OTP Verification Failed: \(error.localizedDescription)"
                    self?.isAuthenticated = false
                case .finished:
                    break
                }
            }, receiveValue: { [weak self] user in
                // Assuming successful verification returns a User object (or token)
                // For simplicity, just setting isAuthenticated flag
                self?.isAuthenticated = true
                // TODO: Store user session/token securely
                print("OTP Verified successfully for user: \(user.mobileNumber) (mock)")
            })
            .store(in: &cancellables)
    }
    
    // Basic validation for Indian mobile numbers (10 digits)
    private func validateMobileNumber(_ number: String) -> Bool {
        let pattern = #"^\d{10}$"#
        return number.range(of: pattern, options: .regularExpression) != nil
    }
    
    // Function to reset state if user wants to go back
    func resetAuthenticationFlow() {
        mobileNumber = ""
        otpCode = ""
        isOTPSent = false
        isAuthenticated = false
        errorMessage = nil
        isLoading = false
        cancellables.forEach { $0.cancel() } // Cancel ongoing requests
    }
}

// MARK: - Mock Authentication Service (Replace with real API calls)

struct MockAuthService {
    
    // Simulates requesting an OTP
    func requestOTP(mobileNumber: String) -> Future<Bool, Error> {
        return Future { promise in
            print("Mock Service: Requesting OTP for \(mobileNumber)...")
            // Simulate network delay
            DispatchQueue.global().asyncAfter(deadline: .now() + 1.5) {
                // Simulate success/failure
                let success = Bool.random() // Randomly succeed or fail for demo
                if success {
                    print("Mock Service: OTP request successful for \(mobileNumber)")
                    promise(.success(true))
                } else {
                    print("Mock Service: OTP request failed for \(mobileNumber)")
                    promise(.failure(AuthError.otpSendFailed))
                }
            }
        }
    }
    
    // Simulates verifying the OTP
    func verifyOTP(mobileNumber: String, otpCode: String) -> Future<User, Error> {
        return Future { promise in
            print("Mock Service: Verifying OTP \(otpCode) for \(mobileNumber)...")
            // Simulate network delay
            DispatchQueue.global().asyncAfter(deadline: .now() + 1.5) {
                // Simulate success/failure based on a mock OTP
                let mockCorrectOTP = "123456"
                if otpCode == mockCorrectOTP {
                     print("Mock Service: OTP verification successful for \(mobileNumber)")
                    // Return a mock user object
                    let user = User(mobileNumber: mobileNumber)
                    promise(.success(user))
                } else {
                     print("Mock Service: OTP verification failed for \(mobileNumber)")
                    promise(.failure(AuthError.invalidOTP))
                }
            }
        }
    }
}

// Custom Error types for Authentication
enum AuthError: LocalizedError {
    case otpSendFailed
    case invalidOTP
    case networkError(String)
    case unknownError
    
    var errorDescription: String? {
        switch self {
        case .otpSendFailed:
            return "Could not send OTP. Please try again later."
        case .invalidOTP:
            return "The OTP entered is incorrect."
        case .networkError(let message):
            return "Network error: \(message)"
        case .unknownError:
            return "An unexpected error occurred."
        }
    }
}
