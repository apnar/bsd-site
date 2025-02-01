/**
 * POST /api/submit
 */
export async function onRequestGet(context) {
  try {

  const { searchParams } = new URL(context.request.url);
  let myid = searchParams.get('id');
  console.log("Found redirect ID: " + myid);

  let myGet = "fields%5B%5D=order_id&filterByFormula=%7Bredirect_id%7D%3D'" + myid + "'";

// submit to airtable
  const resp = await fetch(
    `https://api.airtable.com/v0/${context.env.AIRTABLE_BASE_ID}/${encodeURIComponent(context.env.AIRTABLE_TABLE_ID,)}?${myGet}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${context.env.AIRTABLE_API_KEY}`,
        "Content-type": `application/json`,
      },
    },
  );

  const atJson = await resp.json();

  console.log(atJson);

  if (!resp.ok) {
    // redirecting to error site
    return Response.redirect(errorsite, 303);
  }

  if (!resp.ok) {
    // redirecting to error site
    return Response.redirect(errorsite, 303);
  }

  return Response.redirect(redirect, 303);
  }
  catch (error) {
    console.error(error.message);
    return Response.redirect(errorsite, 303);
  }
};
