// const express = require("express");
// const bodyParser = require("body-parser");
// const { createObjectCsvWriter } = require("csv-writer");
// const path = require("path");
// const { exec } = require("child_process");

// const app = express();
// const PORT = 3000;

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname, 'public')));

// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'index.htm'));
// });

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

// app.post("/submit-form", (req, res) => {
//   const formData = req.body;

//   console.log("Form Data:", formData);

//   csvWriter
//     .writeRecords([formData])
//     .then(() => {
//       console.log("Data written to CSV file successfully!");

//       exec(`./sort_csv.sh student_data.csv MIS && mv sorted_student_data.csv student_data.csv`, (err, stdout, stderr) => {
//         if (err) {
//           console.error("Error executing sort or copy script:", err);
//           return res.status(500).send("An error occurred while sorting and copying the CSV.");
//         }

//         console.log("Sorting and copying script output:", stdout);
//         if (stderr) {
//           console.error("Sorting and copying script stderr:", stderr);
//         }

//         res.send(`
//           <!DOCTYPE html>
//           <html lang="en">
//           <head>
//               <meta charset="UTF-8">
//               <meta name="viewport" content="width=device-width, initial-scale=1.0">
//               <title>Submission Success</title>
//               <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
//               <script>
//                   function downloadCSV() {
//                       const password = prompt("Enter the password to download the CSV file:");
//                       const correctPassword = 'pass1234'; // Change this to your desired password
//                       if (password === correctPassword) {
//                           window.location.href = '/download';
//                       } else {
//                           alert("Incorrect password! You cannot download the file.");
//                       }
//                   }
//               </script>
//           </head>
//           <body class="bg-dark text-white text-center">
//               <div class="container">
//                   <h1>Form Submitted Successfully!</h1>
//                   <p>Your form has been submitted and the data has been saved.</p>
//                   <button onclick="downloadCSV()" class="btn btn-primary">Download CSV</button>
//                   <br><br>
//                   <a href="/" class="btn btn-secondary">Go Back</a>
//               </div>
//           </body>
//           </html>
//         `);
//       });
//     })
//     .catch((err) => {
//       console.error("Error writing to CSV file:", err);
//       res.status(500).send("An error occurred.");
//     });
// });

// // Route to download the CSV file
// app.get('/download', (req, res) => {
//   const filePath = path.join(__dirname, 'student_data.csv');
//   res.download(filePath, 'student_data.csv', (err) => {
//     if (err) {
//       console.error("Error downloading the file:", err);
//       res.status(500).send("An error occurred while downloading the file.");
//     }
//   });
// });

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
const express = require("express");
const bodyParser = require("body-parser");
const { createObjectCsvWriter } = require("csv-writer");
const path = require("path");
const { exec } = require("child_process");
const fs = require('fs');
const csv = require('csv-parser');

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

// Function to check if MIS exists
const checkMISExists = (misNumber) => {
  return new Promise((resolve, reject) => {
    const results = [];
    
    // If file doesn't exist yet, MIS doesn't exist
    if (!fs.existsSync('student_data.csv')) {
      resolve(false);
      return;
    }

    fs.createReadStream('student_data.csv')
      .pipe(csv())
      .on('data', (data) => {
        if (data.MIS === misNumber) {
          results.push(data);
        }
      })
      .on('end', () => {
        resolve(results.length > 0);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

app.post("/submit-form", async (req, res) => {
  const formData = req.body;

  try {
    // Check if MIS already exists
    const misExists = await checkMISExists(formData.MIS);
    
    if (misExists) {
      return res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Submission Error</title>
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
        </head>
        <body class="bg-dark text-white text-center">
            <div class="container">
                <h1>Submission Error</h1>
                <p>A student with MIS number ${formData.MIS} already exists in the system.</p>
                <p>Each MIS number must be unique.</p>
                <a href="/" class="btn btn-secondary">Go Back</a>
            </div>
        </body>
        </html>
      `);
    }

    // If MIS doesn't exist, proceed with saving the data
    await csvWriter.writeRecords([formData]);
    console.log("Data written to CSV file successfully!");

    // Sort the CSV file
    exec(`./sort_csv.sh student_data.csv MIS && mv sorted_student_data.csv student_data.csv`, (err, stdout, stderr) => {
      if (err) {
        console.error("Error executing sort or copy script:", err);
        return res.status(500).send("An error occurred while sorting and copying the CSV.");
      }

      console.log("Sorting and copying script output:", stdout);
      if (stderr) {
        console.error("Sorting and copying script stderr:", stderr);
      }

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
                    const correctPassword = 'pass1234';
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
    });
  } catch (error) {
    console.error("Error processing form submission:", error);
    res.status(500).send("An error occurred while processing your submission.");
  }
});

app.get('/download', (req, res) => {
  const filePath = path.join(__dirname, 'student_data.csv');
  res.download(filePath, 'student_data.csv', (err) => {
    if (err) {
      console.error("Error downloading the file:", err);
      res.status(500).send("An error occurred while downloading the file.");
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});