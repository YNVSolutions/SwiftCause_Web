# Security Policy

The SwiftCause team takes the security of our platform and our users' data very seriously. We appreciate the valuable role that security researchers play in helping us maintain a secure environment.

If you believe you have found a security vulnerability in the SwiftCause project, we encourage you to report it to us privately.

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please send an email to:

**ynvtech@gmail.com**

Please include the following information in your report:

* **A clear description** of the vulnerability, including its potential impact.
* **Detailed steps to reproduce** the vulnerability, including any URLs, example payloads, or proof-of-concept code.
* **Your environment** (e.g., browser, OS) if relevant.
* **Your name or alias** (for attribution, if you wish).

## Our Commitment

When you report a vulnerability to us in good faith and in accordance with this policy:

1.  We will make our best effort to **acknowledge receipt** of your report within 72 hours.
2.  We will **investigate the issue** promptly and work to validate your findings.
3.  We will work to **remediate the vulnerability** in a timely manner.
4.  We will **notify you** when the fix is deployed.
5.  We will **publicly credit you** for your discovery (with your permission) in our release notes or another appropriate location.

## Scope

This policy applies to the SwiftCause project and its related services:

* **In Scope:**
    * The live web application: `https://swift-cause-web.vercel.app`
    * The Firebase backend functions (e.g., `createPaymentIntent`, `handleStripeWebhook`)
    * The `YNVSolutions/SwiftCause_Web` GitHub repository

* **Out of Scope:**
    * Vulnerabilities in our third-party service providers (e.g., Vercel, Google Firebase, or Stripe themselves). Please report these to the respective services.
    * Denial of Service (DoS or DDoS) attacks.
    * Spam, phishing, or social engineering attacks against our team or users.
    * Vulnerabilities related to outdated browsers or operating systems.

## Safe Harbor

We will not pursue legal action against you for security research conducted in good faith and in compliance with this policy. We consider your research to be authorized and welcome the opportunity to work with you to secure our platform.
