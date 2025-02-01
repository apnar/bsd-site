/**
 * POST /api/submit
 */
export async function onRequestPost(context) {
  return await submitHandler(context);
}

async function submitHandler(context) {
  try {
  const body = await context.request.formData();

  const { redirect, errorsite, firstname, lastname, phone, email, gendermale, pronouns,
    mypronouns, height_ft, height_in, age, birthdate, pairing_info, captain,
    experience, note_to_directors, referby, emergencyinfo, tryoutweekone } =
    Object.fromEntries(body);

// fold pronouns together
  let combpronouns = pronouns;
  if (pronouns === "Not Listed") { combpronouns = mypronouns; }

// combine height into single string
  const height = height_ft + "\'" + height_in + '"'; 

// put all missing dates into an array
  const missing = [];
  for (let [key, value] of body) {
    if (key.indexOf("miss") === 0) {
       missing.push(value);
    } 
  }

// put all positions into an array
  const position = [];
  for (let [key, value] of body) {
    if (key.indexOf("p_") === 0) {
       position.push(value);
    } 
  }

// build data to submit
  let reqBody = {
    fields: {
      "First Name": firstname,
      "Last Name": lastname,
      "Phone": phone,
      "Email": email,
      "Male": (gendermale === 'true'),
      "Pronoun": combpronouns,
      "Height": height,
      "Age": age,
      "Pairing Info": pairing_info,
      "Captain": captain,
      "Experience": experience,
      "Position": position,
      "Additional Info": note_to_directors,
      "Refer": referby,
      "Emergency Contact": emergencyinfo,
      "Missing Dates": missing,
      "Requested Week 1": (tryoutweekone === 'true'),
    },
  };

// add birthday if we have it
  if (birthdate !== "") {
    reqBody.fields['Birthdate'] = birthdate;
  }

  console.log(JSON.stringify(reqBody));

// submit to airtable
  const resp = await fetch(
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

  console.log(JSON.stringify(resp));



  //debug - shows submitted values
    //let pretty = JSON.stringify([...body], null, 2);
    //pretty += JSON.stringify(resp);
    //return new Response(pretty, {
    //  headers: {
    //    'Content-Type': 'application/json;charset=utf-8',
    //  },
    //});

  //debug - shows airtable respose
  //  return resp;

  if (!resp.ok) {
    // redirecting to error site
    return Response.redirect(errorsite, 303);
  }

  const squareReqBody = {
    "checkout_options": {
      "ask_for_shipping_address": false,
      "allow_tipping": false,
      "enable_coupon": false,
      "enable_loyalty": false,
      "redirect_url": "https://bumpsetdrink.com/thankyou",
    },
    "quick_pay": {
      "location_id": "LM5PAYQK9AZA1",
      "name": "BSD Spring 2025",
      "price_money": {
        "amount": 100,
        "currency": "USD"
      }
    },
    "pre_populated_data": {
      "buyer_email": email,
      "buyer_phone_number": "+1-" + phone,
    }
  };

  const squareResp = await fetch(
    `https://connect.squareupsandbox.com/v2/online-checkout/payment-links`,
    {
      method: "POST",
      body: JSON.stringify(squareReqBody),
      headers: {
        "Square-Version": `2025-01-23`,
        Authorization: `Bearer ${context.env.SQUARE_API_KEY}`,
        "Content-type": `application/json`,
      },
    },
  );

  return squareResp;

  return Response.redirect(redirect, 303);
  }
  catch (error) {
    console.error(error.message);
    return Response.redirect(errorsite, 303);
  }
};
