package com.iberia.intranet.service;

import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * First-level IT support chatbot using keyword pattern matching.
 * Returns a helpful response or null if unable to resolve.
 */
@Service
public class ChatbotService {

    private final Map<Pattern, String> knowledgeBase = new LinkedHashMap<>();

    public ChatbotService() {
        // Password & Account
        knowledgeBase.put(
                Pattern.compile("(?i).*(password|reset|forgot|locked|account.*lock).*"),
                "🔑 **Password Reset**\n\n" +
                        "1. Go to https://password.alenia-iberia.com\n" +
                        "2. Click 'Forgot Password'\n" +
                        "3. Enter your corporate email\n" +
                        "4. Check your inbox for the reset link\n" +
                        "5. Create a new password (min 12 chars, 1 uppercase, 1 number, 1 special)\n\n" +
                        "If your account is locked, wait 15 minutes and try again. If the issue persists, I can escalate to IT support.");

        // VPN
        knowledgeBase.put(
                Pattern.compile("(?i).*(vpn|remote|connect.*work|work.*home|tunnel).*"),
                "🌐 **VPN Troubleshooting**\n\n" +
                        "1. Open GlobalProtect VPN client\n" +
                        "2. Server: vpn.alenia-iberia.com\n" +
                        "3. Use your corporate credentials\n\n" +
                        "**If not connecting:**\n" +
                        "• Check your internet connection\n" +
                        "• Restart the VPN client\n" +
                        "• Ensure your password hasn't expired\n" +
                        "• Try disconnecting from other VPNs first\n\n" +
                        "Still having issues? I can connect you to IT support.");

        // Email & Outlook
        knowledgeBase.put(
                Pattern.compile("(?i).*(email|outlook|mail|calendar|teams.*mail|inbox).*"),
                "📧 **Email / Outlook Support**\n\n" +
                        "**Outlook not syncing:**\n" +
                        "1. Check internet connection\n" +
                        "2. File → Account Settings → Repair\n" +
                        "3. Clear Outlook cache: %localappdata%\\Microsoft\\Outlook\n\n" +
                        "**Can't send emails:**\n" +
                        "• Check if attachment exceeds 25MB limit\n" +
                        "• Verify recipient address\n" +
                        "• Check Outbox for stuck messages\n\n" +
                        "Need further help? I can escalate this.");

        // Software & Installation
        knowledgeBase.put(
                Pattern.compile("(?i).*(install|software|application|access|license|programme|program).*"),
                "💿 **Software Installation & Access**\n\n" +
                        "1. Open the **Software Center** from your Start menu\n" +
                        "2. Browse or search for the application\n" +
                        "3. Click 'Install'\n\n" +
                        "**If the software is not available:**\n" +
                        "• Submit a request via IT Support → Open Ticket\n" +
                        "• Include the software name and business justification\n" +
                        "• Approval typically takes 1-2 business days\n\n" +
                        "Need a specific license? I can escalate this.");

        // Printer
        knowledgeBase.put(
                Pattern.compile("(?i).*(printer|print|scanner|scan|copier).*"),
                "🖨️ **Printer Setup**\n\n" +
                        "1. Settings → Printers & Scanners → Add printer\n" +
                        "2. Select your floor printer from the list\n" +
                        "3. If not found, use IP: print-floor[X].alenia-iberia.local\n\n" +
                        "**Print jobs stuck:**\n" +
                        "• Open Print Queue → Cancel all\n" +
                        "• Restart Print Spooler service\n" +
                        "• Try a different printer\n\n" +
                        "Still not working? I can connect you to support.");

        // Teams / Communication
        knowledgeBase.put(
                Pattern.compile("(?i).*(teams|meeting|video|call|conference|zoom|share.*screen).*"),
                "💬 **Microsoft Teams Support**\n\n" +
                        "**Can't join meetings:**\n" +
                        "• Update Teams to latest version\n" +
                        "• Check audio/video permissions in Settings\n" +
                        "• Try the web version at teams.microsoft.com\n\n" +
                        "**Screen sharing not working:**\n" +
                        "• Close other screen sharing apps\n" +
                        "• Check if your admin has enabled screen sharing\n" +
                        "• Try 'Share Window' instead of 'Share Desktop'");

        // Wi-Fi / Network
        knowledgeBase.put(
                Pattern.compile("(?i).*(wifi|wi-fi|network|internet|connection|slow).*"),
                "📶 **Network & Wi-Fi**\n\n" +
                        "**Office Wi-Fi:** Connect to 'Alenia-Corp' (auto-authenticated)\n\n" +
                        "**Slow connection:**\n" +
                        "1. Restart your computer\n" +
                        "2. Forget and reconnect to Wi-Fi\n" +
                        "3. Try using an ethernet cable\n" +
                        "4. Check if VPN is slowing the connection\n\n" +
                        "If the problem persists, I can escalate to the network team.");

        // Hello / Greeting
        knowledgeBase.put(
                Pattern.compile("(?i)^(hello|hi|hey|bonjour|salut|help|aide).*"),
                "👋 Hello! I'm the Alenia IT Support Bot.\n\n" +
                        "I can help you with:\n" +
                        "• 🔑 Password reset\n" +
                        "• 🌐 VPN connection\n" +
                        "• 📧 Email / Outlook issues\n" +
                        "• 💿 Software installation\n" +
                        "• 🖨️ Printer setup\n" +
                        "• 💬 Teams / meetings\n" +
                        "• 📶 Wi-Fi / network\n\n" +
                        "What do you need help with?");
    }

    /**
     * Try to find an answer for the user's message.
     * 
     * @return the bot response, or null if no matching answer found
     */
    public String findAnswer(String message) {
        if (message == null || message.isBlank()) {
            return null;
        }

        for (Map.Entry<Pattern, String> entry : knowledgeBase.entrySet()) {
            if (entry.getKey().matcher(message).matches()) {
                return entry.getValue();
            }
        }

        return null; // No match — will trigger escalation logic
    }
}
