addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

// elementHandler class parses through response and individuals elements in response

class elementHandler {
  constructor(variantNum, attributeName, id) {
    this.variantNum = variantNum;
    this.attributeName = attributeName;
    this.id = id;
  }

  element(element) {
    if (this.attributeName) {
      var attribute = element.getAttribute(this.attributeName);
      var elementID = element.getAttribute("id");

      if (attribute && this.variantNum == 0 && elementID == "url") {
        element.setAttribute(
          this.attributeName,
          "https://www.linkedin.com/in/dahoon-song-115336115/"
        );
        element.setInnerContent("Go to Dahoon's LinkedIn Profile");
      } else if (attribute && this.variantNum == 1 && elementID == "url") {
        element.setAttribute(this.attributeName, "https://github.com/dhsong20");
        element.setInnerContent("Go to Dahoon's Github Profile");
      }
    } else if (this.id) {
      var elementID = element.getAttribute("id");

      // for h1 with id = title
      if (elementID == "title") {
        if (this.variantNum == 0) {
          element.setInnerContent("Variant 1: Dahoon's LinkedIn");
        } else {
          element.setInnerContent("Variant 2: Dahoon's Github");
        }
      }
      if (elementID == "description") {
        if (this.variantNum == 0) {
          element.setInnerContent("I hope you are safe and well!");
        } else {
          element.setInnerContent(
            "Had a lot of fun with this take home project!"
          );
        }
      }
    } else {
      if (this.variantNum == 0) {
        element.setInnerContent("Dahoon's LinkedIn");
      } else {
        element.setInnerContent("Dahoon's Github");
      }
    }
  }
}

// handles request, called from eventListener

async function handleRequest(request) {
  try {
    console.log("REQUEST COOKIE", new Map(request.headers));

    var newUser = true;

    var variantsPromise = fetch(
      "https://cfw-takehome.developers.workers.dev/api/variants"
    )
      .then((response) => {
        return response.json();
      })
      .catch((err) => {
        console.log("Error in fetching random variant link: ", err);
      });

    var variantObject = await variantsPromise;
    var variantArray = variantObject["variants"];
    var randInt = Math.random() < 0.5 ? 0 : 1;

    if (request.headers) {
      var cookie = request.headers.get("cookie");

      if (cookie && cookie.includes("variantGroup=0")) {
        newUser = false;
        randInt = 0;
      } else if (cookie && cookie.includes("variantGroup=1")) {
        newUser = false;
        randInt = 1;
      }
    }

    var randVariant = variantArray[randInt];

    var chosenVariantPromise = await fetch(randVariant)
      .then((response) => {
        if (newUser) {
          response = new Response(response.body, response);
          response.headers.set(
            "Set-Cookie",
            `variantGroup=` + randInt.toString() + ";max-age=1577000000"
          );
          console.log("RESPONSE COOKIE", new Map(response.headers));
          return response;
        } else {
          return response;
        }
      })
      .catch((err) => {
        console.log("Error in fetching chosen variant: ", err);
      });

    // 0 is variant 1
    // 1 is variant 2

    if (randInt == 0) {
      return new HTMLRewriter()
        .on("title", new elementHandler(0))
        .on("a", new elementHandler(0, "href", "url"))
        .on("h1", new elementHandler(0, null, "title"))
        .on("p", new elementHandler(0, null, "description"))
        .transform(chosenVariantPromise);
    } else {
      return new HTMLRewriter()
        .on("title", new elementHandler(1))
        .on("a", new elementHandler(1, "href", "url"))
        .on("h1", new elementHandler(1, null, "title"))
        .on("p", new elementHandler(1, null, "description"))
        .transform(chosenVariantPromise);
    }
  } catch (e) {
    console.log("Error", e);
    return new Response(e);
  }
}
