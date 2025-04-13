const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    logger: true,  // ✅ Enable logging
    debug: true    // ✅ Enable debugging
});

transporter.verify((error, success) => {
    if (error) {
        console.error("Email transport error:", error);
    } else {
        console.log("Server is ready to send emails");
    }
});

module.exports = transporter;

module.exports = transporter;
