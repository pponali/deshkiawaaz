package com.prajaavaani.backend.model;

public enum GeographicLevel {
    REGION("Region"),
    VILLAGE("Village"),
    TOWN("Town"),
    CITY("City"),
    PINCODE("Pincode"),
    DISTRICT("District"),
    STATE("State"),
    COUNTRY("Country");

    private final String displayName;

    GeographicLevel(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    // Optional: Method to find enum by display name if needed
    public static GeographicLevel fromDisplayName(String name) {
        for (GeographicLevel level : GeographicLevel.values()) {
            if (level.displayName.equalsIgnoreCase(name)) {
                return level;
            }
        }
        throw new IllegalArgumentException("No enum constant with display name " + name);
    }
}
