import React, { useEffect, useState } from "react";
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
  IconButton,
  Tooltip,
  tableCellClasses,
  TableFooter,
  TablePagination,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useSelector } from "react-redux";
import ClearIcon from "@mui/icons-material/Clear";
import styled from "styled-components";
import { NavLink, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../axios/axiosConfig";
import { FaDownload } from "react-icons/fa6";
// ! pagination
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";
import { useTheme } from "@emotion/react";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import PropTypes from "prop-types";
import { Loader } from "../../CommonComp/LoaderComponent/loader";
// ! ***
// Styled component for TableCell
const StyledTableCell = styled(TableCell)(({ theme }) => ({
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
const StyledNavLink = styled(NavLink)({
  textDecoration: "none",
  color: "#1283d3",
  fontSize: 16,
  paddingRight: 10,
});
// ! pagination

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
// ! ******************end
const LinkExtraction = () => {
  const user = useSelector((state) => state.auth.user);
  const [selectedEmail, setSelectedEmail] = useState(
    user.role === "user" ? user.email : ""
  );
  const [selectedJobId, setSelectedJobId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [jobIds, setJobIds] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [data, setData] = useState([]); // Added this line

  const location = useLocation();
  const { data: jsonData } = location.state || {};
  const [loading, setLoading] = useState(false);

  // ! pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  // ! ***********end

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

  const handleSearchClick = async () => {
    setLoading(true);
    const url = "/link_extracting";
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

      const result = response.data;
      console.log(result.query);

      if (result.status === "Success") {
        setSearchResults(result.data);
        setSearchQuery(result.query);
        console.log(result.data);
        toast.success("Data fetched based on your filters");
      } else {
        console.error("Search API call failed:", result.status);
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error during API call:", error);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };
  const formatQueryString = (query) => {
    const searchString = "Search results based on:";
    if (query.startsWith(searchString)) {
      const restOfQuery = query.slice(searchString.length).trim();
      return `<span style="color: black; font-weight: bold;">${searchString}</span> <span style="color: #1383D3;">${restOfQuery}</span>`;
    }
    return query; // Return as-is if the search string is not found
  };
  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/download_links", {
        params: {
          job_id: selectedJobId,
          email: selectedEmail,
          start_date: startDate ? startDate.toISOString() : null,
          end_date: endDate ? endDate.toISOString() : null,
        },
        responseType: "blob", // Ensure response type is blob to handle file download
      });

      // Create a blob object from the response data
      const blob = new Blob([response.data], { type: "text/csv" });

      // Create a link element, set its href and download attributes, then click it programmatically
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "LE_Resume.csv");
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Optionally display a success message or handle UI changes
      console.log("File download successful");
    } catch (error) {
      console.error("Error downloading file:", error);
      // Optionally display an error message or handle error state
    } finally {
      setLoading(false);
    }
  };
  // ! pagination

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  // ! ************end

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
      <div
        className="Search Result"
        style={{
          marginTop: "10px",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        <div>
          {searchQuery && (
            <div
              style={{ padding: "2px 150px", marginTop: "10px" }}
              dangerouslySetInnerHTML={{
                __html: formatQueryString(searchQuery),
              }}
            />
          )}
        </div>
        <FaDownload
          size={25}
          style={{ cursor: "pointer" }}
          onClick={handleDownload}
        />
      </div>

      {/* TableContainer and Table component */}
      <TableContainer
        // component={Paper}
        sx={{ overflowX: "auto", padding: "15px 150px" }}
      >
        <Table sx={{ minWidth: 500 }} aria-label="custom pagination table">
          <TableHead>
            <TableRow>
              <StyledTableCell align="center">Name</StyledTableCell>
              <StyledTableCell align="center">Link</StyledTableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {/* {Array.isArray(searchResults) && searchResults.length > 0 ? (
              searchResults */}
            {Array.isArray(searchResults) && searchResults.length > 0 ? (
              (rowsPerPage > 0
                ? searchResults.slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage
                  )
                : searchResults
              ).map((row, index) => (
                <TableRow key={index}>
                  <StyledTableCell align="left" component="th" scope="row">
                    {row.name}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Tooltip title="Click">
                      <StyledNavLink
                        to={row.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Link
                      </StyledNavLink>
                    </Tooltip>
                  </StyledTableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <StyledTableCell colSpan={6} align="center">
                  No data available
                </StyledTableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[6, 15, 25]}
                colSpan={6}
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

export default LinkExtraction;
