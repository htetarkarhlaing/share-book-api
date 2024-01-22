const passwordResetTemplate = (token: string, name: string) => {
  return `
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </head>
    <body
      style="
        padding: 50px 0;
        margin: 0;
        box-sizing: border-box;
        background-color: #0f0f0e;
        overflow: hidden;
      "
    >
      <div id="main">
        <div
          id="mail_container"
          style="
            max-width: 600px;
            background-color: #1d1d1d;
            font-family: sans-serif;
            text-align: center;
            position: relative;
            margin: auto;
          "
        >
          <div id="upper_container" style="padding-top: 100px">
            <h3 style="color: #fff; font-size: 24px; margin-bottom: 15px">
              Dear ${name},
            </h3>
            <p
              style="
                font-size: 16px;
                color: #7f7f80;
                width: 80%;
                margin: 10px auto;
                word-spacing: 2px;
                letter-spacing: 0.2px;
                line-height: 22px;
              "
            >
            You have just requested a password recovery with your email. 
            Please use the token below to change your password. Note that the provided token is only valid for 1 hour.
            
            Please be aware that the current app is only implemented on the backend, so a redirect link is not available. 
            Copy the token provided below and attach it as the Bearer token in the 'api/user/reset-password' route.
            </p>
            <div
              style="
                width: 90%;
                background-color: #fff;
                border: none;
                outline: none;
                border-radius: 10px;
                margin: 30px auto;
                font-size: 16px;
                font-weight: 800;
                color: #636b70;
                cursor: pointer;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 18px;
                letter-spacing: 5;
                text-align: center;
                padding: 5px auto;
              "
            >
              <p style="text-align: center;width: 100%;">${token}</p>
            </div>
          </div>
          <div
            style="
              flex-shrink: 0;
              width: 100%;
              height: 82px;
              background-color: #1d1d1d;
              align-self: flex-end;
              display: grid;
              place-items: center;
              padding: 50px 0;
            "
          >
            <div style="width: 100%">
              <p style="font-size: 14px; color: #636b70">ShareBook Team</p>
            </div>
          </div>
        </div>
      </div>
    </body>
  </html>
  `;
};

export default passwordResetTemplate;
