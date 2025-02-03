/**
 * POST /api/submit
 */
export async function onRequestGet(context) {
  const errorsite = "https://www.bumpsetdrink.com/regerror.html";
  const redirect = "https://www.bumpsetdrink.com/regcomplete.html";
  try {

  const { searchParams } = new URL(context.request.url);
  let myid = searchParams.get('id');
  console.log("Found redirect ID: " + myid);

  let myGet = "fields%5B%5D=order_id&filterByFormula=%7Bredirect_id%7D%3D'" + myid + "'";

// use redirect ID to look up order id in airtable
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

  const myRecordID = atJson.records[0].id;
  const myOrderID = atJson.records[0].fields.order_id;

  console.log("My record ID is: " + myRecordID + " Order ID is: " + myOrderID);

// call square to create payment page
  const squareResp = await fetch(
    `https://connect.squareup.com/v2/orders/${myOrderID}`,
    {
      method: "GET",
      headers: {
        "Square-Version": `2025-01-23`,
        Authorization: `Bearer ${context.env.SQUARE_API_KEY}`,
        "Content-type": `application/json`,
      },
    },
  );

  const squareJson = await squareResp.json();
  console.log(squareJson);

  if (!squareResp.ok) {
    // redirecting to error site
    return Response.redirect(errorsite, 303);
  }

  let amountPaid = squareJson.order.total_money.amount / 100;
  const amountDue = squareJson.order.net_amount_due_money.amount;
  const orderState = squareJson.order.state;

  if((amountDue > 0) || (orderState != "OPEN")) {
    // redirecting to error site
    return Response.redirect(errorsite, 303);
  }

  let updateBody = {
    "records": [
    {
      "id": myRecordID,
       fields: {
        "Paid": amountPaid,
       }
    }
   ]
  };

  console.log(updateBody);

// submit to airtable
  const updateResp = await fetch(
    `https://api.airtable.com/v0/${context.env.AIRTABLE_BASE_ID}/${encodeURIComponent(context.env.AIRTABLE_TABLE_ID,)}`,
    {
      method: "PATCH",
      body: JSON.stringify(updateBody),
      headers: {
        Authorization: `Bearer ${context.env.AIRTABLE_API_KEY}`,
        "Content-type": `application/json`,
      },
    }
  );

  const updateJson = await updateResp.json();
  console.log(updateJson);

  if (!updateResp.ok) {
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
