import SwiftUI

struct AuthenticationView: View {
    // Use @StateObject for creating and managing the ViewModel instance within this view
    @StateObject private var viewModel = AuthenticationViewModel()
    
    // Callback to notify parent view upon successful authentication
    var onAuthenticated: (User) -> Void 

    var body: some View {
        VStack(spacing: 20) {
            
            Text("Sign In / Sign Up")
                .font(.largeTitle)
                .fontWeight(.bold)
                .padding(.bottom, 30)

            // Mobile Number Input Section
            if !viewModel.isOTPSent {
                MobileNumberInputView(viewModel: viewModel)
            }
            // OTP Input Section
            else {
                OTPInputView(viewModel: viewModel)
            }

            // Display Error Messages
            if let errorMessage = viewModel.errorMessage {
                Text(errorMessage)
                    .foregroundColor(.red)
                    .font(.caption)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
            }

            Spacer() // Pushes content to the top

        }
        .padding()
        // Observe changes in isAuthenticated to trigger the callback
        .onChange(of: viewModel.isAuthenticated) { isAuthenticated in
             if isAuthenticated {
                 // Ideally, the viewModel would hold the authenticated user object
                 // For now, creating a mock user based on the number
                 // In a real app, the verifyOTP function in ViewModel should publish the user
                 let authenticatedUser = User(mobileNumber: viewModel.mobileNumber) 
                 onAuthenticated(authenticatedUser)
             }
         }
        // Disable UI elements when loading
        .disabled(viewModel.isLoading)
        // Show overlay activity indicator when loading
        .overlay {
            if viewModel.isLoading {
                ProgressView("Processing...")
                    .padding()
                    .background(.thinMaterial)
                    .cornerRadius(10)
            }
        }
    }
}

// Subview for Mobile Number Input
struct MobileNumberInputView: View {
    @ObservedObject var viewModel: AuthenticationViewModel

    var body: some View {
        VStack(spacing: 15) {
            Text("Enter your mobile number to receive an OTP:")
                .font(.headline)
                .multilineTextAlignment(.center)

            HStack {
                 Text("+91") // Country code for India
                     .padding(.leading, 8)
                     .foregroundColor(.gray)
                 
                 TextField("10-digit mobile number", text: $viewModel.mobileNumber)
                     .keyboardType(.numberPad)
                     .textContentType(.telephoneNumber)
                     .padding(10)
                     .background(Color(.systemGray6))
                     .cornerRadius(8)
                     // Limit to 10 digits
                     .onChange(of: viewModel.mobileNumber) { newValue in
                         viewModel.mobileNumber = String(newValue.prefix(10).filter { "0123456789".contains($0) })
                     }
            }
            .padding(.horizontal)


            Button("Send OTP") {
                viewModel.sendOTP()
            }
            .buttonStyle(.borderedProminent)
            .disabled(viewModel.mobileNumber.count != 10) // Enable only for 10 digits
        }
    }
}

// Subview for OTP Input
struct OTPInputView: View {
    @ObservedObject var viewModel: AuthenticationViewModel

    var body: some View {
        VStack(spacing: 15) {
            Text("Enter the 6-digit OTP sent to +91 \(viewModel.mobileNumber):")
                .font(.headline)
                .multilineTextAlignment(.center)

            TextField("OTP Code", text: $viewModel.otpCode)
                .keyboardType(.numberPad)
                .textContentType(.oneTimeCode)
                .padding(10)
                .background(Color(.systemGray6))
                .cornerRadius(8)
                .multilineTextAlignment(.center)
                .font(.title2)
                 // Limit to 6 digits
                 .onChange(of: viewModel.otpCode) { newValue in
                     viewModel.otpCode = String(newValue.prefix(6).filter { "0123456789".contains($0) })
                 }
                 .padding(.horizontal, 50)


            Button("Verify OTP") {
                viewModel.verifyOTP()
            }
            .buttonStyle(.borderedProminent)
            .disabled(viewModel.otpCode.count != 6) // Enable only for 6 digits
            
            // Button to go back and change number
            Button("Change Mobile Number") {
                viewModel.resetAuthenticationFlow()
            }
            .font(.footnote)
            .foregroundColor(.blue)
            .padding(.top, 10)
        }
    }
}

// MARK: - Preview Provider
struct AuthenticationView_Previews: PreviewProvider {
    static var previews: some View {
        // Example usage in preview: provide a dummy callback
        AuthenticationView { user in
            print("Preview: Authenticated user \(user.mobileNumber)")
        }
    }
}
