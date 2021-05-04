const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    try {
        sgMail.send({
            to: email,
            from: 'david_1991@live.com.pt',
            subject: 'Thanks for joining in!',
            text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
        })
    }
    catch (e) {
        console.log(e)
    }
}

const sendCloseAccountEmail = (email,name) =>{
    try {
        sgMail.send({
            to: email,
            from: 'david_1991@live.com.pt',
            subject: 'Account Cancellation',
            text: `We are sorry to see you go, ${name}. How could we kept you as a customer?`
        })
    }
    catch (e) {
        console.log(e)
    }
}

module.exports = {
    sendWelcomeEmail,
    sendCloseAccountEmail
}