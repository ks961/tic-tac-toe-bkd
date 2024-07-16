

export function mailTemplateForOtp(title: string, body: string, otp: (string | number)) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<style>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    html, body {
        height: 100%;
    }

    body {
        display: grid;
        justify-content: center;
        background-color: #d7d0bd;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }

    .container {
        margin-top: 10rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3rem;
    }
    
    .container > p {
        font-weight: 400;
    }
    
    .container__msg {
        gap: 1rem;
        width: 30rem;
        display: flex;
        text-align: center;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .container__otp {
        background-color: #f5f5f7;
        width: 20rem;
        height: 5rem;
        display: grid;
        place-content: center;
        letter-spacing: 1ch;
        font-size: large;
    }
    
</style>
<body>
    <div class="container">
        <div class="container__msg">
            <h1>${title}</h1>
            <p>
                ${body}
            </p>
        </div>
        <div class="container__otp">
            <h2>${otp}</h2>
        </div>
    </div>
</body>
</html>`    
}