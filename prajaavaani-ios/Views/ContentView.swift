import SwiftUI

struct ContentView: View {
    // State variable to track the authenticated user
    // In a real app, this might come from a shared environment object or user defaults/keychain
    @State private var authenticatedUser: User? = nil 
    @State private var showAuthentication: Bool = true // Start by showing auth view

    var body: some View {
        // Use a Group to conditionally present views without extra containers
        Group {
            if showAuthentication {
                // Show AuthenticationView and handle the callback
                AuthenticationView { user in
                    // When authentication is successful:
                    self.authenticatedUser = user
                    self.showAuthentication = false // Hide auth view
                    print("ContentView: User \(user.mobileNumber) authenticated.")
                    // TODO: Persist user session securely
                }
            } else {
                // Main application view using TabView after login
                MainAppView(user: authenticatedUser!) // Pass the authenticated user
            }
        }
        // You might want to add logic here to check for an existing session
        // when the app launches, to bypass authentication if already logged in.
        .onAppear {
            // Example: Check for saved session token on app launch
            // if AuthService.isUserLoggedIn() {
            //     self.authenticatedUser = AuthService.getCurrentUser()
            //     self.showAuthentication = false
            // }
        }
    }
}

// Main view shown after authentication, using TabView
struct MainAppView: View {
    let user: User // The authenticated user
    
    // State to manage selected tab
    @State private var selectedTab: Tab = .leaderboard

    enum Tab {
        case leaderboard
        case postConcern
    }

    var body: some View {
        TabView(selection: $selectedTab) {
            // Leaderboard Tab
            LeaderboardView(userId: user.id) // Pass user ID for voting context
                .tabItem {
                    Label("Leaderboard", systemImage: "list.star")
                }
                .tag(Tab.leaderboard)

            // Post Concern Tab
            PostConcernView(authorId: user.id) // Pass user ID as potential author
                .tabItem {
                    Label("Post Concern", systemImage: "plus.message.fill")
                }
                .tag(Tab.postConcern)
            
            // TODO: Add other tabs like Profile/Settings if needed
        }
        // Add logout functionality or user info display if desired
        // Example: Adding a title that shows the user
        // .navigationTitle("Welcome \(user.mobileNumber)") 
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
