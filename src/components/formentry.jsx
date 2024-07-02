import React, { useState } from 'react';
import './formentry.css';
import * as XLSX from 'xlsx';
import axios from 'axios';

function FormEntry() {
  const [selectedOption, setSelectedOption] = useState("");
  const [formFields, setFormFields] = useState([]);
  const [data, setData] = useState({});
  const [inputValues, setInputValues] = useState([]);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [addedMessage, setAddedMessage] = useState("");
  const [firstMonth, setFirstMonth] = useState("");
  const [secondMonth, setSecondMonth] = useState("");
  const [monthResponse,setMonthResponse]=useState("");
  const [message,setMessage]=useState("");
  const [costDifference,setCostDifference]=useState(0);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const arrayBuffer = e.target.result;
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheets = ['2kw', '3kw', '5kw', '10kw'];
      const extractedData = {};

      sheets.forEach((sheet) => {
        const worksheet = workbook.Sheets[sheet];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const descriptionIndex = jsonData[0].indexOf('Description');
        if (descriptionIndex > -1) {
          extractedData[sheet] = jsonData
            .slice(1)
            .map((row) => row[descriptionIndex])
            .filter((item) => item);
        }
      });

      setData(extractedData);
      console.log("Data loaded:", extractedData); // Debug log
    };

    reader.readAsArrayBuffer(file);
  };

  const handleChange = (event) => {
    const value = event.target.value;
    setSelectedOption(value);
    if (data[value]) {
      setFormFields(data[value]);
      setInputValues(Array(data[value].length).fill(""));
    } else {
      setFormFields([]);
      setInputValues([]);
    }
    console.log("Selected option:", value); // Debug log
    console.log("Form fields:", formFields); // Debug log
  };

  const handleInputChange = (index, value) => {
    const newInputValues = [...inputValues];
    newInputValues[index] = value;
    setInputValues(newInputValues);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const allFieldsFilled = inputValues.every(value => value.trim() !== "");
    if (!allFieldsFilled || !name || !location || !date) {
      alert("Please fill all the fields before submitting the form.");
      return;
    }

    const requestData = {
      selectedOption,
      name,
      location,
      date,
      values: inputValues
    };

    try {
      const response = await axios.post('http://localhost:8000/dataentry/', requestData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log("Form submitted successfully:", response.data);
      setResponseMessage(response.data.message); // Update the response message state
      setAddedMessage(response.data.AddedInformation);
      setCostDifference(response.data.CostDifference);
    } catch (error) {
      console.error("Error submitting form:", error);
      setResponseMessage("Error submitting form."); // Update the response message state in case of error
    }
  };

  const handleRightSideSubmit = async () => {
    const requestData = {
      selectedOption,
      firstMonth,
      secondMonth
    };

    try {
      const response = await axios.post('http://localhost:8000/checkmonthdiff/', requestData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log("Difference:", response.data.difference);
      setMonthResponse(response.data.difference);
      setMessage(response.data.message);
    } catch (error) {
      console.error("Error calculating month difference:", error);
    }
  };

  return (
    <>
      <h1>Solar Cost Tracker</h1>
      <input className="inputfile" type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      <div className="App">
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <label htmlFor="dropdown">Select a value:</label>
            <select id="dropdown" value={selectedOption} onChange={handleChange}>
              <option value="">--Please choose an option--</option>
              <option value="2kw">2kw</option>
              <option value="3kw">3kw</option>
              <option value="5kw">5kw</option>
              <option value="10kw">10kw</option>
            </select>

            <div>
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label htmlFor="location">Location:</label>
              <input
                type="text"
                id="location"
                name="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div>
              <label htmlFor="date">Date:</label>
              <input
                type="date"
                id="date"
                name="date"
                value={date}
                onChange={(e) => setDate(e.target.value)} />
            </div>

            {formFields.length > 0 && formFields.map((field, index) => (
              <div key={index}>
                <label htmlFor={`field${index}`}>{field}:</label>
                <input
                  type="text"
                  id={`field${index}`}
                  name={`field${index}`}
                  value={inputValues[index] || ""}
                  onChange={(e) => handleInputChange(index, e.target.value)} />
              </div>
            ))}

            <button type="submit">Submit</button>
            {responseMessage && <p>{responseMessage}</p>}
            {addedMessage && <p>{addedMessage}</p>}
          </form>
        </div>
        <div className="right-side">
          <label htmlFor="secondDropdown">Select a value:</label>
          <select id="secondDropdown" value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)}>
            <option value="">--Please choose an option--</option>
            <option value="2kw">2kw</option>
            <option value="3kw">3kw</option>
            <option value="5kw">5kw</option>
            <option value="10kw">10kw</option>
          </select>
          <div className="dropdown-container">
            <label htmlFor="firstMonth">Select First Month:</label>
            <select id="firstMonth" value={firstMonth} onChange={(e) => setFirstMonth(e.target.value)}>
              <option value="">--Select Month--</option>
              <option value="January">January</option>
              <option value="February">February</option>
              <option value="March">March</option>
              <option value="April">April</option>
              <option value="May">May</option>
              <option value="June">June</option>
              <option value="July">July</option>
              <option value="August">August</option>
              <option value="September">September</option>
              <option value="October">October</option>
              <option value="November">November</option>
              <option value="December">December</option>
            </select>
          </div>
          <div className="dropdown-container">
            <label htmlFor="secondMonth">Select Second Month:</label>
            <select id="secondMonth" value={secondMonth} onChange={(e) => setSecondMonth(e.target.value)}>
              <option value="">--Select Month--</option>
              <option value="January">January</option>
              <option value="February">February</option>
              <option value="March">March</option>
              <option value="April">April</option>
              <option value="May">May</option>
              <option value="June">June</option>
              <option value="July">July</option>
              <option value="August">August</option>
              <option value="September">September</option>
              <option value="October">October</option>
              <option value="November">November</option>
              <option value="December">December</option>
            </select>
          </div>
          <button onClick={handleRightSideSubmit}>Submit</button>
          <p>{message} {monthResponse ? monthResponse : ""}</p>
        </div>
      </div>
    </>
  );
}

export default FormEntry;
