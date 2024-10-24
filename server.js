// const express = require("express");
// const bodyParser = require("body-parser");
// const fs = require("fs");
// const { createObjectCsvWriter } = require("csv-writer");
// const path = require("path");

// const app = express();
// const PORT = 3000;

// // Middleware to parse form data
// app.use(bodyParser.urlencoded({ extended: true }));

// // Serve static files (ensure your static files are in the 'public' folder)
// app.use(express.static(path.join(__dirname, 'public')));

// // CSV writer setup
// const csvWriter = createObjectCsvWriter({
//   path: "student_data.csv",
//   header: [
//     { id: "fname", title: "First Name" },
//     { id: "lname", title: "Last Name" },
//     { id: "email", title: "Email" },
//     { id: "mob", title: "Phone Number" },
//     { id: "MIS", title: "MIS Number" },
//     { id: "department", title: "Department" },
//     { id: "year", title: "Year" },
//     { id: "birthdate", title: "Birthdate" },
//   ],
//   append: true,
// });

// // Handle form submission
// app.post("/submit-form", (req, res) => {
//   const formData = req.body;

//   // Log form data to console for debugging
//   console.log("Form Data:", formData);

//   // Write data to CSV file
//   csvWriter
//     .writeRecords([formData])
//     .then(() => {
//       console.log("Data written to CSV file successfully!");
//       res.send("Form submitted successfully!");
//     })
//     .catch((err) => {
//       console.error("Error writing to CSV file:", err);
//       res.status(500).send("An error occurred.");
//     });
// });

// // Start the server
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const { createObjectCsvWriter } = require("csv-writer");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (ensure your static files are in the 'public' folder)
app.use(express.static(path.join(__dirname, 'public')));

// Serve the index.htm file at the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.htm'));
});

// CSV writer setup
const csvWriter = createObjectCsvWriter({
  path: "student_data.csv",
  header: [
    { id: "fname", title: "First Name" },
    { id: "lname", title: "Last Name" },
    { id: "email", title: "Email" },
    { id: "mob", title: "Phone Number" },
    { id: "MIS", title: "MIS Number" },
    { id: "department", title: "Department" },
    { id: "year", title: "Year" },
    { id: "birthdate", title: "Birthdate" },
  ],
  append: true,
});

// Handle form submission
app.post("/submit-form", (req, res) => {
  const formData = req.body;

  // Log form data to console for debugging
  console.log("Form Data:", formData);

  // Write data to CSV file
  csvWriter
    .writeRecords([formData])
    .then(() => {
      console.log("Data written to CSV file successfully!");
      res.send("Form submitted successfully!");
    })
    .catch((err) => {
      console.error("Error writing to CSV file:", err);
      res.status(500).send("An error occurred.");
    });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
