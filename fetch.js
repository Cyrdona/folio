const fs = require("fs");
const https = require("https");
require("dotenv").config();

const GITHUB_TOKEN = process.env.REACT_APP_GITHUB_TOKEN;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const USE_GITHUB_DATA = process.env.USE_GITHUB_DATA;
// const MEDIUM_USERNAME = process.env.MEDIUM_USERNAME;

const ERR = {
  noUserName:
    "Github Username was found to be undefined. Please set all relevant environment variables.",
  requestFailed:
    "The request to GitHub didn't succeed. Check if GitHub token in your .env file is correct.",
  requestMediumFailed:
    "The request to Medium didn't succeed. Check if Medium username in your .env file is correct."
};

if (USE_GITHUB_DATA === "true") {
  if (GITHUB_USERNAME === undefined) {
    throw new Error(ERR.noUserName);
  }

  console.log(`Fetching profile data for ${GITHUB_USERNAME}`);
  const data = JSON.stringify({
    query: `
{
  user(login:"${GITHUB_USERNAME}") { 
    name
    bio
    avatarUrl
    location
    pinnedItems(first: 6, types: [REPOSITORY]) {
      totalCount
      edges {
        node {
          ... on Repository {
            name
            description
            forkCount
            stargazers {
              totalCount
            }
            url
            id
            diskUsage
            primaryLanguage {
              name
              color
            }
          }
        }
      }
    }
  }
}
`
  });

  const options = {
    hostname: "api.github.com",
    path: "/graphql",
    port: 443,
    method: "POST",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "User-Agent": "Node"
    }
  };

  const req = https.request(options, res => {
    let data = "";

    console.log(`statusCode: ${res.statusCode}`);
    if (res.statusCode !== 200) {
      throw new Error(ERR.requestFailed);
    }

    res.on("data", d => {
      data += d;
    });

    res.on("end", () => {
      fs.writeFile("./public/profile.json", data, err => {
        if (err) {
          console.error("Error writing profile.json:", err);
        } else {
          console.log("Saved file to public/profile.json");
        }
      });
    });
  });

  req.on("error", error => {
    throw error;
  });

  req.write(data);
  req.end();
}

// if (MEDIUM_USERNAME !== undefined) {
//   console.log(`Fetching Medium blogs data for ${MEDIUM_USERNAME}`);
//   const options = {
//     hostname: "api.rss2json.com",
//     path: `/v1/api.json?rss_url=${encodeURIComponent(`https://medium.com/feed/@${MEDIUM_USERNAME}`)}`,
//     port: 443,
//     method: "GET"
//   };

//   const reqMedium = https.request(options, res => {
//     let mediumData = "";

//     console.log(`statusCode: ${res.statusCode}`);
//     if (res.statusCode !== 200) {
//       throw new Error(ERR.requestMediumFailed);
//     }

//     res.on("data", d => {
//       mediumData += d;
//     });

//     res.on("end", () => {
//       fs.writeFile("./public/blogs.json", mediumData, err => {
//         if (err) {
//           console.error("Error writing blogs.json:", err);
//         } else {
//           console.log("Saved file to public/blogs.json");
//         }
//       });
//     });
//   });

//   reqMedium.on("error", error => {
//     throw error;
//   });

//   reqMedium.end();
// }
