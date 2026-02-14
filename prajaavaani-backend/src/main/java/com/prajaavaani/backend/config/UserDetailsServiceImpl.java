package com.prajaavaani.backend.config; // Placing in config package for security related beans

import com.prajaavaani.backend.model.UserEntity;
import com.prajaavaani.backend.repository.UserRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections; // For empty authorities list

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // In our case, username is the mobile number
        UserEntity userEntity = userRepository.findByMobileNumber(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with mobile number: " + username));

        // Create Spring Security UserDetails object
        // Using an empty password "" because auth is handled by OTP/JWT, not password comparison here.
        // Assign roles/authorities if implemented later.
        return new User(userEntity.getMobileNumber(), "", Collections.emptyList());
    }

    // Optional: Method to load UserDetails by ID if needed elsewhere
    public UserDetails loadUserById(java.util.UUID id) throws UsernameNotFoundException {
         UserEntity userEntity = userRepository.findById(id)
                 .orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + id));
         return new User(userEntity.getMobileNumber(), "", Collections.emptyList());
     }
}
