import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Paper,
  Box,
  Grid2
} from "@mui/material";
import Brain from "../assets/brain.png";
import { styled } from "@mui/system";
import axios from 'axios';


const UploadButton = styled(Button)({
  marginTop: "20px",
  backgroundColor: "#2196f3",
  color: "#fff",
  padding: "10px 20px",
  fontSize: "18px",
  "&:hover": {
    backgroundColor: "#1976d2",
  },
});

const PredictButton = styled(Button)({
  marginTop: "20px",
  marginLeft: "15px",
  backgroundColor: "#ff5722",
  color: "#fff",
  padding: "10px 20px",
  fontSize: "18px",
  "&:hover": {
    backgroundColor: "#e64a19",
  },
});

const Home = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prediction, setPrediction] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(process.env.REACT_APP_API_URL + '/classify', formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setPrediction(response.data.class || response.data.error);
    } catch (error) {
      console.error("Error uploading file:", error);
      setPrediction("An error occurred while classifying.");
    }
  };

  return (
    <div>
      <AppBar position="static" style={{ backgroundColor: "#2c3e50" }}>
        <Toolbar>
          <Typography variant="h3" style={{ flexGrow: 1, padding: "10px" }}>
            Brain Tumor Classification
          </Typography>
        </Toolbar>
      </AppBar>

      <Container
        style={{
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Grid2
          container
          spacing={4}
          marginBottom={10}
          justifyContent="center"
          alignItems="center"
        >
          <Grid2 item xs={12} md={6}>
            <Typography
              variant="h3"
              gutterBottom
              style={{ color: "#2c3e50", fontWeight: "bold", padding: '10px' }}
            >
              Detect Brain Tumors with Deep Learning
            </Typography>
            <Typography
              variant="h6"
              gutterBottom
              style={{ color: "#34495e", lineHeight: 1.5 }}
            >
              Our advanced platform enables accurate and fast detection of brain
              tumors from MRI images, providing reliable results for medical
              professionals and patients.
            </Typography>

            {preview && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "20px",
                  marginBottom: "20px",
                }}
              >
                <Paper
                  elevation={4}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "10px",
                    textAlign: "center",
                    backgroundColor: "#ecf0f1",
                  }}
                >
                  <img
                    src={preview}
                    alt="Preview"
                    style={{
                      width: "100%",
                      maxWidth: "40px",
                      height: "auto",
                      objectFit: "cover",
                      borderRadius: "10px",
                      border: "1px solid #ccc",
                    }}
                  />
                  <Typography
                    variant="p"
                    gutterBottom
                    style={{ color: "#2c3e50" }}
                  >
                    {file.name}
                  </Typography>
                </Paper>
              </Box>
            )}

            <Box display="flex" justifyContent="center" alignItems="center">
              <UploadButton component="label">
                Upload MRI Image
                <input type="file" hidden onChange={handleFileChange} />
              </UploadButton>
              <PredictButton onClick={handleUpload}>Predict</PredictButton>
            </Box>

            {prediction && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "20px",
                  marginBottom: "20px",
                }}
              >
                <Paper
                  elevation={4}
                  style={{
                    padding: "20px",
                    backgroundColor: "#ffffff",
                    textAlign: "center",
                    width: "50%",
                    border: "2px solid #4caf50",
                  }}
                >
                  <Typography
                    variant="h5"
                    style={{ color: "#2c3e50", fontWeight: "bold" }}
                  >
                    Prediction Result
                  </Typography>
                  <Typography
                    variant="h6"
                    style={{ color: "#34495e", marginTop: "10px" }}
                  >
                    {prediction}
                  </Typography>
                </Paper>
              </Box>
            )}

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: '50px',
              }}
            >
              <Paper
                elevation={4}
                style={{
                  width: "20%",
                  padding: "10px",
                  backgroundColor: "#ecf0f1",
                  textAlign: "center",
                }}
              >
                <img
                  src={Brain}
                  alt="MRI Upload"
                  style={{ width: "100%", borderRadius: "10px" }}
                />
              </Paper>
            </Box>
          </Grid2>
        </Grid2>
      </Container>

      <Box
        sx={{
          backgroundColor: "#2c3e50",
          color: "#ecf0f1",
          padding: "20px",
          textAlign: "center",
          marginTop: "30px",
        }}
      >
        <Typography variant="subtitle1">
          © 2025 Brain Tumor Classification | All rights reserved.
        </Typography>
      </Box>
    </div>
  );
};

export default Home;
