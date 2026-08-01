export const depositApprovedTemplate = (
    name:string,
    amount:number,
    currency:string
)=>`
<!DOCTYPE html>

<html>

<body style="background:#f4f7fb;padding:40px;font-family:Arial">

<div style="
max-width:600px;
margin:auto;
background:white;
padding:40px;
border-radius:12px;
">

<h2 style="color:#16a34a;">
Deposit Approved ✅
</h2>

<p>Hello <b>${name}</b>,</p>

<p>

Your deposit has been approved.

</p>

<h1>

${currency}${amount}

</h1>

<p>

Your balance has been updated successfully.

</p>

<a
href="https://blackgoldinvests.com/dashboard"
style="
padding:14px 30px;
background:#16a34a;
color:white;
text-decoration:none;
border-radius:8px;
display:inline-block;
">

View Account

</a>

</div>

</body>

</html>

`;