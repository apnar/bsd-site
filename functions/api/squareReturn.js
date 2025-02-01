/**
 * POST /api/submit
 */
export async function onRequestGet(context) {
  try {

  const { searchParams } = new URL(request.url);
  let myid = searchParams.get('id');
  console.log("Found redirect ID: " + myid);

  //debug - shows submitted values
    let pretty = JSON.stringify([...body], null, 2);
    pretty += JSON.stringify(resp);
    return new Response(pretty, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
    });

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
