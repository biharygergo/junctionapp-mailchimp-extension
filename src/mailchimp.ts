import axios, { Method } from "axios";
import { createHash } from "crypto";

const API_ROOT = "https://us19.api.mailchimp.com/3.0";

type RegistrationData = {
  status?: string;
  answers?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    CustomAnswers?: { section: string; key: string; value: any }[];
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

const getCustomMergeFields = (registrationData: RegistrationData) => {
  const customAnswersToSync = (process.env.CUSTOM_ANSWERS_TO_SYNC || "").split(
    ","
  );

  const customMergeFields: { [mergeField: string]: string } = {};
  customAnswersToSync.forEach((customAnswerToSync) => {
    const [mergeField, customAnswerId] = customAnswerToSync.split(":");
    customMergeFields[mergeField] =
      registrationData?.answers?.CustomAnswers?.find(
        (a) => a.key === customAnswerId
      )?.value;
  }, {});

  return customMergeFields;
}

const createOrUpdateContact = (
  hash: string,
  registrationData: RegistrationData
) => {
  const statusMergeField = process.env.STATUS_MERGE_FIELD || "JUNC_STAT";

  const mailchimpData = {
    email_address: registrationData?.answers?.email,
    status_if_new: "subscribed",
    merge_fields: {
      FNAME: registrationData?.answers?.firstName,
      LNAME: registrationData?.answers?.lastName,
      [statusMergeField]: registrationData.status,
      ...getCustomMergeFields(registrationData),
    },
    tags: [process.env.MAILCHIMP_TAG],
  };

  console.log("Sending participant data to MailChimp...", mailchimpData);

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
  console.log(registrationData, registrationData?.answers?.CustomAnswers);
  console.log(
    `Syncing data with Mailchimp for e-mail: ${registrationData.answers?.email}`
  );

  if (
    !registrationData?.answers?.firstName ||
    !registrationData?.answers?.lastName ||
    !registrationData?.answers?.email
  ) {
    console.error(
      "Invalid or incomplete data received, aborting Mailchimp sync...",
      registrationData
    );
    throw new Error("Invalid data received.");
  }

  const emailHash = createHash("md5")
    .update(registrationData.answers.email)
    .digest("hex");

  await createOrUpdateContact(emailHash, registrationData);
  await updateContactTags(emailHash);

  console.log("Successfully synced registration data with Mailchimp!");
};
