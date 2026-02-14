import SwiftUI

struct PostConcernView: View {
    // Initialize the ViewModel, passing the authenticated user's ID
    // The actual user ID should be passed from the parent view (e.g., MainAppView)
    @StateObject private var viewModel: PostConcernViewModel 
    
    // Environment variable to dismiss the view (if presented modally)
    @Environment(\.dismiss) var dismiss 

    // Initializer to accept the authorId
    init(authorId: UUID?) {
        _viewModel = StateObject(wrappedValue: PostConcernViewModel(authorId: authorId))
    }

    var body: some View {
        NavigationView { // Use NavigationView for title and potential toolbar items
            Form {
                Section(header: Text("Your Concern")) {
                    // Use TextEditor for multi-line input
                    TextEditor(text: $viewModel.concernText)
                        .frame(height: 150) // Set a reasonable height
                        .overlay(
                             RoundedRectangle(cornerRadius: 8)
                                 .stroke(Color(.systemGray4), lineWidth: 1)
                         )
                    
                    TextField("Your Name (Optional)", text: $viewModel.authorName)
                }

                Section(header: Text("Location Details")) {
                    Picker("Geographic Level", selection: $viewModel.selectedGeographicLevel) {
                        ForEach(GeographicLevel.allCases, id: \.self) { level in
                            Text(level.rawValue).tag(level)
                        }
                    }
                    
                    TextField(locationPlaceholder, text: $viewModel.locationIdentifier)
                        .autocapitalization(.words) // Suggest capitalizing location names
                }

                Section {
                    Button("Submit Concern") {
                        viewModel.postConcern()
                    }
                    .disabled(!viewModel.isFormValid || viewModel.isPosting) // Disable if form invalid or posting
                }
                
                // Display feedback messages
                if viewModel.isPosting {
                    HStack {
                        Spacer()
                        ProgressView()
                        Text("Posting...")
                        Spacer()
                    }
                }
                
                if let errorMessage = viewModel.errorMessage {
                    Text(errorMessage)
                        .foregroundColor(.red)
                        .font(.caption)
                }
                
                // Show success message and maybe offer to post another
                if viewModel.postSuccess {
                     Text("Concern posted successfully!")
                         .foregroundColor(.green)
                         .onAppear {
                             // Optionally dismiss the view after a short delay
                             DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                                 // Only dismiss if the success state is still true
                                 if viewModel.postSuccess {
                                      // Resetting form is now done in ViewModel on success
                                      // dismiss() // Uncomment if presenting modally
                                 }
                             }
                         }
                 }
            }
            .navigationTitle("Post a Concern")
            .navigationBarTitleDisplayMode(.inline)
            // Add a Cancel button if presented modally
            // .toolbar {
            //     ToolbarItem(placement: .navigationBarLeading) {
            //         Button("Cancel") {
            //             dismiss()
            //         }
            //     }
            // }
        }
        // Reset success flag when the view disappears to avoid showing old success message
        .onDisappear {
            viewModel.postSuccess = false 
        }
    }
    
    // Dynamic placeholder text based on selected geographic level
    private var locationPlaceholder: String {
        switch viewModel.selectedGeographicLevel {
            case .region: return "Region Name"
            case .village: return "Village Name"
            case .town: return "Town Name"
            case .city: return "City Name"
            case .pincode: return "Pincode (e.g., 110001)"
            case .district: return "District Name"
            case .state: return "State Name"
            case .country: return "Country Name (e.g., India)"
        }
    }
}

// MARK: - Preview Provider
struct PostConcernView_Previews: PreviewProvider {
    static var previews: some View {
        // Pass a nil or dummy UUID for preview purposes
        PostConcernView(authorId: nil) 
    }
}
