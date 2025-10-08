# OpenAI API Setup Guide

## Overview
This guide will help you set up OpenAI API integration for AI-powered email generation in your Goshawk AI application.

## Step 1: Get OpenAI API Key

1. **Go to OpenAI Platform**: Visit [platform.openai.com](https://platform.openai.com)
2. **Sign up or Login**: Create an account or sign in
3. **Navigate to API Keys**: Go to your account settings and find "API Keys"
4. **Create New Key**: Click "Create new secret key"
5. **Copy the Key**: Save the API key securely (you won't be able to see it again)

## Step 2: Add API Key to Environment Variables

Add your OpenAI API key to your `.env.local` file:

```env
# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here

# Existing environment variables...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
DATABASE_URL=your-database-url
EMAIL_FROM=noreply@yourdomain.com
RESEND_API_KEY=your-resend-api-key
```

## Step 3: Test the Integration

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Go to the Email page**: Navigate to `http://localhost:3000/app/email`

3. **Generate an email**: Select an appointment and click "Generate AI Email"

4. **Check the console**: Look for any OpenAI API errors or success messages

## Features

### ✅ **AI-Powered Email Generation**
- **Natural Language**: Uses GPT-3.5-turbo for sophisticated email writing
- **Context Awareness**: Analyzes appointment descriptions to create relevant content
- **Professional Tone**: Maintains warm, professional communication style
- **Personalization**: References specific details from phone conversations

### ✅ **Smart Fallback System**
- **Graceful Degradation**: Falls back to rule-based emails if OpenAI fails
- **Error Handling**: Continues working even without API key
- **Development Friendly**: Works in development mode without API key

### ✅ **Cost Optimization**
- **Efficient Prompts**: Optimized prompts to minimize token usage
- **Reasonable Limits**: 500 max tokens per request (~$0.001-0.002 per email)
- **Smart Caching**: Avoids unnecessary API calls

## Example AI-Generated Emails

### **Dental Appointment**
> "Dear Sarah, Thank you for scheduling your dental appointment with us! We're excited to help address the sensitivity you mentioned in your lower left molars and discuss the whitening options you're interested in. We'll make sure to give you a thorough examination and provide personalized recommendations for your oral health."

### **Legal Consultation**
> "Dear Emily, Thank you for scheduling your legal consultation with us. We understand you're dealing with a property dispute involving boundary issues, and we're prepared to review your case thoroughly and discuss potential litigation strategies. Our team is committed to providing you with the guidance you need."

### **Tech Project**
> "Dear Michael, Thank you for scheduling your consultation with us! We're excited to discuss your website redesign project and dive into the e-commerce integration and mobile responsiveness features you mentioned. We'll be prepared with insights and recommendations to help bring your vision to life."

## Troubleshooting

### **API Key Issues**
- **Invalid Key**: Check that your API key is correct and active
- **Billing**: Ensure you have credits in your OpenAI account
- **Rate Limits**: Check if you've hit any usage limits

### **Common Errors**
- **"OpenAI API error"**: Check your API key and internet connection
- **"Error parsing OpenAI response"**: The AI response wasn't in expected JSON format
- **Fallback emails**: System automatically uses basic templates if OpenAI fails

### **Development Mode**
- **No API Key**: System works with fallback templates
- **Console Logs**: Check browser console for detailed error messages
- **Testing**: Use mock data to test without API calls

## Cost Estimation

### **Per Email Costs**
- **GPT-3.5-turbo**: ~$0.001-0.002 per email
- **Monthly Estimate**: ~$5-20 for 1000-5000 emails
- **Free Tier**: $5 free credits for new accounts

### **Optimization Tips**
- **Batch Processing**: Generate multiple emails in one session
- **Template Caching**: Reuse similar appointment types
- **Prompt Optimization**: Efficient prompts reduce token usage

## Security Best Practices

- **Never commit API keys** to version control
- **Use environment variables** for all sensitive data
- **Rotate keys regularly** for security
- **Monitor usage** to prevent unexpected charges

## Next Steps

1. **Test the integration** with your OpenAI API key
2. **Customize prompts** if needed for your specific use case
3. **Monitor costs** and usage in your OpenAI dashboard
4. **Scale up** as your email volume grows

Your AI-powered email generation is now ready to create professional, personalized appointment confirmations! 🚀
