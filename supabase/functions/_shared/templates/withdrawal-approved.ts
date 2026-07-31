export const withdrawalApprovedTemplate = (
name:string,
amount:number,
currency:string
)=>`

<!DOCTYPE html>

<html>

<body style="background:#f4f7fb;padding:40px;font-family:Arial;">

<div style="
background:white;
max-width:600px;
margin:auto;
padding:40px;
border-radius:12px;
">

<h2 style="color:#dc2626;">
Withdrawal Approved
</h2>

<p>

Hello <b>${name}</b>

</p>

<p>

Your withdrawal request has been approved.

</p>

<h1>

${currency}${amount}

</h1>

<p>

Funds are now being processed.

</p>

<a
href="https://yourdomain.com/dashboard"
style="
background:#dc2626;
padding:14px 30px;
color:white;
text-decoration:none;
border-radius:8px;
display:inline-block;
">

View Dashboard

</a>

</div>

</body>

</html>

`;