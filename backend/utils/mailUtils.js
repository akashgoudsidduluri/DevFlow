import nodemailer from 'nodemailer';

/**
 * MOCK EMAIL UTILITY
 * For development, this logs the "email" to the console.
 * In a real app, use an SMTP transporter.
 */
export const sendInvitationEmail = async (email, inviterName, projectName, verificationLink) => {
    console.log('\n----------------------------------------');
    console.log('📧 DEVFLOW PROTOCOL: OUTGOING INVITATION');
    console.log('----------------------------------------');
    console.log(`FROM: DevFlow Hub <no-reply@devflow.app>`);
    console.log(`TO: ${email}`);
    console.log(`SUBJECT: Access Requested by ${inviterName}`);
    console.log('\nBODY:');
    console.log(`Greetings Core Member,`);
    console.log(`\n${inviterName} has invited you to join the [${projectName}] workspace.`);
    console.log(`To verify your identity and gain access, please click the secure link below:`);
    console.log(`\n🔗 ${verificationLink}`);
    console.log(`\nNote: This link will expire in 24 hours.`);
    console.log('----------------------------------------\n');

    // Return true to simulate success
    return true;
};
