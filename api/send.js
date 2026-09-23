// Vercel Serverless Function: sends the AEVOLAN contact form via Resend.
// Lives at: /api/send.js  ->  reachable at https://www.aevolantech.com/api/send
// Requires an environment variable RESEND_API_KEY set in Vercel (see setup notes).

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, project, message } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'AEVOLAN Contact <contact@aevolantech.com>',
        to: ['aevolantechnologies@gmail.com'],
        reply_to: email,
        subject: `AEVOLAN enquiry: ${project || 'General'} from ${name}`,
        text:
`New message from AEVOLAN contact form

Name: ${name}
Email: ${email}
Regarding: ${project || 'General'}

${message}`
      })
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error('Resend error:', errText);
      return res.status(502).json({ error: 'Email provider error' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Send handler error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
