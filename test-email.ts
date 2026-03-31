import { sendEnquiryNotification } from "./src/lib/email";

async function main() {
    console.log("Testing Resend configuration...");
    try {
        await sendEnquiryNotification({
            name: "Agent Test",
            email: "agent@test.com",
            phone: "000000000",
            subject: "Resend Email Test",
            message: "This is a direct test of the sending functionality to verify your Resend config."
        });
        console.log("Test execution finished successfully.");
    } catch (e: any) {
        console.error("Test execution failed.");
        console.error(e.message || e);
    }
}

main();
