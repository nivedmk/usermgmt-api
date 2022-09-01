const Sib = require("sib-api-v3-sdk");
require("dotenv").config();
const client = Sib.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.API_KEY;

function triggerMail(user) {
  const tranEmailApi = new Sib.TransactionalEmailsApi();
  const sender = {
    email: "nivedmk47@gmail.com",
    name: "XYZ",
  };
  const receivers = [
    {
      email: user.email,
    },
  ];

  tranEmailApi
    .sendTransacEmail({
      sender,
      to: receivers,
      subject: "Welcome to XYZ enterprises",
      // textContent: ,
      htmlContent: `
        <h1>Hi {{params.user.userName}}</h1>
        <h5>
        Please use the below credentails for log in:
        <br/>
        email: {{params.user.email}}
        <br/>
        Password: {{params.user.password}}
        </h5>
        <a href="https://www.google.com/">Visit</a>
                `,
      params: {
        user: user,
      },
    })
    .then(console.log)
    .catch(console.log);
}

module.exports = triggerMail;
