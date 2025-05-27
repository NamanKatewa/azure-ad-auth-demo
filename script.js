const config = {
  auth: {
    clientId: "f6754e6c-56c4-4a38-8588-f5d4f5c9722b",
    authority:
      "https://login.microsoftonline.com/38fd5a4b-955f-455a-9ad2-d2daa5a4e4d0",
    redirectUri: "https://namankatewa.github.io/azure-ad-auth-demo/",
  },
};

const app = new msal.PublicClientApplication(config);

function signIn() {
  app.loginRedirect({ scopes: ["User.Read"] });
}

function signOut() {
  app.logoutRedirect({
    postLogoutRedirectUri: "https://namankatewa.github.io/azure-ad-auth-demo/",
  });
}

app
  .handleRedirectPromise()
  .then((res) => {
    const account = res?.account || app.getAllAccounts()[0];
    if (account) {
      app.setActiveAccount(account);
      if (!location.pathname.includes("home.html")) {
        location.href =
          "https://namankatewa.github.io/azure-ad-auth-demo/home.html";
      } else {
        showInfo();
      }
    }
  })
  .catch((err) => console.error("Error:", err));

function showInfo() {
  app.acquireTokenSilent({ scopes: ["User.Read"] }).then((token) => {
    fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${token.accessToken}` },
    })
      .then((r) => r.json())
      .then((user) => {
        const { name, roll } = extractNameAndRoll(user.displayName);
        document.getElementById("name").textContent = "Name: " + name;
        document.getElementById("roll").textContent = "Roll Number: " + roll;
        document.getElementById("email").textContent =
          "Email: " + (user.mail || user.userPrincipalName);
        document.getElementById("phone").textContent =
          "Phone: " + (user.mobilePhone || user.businessPhones?.[0] || "N/A");
        document.getElementById("job").textContent =
          "Job Title: " + (user.jobTitle || "N/A");
      });
  });
}

function extractNameAndRoll(name) {
  const match = name.match(/(.*)\s(\d{10})$/);
  if (!match) return { name: name, roll: null };

  const nameNew = match[1].trim();
  const roll = match[2];
  return { name: titleCase(nameNew), roll };
}

function titleCase(name) {
  return name
    .toLowerCase()
    .split(" ")
    .filter((word) => word.length > 0)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}
