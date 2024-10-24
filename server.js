const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const { createObjectCsvWriter } = require("csv-writer");
const path = require("path");
const { exec } = require("child_process");

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.htm'));
});

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

app.post("/submit-form", (req, res) => {
  const formData = req.body;

  console.log("Form Data:", formData);

  csvWriter
    .writeRecords([formData])
    .then(() => {
      console.log("Data written to CSV file successfully!");

      exec(`./sort_csv.sh student_data.csv MIS && mv sorted_student_data.csv student_data.csv`, (err, stdout, stderr) => {
        if (err) {
          console.error("Error executing sort or copy script:", err);
          return res.status(500).send("An error occurred while sorting and copying the CSV.");
        }

        console.log("Sorting and copying script output:", stdout);
        if (stderr) {
          console.error("Sorting and copying script stderr:", stderr);
        }

        res.send("Form submitted, CSV sorted, and data updated successfully!");
      });
    })
    .catch((err) => {
      console.error("Error writing to CSV file:", err);
      res.status(500).send("An error occurred.");
    });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
