/**
 * POST /api/submit
 */
export async function onRequestPost(context) {
  return await submitHandler(context);
}

async function submitHandler(context) {
  const body = await context.request.formData();

  const { firstname, lastname, email, phone } =
    Object.fromEntries(body);

  const reqBody = {
    fields: {
      "First Name": firstname,
      "Last Name": lastname,
      "Email": email,
      "Phone": phone,
    },
  };

  return HandleAirtableData({ body: reqBody, env: context.env });
}

const HandleAirtableData = async function onRequest({ body, env }) {
  return fetch(
    `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(env.AIRTABLE_TABLE_ID,)}`,
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${env.AIRTABLE_API_KEY}`,
        "Content-type": `application/json`,
      },
    },
  );
};
