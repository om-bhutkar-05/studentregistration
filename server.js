const express = require("express");
const bodyParser = require("body-parser");
const { createObjectCsvWriter } = require("csv-writer");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (ensure your static files are in the 'public' folder)
app.use(express.static(path.join(__dirname, 'public')));

// Serve the index.html file at the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
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
      
      // Send HTML response with a download button
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Submission Success</title>
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
            <script>
                function downloadCSV() {
                    const password = prompt("Enter the password to download the CSV file:");
                    const correctPassword = 'pass1234'; // Change this to your desired password

                    if (password === correctPassword) {
                        window.location.href = '/download';
                    } else {
                        alert("Incorrect password! You cannot download the file.");
                    }
                }
            </script>
        </head>
        <body class="bg-dark text-white text-center">
            <div class="container">
                <h1>Form Submitted Successfully!</h1>
                <p>Your form has been submitted and the data has been saved.</p>
                <button onclick="downloadCSV()" class="btn btn-primary">Download CSV</button>
                <br><br>
                <a href="/" class="btn btn-secondary">Go Back</a>
            </div>
        </body>
        </html>
      `);
    })
    .catch((err) => {
      console.error("Error writing to CSV file:", err);
      res.status(500).send("An error occurred.");
    });
});

// Route to download the CSV file
app.get('/download', (req, res) => {
  const filePath = path.join(__dirname, 'student_data.csv');
  res.download(filePath, 'student_data.csv', (err) => {
    if (err) {
      console.error("Error downloading the file:", err);
      res.status(500).send("An error occurred while downloading the file.");
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
