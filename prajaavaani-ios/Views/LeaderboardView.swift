import SwiftUI

struct LeaderboardView: View {
    // Initialize the ViewModel, passing the authenticated user's ID
    // The actual user ID should be passed from the parent view (e.g., MainAppView)
    @StateObject private var viewModel: LeaderboardViewModel
    
    // State for potentially selecting location identifier (basic implementation)
    @State private var locationInput: String = "" 

    // Initializer to accept the userId
    init(userId: UUID?) {
        _viewModel = StateObject(wrappedValue: LeaderboardViewModel(userId: userId))
        // Set initial location input based on default ViewModel state
        _locationInput = State(initialValue: viewModel.selectedLocationIdentifier)
    }

    var body: some View {
        NavigationView {
            VStack {
                // Scope Selection Controls
                LeaderboardScopeSelector(
                    selectedLevel: $viewModel.selectedLevel,
                    locationInput: $locationInput,
                    onScopeChange: { level, location in
                        viewModel.changeLeaderboardScope(level: level, locationIdentifier: location)
                    }
                )
                .padding(.bottom, 5)

                // Display Error Messages
                if let errorMessage = viewModel.errorMessage {
                    Text(errorMessage)
                        .foregroundColor(.red)
                        .font(.caption)
                        .padding(.horizontal)
                }

                // List of Concerns or Loading/Empty State
                if viewModel.isLoading && viewModel.concerns.isEmpty {
                    Spacer()
                    ProgressView("Loading Concerns...")
                    Spacer()
                } else if viewModel.concerns.isEmpty && !viewModel.isLoading {
                     Spacer()
                     Text("No concerns found for this area.")
                         .foregroundColor(.secondary)
                     Spacer()
                 } else {
                    List {
                        ForEach(viewModel.concerns) { concern in
                            ConcernRow(concern: concern, viewModel: viewModel)
                        }
                    }
                    .listStyle(.plain) // Use plain style for less visual clutter
                    // Add pull-to-refresh functionality
                    .refreshable {
                         viewModel.fetchConcerns()
                     }
                }
            }
            .navigationTitle("Leaderboard")
            // Trigger initial fetch when the view appears if needed (ViewModel init already does this)
            // .onAppear {
            //     viewModel.fetchConcerns()
            // }
        }
    }
}

// MARK: - Subviews

// View for selecting the leaderboard scope
struct LeaderboardScopeSelector: View {
    @Binding var selectedLevel: GeographicLevel
    @Binding var locationInput: String
    var onScopeChange: (GeographicLevel, String) -> Void
    
    // State to delay scope change until button press
    @State private var stagedLevel: GeographicLevel
    @State private var stagedLocation: String

    init(selectedLevel: Binding<GeographicLevel>, locationInput: Binding<String>, onScopeChange: @escaping (GeographicLevel, String) -> Void) {
        self._selectedLevel = selectedLevel
        self._locationInput = locationInput
        self.onScopeChange = onScopeChange
        // Initialize staged values
        self._stagedLevel = State(initialValue: selectedLevel.wrappedValue)
        self._stagedLocation = State(initialValue: locationInput.wrappedValue)
    }


    var body: some View {
        HStack(spacing: 10) {
            Picker("Level", selection: $stagedLevel) {
                ForEach(GeographicLevel.allCases, id: \.self) { level in
                    Text(level.rawValue).tag(level)
                }
            }
            .pickerStyle(.menu) // Compact style

            // Basic TextField for location - needs improvement for real use (e.g., search/selection)
            TextField("Location (e.g., State Name)", text: $stagedLocation)
                 .textFieldStyle(.roundedBorder)
                 .autocapitalization(.words)

            Button {
                 // Apply the staged changes and trigger fetch
                 selectedLevel = stagedLevel
                 locationInput = stagedLocation
                 onScopeChange(stagedLevel, stagedLocation)
                 // Hide keyboard
                 UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
             } label: {
                 Image(systemName: "magnifyingglass")
             }
             .buttonStyle(.bordered)
             .disabled(stagedLocation.trimmingCharacters(in: .whitespaces).isEmpty)

        }
        .padding(.horizontal)
        .padding(.top, 5)
         // Update staged values if the external bindings change
         .onChange(of: selectedLevel) { newLevel in
             stagedLevel = newLevel
         }
         .onChange(of: locationInput) { newLocation in
             stagedLocation = newLocation
         }
    }
}


// View for displaying a single concern row
struct ConcernRow: View {
    let concern: Concern
    @ObservedObject var viewModel: LeaderboardViewModel // Pass ViewModel for actions

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(concern.text)
                .lineLimit(4) // Limit text lines shown initially

            HStack {
                // Optional Author Name
                if let authorName = concern.authorName, !authorName.isEmpty {
                    Text("by \(authorName)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                } else {
                     Text("by Anonymous")
                         .font(.caption)
                         .italic()
                         .foregroundColor(.secondary)
                 }
                
                Spacer()

                // Voting Buttons
                HStack(spacing: 15) {
                    Button {
                        viewModel.upvoteConcern(concernId: concern.id)
                    } label: {
                        Label("\(concern.upvotes)", systemImage: "arrow.up.circle")
                            .labelStyle(.titleAndIcon) // Show both number and icon
                            .foregroundColor(.green)
                    }
                    .buttonStyle(.plain) // Use plain style to avoid default button appearance in List

                    Button {
                         viewModel.downvoteConcern(concernId: concern.id)
                    } label: {
                        Label("\(concern.downvotes)", systemImage: "arrow.down.circle")
                             .labelStyle(.titleAndIcon)
                             .foregroundColor(.red)
                    }
                     .buttonStyle(.plain)
                    
                    // Display Net Votes
                    Text("Net: \(concern.netVotes)")
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundColor(concern.netVotes >= 0 ? .blue : .orange)
                }
            }
            .font(.caption) // Apply caption font to the whole HStack
        }
        .padding(.vertical, 5) // Add some vertical padding within the row
    }
}


// MARK: - Preview Provider
struct LeaderboardView_Previews: PreviewProvider {
    static var previews: some View {
        // Pass a nil or dummy UUID for preview purposes
        LeaderboardView(userId: nil) 
    }
}
