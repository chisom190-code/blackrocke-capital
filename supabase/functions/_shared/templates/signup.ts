export const signupTemplate = (name: string) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
</head>

<body style="margin:0;padding:40px;background:#f4f7fb;font-family:Arial,sans-serif;">

<table width="100%" cellspacing="0" cellpadding="0">
<tr>
<td align="center">

<table width="600" style="background:#ffffff;border-radius:12px;padding:40px;">

<tr>
<td align="center">
<h1 style="color:#0B5ED7;margin:0;">
Blackgold invests
</h1>

<p style="font-size:22px;font-weight:bold;">
Welcome, ${name} 👋
</p>

<p style="color:#666;line-height:1.7;">
Thank you for joining Blackgold invests.

Your investment account has been created successfully.

You can now log in and begin investing securely.
</p>

<a
href="https://blackgoldinvests.com/dashboard"
style="
display:inline-block;
margin-top:25px;
padding:15px 30px;
background:#0B5ED7;
color:white;
text-decoration:none;
border-radius:8px;
font-weight:bold;
">
Go to Dashboard
</a>

<hr style="margin:40px 0;">

<p style="color:#999;font-size:13px;">
© Blackgold invests
</p>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;