/**
 * POST /api/submit
 */
export async function onRequestPost(context) {
  return await submitHandler(context);
}

async function submitHandler(context) {
  const body = await context.request.formData();

  const { firstname, lastname, email, phone, redirect } =
    Object.fromEntries(body);

  const reqBody = {
    fields: {
      "First Name": firstname,
      "Last Name": lastname,
      "Email": email,
      "Phone": phone,
    },
  };

  return fetch(
    `https://api.airtable.com/v0/${context.env.AIRTABLE_BASE_ID}/${encodeURIComponent(context.env.AIRTABLE_TABLE_ID,)}`,
    {
      method: "POST",
      body: JSON.stringify(reqBody),
      headers: {
        Authorization: `Bearer ${context.env.AIRTABLE_API_KEY}`,
        "Content-type": `application/json`,
      },
    },
  );

  return Response.redirect(redirect, 303);
};
