# junctionapp-mailchimp-extension
Small connector between the JunctionApp and a given MailChimp Audience

## Setup
Create a `.env` file with the following configuration: 
```
MAILCHIMP_AUDIENCE_ID=<Audience/List ID here>
MAILCHIMP_API_KEY=<API key here>
MAILCHIMP_TAG=<The tag you want to add, ideally the event name>
```

## Connect
Go to your event in the JunctionApp and under `Miscellaneous/Webhooks` set up a webhook for `Registrations - Save`. Set the URL to your deployed instance with the path `/registration/`
