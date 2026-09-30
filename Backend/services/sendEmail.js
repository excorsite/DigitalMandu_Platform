const nodemailer= require("nodemailer");
// optionsis the nested object that we give to use them in as email ddta
const sendEmail = async (options) => {
    try {
        // creating transporting channel from nodemailer
        var transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // some details to send mail which is passed to the sendMail after this
        const mailOptions = {
            from: "<Digital Mandu>",
            to: options.userEmail,
            subject: options.emailSubject,
            text: options.emailMessage,
        };

        // using above data sending emailo
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = sendEmail;