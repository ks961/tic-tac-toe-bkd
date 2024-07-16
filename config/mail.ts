

export function mailTemplateForOtp(title: string, body: string, otp: (string | number)) {
    return `<table style="width: 100%; height: 100%; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;">
    <tr>
      <td style="background-color: #d7d0bd; padding: 20px; text-align: center;">
        <table style="width: 300px; margin: 0 auto;">
          <tr>
            <td style="font-size: 24px; text-align: center; font-weight: bold;">${title}</td>
          </tr>
          <tr>
            <td style="text-align: center; font-weight: 600;">${body}</td>
          </tr>
        </table>
        <table style="background-color: #f5f5f7; width: 200px; height: 50px; margin: 20px auto;">
          <tr>
            <td style="font-size: 18px; text-align: center; letter-spacing: 1ch; font-weight: 400;">${otp}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`    
}