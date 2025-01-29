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

// use dummy birthdate if its blank  
  let mybirthdate = ""; // 1970-01-01';
  if (birthdate !== "") { mybirthdate = birthdate; }

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
  const reqBody = {
    fields: {
      "First Name": firstname,
      "Last Name": lastname,
      "Phone": phone,
      "Email": email,
      "Male": (gendermale === 'true'),
      "Pronoun": combpronouns,
      "Height": height,
      "Age": age,
      "Birthdate": mybirthdate,
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

  if (!resp.ok) {
    // redirecting to error site
    return Response.redirect(errorsite, 303);
  }

  //debug - shows submitted values
    //let pretty = JSON.stringify([...body], null, 2);
    //pretty += JSON.stringify(resp);
    //return new Response(pretty, {
    //  headers: {
    //    'Content-Type': 'application/json;charset=utf-8',
    //  },
    //});

  //debug - shows airtable respose
    //return resp;

  return Response.redirect(redirect, 303);
  }
  catch (error) {
    console.error(error.message);
    return Response.redirect(errorsite, 303);
  }
};
