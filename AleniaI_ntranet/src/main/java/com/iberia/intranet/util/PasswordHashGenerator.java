package com.iberia.intranet.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Utility class to generate BCrypt password hashes
 * Run this class to get the hashed passwords for your database
 */
public class PasswordHashGenerator {

    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        String adminPassword = "Admin123!";
        String managerPassword = "Manager123!";
        String collaboratorPassword = "User123!";

        String adminHash = encoder.encode(adminPassword);
        String managerHash = encoder.encode(managerPassword);
        String collaboratorHash = encoder.encode(collaboratorPassword);

        System.out.println("=".repeat(80));
        System.out.println("GENERATED BCRYPT PASSWORD HASHES");
        System.out.println("=".repeat(80));
        System.out.println();

        System.out.println("Admin Password: " + adminPassword);
        System.out.println("Hash: " + adminHash);
        System.out.println();
        System.out.println("SQL:");
        System.out.println("UPDATE users SET password = '" + adminHash + "' WHERE email = 'admin@iberia.tn';");
        System.out.println();
        System.out.println("-".repeat(80));
        System.out.println();

        System.out.println("Manager Password: " + managerPassword);
        System.out.println("Hash: " + managerHash);
        System.out.println();
        System.out.println("SQL:");
        System.out.println("UPDATE users SET password = '" + managerHash + "' WHERE email = 'manager@iberia.tn';");
        System.out.println();
        System.out.println("-".repeat(80));
        System.out.println();

        System.out.println("Collaborator Password: " + collaboratorPassword);
        System.out.println("Hash: " + collaboratorHash);
        System.out.println();
        System.out.println("SQL:");
        System.out.println(
                "UPDATE users SET password = '" + collaboratorHash + "' WHERE email = 'collaborator@iberia.tn';");
        System.out.println();
        System.out.println("=".repeat(80));
    }
}
