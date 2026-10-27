# BookMyMasseuse

A responsive, static massage booking website. Plain HTML, CSS and JavaScript; no package installation, build process, server or API key is required.

## Publish on Netlify

1. Unzip `bookmymasseuse-netlify.zip`.
2. Sign in at https://app.netlify.com/drop and drag in the extracted folder containing `index.html` (not the ZIP).
3. In the site's **Forms** section, choose **Enable form detection**.
4. Deploy the folder again so Netlify detects the `massage-booking` form. Confirm that this form appears in your dashboard.
5. Submit a test booking on the deployed site and confirm that it appears in **Forms → massage-booking**. Set up email notifications in the form's notification settings.
6. Change the site name or attach your domain in Netlify when ready.

For Git deployments, use this directory as the base directory, leave the build command empty and set the publish directory to `.`. The included `netlify.toml` already sets the publish directory.

Official setup documentation: https://docs.netlify.com/manage/forms/setup/

Netlify account limits and billing apply to hosting and form submissions. No paid feature or account integration is assumed by this code.

## Customize before launch

- **Services and prices:** update `massage.prices` in `script.js`, along with the initial fallback prices in `index.html`. The site offers one full-body massage with 60- and 90-minute durations. Prices default to INR. Change the currency formatter if needed.
- **Business details:** the full-body massage price is ₹600 for either session length. The at-home service wording and preferred time options are example content. The sole service is full-body massage. Replace them with your actual offers. Add your real contact information, service areas, operating hours and cancellation terms before public launch.
- **Photos:** replace the local JPGs in `assets/` with your own images if preferred. The three illustrative stock photos come from Unsplash: `photo-1544161515-4ab6ce6db874` (hero), `photo-1519823551278-64ac92734fb1` (hands-on massage), and `photo-1540555700478-4be289fbecef` (towels, lotion and flowers). They do not depict your business. Review the source license for your usage: https://unsplash.com/license.
- **Branding:** change the logo text in each HTML page. Colors are CSS variables at the top of `styles.css`.
- **Privacy:** adapt `privacy.html` to your business's actual contact process, data retention and practices; add a privacy contact before launch.

## How bookings work

- The visitor requests a full-body massage and selects a 60/90-minute length, preferred date/time and contact details.
- JavaScript updates the estimate, blocks past dates and disables elapsed times on the current day (visitor's local timezone). The visitor's selected time is a preference, not an inventory-backed slot.
- The form submits a URL-encoded request to Netlify Forms, then shows `thank-you.html` after a successful HTTP response. Failed submissions show an error and preserve input for retry.
- Requests require manual follow-up. The site does not reserve appointments, match therapists, charge cards or send customer confirmations automatically. Netlify notification emails can notify the operator.
- Honeypot spam protection is included. No payment or health information is requested.
- The estimate sent by the browser is informational and must be verified by the operator before confirming a quote.
- With JavaScript disabled, the native HTML form still posts to Netlify and uses the custom thank-you page. The visible estimate is the default; the fallback pricing note explains 90-minute pricing.
- In local/file previews, JavaScript validates the form and explicitly says no request was sent. Real form processing must be tested on Netlify after enabling detection and redeploying.

## Local preview

Open `index.html` in a browser, or run `python3 -m http.server 8796` in this directory and visit http://localhost:8796.

## Files

- `index.html` — homepage and Netlify booking form
- `styles.css` — responsive layout and visual design
- `script.js` — estimate, date/time validation, mobile navigation and submission handling
- `thank-you.html` — request acknowledgement
- `privacy.html` — starter privacy notice
- `assets/` — three local photographs and favicon
- `netlify.toml` — static hosting configuration

All assets are local; there are no third-party scripts or web fonts.
