export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: 'Missing email or code' });
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': 'Xkeysib-05f15c12fbcf782fc875f7288184d0ce471b99e76b3ec3199323c9678104c3c3-UlJLsZLKuZEU2Bg6'
      },
      body: JSON.stringify({
        sender: { name: "منصة الأستاذ", email: "mhamed01023265312@gmail.com" },
        to: [{ email: email }],
        subject: "رمز التحقق الخاص بك",
        htmlContent: `<div style="direction:rtl;text-align:center;padding:20px;font-family:Arial,sans-serif;"><h2>رمز التحقق الخاص بك هو:</h2><h1 style="color:#2563eb;font-size:32px;letter-spacing:4px;">${code}</h1></div>`
      })
    });

    const data = await response.json();

    if (response.ok) {
      return res.status(200).json({ success: true, data });
    } else {
      return res.status(400).json({ success: false, error: data });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
