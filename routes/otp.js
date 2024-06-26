const { load } = require("cheerio");
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://sahildhillon609:Sahil180@hr12.reguy9v.mongodb.net/db4', {
});

const parse_form_data = (html) => {
    const $ = load(html);
    const formData = new URLSearchParams();

    $("input").each((_idx, element) => {
        const name = $(element).attr("name");
        const value = $(element).val();
        if (name && value) formData.append(name, value);
    });

    return formData;
};

const createSession = async () => {
    const res1 = await fetch("https://igs.ghmc.gov.in/send_otp_mobile.aspx");
    if (res1.status !== 200) throw new Error("Request failed.");
    const cookie = res1.headers.get("Set-Cookie")?.split(";").shift()?.replace(";", "").trim() || "";

    const formData = parse_form_data(await res1.text());
    return { cookie, send_otp_data: formData };
};

const send_otp = async (cookie, send_otp_data) => {
    const res = await fetch("https://igs.ghmc.gov.in/send_otp_mobile.aspx", {
        method: "POST",
        headers: {
            "content-type": "application/x-www-form-urlencoded",
            "Cookie": cookie,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        },
        body: send_otp_data.toString(),
    });
    if (res.status !== 200) throw new Error("Failed to send OTP");

    const formData = parse_form_data(await res.text());
    return { cookie, validate_otp_data: formData };
};

const validate_otp = async (cookie, validate_otp_data) => {
    const res = await fetch("https://igs.ghmc.gov.in/send_otp_mobile.aspx", {
        method: "POST",
        headers: {
            "content-type": "application/x-www-form-urlencoded",
            "Cookie": cookie,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        },
        body: validate_otp_data.toString(),
    });
    if (res.redirected) return true;

    return false;
};


// Define a schema and model if not already defined
const otpSchema = new mongoose.Schema({
    mobile: String,
    cookie: String,
    validate_otp_data: String
});

const Otp = mongoose.models.otp || mongoose.model('otp', otpSchema);



const send_otp_to_mobile = async (mobile) => {
    const { cookie, send_otp_data } = await createSession();
    send_otp_data.set("txtmobileno", mobile);

    const { cookie: c2, validate_otp_data } = await send_otp(cookie, send_otp_data);

    //save cookie and validate otp data to mongodb
    await Otp.updateOne({mobile: mobile}, {mobile, cookie, validate_otp_data: validate_otp_data.toString()}, {upsert:true});


    return { cookie: c2, validate_otp_data };
};

const validate_otp_code = async (mobile, otp) => {
    // fetch cookie and validate_otp data from mongodb
    const result = await Otp.findOne({ mobile: mobile });
    
    if (!result) return false;

    const validate_otp_data = new URLSearchParams(result.validate_otp_data);
    validate_otp_data.set("txtotp", otp);

    const isOtpValid = await validate_otp(result.cookie, validate_otp_data);

    if (!isOtpValid) return false;
    return true;
};
module.exports = {send_otp_to_mobile,validate_otp_code};