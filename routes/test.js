// app.js

const { send_otp_to_mobile, validate_otp_code } = require('./otp');
const readline = require('readline');

// Function to get OTP input from user
const getOTPFromUser = () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question("Enter OTP: ", (answer) => {
            resolve(answer.trim());
            rl.close();
        });
    });
};

// Example usage
(async () => {
    // Send OTP to the mobile number
    await send_otp_to_mobile("9729592295");

    // Get OTP input from the user
    const otp = await getOTPFromUser();

    // Validate the OTP provided by the user
    const isValid = await validate_otp_code("9729592295", otp);
    console.log(isValid ? "OTP is valid." : "OTP is invalid.");
})();
