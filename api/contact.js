export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Import Resend dynamically to avoid initialization issues
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Check if API key is available
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY not found in environment variables');
      return res.status(500).json({ error: 'Email service not configured' });
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Contact Form <onboarding@resend.dev>',
      to: ['ops@9m.site'],
      subject: 'New Contact Form Submission',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0f0f0f; border-bottom: 2px solid #d7dbd2; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
          </div>
          
          <div style="margin: 20px 0;">
            <p><strong>Message:</strong></p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${message}</div>
          </div>
          
          <hr style="border: none; border-top: 1px solid #d7dbd2; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            Sent from 9m.site contact form
          </p>
        </div>
      `,
      text: `
New Contact Form Submission

Name: ${name}
Email: ${email}

Message:
${message}

---
Sent from 9m.site contact form
      `.trim()
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    console.log('Email sent successfully:', data.id);
    return res.status(200).json({ 
      success: true, 
      message: 'Message sent successfully! We\'ll get back to you soon.',
      id: data.id 
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}