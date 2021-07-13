import axios, { Method } from "axios";
import { createHash } from "crypto";

const API_ROOT = "https://us19.api.mailchimp.com/3.0";

type RegistrationData = {
  status?: string;
  answers?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
};

const sendToMailchimp = (method: Method, path: string, data: any) => {
  return axios({
    method: method,
    url: API_ROOT + path,
    data: data,
    auth: {
      username: "anystring",
      password: process.env.MAILCHIMP_API_KEY || "THIS_WONT_WORK",
    },
  })
    .then((resp) => resp.data)
    .catch((err) => console.log(err));
};

const createOrUpdateContact = (
  hash: string,
  registrationData: RegistrationData
) => {
  const mailchimpData = {
    email_address: registrationData?.answers?.email,
    status_if_new: "subscribed",
    merge_fields: {
      FNAME: registrationData?.answers?.firstName,
      LNAME: registrationData?.answers?.lastName,
      JUNC_STAT: registrationData.status,
    },
    tags: [process.env.MAILCHIMP_TAG],
  };

  return sendToMailchimp(
    "PUT",
    `/lists/${process.env.MAILCHIMP_AUDIENCE_ID}/members/${hash}`,
    mailchimpData
  );
};

const updateContactTags = (hash: string) => {
  const tagUpdates = {
    tags: [
      {
        name: process.env.MAILCHIMP_TAG,
        status: "active",
      },
    ],
  };

  return sendToMailchimp(
    "POST",
    `/lists/${process.env.MAILCHIMP_AUDIENCE_ID}/members/${hash}/tags`,
    tagUpdates
  );
};

export const onRegistration = async (registrationData: RegistrationData) => {
  console.log(`Syncing data with Mailchimp for e-mail: ${registrationData.answers?.email}`);

  if (
    !registrationData?.answers?.firstName ||
    !registrationData?.answers?.lastName ||
    !registrationData?.answers?.email
  ) {
    console.error(
      "Invalid or incomplete data received, aborting Mailchimp sync...",
      registrationData
    );
    return;
  }

  const emailHash = createHash("md5")
    .update(registrationData.answers.email)
    .digest("hex");

  await createOrUpdateContact(emailHash, registrationData);
  await updateContactTags(emailHash);

  console.log("Successfully synced registration data with Mailchimp!");
};
