import React, { useEffect } from "react";
import {
  Button,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Box,
  ButtonBase,
  Tooltip,
  IconButton,
  tableCellClasses,
  TableFooter,
  TablePagination,
} from "@mui/material";
import { styled } from "@mui/system";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useSelector } from "react-redux";
import mailIcon from "../../Utils/mailIcon.png";
import downloadIcon from "../../Utils/downloadIcon.png";
import releventBtn from "../../Utils/RRButton.png";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import ClearIcon from "@mui/icons-material/Clear";
import axiosInstance from "../../axios/axiosConfig";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";
import { useTheme } from "@emotion/react";
import PropTypes from "prop-types";
import { Loader } from "../../CommonComp/LoaderComponent/loader";

// const StyledTableCell = styled(TableCell)({
//   border: "2px solid black",
// });

const StyledTableCell = styled(TableCell)(() => ({
  border: "2px solid black",
  [`&.${tableCellClasses.head}`]: {
    // backgroundColor: theme.palette.common.black,
    backgroundColor: "#3778a6",
    color: "white",
    fontSize: 17,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));
const ImageButton = styled(ButtonBase)(() => ({
  "& img": {
    width: "auto",
    height: "auto",
    maxWidth: "20px",
    maxHeight: "20px",
    transition: "transform 0.2s ease",
  },
  "&:hover img": {
    transform: "scale(1.2)",
    zIndex: 1,
  },
}));
function TablePaginationActions(props) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowRight />
        ) : (
          <KeyboardArrowLeft />
        )}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowLeft />
        ) : (
          <KeyboardArrowRight />
        )}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}
TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};

// !   component start
const FetchResume = () => {
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();
  const { data: jsonData } = location.state || {};

  const [data, setData] = useState([]);
  const [jobIds, setJobIds] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  // const skillset = searchResults[0].Skillset;
  // console.log(skillset);
  // const [selectedRowEmail, setSelectedRowEmail] = useState("");
  // console.log(selectedRowEmail);
  const [selectedEmail, setSelectedEmail] = useState(
    user.role === "user" ? user.email : ""
  );
  const [selectedJobId, setSelectedJobId] = useState("");
  console.log(selectedJobId);
  const [startDate, setStartDate] = React.useState(null);
  const [endDate, setEndDate] = React.useState(null);
  const [percentageMap, setPercentageMap] = useState({}); // State to store percentage for each row
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (jsonData) {
      try {
        const parsedData = JSON.parse(jsonData);
        setData(parsedData);
      } catch (error) {
        console.error("Failed to parse JSON data:", error);
      }
    }
  }, [jsonData]);

  useEffect(() => {
    if (selectedEmail) {
      const selectedData = data.find((job) => job.email === selectedEmail);
      if (selectedData) {
        const ids = selectedData.job_ids.split("\n").map((id) => id.trim());
        setJobIds(ids);
      } else {
        setJobIds([]);
      }
    } else {
      setJobIds([]);
    }
  }, [selectedEmail, data]);

  // ! for search button api req and add data to the table
  const handleSearchClick = async () => {
    setLoading(true);
    const url = "/fetch_candidates"; // Ensure the correct protocol is used
    const params = {
      filters: {
        user_type: user.role === "admin" ? "admin" : "user",
        job_id: selectedJobId || "",
        email: selectedEmail === "No Email" ? "" : selectedEmail,
        start_date: startDate ? startDate.toISOString() : null,
        end_date: endDate ? endDate.toISOString() : null,
      },
      fetch_resume: "candidate_info",
    };

    try {
      const response = await axiosInstance.post(url, params, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);

      const result = response?.data;

      console.log(result?.data);
      if (result.status === "Success") {
        setSearchResults(result?.data);
        toast.success("Data fetched based on your filters");
      } else {
        console.error("Search API call failed:", result.status);
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error during API call:", error);
      toast.error(error.response.data?.message);
    } finally {
      setLoading(false);
    }
  };

  // ! in table download button api req
  const handleDownloadClick = async (email) => {
    setLoading(true);
    const url = `/download_api_resumes?email=${encodeURIComponent(
      email
    )}&jd_id=${encodeURIComponent(selectedJobId)}`;

    try {
      const response = await axiosInstance.get(url, {
        responseType: "blob", // Important to get the response as a blob
      });

      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `resume_${email}.txt`; // Set the file name
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl); // Clean up the URL object
    } catch (error) {
      console.error("Error during download request:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleMailClick = (email, name) => {
    setLoading(true);
    const url = `/send-invitation?email=${encodeURIComponent(
      email
    )}&name=${encodeURIComponent(name)}`;
    console.log("Sending request to:", url); // Debugging log

    axiosInstance
      .post(url)
      .then((response) => {
        console.log("Mail response:", response.data);
        toast.success("mail send successfully");
      })
      .catch((error) => {
        console.error("Error during mail request:", error);
        if (error.response) {
          console.error("Error response data:", error.response.data);
          toast.error(`Error: ${error.response.data.message}`);
        } else {
          toast.error("An unknown error occurred.");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const handleRelevantClick = async (name, jobId, email) => {
    setLoading(true);
    const url = `/Relevant?name=${encodeURIComponent(
      name
    )}&job_id=${encodeURIComponent(jobId)}`;

    try {
      const response = await axiosInstance.post(url);
      const result = response.data;

      if (result.status === "Success") {
        const formattedExperience = formatExperience(
          result.relevent_experience
        );
        const updatedMap = { ...percentageMap };
        updatedMap[email] = formattedExperience;
        setPercentageMap(updatedMap);
        toast.success(`Successfully Calculated Relevant Experience`);
      } else {
        console.error("Relevant Experience API call failed:", result.status);
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error during Relevant Experience API call:", error);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format the experience string into an array of strings
  const formatExperience = (experienceString) => {
    // Split the experience string into lines based on specific delimiters
    return experienceString
      .split(/(?<=\d%)|(?=-)/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  };

  // const handleRelevantClick = async (name, jobId, email) => {
  //   setLoading(true);
  //   const url = `/Relevant?name=${encodeURIComponent(
  //     name
  //   )}&job_id=${encodeURIComponent(jobId)}`;

  //   try {
  //     const response = await axiosInstance.post(url);
  //     const result = response.data;

  //     if (result.status === "Success") {
  //       const updatedMap = { ...percentageMap };
  //       updatedMap[email] = result.relevent_experience;
  //       setPercentageMap(updatedMap);
  //       toast.success(`Successfully Calculated Relevant Experience`);
  //     } else {
  //       console.error("Relevant Experience API call failed:", result.status);
  //       toast.error(result.message);
  //     }
  //   } catch (error) {
  //     console.error("Error during Relevant Experience API call:", error);
  //     toast.error(error.response.data.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatSkillset = (skillset) => {
    return skillset
      .split("\n")
      .map((line) => {
        if (line) {
          const parts = line.split(":");
          if (parts.length > 1) {
            const key = parts[0] + ":";
            const value = parts.slice(1).join(":");
            return `<span style="font-weight: bold; color: black;">${key}</span><span style="color:#1383D3;">${value}</span>`;
          }
          return line;
        }
        return line;
      })
      .join("<br>");
  };
  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center",
            flexWrap: "wrap",
            padding: "15px 70px 0px 70px",
          }}
        >
          <TextField
            select
            label="Select Email"
            value={selectedEmail}
            onChange={(e) =>
              setSelectedEmail(
                e.target.value === "No Email" ? "" : e.target.value
              )
            }
            sx={{ width: 150 }}
          >
            {Array.isArray(data) && data.length > 0 ? (
              data.map((job) => (
                <MenuItem
                  key={job.email || "default"}
                  value={job.email || "No Email"}
                >
                  {job.email || "No Email"}
                </MenuItem>
              ))
            ) : (
              <MenuItem key="default" value="No Email">
                No Email
              </MenuItem>
            )}
          </TextField>

          <TextField
            select
            label="JOB ID"
            value={selectedJobId}
            variant="standard"
            onChange={(e) => setSelectedJobId(e.target.value)}
            sx={{ width: 150 }}
            disabled={!selectedEmail}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {Array.isArray(jobIds) &&
              jobIds.map((id, index) => (
                <MenuItem key={index} value={id}>
                  {id}
                </MenuItem>
              ))}
          </TextField>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(date) => setStartDate(date)}
              renderInput={(params) => (
                <TextField {...params} sx={{ width: 150 }} />
              )}
            />
            {startDate && (
              <IconButton onClick={() => setStartDate(null)}>
                <ClearIcon />
              </IconButton>
            )}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(date) => setEndDate(date)}
              renderInput={(params) => (
                <TextField {...params} sx={{ width: 150 }} />
              )}
            />
            {endDate && (
              <IconButton onClick={() => setEndDate(null)}>
                <ClearIcon />
              </IconButton>
            )}
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearchClick}
          >
            Search
          </Button>
        </Box>
      </LocalizationProvider>

      <div style={{ padding: "2px 150px" }}>
        <div
          dangerouslySetInnerHTML={{
            __html: searchResults[0]
              ? formatSkillset(searchResults[0].Skillset)
              : "",
          }}
        />
        {/* {searchResults[0]?.Skillset} */}
      </div>

      <TableContainer
        // component={Paper}
        sx={{ overflowX: "auto", padding: "15px 150px" }}
      >
        <Table
          sx={{
            "& .MuiTableCell-sizeMedium": {
              padding: "13px 16px",
            },
          }}
          aria-label="custom pagination table"
        >
          <TableHead>
            <TableRow>
              <StyledTableCell align="center">Name</StyledTableCell>
              <StyledTableCell align="center">Email</StyledTableCell>
              <StyledTableCell align="center">Contact</StyledTableCell>
              <StyledTableCell align="center">Ranking&nbsp;(%)</StyledTableCell>
              <StyledTableCell align="center" colSpan={2}>
                Actions
              </StyledTableCell>
              <StyledTableCell align="center">Relevant Ranking</StyledTableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {Array.isArray(searchResults) && searchResults.length > 0 ? (
              (rowsPerPage > 0
                ? searchResults.slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage
                  )
                : searchResults
              ).map((row, index) => (
                <TableRow key={index}>
                  <StyledTableCell component="th" scope="row">
                    {row.Name}
                  </StyledTableCell>
                  <StyledTableCell align="left">{row.Email}</StyledTableCell>
                  <StyledTableCell align="left">{row?.Mobile}</StyledTableCell>
                  <StyledTableCell align="left">
                    {row.Similarity}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Tooltip title="Download">
                      <ImageButton
                        onClick={async () => {
                          // setSelectedRowEmail(row.Email); // Set the selected row's email
                          await handleDownloadClick(row.Email);
                        }}
                      >
                        <img
                          src={downloadIcon}
                          alt="Download Icon"
                          style={{
                            width: "auto",
                            height: "auto",
                            maxWidth: "20px",
                            maxHeight: "20px",
                          }}
                        />
                      </ImageButton>
                    </Tooltip>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Tooltip title="Mail">
                      <ImageButton
                        onClick={() => {
                          handleMailClick(row.Email, row.Name);
                        }}
                      >
                        <img
                          src={mailIcon}
                          alt="Mail Icon"
                          style={{
                            width: "auto",
                            height: "auto",
                            maxWidth: "20px",
                            maxHeight: "20px",
                          }}
                        />
                      </ImageButton>
                    </Tooltip>
                  </StyledTableCell>
                  {/* <StyledTableCell align="center">
                    <Tooltip
                      title={
                        selectedJobId !== ""
                          ? ""
                          : "Please fill a Job ID to enable Relevant Ranking"
                      }
                    >
                      <ImageButton
                        onClick={() =>
                          handleRelevantClick(
                            row.Name,
                            selectedJobId,
                            row.Email
                          )
                        }
                      >
                        <img
                          src={releventBtn}
                          alt="Relevant Experience Icon"
                          style={{
                            width: "auto",
                            height: "auto",
                            maxWidth: "20px",
                            maxHeight: "20px",
                          }}
                        />
                      </ImageButton>
                    </Tooltip>
                    {percentageMap[row.Email] !== undefined && (
                      <div style={{ marginTop: "5px" }}>
                        {`Relevant Experience: ${percentageMap[row.Email]}`}
                      </div>
                    )}
                  </StyledTableCell> */}
                  <StyledTableCell align="center">
                    <Tooltip
                      title={
                        selectedJobId !== ""
                          ? ""
                          : "Please fill a Job ID to enable Relevant Ranking"
                      }
                    >
                      <ImageButton
                        onClick={() =>
                          handleRelevantClick(
                            row.Name,
                            selectedJobId,
                            row.Email
                          )
                        }
                      >
                        <img
                          src={releventBtn}
                          alt="Relevant Experience Icon"
                          style={{
                            width: "auto",
                            height: "auto",
                            maxWidth: "20px",
                            maxHeight: "20px",
                          }}
                        />
                      </ImageButton>
                    </Tooltip>
                    {/* Display percentage and formatted experience here */}
                    {percentageMap[row.Email] !== undefined && (
                      <div style={{ marginTop: "5px", textAlign: "left" }}>
                        {percentageMap[row.Email].map((line, index) => (
                          <div key={index}>{line}</div>
                        ))}
                      </div>
                    )}
                  </StyledTableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <StyledTableCell colSpan={7} align="center">
                  No data available
                </StyledTableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[6, 15, 25]}
                colSpan={7}
                count={searchResults.length}
                rowsPerPage={rowsPerPage}
                page={page}
                SelectProps={{
                  inputProps: {
                    "aria-label": "rows per page",
                  },
                  native: true,
                }}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
      {loading && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "20px",
          }}
        >
          <Loader />
        </div>
      )}
    </>
  );
};

export default FetchResume;
